/**
 * API usage + cost tracking.
 *
 * Records metered model calls (the assistant, pricebook generation) with an
 * estimated cost, so the analytics page can show what the platform's AI is
 * spending each month. Recording is best-effort — a logging failure must never
 * break the thing being logged.
 */

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { startOfPacificMonth } from "@/lib/time";

/**
 * Approximate model rates in micro-dollars (1e-6 USD) per token, [input, output].
 * These are estimates for a month-to-date gauge, not billing — the panel labels
 * them as such. Matched by substring, longest first.
 */
const RATES: Array<{ match: string; input: number; output: number }> = [
  { match: "opus", input: 15, output: 75 },
  { match: "sonnet", input: 3, output: 15 },
  { match: "haiku", input: 0.8, output: 4 },
  { match: "gpt-5", input: 5, output: 15 },
  { match: "gemini", input: 0.15, output: 0.6 },
];
const DEFAULT_RATE = { input: 3, output: 15 };

function rateFor(model: string | undefined) {
  const m = (model ?? "").toLowerCase();
  return RATES.find((r) => m.includes(r.match)) ?? DEFAULT_RATE;
}

export function estimateCostMicros(
  model: string | undefined,
  inputTokens: number,
  outputTokens: number
): number {
  const r = rateFor(model);
  return Math.round(inputTokens * r.input + outputTokens * r.output);
}

export interface RecordUsageInput {
  provider: string; // 'ai_gateway'
  model?: string;
  operation?: string;
  inputTokens?: number;
  outputTokens?: number;
  /** Pre-computed cost; otherwise estimated from tokens + model rate. */
  costMicros?: number;
}

export async function recordUsage(input: RecordUsageInput): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const inputTokens = Math.max(0, Math.round(input.inputTokens ?? 0));
  const outputTokens = Math.max(0, Math.round(input.outputTokens ?? 0));
  const costMicros =
    input.costMicros ?? estimateCostMicros(input.model, inputTokens, outputTokens);

  try {
    await supabase().from("api_usage").insert({
      provider: input.provider,
      model: input.model ?? null,
      operation: input.operation ?? null,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cost_micros: costMicros,
    });
  } catch (err) {
    console.error("[api-usage] record failed:", err);
  }
}

export interface ProviderSpend {
  provider: string;
  calls: number;
  inputTokens: number;
  outputTokens: number;
  costMicros: number;
}

export interface UsageSummary {
  monthLabel: string;
  byProvider: ProviderSpend[];
  totalMicros: number;
  /** Live ElevenLabs figures, when the key is set. */
  elevenLabs?: {
    charactersUsed: number;
    characterLimit: number;
    nextInvoiceCents: number | null;
    tier: string | null;
  };
}

/** Micro-dollars to a display string. */
export function formatMicros(micros: number): string {
  const dollars = micros / 1_000_000;
  if (dollars > 0 && dollars < 0.01) return "<$0.01";
  return `$${dollars.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export async function getMonthUsage(): Promise<UsageSummary> {
  const monthStart = startOfPacificMonth().toISOString();
  const monthLabel = new Date().toLocaleDateString("en-US", {
    timeZone: "America/Los_Angeles",
    month: "long",
    year: "numeric",
  });

  const byProvider: ProviderSpend[] = [];
  let totalMicros = 0;

  if (isSupabaseConfigured()) {
    const { data } = await supabase()
      .from("api_usage")
      .select("provider, input_tokens, output_tokens, cost_micros")
      .gte("created_at", monthStart)
      .limit(10000);

    const acc = new Map<string, ProviderSpend>();
    for (const row of data ?? []) {
      const key = String(row.provider ?? "unknown");
      const e = acc.get(key) ?? {
        provider: key,
        calls: 0,
        inputTokens: 0,
        outputTokens: 0,
        costMicros: 0,
      };
      e.calls += 1;
      e.inputTokens += Number(row.input_tokens ?? 0);
      e.outputTokens += Number(row.output_tokens ?? 0);
      e.costMicros += Number(row.cost_micros ?? 0);
      acc.set(key, e);
    }
    for (const e of acc.values()) {
      byProvider.push(e);
      totalMicros += e.costMicros;
    }
    byProvider.sort((a, b) => b.costMicros - a.costMicros);
  }

  const elevenLabs = await elevenLabsUsage();

  return { monthLabel, byProvider, totalMicros, elevenLabs };
}

/** Live ElevenLabs subscription usage. Returns undefined if the key is unset. */
async function elevenLabsUsage(): Promise<UsageSummary["elevenLabs"]> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return undefined;
  try {
    const res = await fetch("https://api.elevenlabs.io/v1/user/subscription", {
      headers: { "xi-api-key": key },
      cache: "no-store",
    });
    if (!res.ok) return undefined;
    const d = (await res.json()) as {
      character_count?: number;
      character_limit?: number;
      tier?: string;
      next_invoice?: { amount_due_cents?: number };
    };
    return {
      charactersUsed: d.character_count ?? 0,
      characterLimit: d.character_limit ?? 0,
      nextInvoiceCents: d.next_invoice?.amount_due_cents ?? null,
      tier: d.tier ?? null,
    };
  } catch {
    return undefined;
  }
}
