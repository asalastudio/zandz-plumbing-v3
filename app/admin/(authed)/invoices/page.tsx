import Link from "next/link";
import { Plus, ExternalLink } from "lucide-react";
import { listInvoices, invoiceViewUrl, type InvoiceListItem } from "@/lib/invoices";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const metadata = { title: "Invoices · Z and Z OS" };

function money(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function fmtDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "America/Los_Angeles",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusOf(inv: InvoiceListItem): { label: string; cls: string } {
  if (inv.paid_at) return { label: "Paid", cls: "bg-emerald-100 text-emerald-700" };
  if (inv.sent_at) return { label: "Sent", cls: "bg-sky-100 text-sky-700" };
  return { label: "Draft", cls: "bg-line text-muted" };
}

function banner(status: string | undefined): string | null {
  if (!status) return null;
  if (status === "created") return "Invoice created.";
  const parts = status.split(",").map((p) => {
    if (p === "email_sent") return "Emailed to the customer.";
    if (p === "text_sent") return "Texted to the customer.";
    if (p === "email_skipped") return "Email skipped (Resend not configured).";
    if (p === "text_skipped") return "Text skipped (Twilio not configured yet).";
    if (p === "email_failed") return "Email failed to send.";
    if (p === "text_failed") return "Text failed to send.";
    if (p === "email_no_address") return "No email on file, email not sent.";
    if (p === "text_no_phone") return "No phone on file, text not sent.";
    return p;
  });
  return parts.join(" ");
}

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const msg = banner(status);
  const invoices = isSupabaseConfigured() ? await listInvoices() : [];

  return (
    <div className="pb-24 lg:pb-0">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">Billing</p>
          <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
            Invoices
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted">
            Create a custom invoice for any customer and send it by email or text.
          </p>
        </header>
        <Link
          href="/admin/invoices/new"
          className="inline-flex items-center gap-2 bg-[#F96302] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition-transform duration-150 hover:-translate-y-0.5 hover:bg-[#e05602] hover:shadow-lg"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New invoice
        </Link>
      </div>

      {msg && (
        <div className="mb-6 border border-[#F96302]/40 bg-[#F96302]/10 px-4 py-3 text-sm text-[#B24400]">
          {msg}
        </div>
      )}

      {invoices.length === 0 ? (
        <div className="border border-line bg-surface px-6 py-16 text-center">
          <p className="text-base text-muted">No invoices yet.</p>
          <Link
            href="/admin/invoices/new"
            className="mt-4 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#F96302] hover:underline"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create the first one
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto border border-line">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-raised text-left text-[11px] uppercase tracking-[0.1em] text-muted">
                <th className="px-4 py-3 font-bold">Invoice</th>
                <th className="px-4 py-3 font-bold">Customer</th>
                <th className="px-4 py-3 text-right font-bold">Amount</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Created</th>
                <th className="px-4 py-3 font-bold">View</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const st = statusOf(inv);
                return (
                  <tr key={inv.id} className="border-b border-line hover:bg-raised">
                    <td className="px-4 py-3 font-bold text-ink">#{inv.id}</td>
                    <td className="px-4 py-3 text-muted">{inv.customer_name ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-bold text-ink">
                      {money(inv.amount_cents)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${st.cls}`}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">{fmtDate(inv.created_at)}</td>
                    <td className="px-4 py-3">
                      <a
                        href={invoiceViewUrl(inv.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[#F96302] hover:underline"
                      >
                        Open <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
