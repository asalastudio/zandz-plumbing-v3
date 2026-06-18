/**
 * Lead-related transactional email.
 *
 *   - sendDispatchEmail()             — internal alert to the dispatch inbox
 *                                       (DISPATCH_EMAIL) when a new lead lands.
 *                                       Reply-To is the customer so Jay can
 *                                       reply straight to them.
 *   - sendCustomerConfirmationEmail() — branded receipt to the customer
 *                                       confirming the request was received.
 *                                       Reply-To is the office inbox.
 *
 * Both use the shared branded layout + Resend wrapper in lib/email and skip
 * cleanly when RESEND_API_KEY (or DISPATCH_EMAIL) is unset.
 */

import {
  sendEmail,
  renderEmailLayout,
  emailButton,
  escapeHtml,
  escapeAttr,
  leadFromAddress,
  replyToInbox,
  BRAND,
  type EmailResult,
} from "@/lib/email";
import { siteSettings } from "@/content/site-settings";

interface DispatchEmailInput {
  name: string;
  phoneFormatted: string;
  phoneE164: string;
  email: string;
  zip: string;
  city: string;
  serviceLabel: string;
  preferredCallbackTime?: string;
  briefDescription?: string;
  outOfArea: boolean;
  sourcePage?: string;
  supabaseJobId?: number;
}

export async function sendDispatchEmail(input: DispatchEmailInput): Promise<EmailResult> {
  const to = process.env.DISPATCH_EMAIL;
  if (!to) {
    return { ok: true, skipped: true, error: "DISPATCH_EMAIL not set — skipped" };
  }
  const recipients = to.split(",").map((s) => s.trim()).filter(Boolean);

  const subject = input.outOfArea
    ? `⚠️ OUT-OF-AREA lead: ${input.name} — ${input.serviceLabel}`
    : `New lead: ${input.name} — ${input.serviceLabel} (${input.city})`;

  const html = renderEmailLayout({
    eyebrow: "New web lead",
    heading: input.name,
    headingSub: `${input.serviceLabel} · ${input.city} ${input.zip}`,
    preheader: `New lead: ${input.name}, ${input.serviceLabel} in ${input.city}`,
    bodyHtml: buildDispatchBody(input),
  });

  return sendEmail({
    from: leadFromAddress(),
    to: recipients,
    subject,
    html,
    text: buildDispatchText(input),
    replyTo: input.email,
  });
}

function buildDispatchBody(i: DispatchEmailInput): string {
  const banner = i.outOfArea
    ? `<div style="background:#FEF3C7;border-left:4px solid #F59E0B;padding:12px 16px;margin:0 0 18px;border-radius:4px;">
         <strong style="color:#92400E;">⚠️ Out-of-area request.</strong>
         <span style="color:#78350F;"> Verify before dispatch.</span>
       </div>`
    : "";

  const callbackRow = i.preferredCallbackTime
    ? row("Best time to call", capitalize(i.preferredCallbackTime))
    : "";
  const descriptionRow = i.briefDescription
    ? row("Customer notes", escapeHtml(i.briefDescription))
    : "";
  const sourceRow = i.sourcePage ? row("Source page", escapeHtml(i.sourcePage)) : "";

  const dashboardLine = i.supabaseJobId
    ? `<p style="margin-top:24px;font-size:13px;color:${BRAND.muted};">
         Job <strong>#${i.supabaseJobId}</strong> · open in
         <a href="https://www.zandzplumbing.com/admin/jobs" style="color:${BRAND.orange};font-weight:700;">Z and Z OS</a>
       </p>`
    : "";

  return `${banner}
    <table style="width:100%;border-collapse:collapse;">
      ${row("Phone", `<a href="tel:${escapeAttr(i.phoneE164)}" style="color:${BRAND.orange};font-weight:600;text-decoration:none;">${escapeHtml(i.phoneFormatted)}</a>`)}
      ${row("Email", `<a href="mailto:${escapeAttr(i.email)}" style="color:${BRAND.orange};text-decoration:none;">${escapeHtml(i.email)}</a>`)}
      ${row("Service", escapeHtml(i.serviceLabel))}
      ${row("ZIP", `${escapeHtml(i.zip)} · ${escapeHtml(i.city)}`)}
      ${callbackRow}
      ${descriptionRow}
      ${sourceRow}
    </table>
    <div style="margin-top:24px;">
      ${emailButton(`tel:${i.phoneE164}`, `Call ${i.phoneFormatted}`)}
    </div>
    ${dashboardLine}`;
}

function buildDispatchText(i: DispatchEmailInput): string {
  return [
    i.outOfArea ? "⚠️ OUT-OF-AREA — verify before dispatch.\n" : "",
    `NEW WEB LEAD`,
    `${i.name} — ${i.serviceLabel} — ${i.city} ${i.zip}`,
    ``,
    `Phone: ${i.phoneFormatted} (${i.phoneE164})`,
    `Email: ${i.email}`,
    i.preferredCallbackTime ? `Best time: ${capitalize(i.preferredCallbackTime)}` : "",
    i.briefDescription ? `Notes: ${i.briefDescription}` : "",
    i.sourcePage ? `Source: ${i.sourcePage}` : "",
    i.supabaseJobId ? `Job #${i.supabaseJobId} in Z and Z OS` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

// ── Customer confirmation ───────────────────────────────────────────────────

interface CustomerConfirmationInput {
  firstName: string;
  email: string;
  serviceLabel: string;
  outOfArea: boolean;
}

export async function sendCustomerConfirmationEmail(
  input: CustomerConfirmationInput
): Promise<EmailResult> {
  const to = input.email?.trim();
  if (!to) {
    return { ok: true, skipped: true, error: "no customer email — skipped" };
  }

  const first = input.firstName.split(" ")[0] || "there";
  const service = input.serviceLabel.toLowerCase();

  const intro = input.outOfArea
    ? `We received your request for ${escapeHtml(service)}. Your ZIP is outside our regular East Bay service area, but we will review it and reach back out.`
    : `We received your request for ${escapeHtml(service)} and will call you within about 15 minutes during business hours.`;

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#333;">Hi ${escapeHtml(first)}, thanks for reaching out to ${escapeHtml(siteSettings.name)}.</p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#444;">${intro}</p>
    <div style="margin:0 0 20px;">
      ${emailButton(`tel:${siteSettings.phoneTel}`, `Call ${siteSettings.phone}`)}
    </div>
    <p style="margin:0;font-size:13px;line-height:1.6;color:${BRAND.muted};">Need to reach us first? Call ${escapeHtml(siteSettings.phone)} or just reply to this email and it reaches our office.</p>`;

  const html = renderEmailLayout({
    eyebrow: "Request received",
    heading: `Thanks, ${first}.`,
    headingSub: input.outOfArea
      ? "We got your request and will be in touch."
      : "We got your request. A real person will call you shortly.",
    preheader: "We received your request and will call you shortly.",
    bodyHtml,
  });

  const text = [
    `Hi ${first}, thanks for reaching out to ${siteSettings.name}.`,
    ``,
    input.outOfArea
      ? `We received your request for ${service}. Your ZIP is outside our regular East Bay service area, but we will review it and reach back out.`
      : `We received your request for ${service} and will call you within about 15 minutes during business hours.`,
    ``,
    `Need to reach us first? Call ${siteSettings.phone}.`,
    `${siteSettings.name} · ${siteSettings.cslb}`,
  ].join("\n");

  return sendEmail({
    from: leadFromAddress(),
    to,
    subject: "We received your request",
    html,
    text,
    replyTo: replyToInbox(),
  });
}

// ── helpers ─────────────────────────────────────────────────────────────────

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;color:${BRAND.muted};font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;width:110px;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:8px 0;color:#111;font-size:14px;line-height:1.5;">${value}</td>
  </tr>`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
