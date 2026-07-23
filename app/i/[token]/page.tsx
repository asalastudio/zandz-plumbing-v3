import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { verifyInvoiceToken, getInvoiceForView } from "@/lib/invoices";
import { formatMoney } from "@/lib/email";
import { siteSettings } from "@/content/site-settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Invoice · Z and Z Plumbing",
  robots: { index: false, follow: false },
};

function fmtDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function PublicInvoicePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invoiceId = verifyInvoiceToken(token);
  if (!invoiceId) notFound();

  const view = await getInvoiceForView(invoiceId);
  if (!view) notFound();

  const { invoice, customer, jobServiceLabel } = view;
  const paid = Boolean(invoice.paid_at);

  return (
    <main className="min-h-screen bg-[#F5F5F5] py-10 px-4 text-[#111]">
      <div className="mx-auto max-w-2xl">
        {/* Brand bar */}
        <div className="mb-5 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-wordmark.svg" alt={siteSettings.name} className="h-10 w-auto" />
        </div>

        <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white shadow-sm">
          {/* Header */}
          <div className="bg-black px-6 py-6 text-white sm:px-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#F96302]">
                  Invoice
                </p>
                <h1 className="mt-1 text-3xl font-black leading-none">
                  {formatMoney(invoice.amount_cents)}
                </h1>
                <p className="mt-2 text-sm text-white/70">
                  Invoice #{invoice.id}
                  {jobServiceLabel ? ` · ${jobServiceLabel}` : ""} · {fmtDate(invoice.created_at)}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide ${
                  paid ? "bg-emerald-500/20 text-emerald-200" : "bg-[#F96302]/20 text-[#F9A968]"
                }`}
              >
                {paid ? "Paid" : "Amount due"}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6 sm:px-8">
            <p className="mb-5 text-base text-[#333]">
              {customer?.name ? `Hi ${customer.name}, ` : ""}here is your invoice from{" "}
              {siteSettings.name}.
            </p>

            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#E5E5E5] text-left text-[11px] uppercase tracking-[0.08em] text-[#888]">
                  <th className="py-2 font-bold">Item</th>
                  <th className="py-2 text-right font-bold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.line_items.map((item, idx) => (
                  <tr key={idx} className="border-b border-[#F0F0F0]">
                    <td className="py-3 pr-3 align-top">
                      <span className="block whitespace-pre-line font-semibold text-[#111]">{item.description}</span>
                      <br />
                      <span className="text-[#888]">
                        {item.quantity} x {formatMoney(item.unit_price_cents)}
                      </span>
                    </td>
                    <td className="py-3 text-right align-top font-bold text-[#111]">
                      {formatMoney(item.total_cents)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="pt-4 text-base font-extrabold">Total</td>
                  <td className="pt-4 text-right text-lg font-black">
                    {formatMoney(invoice.amount_cents)}
                  </td>
                </tr>
              </tfoot>
            </table>

            {invoice.notes ? (
              <div className="mt-5 border-l-4 border-[#F96302] bg-[#F5F5F5] px-4 py-3 text-sm leading-relaxed text-[#333]">
                {invoice.notes}
              </div>
            ) : null}

            {/* Payment */}
            {paid ? (
              <div className="mt-6 rounded-lg bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                <strong>Paid in full.</strong> Thank you for your business.
                {invoice.paid_at ? ` Received ${fmtDate(invoice.paid_at)}.` : ""}
              </div>
            ) : (
              <div className="mt-6 rounded-lg border border-[#E5E5E5] bg-[#F8F8F8] px-4 py-4">
                <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#888]">
                  How to pay
                </p>
                <ul className="ml-5 list-disc space-y-1 text-sm text-[#333]">
                  <li>
                    <strong>Phone:</strong> call {siteSettings.phone} to pay by card.
                  </li>
                  <li>
                    <strong>Check:</strong> payable to {siteSettings.legalName}.
                  </li>
                  <li>
                    <strong>Cash:</strong> accepted with prior confirmation; make sure it is recorded
                    on your receipt.
                  </li>
                </ul>
                <a
                  href={`tel:${siteSettings.phoneTel}`}
                  className="mt-4 inline-block rounded-md bg-[#F96302] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-white"
                >
                  Call {siteSettings.phone}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 text-center text-xs leading-relaxed text-[#9a9a9a]">
          <p className="font-bold text-[#7a7a7a]">{siteSettings.name}</p>
          <p className="mt-1">
            {siteSettings.phone} · {siteSettings.address.full}
          </p>
          <p className="mt-1">
            {siteSettings.cslb} · {siteSettings.licenses.join(" · ")}
          </p>
        </div>
      </div>
    </main>
  );
}
