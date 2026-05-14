import type { InvoiceLineItem } from "@/lib/invoices";
import { siteSettings } from "@/content/site-settings";

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

export async function sendInvoiceEmail(
  input: SendInvoiceEmailInput
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: true, skipped: true, error: "RESEND_API_KEY is not set" };
  }

  const from =
    process.env.INVOICE_FROM_EMAIL ??
    process.env.LEAD_FROM_EMAIL ??
    "Z and Z Plumbing <leads@zandzplumbing.com>";

  const subject = `Invoice #${input.invoiceId} from Z and Z Plumbing`;
  const html = buildInvoiceHtml(input);
  const text = buildInvoiceText(input);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject,
        html,
        text,
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

function buildInvoiceHtml(i: SendInvoiceEmailInput): string {
  const paymentButton = i.paymentUrl
    ? `<a href="${escapeAttr(i.paymentUrl)}" style="display:inline-block;background:#F96302;color:#fff;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;font-size:13px;padding:14px 22px;border-radius:6px;text-decoration:none;">Pay invoice</a>`
    : `<a href="tel:${escapeAttr(siteSettings.phoneTel)}" style="display:inline-block;background:#F96302;color:#fff;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;font-size:13px;padding:14px 22px;border-radius:6px;text-decoration:none;">Call to arrange payment</a>`;

  return `<!doctype html>
<html><body style="margin:0;background:#F5F5F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;color:#111;">
  <div style="max-width:620px;margin:0 auto;padding:24px 16px;">
    <div style="background:#000;color:#fff;padding:24px;border-radius:8px 8px 0 0;">
      <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#F96302;">Invoice from Z and Z Plumbing</p>
      <h1 style="margin:8px 0 0;font-size:28px;line-height:1.1;font-weight:900;">${formatMoney(i.amountCents)}</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:14px;">Invoice #${i.invoiceId} · ${escapeHtml(i.serviceLabel)}</p>
    </div>
    <div style="background:#fff;border:1px solid #E5E5E5;border-top:none;border-radius:0 0 8px 8px;padding:24px;">
      <p style="margin:0 0 18px;font-size:16px;line-height:1.55;color:#333;">Hi ${escapeHtml(i.customerName)}, your Z and Z Plumbing invoice is ready.</p>
      <table style="width:100%;border-collapse:collapse;margin:0 0 18px;">
        <thead>
          <tr>
            <th align="left" style="padding:8px 0;border-bottom:1px solid #E5E5E5;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#666;">Item</th>
            <th align="right" style="padding:8px 0;border-bottom:1px solid #E5E5E5;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#666;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${i.lineItems
            .map(
              (item) => `<tr>
                <td style="padding:12px 0;border-bottom:1px solid #F0F0F0;font-size:14px;line-height:1.4;color:#111;">
                  <strong>${escapeHtml(item.description)}</strong><br />
                  <span style="color:#666;">${item.quantity} x ${formatMoney(item.unit_price_cents)}</span>
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
          ? `<div style="background:#F5F5F5;border-left:4px solid #F96302;padding:12px 14px;margin:18px 0;color:#333;font-size:14px;line-height:1.5;">${escapeHtml(i.notes)}</div>`
          : ""
      }
      <div style="background:#F8F8F8;border:1px solid #E5E5E5;padding:16px;margin:22px 0 0;border-radius:6px;">
        <p style="margin:0 0 10px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#666;">Payment options</p>
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
      <div style="margin-top:24px;display:flex;gap:12px;flex-wrap:wrap;">
        ${paymentButton}
        <a href="${escapeAttr(i.trackingUrl)}" style="display:inline-block;border:1px solid #999;color:#111;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;font-size:13px;padding:13px 20px;border-radius:6px;text-decoration:none;">View job</a>
      </div>
      <p style="margin:24px 0 0;font-size:13px;color:#666;line-height:1.5;">Questions? Call ${escapeHtml(siteSettings.phone)}.</p>
    </div>
  </div>
</body></html>`;
}

function buildInvoiceText(i: SendInvoiceEmailInput): string {
  return [
    `Invoice #${i.invoiceId} from Z and Z Plumbing`,
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

function formatMoney(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(s: string): string {
  return encodeURI(s).replace(/"/g, "%22").replace(/'/g, "%27");
}
