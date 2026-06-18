/**
 * Shared branded email infrastructure for Z and Z Plumbing.
 *
 * Centralizes three things every scenario email needs:
 *   1. sendEmail()        — the Resend POST. Skips cleanly (ok + skipped) when
 *                           RESEND_API_KEY is unset, so the pipeline never
 *                           blocks on email.
 *   2. renderEmailLayout()— the branded HTML shell: black header + orange
 *                           eyebrow + white card + NAP/license footer.
 *   3. helpers            — escapeHtml/escapeAttr, emailButton, formatMoney,
 *                           and From/Reply-To resolution.
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

// ── Branded layout ──────────────────────────────────────────────────────────

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
  maxWidth?: number;
}

export function renderEmailLayout(i: LayoutInput): string {
  const width = i.maxWidth ?? 600;
  const preheader = i.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(i.preheader)}</div>`
    : "";

  return `<!doctype html>
<html><body style="margin:0;background:${BRAND.panel};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;color:${BRAND.ink};">
  ${preheader}
  <div style="max-width:${width}px;margin:0 auto;padding:24px 16px;">
    <div style="background:${BRAND.black};color:#fff;padding:24px;border-radius:8px 8px 0 0;">
      <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:${BRAND.orange};">${escapeHtml(i.eyebrow)}</p>
      <h1 style="margin:8px 0 0;font-size:26px;line-height:1.12;font-weight:900;letter-spacing:-0.01em;">${escapeHtml(i.heading)}</h1>
      ${i.headingSub ? `<p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:14px;line-height:1.5;">${escapeHtml(i.headingSub)}</p>` : ""}
    </div>
    <div style="background:#fff;border:1px solid ${BRAND.hairline};border-top:none;border-radius:0 0 8px 8px;padding:24px;">
      ${i.bodyHtml}
    </div>
    ${renderFooter()}
  </div>
</body></html>`;
}

function renderFooter(): string {
  const s = siteSettings;
  return `<div style="padding:18px 8px 4px;color:#9a9a9a;font-size:12px;line-height:1.6;text-align:center;">
    <p style="margin:0;font-weight:700;color:#7a7a7a;">${escapeHtml(s.name)}</p>
    <p style="margin:4px 0 0;">${escapeHtml(s.phone)} · ${escapeHtml(s.address.full)}</p>
    <p style="margin:4px 0 0;">${escapeHtml(s.cslb)} · ${escapeHtml(s.licenses.join(" · "))}</p>
  </div>`;
}

export function emailButton(
  href: string,
  label: string,
  variant: "primary" | "outline" = "primary"
): string {
  const base =
    "display:inline-block;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;font-size:13px;padding:14px 22px;border-radius:6px;text-decoration:none;";
  const style =
    variant === "primary"
      ? `${base}background:${BRAND.orange};color:#fff;`
      : `${base}border:1px solid #999;color:${BRAND.ink};`;
  return `<a href="${escapeAttr(href)}" style="${style}">${escapeHtml(label)}</a>`;
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
