/**
 * Text (SMS) delivery for invoices.
 *
 * Sends a short branded message with the amount and a link to the public
 * invoice view, plus the legally required STOP opt-out. Skips cleanly when
 * Twilio is not configured (it is dormant until the A2P 10DLC setup is live).
 */

import { sendSms, toE164, isTwilioConfigured } from "@/lib/twilio";
import { siteSettings } from "@/content/site-settings";
import { formatMoney } from "@/lib/email";

interface SendInvoiceSmsInput {
  toPhoneE164: string;
  customerName: string;
  invoiceId: number;
  amountCents: number;
  viewUrl: string;
}

export async function sendInvoiceSms(
  input: SendInvoiceSmsInput
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  if (!isTwilioConfigured()) {
    return { ok: true, skipped: true, error: "Twilio not configured — skipped" };
  }

  const to = toE164(input.toPhoneE164);
  if (!to) {
    return { ok: false, error: `invalid phone: ${input.toPhoneE164}` };
  }

  const first = input.customerName.split(" ")[0] || "there";
  const body =
    `Hi ${first}, this is ${siteSettings.name}. Your invoice #${input.invoiceId} ` +
    `for ${formatMoney(input.amountCents)} is ready: ${input.viewUrl}\n\n` +
    `Questions or to pay, call ${siteSettings.phone}. Reply STOP to opt out.`;

  const res = await sendSms({ to, body });
  return { ok: res.ok, error: res.errorMessage };
}
