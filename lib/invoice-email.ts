/**
 * Customer-facing invoice email + paid receipt.
 *
 *   - sendInvoiceEmail()        — the invoice itself (line items, payment
 *                                 options, pay/call CTA, view-job link).
 *   - sendInvoiceReceiptEmail() — confirmation that a payment was received.
 *
 * Both use the shared branded layout + Resend wrapper in lib/email, set
 * Reply-To to the office inbox, and skip cleanly when RESEND_API_KEY is unset.
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

interface SendInvoiceEmailInput {
  to: string;
  customerName: string;
  invoiceId: number;
  serviceLabel: string;
  amountCents: number;
  lineItems: InvoiceLineItem[];
  trackingUrl: string;
  paymentUrl?: string | null;
  notes?: string | null;
}

export async function sendInvoiceEmail(input: SendInvoiceEmailInput): Promise<EmailResult> {
  const html = renderEmailLayout({
    eyebrow: "Invoice from Z and Z Plumbing",
    heading: formatMoney(input.amountCents),
    headingSub: `Invoice #${input.invoiceId} · ${input.serviceLabel}`,
    preheader: `Your Z and Z Plumbing invoice for ${formatMoney(input.amountCents)} is ready.`,
    bodyHtml: buildInvoiceBody(input),
  });

  return sendEmail({
    from: invoiceFromAddress(),
    to: input.to,
    subject: `Invoice #${input.invoiceId} from Z and Z Plumbing`,
    html,
    text: buildInvoiceText(input),
    replyTo: replyToInbox(),
  });
}

function buildInvoiceBody(i: SendInvoiceEmailInput): string {
  const paymentButton = i.paymentUrl
    ? emailButton(i.paymentUrl, "Pay invoice")
    : emailButton(`tel:${siteSettings.phoneTel}`, "Call to arrange payment");

  return `
    <p style="margin:0 0 18px;font-size:16px;line-height:1.55;color:#333;">Hi ${escapeHtml(i.customerName)}, your ${escapeHtml(siteSettings.name)} invoice is ready.</p>
    <table style="width:100%;border-collapse:collapse;margin:0 0 18px;">
      <thead>
        <tr>
          <th align="left" style="padding:8px 0;border-bottom:1px solid ${BRAND.hairline};font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:${BRAND.muted};">Item</th>
          <th align="right" style="padding:8px 0;border-bottom:1px solid ${BRAND.hairline};font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:${BRAND.muted};">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${i.lineItems
          .map(
            (item) => `<tr>
              <td style="padding:12px 0;border-bottom:1px solid #F0F0F0;font-size:14px;line-height:1.4;color:#111;">
                <strong>${escapeHtml(item.description)}</strong><br />
                <span style="color:${BRAND.muted};">${item.quantity} x ${formatMoney(item.unit_price_cents)}</span>
              </td>
              <td align="right" style="padding:12px 0;border-bottom:1px solid #F0F0F0;font-size:14px;font-weight:700;color:#111;">${formatMoney(item.total_cents)}</td>
            </tr>`
          )
          .join("")}
      </tbody>
      <tfoot>
        <tr>
          <td style="padding:14px 0 0;font-size:16px;font-weight:800;">Total</td>
          <td align="right" style="padding:14px 0 0;font-size:18px;font-weight:900;">${formatMoney(i.amountCents)}</td>
        </tr>
      </tfoot>
    </table>
    ${
      i.notes
        ? `<div style="background:${BRAND.panel};border-left:4px solid ${BRAND.orange};padding:12px 14px;margin:18px 0;color:#333;font-size:14px;line-height:1.5;">${escapeHtml(i.notes)}</div>`
        : ""
    }
    <div style="background:#F8F8F8;border:1px solid ${BRAND.hairline};padding:16px;margin:22px 0 0;border-radius:6px;">
      <p style="margin:0 0 10px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:${BRAND.muted};">Payment options</p>
      <ul style="margin:0;padding-left:20px;color:#333;font-size:14px;line-height:1.65;">
        ${
          i.paymentUrl
            ? `<li><strong>Card or online payment:</strong> use the Pay invoice button.</li>`
            : `<li><strong>Card payment:</strong> call ${escapeHtml(siteSettings.phone)} to arrange payment.</li>`
        }
        <li><strong>Check:</strong> make checks payable to ${escapeHtml(siteSettings.legalName)}.</li>
        <li><strong>Cash:</strong> accepted in certain circumstances. Please confirm with Z and Z first and make sure the payment is recorded on your receipt.</li>
      </ul>
    </div>
    <div style="margin-top:24px;">
      ${paymentButton}
      <span style="display:inline-block;width:8px;"></span>
      ${emailButton(i.trackingUrl, "View job", "outline")}
    </div>
    <p style="margin:24px 0 0;font-size:13px;color:${BRAND.muted};line-height:1.5;">Questions? Call ${escapeHtml(siteSettings.phone)}.</p>`;
}

function buildInvoiceText(i: SendInvoiceEmailInput): string {
  return [
    `Invoice #${i.invoiceId} from ${siteSettings.name}`,
    `${i.serviceLabel}`,
    ``,
    ...i.lineItems.map(
      (item) =>
        `${item.description}: ${item.quantity} x ${formatMoney(item.unit_price_cents)} = ${formatMoney(item.total_cents)}`
    ),
    ``,
    `Total: ${formatMoney(i.amountCents)}`,
    i.notes ? `Notes: ${i.notes}` : "",
    i.paymentUrl ? `Pay invoice: ${i.paymentUrl}` : `Call to pay: ${siteSettings.phone}`,
    `Payment options: card/online when enabled, check payable to ${siteSettings.legalName}, or cash in certain circumstances with Z and Z confirmation.`,
    `View job: ${i.trackingUrl}`,
  ]
    .filter(Boolean)
    .join("\n");
}

// ── Paid receipt ────────────────────────────────────────────────────────────

interface SendInvoiceReceiptInput {
  to: string;
  customerName: string;
  invoiceId: number;
  amountCents: number;
  serviceLabel: string;
  paymentMethod: string;
  trackingUrl?: string | null;
}

export async function sendInvoiceReceiptEmail(
  input: SendInvoiceReceiptInput
): Promise<EmailResult> {
  const to = input.to?.trim();
  if (!to) {
    return { ok: true, skipped: true, error: "no customer email — skipped" };
  }

  const method = prettyMethod(input.paymentMethod);
  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#333;">Hi ${escapeHtml(input.customerName)}, thank you. We received your payment.</p>
    <table style="width:100%;border-collapse:collapse;margin:0 0 8px;">
      ${receiptRow("Invoice", `#${input.invoiceId}`)}
      ${receiptRow("Service", escapeHtml(input.serviceLabel))}
      ${receiptRow("Amount paid", `<strong>${formatMoney(input.amountCents)}</strong>`)}
      ${receiptRow("Payment method", escapeHtml(method))}
    </table>
    ${
      input.trackingUrl
        ? `<div style="margin-top:22px;">${emailButton(input.trackingUrl, "View job", "outline")}</div>`
        : ""
    }
    <p style="margin:24px 0 0;font-size:13px;color:${BRAND.muted};line-height:1.5;">Thanks for choosing ${escapeHtml(siteSettings.name)}. Questions about this receipt? Call ${escapeHtml(siteSettings.phone)} or reply to this email.</p>`;

  const html = renderEmailLayout({
    eyebrow: "Payment received",
    heading: "Thank you",
    headingSub: `${formatMoney(input.amountCents)} · Invoice #${input.invoiceId}`,
    preheader: `We received your payment of ${formatMoney(input.amountCents)}.`,
    bodyHtml,
  });

  const text = [
    `Payment received - thank you, ${input.customerName}.`,
    ``,
    `Invoice #${input.invoiceId}`,
    `Service: ${input.serviceLabel}`,
    `Amount paid: ${formatMoney(input.amountCents)}`,
    `Payment method: ${method}`,
    ``,
    `Questions? Call ${siteSettings.phone}.`,
    `${siteSettings.name} · ${siteSettings.cslb}`,
  ].join("\n");

  return sendEmail({
    from: invoiceFromAddress(),
    to,
    subject: `Payment received for invoice #${input.invoiceId}`,
    html,
    text,
    replyTo: replyToInbox(),
  });
}

function receiptRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;border-bottom:1px solid #F0F0F0;color:${BRAND.muted};font-size:13px;width:140px;">${escapeHtml(label)}</td>
    <td align="right" style="padding:8px 0;border-bottom:1px solid #F0F0F0;color:#111;font-size:14px;">${value}</td>
  </tr>`;
}

function prettyMethod(method: string): string {
  const m = method.trim().toLowerCase();
  if (m === "card") return "Card";
  if (m === "cash") return "Cash";
  if (m === "check" || m === "cheque") return "Check";
  if (!m) return "Recorded";
  return method.charAt(0).toUpperCase() + method.slice(1);
}
