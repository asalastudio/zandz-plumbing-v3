/**
 * Shared branded email infrastructure for Z and Z Plumbing.
 *
 *   1. sendEmail()        — the Resend POST. Skips cleanly (ok + skipped) when
 *                           RESEND_API_KEY is unset, so the pipeline never
 *                           blocks on email.
 *   2. renderEmailLayout()— the branded shell, built with email-bulletproof
 *                           HTML: real <head> + MSO conditionals, table-based
 *                           layout (Outlook ignores max-width on divs), a
 *                           logo lockup, black header, white card, and an
 *                           NAP/license footer.
 *   3. emailButton()      — a bulletproof table-cell button (padding on the
 *                           <td> so Outlook renders it), not a bare <a>.
 *   4. helpers            — escapeHtml/escapeAttr, formatMoney, From/Reply-To.
 *
 * Brand is Home Depot-inspired: orange #F96302, black, white. Per the brand
 * voice rules, no em-dashes in customer-facing copy.
 */

import { siteSettings } from "@/content/site-settings";

export const BRAND = {
  orange: "#F96302",
  black: "#000000",
  ink: "#111111",
  muted: "#666666",
  hairline: "#E5E5E5",
  panel: "#F5F5F5",
} as const;

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

const LOGO_URL = `${siteSettings.siteUrl}/email/logo-icon.png`;

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export type EmailResult = { ok: boolean; skipped?: boolean; error?: string };

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  /** Defaults to the lead From address. */
  from?: string;
  /** Where replies should go. Omit for internal mail. */
  replyTo?: string;
}

/**
 * Send through Resend. Returns ok+skipped (never throws on config) when the
 * API key is missing so callers can treat email as best-effort.
 */
export async function sendEmail(input: SendEmailInput): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: true, skipped: true, error: "RESEND_API_KEY is not set" };
  }

  const recipients = (Array.isArray(input.to) ? input.to : [input.to])
    .map((s) => s.trim())
    .filter(Boolean);
  if (recipients.length === 0) {
    return { ok: true, skipped: true, error: "no recipients" };
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: input.from ?? leadFromAddress(),
        to: recipients,
        subject: input.subject,
        html: input.html,
        text: input.text,
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { ok: false, error: `Resend ${res.status}: ${err}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

// ── From + Reply-To resolution ──────────────────────────────────────────────

export function leadFromAddress(): string {
  return process.env.LEAD_FROM_EMAIL ?? "Z and Z Plumbing <leads@zandzplumbing.com>";
}

export function invoiceFromAddress(): string {
  return (
    process.env.INVOICE_FROM_EMAIL ??
    process.env.LEAD_FROM_EMAIL ??
    "Z and Z Plumbing <invoices@zandzplumbing.com>"
  );
}

/**
 * Where customer replies should land. The sending domain may be send-only
 * (e.g. a notifications subdomain with no inbox), so customer-facing emails
 * set Reply-To to a real, monitored Workspace inbox.
 */
export function replyToInbox(): string {
  return process.env.REPLY_TO_EMAIL ?? siteSettings.email;
}

// ── Branded layout (bulletproof, table-based) ───────────────────────────────

export interface LayoutInput {
  /** small uppercase orange label above the heading */
  eyebrow: string;
  /** large white heading on the black header band */
  heading: string;
  /** optional muted subline under the heading */
  headingSub?: string;
  /** inner HTML for the white card */
  bodyHtml: string;
  /** hidden inbox-preview text */
  preheader?: string;
  /** unused; kept for signature compatibility (fixed 600px) */
  maxWidth?: number;
}

export function renderEmailLayout(i: LayoutInput): string {
  const preheader = i.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;opacity:0;">${escapeHtml(i.preheader)}‌${"&nbsp;".repeat(60)}</div>`
    : "";

  return `<!doctype html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="x-ua-compatible" content="ie=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${escapeHtml(siteSettings.name)}</title>
<!--[if mso]>
<style>table,td,th{mso-line-height-rule:exactly;border-collapse:collapse}</style>
<![endif]-->
</head>
<body style="margin:0;padding:0;background:${BRAND.panel};-webkit-text-size-adjust:100%;">
${preheader}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.panel};">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
        <tr>
          <td style="padding:0 4px 16px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="vertical-align:middle;"><img src="${escapeAttr(LOGO_URL)}" width="40" height="40" alt="${escapeAttr(siteSettings.name)}" style="display:block;border:0;outline:none;text-decoration:none;width:40px;height:40px;"></td>
                <td style="vertical-align:middle;padding-left:10px;font-family:${FONT};font-size:17px;font-weight:800;letter-spacing:0.05em;color:${BRAND.ink};text-transform:uppercase;">${escapeHtml(siteSettings.name)}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:${BRAND.black};border-radius:8px 8px 0 0;padding:24px;font-family:${FONT};">
            <div style="font-size:11px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:${BRAND.orange};">${escapeHtml(i.eyebrow)}</div>
            <div style="font-size:26px;line-height:1.14;font-weight:900;letter-spacing:-0.01em;color:#ffffff;padding-top:8px;">${escapeHtml(i.heading)}</div>
            ${i.headingSub ? `<div style="font-size:14px;line-height:1.5;color:rgba(255,255,255,0.7);padding-top:8px;">${escapeHtml(i.headingSub)}</div>` : ""}
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;border:1px solid ${BRAND.hairline};border-top:none;border-radius:0 0 8px 8px;padding:24px;font-family:${FONT};color:${BRAND.ink};">
            ${i.bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:18px 8px 4px;text-align:center;font-family:${FONT};color:#9a9a9a;font-size:12px;line-height:1.6;">
            <div style="font-weight:700;color:#7a7a7a;">${escapeHtml(siteSettings.name)}</div>
            <div style="padding-top:4px;">${escapeHtml(siteSettings.phone)} · ${escapeHtml(siteSettings.address.full)}</div>
            <div style="padding-top:4px;">${escapeHtml(siteSettings.cslb)} · ${escapeHtml(siteSettings.licenses.join(" · "))}</div>
          </td>
        </tr>
      </table>
      <!--[if mso]></td></tr></table><![endif]-->
    </td>
  </tr>
</table>
</body></html>`;
}

/**
 * Bulletproof button. Padding lives on the <td> (Outlook ignores padding on
 * <a>), and the cell carries the fill/border so it renders everywhere.
 */
export function emailButton(
  href: string,
  label: string,
  variant: "primary" | "outline" = "primary"
): string {
  const cell =
    variant === "primary"
      ? `background:${BRAND.orange};border-radius:6px;`
      : `border:1px solid #999999;border-radius:6px;`;
  const text = variant === "primary" ? "#ffffff" : BRAND.ink;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-block;"><tr><td align="center" style="${cell}padding:13px 22px;font-family:${FONT};">
    <a href="${escapeAttr(href)}" style="color:${text};text-decoration:none;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;font-family:${FONT};">${escapeHtml(label)}</a>
  </td></tr></table>`;
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Stricter encoder for href/src attribute values. */
export function escapeAttr(s: string): string {
  return encodeURI(s).replace(/"/g, "%22").replace(/'/g, "%27");
}

export function formatMoney(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}
