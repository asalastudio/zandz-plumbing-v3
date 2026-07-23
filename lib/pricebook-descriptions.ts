/**
 * AI-drafted scope-of-work descriptions for the pricebook.
 *
 * Most imported services carry only their name as a "description". A real scope
 * of work is what makes an estimate or invoice read as professional, so this
 * drafts one per service in the house style set by the five water-heater
 * services that shipped with proper scopes.
 *
 * Drafts are written to service_catalog.description_draft and marked 'pending'.
 * They never touch the live `description` — a human promotes them through the
 * review queue. See migration 013.
 */

import { generateText } from "ai";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getServiceMaterials } from "@/lib/db";
import { recordUsage } from "@/lib/api-usage";

const MODEL = process.env.ASSISTANT_MODEL ?? "anthropic/claude-sonnet-4-6";

// House style, lifted verbatim from H6120 so drafts match what the company
// already writes. Kept short — one good exemplar teaches the format better than
// a page of rules.
const EXEMPLAR = `Furnish and install a new 50 Gallon Gas water heater. The following work is included:
- Shut water down to the heater and drain the unit
- Inspect water and gas shut off valves
- Remove and dispose of the old water heater
- Set in place the new heater
- Install a new temperature and pressure relief valve
- Install new flexible water supplies
- Install a new flexible gas supply
- Install earthquake strapping
- Connect the flue piping and modify as necessary
- Fill the heater and check for water and gas leaks
- Light the pilot and turn the heater on
- Check the flue for proper draw and confirm no carbon monoxide leaks
- Adjust the temperature to an optimal 120 degrees
- Clean the work area
- Review the installation, controls, and settings with the homeowner`;

const SYSTEM = `You write scope-of-work descriptions for Z and Z Plumbing's pricebook. These appear on customer estimates and invoices, so they must be accurate, professional, and specific to real plumbing practice.

Match this exact format and voice:

${EXEMPLAR}

Rules:
- Open with one short sentence naming what the service delivers (e.g. "Furnish and install..." or "Clear a mainline stoppage...").
- Then the line: "The following work is included:"
- Then 5 to 12 hyphen bullets, each a concrete step a plumber actually performs, in the order they happen. End each on the work itself, not a period-less fragment.
- Neutral tense that reads correctly on both an estimate (future work) and an invoice (completed work). Prefer plain verbs: "Remove and dispose of the old unit", not "We will remove" or "Removed".
- Be truthful to the trade. Do not invent steps that would not apply. If the service is diagnostic or hourly, describe inspection/assessment steps, not an installation.
- No prices, no warranties, no marketing language, no em-dashes.
- Output ONLY the description. No preamble, no headings, no code fences.`;

export interface DraftableService {
  id: number;
  code: string;
  name: string;
  category: string | null;
  price_cents: number;
  hours: number | null;
}

/** Build the per-service user prompt, grounded in everything we know about it. */
async function buildPrompt(s: DraftableService): Promise<string> {
  const facts = [
    `Service name: ${s.name}`,
    `Pricebook code: ${s.code}`,
    s.category ? `Category: ${s.category}` : null,
    s.price_cents ? `Price: $${(s.price_cents / 100).toFixed(2)}` : null,
    s.hours ? `Estimated labor: ${s.hours} hours` : null,
  ].filter(Boolean);

  // Linked materials are strong signal for what the job physically involves.
  const materials = await getServiceMaterials(s.code).catch(() => []);
  if (materials.length > 0) {
    facts.push(
      `Materials typically used: ${materials.map((m) => m.name).slice(0, 12).join(", ")}`
    );
  }

  return `Write the scope of work for this service.\n\n${facts.join("\n")}`;
}

// ──────────────────────────────────────────────────────────────────────────
// Review queue
//
// 'approved' means "a human has reviewed this service's description and it is
// final" — whether they took the draft, edited it, or kept the original. The
// live `description` holds whatever they settled on. Nothing generated reaches
// a customer document without passing through here.
// ──────────────────────────────────────────────────────────────────────────

export interface ReviewItem {
  id: number;
  code: string;
  name: string;
  category: string | null;
  price_cents: number;
  /** The live description a customer would see today. */
  current: string | null;
  /** The AI draft awaiting a decision. */
  draft: string | null;
}

export async function listReviewQueue(limit = 200): Promise<ReviewItem[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase()
    .from("service_catalog")
    .select("id, code, name, category, price_cents, description, description_draft")
    .eq("description_status", "pending")
    .order("category", { ascending: true })
    .order("name", { ascending: true })
    .limit(limit);
  if (error) throw new Error(`listReviewQueue: ${error.message}`);
  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: Number(r.id),
    code: String(r.code),
    name: String(r.name),
    category: (r.category as string | null) ?? null,
    price_cents: Number(r.price_cents ?? 0),
    current: (r.description as string | null) ?? null,
    draft: (r.description_draft as string | null) ?? null,
  }));
}

export async function reviewQueueCount(): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  const { count } = await supabase()
    .from("service_catalog")
    .select("id", { count: "exact", head: true })
    .eq("description_status", "pending");
  return count ?? 0;
}

export interface DescriptionCounts {
  original: number; // never drafted
  pending: number; // drafted, awaiting review
  approved: number; // reviewed and final
}

export async function descriptionCounts(): Promise<DescriptionCounts> {
  if (!isSupabaseConfigured()) return { original: 0, pending: 0, approved: 0 };
  const sb = supabase();
  const one = async (status: string) =>
    (
      await sb
        .from("service_catalog")
        .select("id", { count: "exact", head: true })
        .eq("active", true)
        .eq("description_status", status)
    ).count ?? 0;
  const [original, pending, approved] = await Promise.all([
    one("original"),
    one("pending"),
    one("approved"),
  ]);
  return { original, pending, approved };
}

/** Accept a description (the edited draft) as final and make it live. */
export async function approveDescription(id: number, description: string): Promise<void> {
  const text = description.trim();
  if (!text) throw new Error("Cannot approve an empty description.");
  const { error } = await supabase()
    .from("service_catalog")
    .update({
      description: text,
      description_draft: null,
      description_status: "approved",
      description_reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(`approveDescription: ${error.message}`);
}

/** Reject the draft and keep the original live description. Still counts as reviewed. */
export async function keepOriginalDescription(id: number): Promise<void> {
  const { error } = await supabase()
    .from("service_catalog")
    .update({
      description_draft: null,
      description_status: "approved",
      description_reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(`keepOriginalDescription: ${error.message}`);
}

/** Re-draft one service (e.g. the reviewer didn't like the first attempt). */
export async function regenerateDescription(id: number): Promise<void> {
  const sb = supabase();
  const { data, error } = await sb
    .from("service_catalog")
    .select("id, code, name, category, price_cents, hours")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) throw new Error(`regenerateDescription: ${error?.message ?? "not found"}`);

  const draft = await generateDescriptionDraft(data as DraftableService);
  const { error: upErr } = await sb
    .from("service_catalog")
    .update({ description_draft: draft, description_status: "pending", updated_at: new Date().toISOString() })
    .eq("id", id);
  if (upErr) throw new Error(`regenerateDescription: ${upErr.message}`);
}

export async function generateDescriptionDraft(s: DraftableService): Promise<string> {
  const prompt = await buildPrompt(s);
  const { text, usage } = await generateText({
    model: MODEL,
    system: SYSTEM,
    prompt,
    temperature: 0.4,
  });
  void recordUsage({
    provider: "ai_gateway",
    model: MODEL,
    operation: "pricebook_draft",
    inputTokens: usage?.inputTokens ?? 0,
    outputTokens: usage?.outputTokens ?? 0,
  });
  return text.trim();
}

export interface DraftRunResult {
  drafted: number;
  failed: number;
  remaining: number;
  errors: Array<{ code: string; error: string }>;
}

/**
 * Draft descriptions for services that have never been reviewed.
 *
 * Bounded per call so a single run stays inside the function timeout; returns
 * how many are left so the UI can invite another pass. Concurrency is limited
 * to keep well under the model's rate limits.
 */
export async function draftPendingDescriptions(
  batch = 25,
  concurrency = 4
): Promise<DraftRunResult> {
  if (!isSupabaseConfigured()) {
    return { drafted: 0, failed: 0, remaining: 0, errors: [{ code: "-", error: "Supabase not configured" }] };
  }

  const sb = supabase();

  const { data: todo, error } = await sb
    .from("service_catalog")
    .select("id, code, name, category, price_cents, hours")
    .eq("active", true)
    .eq("description_status", "original")
    .order("category", { ascending: true })
    .limit(batch);

  if (error) {
    return { drafted: 0, failed: 0, remaining: 0, errors: [{ code: "-", error: error.message }] };
  }

  const services = (todo ?? []) as DraftableService[];
  const errors: Array<{ code: string; error: string }> = [];
  let drafted = 0;

  // Simple fixed-size worker pool over the batch.
  let cursor = 0;
  async function worker() {
    while (cursor < services.length) {
      const s = services[cursor++];
      try {
        const draft = await generateDescriptionDraft(s);
        const { error: upErr } = await sb
          .from("service_catalog")
          .update({ description_draft: draft, description_status: "pending", updated_at: new Date().toISOString() })
          .eq("id", s.id);
        if (upErr) throw new Error(upErr.message);
        drafted++;
      } catch (e) {
        errors.push({ code: s.code, error: (e as Error).message });
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, services.length) }, worker));

  const { count: remaining } = await sb
    .from("service_catalog")
    .select("id", { count: "exact", head: true })
    .eq("active", true)
    .eq("description_status", "original");

  return { drafted, failed: errors.length, remaining: remaining ?? 0, errors };
}
