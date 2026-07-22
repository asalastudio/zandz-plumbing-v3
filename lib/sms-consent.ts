/**
 * First-party SMS consent ledger.
 *
 * A2P 10DLC campaigns are approved on a stated opt-in flow ("customer ticks a
 * consent checkbox on the web form"). If a carrier ever audits, we have to be
 * able to show, per phone number, that consent was actually captured and when.
 *
 * That evidence used to live in HubSpot's `sms_consent` contact property. With
 * HubSpot dropped, the OS has to keep the record itself — so every lead writes
 * here, including refusals, because "they declined" is as important to prove as
 * "they agreed".
 *
 * The table is keyed on phone_e164 (unique as of migration 012), so a repeat
 * customer updates their existing row rather than stacking duplicates.
 */

import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type ConsentSource = "web_form" | "verbal" | "admin_manual";

export interface RecordConsentInput {
  phoneE164: string;
  customerName: string;
  consented: boolean;
  source: ConsentSource;
  customerId?: number;
  jobId?: number;
}

export async function recordSmsConsent(
  input: RecordConsentInput
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: true, error: "Supabase not configured — skipped" };
  }

  try {
    const { error } = await supabase()
      .from("sms_consent")
      .upsert(
        {
          phone_e164: input.phoneE164,
          customer_name: input.customerName || "there",
          consented: input.consented,
          consent_source: input.source,
          // Only stamp a capture time when they actually said yes. A refusal
          // has no consent moment to record.
          consent_captured_at: input.consented ? new Date().toISOString() : null,
          customer_id: input.customerId ?? null,
          job_id: input.jobId ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "phone_e164" }
      );

    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/**
 * Has this number opted in to texts, and not since opted out?
 *
 * Checks both sides: an affirmative consent row AND the absence of a STOP
 * record. The opt-out list wins — a STOP reply revokes prior consent no matter
 * what the ledger says.
 */
export async function hasSmsConsent(phoneE164: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const sb = supabase();

  const { data: optedOut } = await sb
    .from("sms_opt_outs")
    .select("phone_e164")
    .eq("phone_e164", phoneE164)
    .maybeSingle();
  if (optedOut) return false;

  const { data: consent } = await sb
    .from("sms_consent")
    .select("consented")
    .eq("phone_e164", phoneE164)
    .maybeSingle();

  return consent?.consented === true;
}
