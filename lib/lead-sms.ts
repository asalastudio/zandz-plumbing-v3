/**
 * SMS notifications for the lead intake flow.
 *
 * Two distinct messages:
 *   1. Dispatch alert — goes to the dispatch phones (DISPATCH_PHONE, which
 *      accepts a comma-separated list so Jay and Seif both get pinged).
 *      Internal only, so the STOP-opt-out copy is not strictly required, but
 *      we include a compact alert with the key facts.
 *   2. Customer receipt — confirmation to the customer that the lead landed,
 *      with the office number and an opt-out instruction (A2P 10DLC rules).
 *
 * Both gracefully skip when Twilio or the relevant env var isn't configured.
 */

import { sendSms, toE164, isTwilioConfigured } from "@/lib/twilio";
import { siteSettings } from "@/content/site-settings";

/**
 * Parse DISPATCH_PHONE into a list of E.164 numbers.
 *
 * Mirrors how DISPATCH_EMAIL is split in lib/resend.ts. Invalid entries are
 * reported rather than silently dropped — a typo'd dispatch number is the kind
 * of thing that hides for weeks otherwise.
 */
export function dispatchPhones(): { valid: string[]; invalid: string[] } {
  const raw = process.env.DISPATCH_PHONE ?? "";
  const valid: string[] = [];
  const invalid: string[] = [];

  for (const entry of raw.split(",").map((s) => s.trim()).filter(Boolean)) {
    const e164 = toE164(entry);
    if (e164) {
      if (!valid.includes(e164)) valid.push(e164);
    } else {
      invalid.push(entry);
    }
  }

  return { valid, invalid };
}

interface DispatchSmsInput {
  name: string;
  city: string;
  zip: string;
  serviceLabel: string;
  phoneFormatted: string;
  outOfArea: boolean;
}

export async function sendDispatchSms(
  input: DispatchSmsInput
): Promise<{ ok: boolean; error?: string }> {
  if (!isTwilioConfigured()) {
    return { ok: true, error: "Twilio env not set — skipped" };
  }
  if (!process.env.DISPATCH_PHONE) {
    return { ok: true, error: "DISPATCH_PHONE not set — skipped" };
  }

  const { valid, invalid } = dispatchPhones();
  if (valid.length === 0) {
    return {
      ok: false,
      error: `DISPATCH_PHONE has no valid US numbers (rejected: ${invalid.join(", ")})`,
    };
  }

  const prefix = input.outOfArea ? "⚠️ OUT-OF-AREA " : "";
  const body =
    `${prefix}New Z&Z lead: ${input.name} — ${input.serviceLabel} — ` +
    `${input.city} ${input.zip}. Call ${input.phoneFormatted}.`;

  // Send to every dispatcher independently. One bad number must not stop the
  // others from being alerted.
  const results = await Promise.all(
    valid.map(async (to) => ({ to, res: await sendSms({ to, body }) }))
  );

  const failures = results.filter((r) => !r.res.ok);
  const problems = [
    ...failures.map((f) => `${f.to}: ${f.res.errorMessage ?? "unknown error"}`),
    ...invalid.map((i) => `${i}: not a valid US number`),
  ];

  // Succeed if at least one dispatcher was reached; surface the rest in logs.
  return {
    ok: failures.length < valid.length,
    error: problems.length ? problems.join("; ") : undefined,
  };
}

interface CustomerReceiptInput {
  firstName: string;
  phoneE164: string;
  outOfArea: boolean;
}

export async function sendCustomerReceiptSms(
  input: CustomerReceiptInput
): Promise<{ ok: boolean; error?: string }> {
  if (!isTwilioConfigured()) {
    return { ok: true, error: "Twilio env not set — skipped" };
  }

  const to = toE164(input.phoneE164);
  if (!to) {
    return { ok: false, error: `Invalid customer phone: ${input.phoneE164}` };
  }

  const firstName = input.firstName.split(" ")[0];

  const body = input.outOfArea
    ? `Hi ${firstName}, this is ${siteSettings.name}. We got your request. Your ZIP is outside our regular service area, but we'll review and reach back out. Questions: ${siteSettings.phone}. Reply STOP to opt out.`
    : `Hi ${firstName}, this is ${siteSettings.name}. We got your request and will call you within ~15 minutes during business hours. Need to reach us first? ${siteSettings.phone}. Reply STOP to opt out.`;

  const res = await sendSms({ to, body });
  return { ok: res.ok, error: res.errorMessage };
}
