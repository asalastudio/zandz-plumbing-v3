/**
 * Lead intake orchestration.
 *
 * Single entry point called from the public /api/lead route.
 * Each side-effect (Supabase insert, HubSpot post, email, SMS) runs
 * independently and reports back its own ok/error — one failure should NOT
 * block the others. The form caller only learns "did we record the lead"
 * (Supabase ok). Everything else is reported to logs.
 */

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { submitLead as submitLeadToHubSpotForm, type LeadPayload } from "@/lib/hubspot";
import { createHubSpotDeal } from "@/lib/hubspot-deals";
import { sendDispatchEmail } from "@/lib/resend";
import { sendDispatchSms, sendCustomerReceiptSms } from "@/lib/lead-sms";
import { toE164 } from "@/lib/twilio";

export interface LeadInput extends LeadPayload {
  serviceLabel?: string;
  outOfArea?: boolean;
  serviceAreaSlug?: string;
}

export interface LeadResult {
  ok: boolean;
  supabaseJobId?: number;
  supabaseCustomerId?: number;
  outcomes: {
    supabase: SideEffect;
    hubspotForm: SideEffect;
    hubspotDeal: SideEffect;
    dispatchEmail: SideEffect;
    dispatchSms: SideEffect;
    customerSms: SideEffect;
  };
}

type SideEffect = { ok: boolean; skipped?: boolean; detail?: string };

const okSkipped = (detail: string): SideEffect => ({ ok: true, skipped: true, detail });
const okDone = (detail?: string): SideEffect => ({ ok: true, detail });
const failed = (detail: string): SideEffect => ({ ok: false, detail });

export async function ingestLead(input: LeadInput): Promise<LeadResult> {
  const fullName = `${input.firstName} ${input.lastName}`.trim();
  const phoneE164 = toE164(input.phone);
  if (!phoneE164) {
    return {
      ok: false,
      outcomes: {
        supabase: failed(`Could not normalize phone to E.164: ${input.phone}`),
        hubspotForm: okSkipped("blocked by phone validation"),
        hubspotDeal: okSkipped("blocked by phone validation"),
        dispatchEmail: okSkipped("blocked by phone validation"),
        dispatchSms: okSkipped("blocked by phone validation"),
        customerSms: okSkipped("blocked by phone validation"),
      },
    };
  }
  const cityFromArea = deriveCity(input);

  // ── 1. Supabase: customer + job (the source of truth for the admin UI) ──
  let supabaseJobId: number | undefined;
  let supabaseCustomerId: number | undefined;
  let supabaseOutcome: SideEffect;

  if (!isSupabaseConfigured()) {
    supabaseOutcome = failed("Supabase env not set");
  } else {
    try {
      const sb = supabase();

      // Upsert customer by phone_e164 (or email if phone missing). Avoids dupes
      // when an existing customer submits a new request.
      let customerId: number | undefined;

      if (phoneE164) {
        const { data: existing } = await sb
          .from("customers")
          .select("id")
          .eq("phone_e164", phoneE164)
          .limit(1)
          .maybeSingle();
        if (existing?.id) customerId = existing.id as number;
      }
      if (!customerId && input.email) {
        const { data: existing } = await sb
          .from("customers")
          .select("id")
          .eq("email", input.email)
          .limit(1)
          .maybeSingle();
        if (existing?.id) customerId = existing.id as number;
      }

      if (!customerId) {
        const { data: inserted, error: insErr } = await sb
          .from("customers")
          .insert({
            name: fullName,
            phone_e164: phoneE164,
            email: input.email,
            zip: input.zip,
            city: cityFromArea,
          })
          .select("id")
          .single();
        if (insErr) throw new Error(`customer insert: ${insErr.message}`);
        customerId = inserted.id as number;
      }

      supabaseCustomerId = customerId;

      const internalNotes = buildInternalNotes(input);
      const { data: jobRow, error: jobErr } = await sb
        .from("jobs")
        .insert({
          customer_id: customerId,
          service_type: input.serviceInterest,
          service_label: input.serviceLabel ?? input.serviceInterest,
          status: "new",
          job_zip: input.zip,
          job_city: cityFromArea,
          customer_notes: input.briefDescription ?? null,
          internal_notes: internalNotes,
        })
        .select("id")
        .single();
      if (jobErr) throw new Error(`job insert: ${jobErr.message}`);

      supabaseJobId = jobRow.id as number;
      supabaseOutcome = okDone(`job ${supabaseJobId}`);
    } catch (err) {
      console.error("[leads] Supabase write failed:", err);
      supabaseOutcome = failed((err as Error).message);
    }
  }

  // ── 2. HubSpot Forms API (top-of-funnel intake) ──
  const hubspotFormRes = await safeAwait(
    submitLeadToHubSpotForm(input),
    "hubspot form submit"
  );

  // ── 3. HubSpot CRM Deal (sales pipeline) ──
  const hubspotDealRes = await safeAwait(
    createHubSpotDeal({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: phoneE164,
      zip: input.zip,
      serviceLabel: input.serviceLabel ?? input.serviceInterest,
      briefDescription: input.briefDescription,
      sourcePage: input.sourcePage,
      outOfArea: input.outOfArea ?? false,
    }),
    "hubspot deal create"
  );

  // ── 4. Dispatch email (Resend) ──
  const dispatchEmailRes = await safeAwait(
    sendDispatchEmail({
      name: fullName,
      phoneFormatted: input.phone,
      phoneE164: phoneE164,
      email: input.email,
      zip: input.zip,
      city: cityFromArea ?? "(unknown)",
      serviceLabel: input.serviceLabel ?? input.serviceInterest,
      preferredCallbackTime: input.preferredCallbackTime,
      briefDescription: input.briefDescription,
      outOfArea: input.outOfArea ?? false,
      sourcePage: input.sourcePage,
      supabaseJobId,
    }),
    "dispatch email"
  );

  // ── 5. Dispatch SMS (Twilio) ──
  const dispatchSmsRes = await safeAwait(
    sendDispatchSms({
      name: fullName,
      city: cityFromArea ?? input.zip,
      zip: input.zip,
      serviceLabel: input.serviceLabel ?? input.serviceInterest,
      phoneFormatted: input.phone,
      outOfArea: input.outOfArea ?? false,
    }),
    "dispatch sms"
  );

  // ── 6. Customer SMS receipt (Twilio) ──
  let customerSmsRes: SideEffect;
  if (!input.smsConsent) {
    customerSmsRes = okSkipped("customer declined SMS consent");
  } else {
    customerSmsRes = await safeAwait(
      sendCustomerReceiptSms({
        firstName: input.firstName,
        phoneE164: phoneE164,
        outOfArea: input.outOfArea ?? false,
      }),
      "customer sms"
    );
  }

  return {
    ok: supabaseOutcome.ok,
    supabaseJobId,
    supabaseCustomerId,
    outcomes: {
      supabase: supabaseOutcome,
      hubspotForm: hubspotFormRes,
      hubspotDeal: hubspotDealRes,
      dispatchEmail: dispatchEmailRes,
      dispatchSms: dispatchSmsRes,
      customerSms: customerSmsRes,
    },
  };
}

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

import { serviceAreas } from "@/content/service-areas";

function deriveCity(input: LeadInput): string | null {
  // First try the explicit serviceAreaSlug the client passed
  if (input.serviceAreaSlug) {
    const a = serviceAreas.find((s) => s.slug === input.serviceAreaSlug);
    if (a) return a.city;
  }
  // Fallback: look up by ZIP
  const a = serviceAreas.find((s) => s.zips.includes(input.zip));
  return a?.city ?? null;
}

function buildInternalNotes(input: LeadInput): string {
  const parts: string[] = [];
  if (input.outOfArea) parts.push("⚠️ OUT_OF_AREA — verify before dispatch");
  parts.push(`Web lead via ${input.sourcePage ?? "unknown source"}`);
  if (input.preferredCallbackTime) {
    parts.push(`Preferred callback: ${input.preferredCallbackTime}`);
  }
  if (input.smsConsent === false) parts.push("Customer declined SMS");
  return parts.join("\n");
}

async function safeAwait<T extends { ok: boolean; error?: string }>(
  promise: Promise<T>,
  label: string
): Promise<SideEffect> {
  try {
    const r = await promise;
    if (r.ok && r.error) return okSkipped(r.error);
    if (r.ok) return okDone();
    return failed(r.error ?? `${label} returned ok=false`);
  } catch (err) {
    console.error(`[leads] ${label} threw:`, err);
    return failed((err as Error).message);
  }
}
