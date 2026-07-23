/**
 * Customer-facing estimate email.
 *
 * Sends the branded estimate with the PDF attached, so the customer can review
 * and approve it. Mirrors the invoice email (lib/invoice-email.ts) — same
 * branded shell, PDF attachment, and graceful skip when Resend is unset.
 */

import type { InvoiceLineItem } from "@/lib/invoices";
import { siteSettings } from "@/content/site-settings";
import {
  sendEmail,
  renderEmailLayout,
  emailButton,
  escapeHtml,
  formatMoney,
  invoiceFromAddress,
  replyToInbox,
  BRAND,
  type EmailResult,
} from "@/lib/email";

interface SendEstimateEmailInput {
  to: string;
  customerName: string;
  estimateId: number;
  serviceLabel: string;
  amountCents: number;
  lineItems: InvoiceLineItem[];
  viewUrl: string;
  validUntil?: string | null;
  notes?: string | null;
}

/** Render the estimate PDF as an attachment. Best-effort — never blocks the email. */
async function estimatePdfAttachment(estimateId: number) {
  try {
    const { getEstimateForDocument } = await import("@/lib/estimates");
    const { renderEstimatePdf } = await import("@/lib/documents/estimate-pdf");
    const { loadLogo } = await import("@/lib/documents/logo");
    const data = await getEstimateForDocument(estimateId);
    if (!data) return undefined;
    const logo = await loadLogo();
    const pdf = await renderEstimatePdf(data, logo?.uri, logo?.isWordmark);
    return {
      filename: `Estimate-${estimateId}.pdf`,
      content: pdf.toString("base64"),
      contentType: "application/pdf",
    };
  } catch (err) {
    console.error("[estimate-email] PDF attach failed:", err);
    return undefined;
  }
}

function descriptionHtml(description: string): string {
  const [first = "", ...rest] = description.split("\n");
  const head = `<strong>${escapeHtml(first)}</strong>`;
  if (rest.length === 0) return head;
  return `${head}<br />${rest.map((line) => escapeHtml(line)).join("<br />")}`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export async function sendEstimateEmail(input: SendEstimateEmailInput): Promise<EmailResult> {
  const pdf = await estimatePdfAttachment(input.estimateId);

  const html = renderEmailLayout({
    eyebrow: "Estimate from Z and Z Plumbing",
    heading: formatMoney(input.amountCents),
    headingSub: `Estimate #${input.estimateId} · ${input.serviceLabel}`,
    preheader: `Your Z and Z Plumbing estimate for ${formatMoney(input.amountCents)} is ready to review.`,
    bodyHtml: buildBody(input),
  });

  return sendEmail({
    from: invoiceFromAddress(),
    to: input.to,
    subject: `Estimate #${input.estimateId} from Z and Z Plumbing`,
    html,
    text: buildText(input),
    replyTo: replyToInbox(),
    attachments: pdf ? [pdf] : undefined,
  });
}

function buildBody(i: SendEstimateEmailInput): string {
  return `
    <p style="margin:0 0 18px;font-size:16px;line-height:1.55;color:#333;">Hi ${escapeHtml(i.customerName)}, here is your ${escapeHtml(siteSettings.name)} estimate for review.</p>
    <table style="width:100%;border-collapse:collapse;margin:0 0 18px;">
      <thead>
        <tr>
          <th align="left" style="padding:8px 0;border-bottom:1px solid ${BRAND.hairline};font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:${BRAND.muted};">Scope</th>
          <th align="right" style="padding:8px 0;border-bottom:1px solid ${BRAND.hairline};font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:${BRAND.muted};">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${i.lineItems
          .map(
            (item) => `<tr>
              <td style="padding:12px 0;border-bottom:1px solid #F0F0F0;font-size:14px;line-height:1.5;color:#111;">
                ${descriptionHtml(item.description)}
              </td>
              <td align="right" style="padding:12px 0;border-bottom:1px solid #F0F0F0;font-size:14px;font-weight:700;color:#111;vertical-align:top;">${formatMoney(item.total_cents)}</td>
            </tr>`
          )
          .join("")}
      </tbody>
      <tfoot>
        <tr>
          <td style="padding:14px 0 0;font-size:16px;font-weight:800;">Estimate total</td>
          <td align="right" style="padding:14px 0 0;font-size:18px;font-weight:900;">${formatMoney(i.amountCents)}</td>
        </tr>
      </tfoot>
    </table>
    ${
      i.notes
        ? `<div style="background:${BRAND.panel};border-left:4px solid ${BRAND.orange};padding:12px 14px;margin:18px 0;color:#333;font-size:14px;line-height:1.5;">${escapeHtml(i.notes)}</div>`
        : ""
    }
    <p style="margin:0 0 18px;font-size:14px;line-height:1.55;color:#333;">
      This is an estimate, not a final bill. The full scope and terms are in the attached PDF.
      ${i.validUntil ? `This estimate is valid through <strong>${escapeHtml(fmtDate(i.validUntil))}</strong>.` : ""}
      To approve or ask a question, just reply to this email or call ${escapeHtml(siteSettings.phone)}.
    </p>
    <div style="margin-top:8px;">
      ${emailButton(i.viewUrl, "View estimate")}
    </div>
    <p style="margin:24px 0 0;font-size:13px;color:${BRAND.muted};line-height:1.5;">Questions? Call ${escapeHtml(siteSettings.phone)}.</p>`;
}

function buildText(i: SendEstimateEmailInput): string {
  const lines = i.lineItems.map((it) => `- ${it.description.split("\n")[0]}: ${formatMoney(it.total_cents)}`);
  return [
    `Hi ${i.customerName}, here is your ${siteSettings.name} estimate.`,
    "",
    `Estimate #${i.estimateId} — ${i.serviceLabel}`,
    ...lines,
    `Total: ${formatMoney(i.amountCents)}`,
    i.validUntil ? `Valid through ${fmtDate(i.validUntil)}.` : "",
    "",
    `This is an estimate, not a final bill. Full scope and terms are in the attached PDF.`,
    `Review: ${i.viewUrl}`,
    `Questions or to approve, reply to this email or call ${siteSettings.phone}.`,
  ]
    .filter(Boolean)
    .join("\n");
}
