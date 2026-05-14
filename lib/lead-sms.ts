/**
 * SMS notifications for the lead intake flow.
 *
 * Two distinct messages:
 *   1. Dispatch alert — goes to Jay's phone (DISPATCH_PHONE). Internal only,
 *      so the STOP-opt-out copy is not strictly required, but we include a
 *      compact alert with the key facts.
 *   2. Customer receipt — confirmation to the customer that the lead landed,
 *      with the office number and an opt-out instruction (A2P 10DLC rules).
 *
 * Both gracefully skip when Twilio or the relevant env var isn't configured.
 */

import { sendSms, toE164, isTwilioConfigured } from "@/lib/twilio";
import { siteSettings } from "@/content/site-settings";

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
  const rawDispatchPhone = process.env.DISPATCH_PHONE;
  if (!rawDispatchPhone) {
    return { ok: true, error: "DISPATCH_PHONE not set — skipped" };
  }
  const to = toE164(rawDispatchPhone);
  if (!to) {
    return { ok: false, error: `DISPATCH_PHONE is not a valid US number: ${rawDispatchPhone}` };
  }

  const prefix = input.outOfArea ? "⚠️ OUT-OF-AREA " : "";
  const body =
    `${prefix}New Z&Z lead: ${input.name} — ${input.serviceLabel} — ` +
    `${input.city} ${input.zip}. Call ${input.phoneFormatted}.`;

  const res = await sendSms({ to, body });
  return { ok: res.ok, error: res.errorMessage };
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
