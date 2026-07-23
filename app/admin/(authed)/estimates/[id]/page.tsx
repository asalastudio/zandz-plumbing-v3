import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, FileText, Pencil, Send, Check, X, ArrowRightCircle } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getEstimateForView } from "@/lib/estimates";

export const dynamic = "force-dynamic";

function money(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export default async function EstimateDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; updated?: string; estimate?: string; sent?: string }>;
}) {
  if (!isSupabaseConfigured()) return notFound();

  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (!id || Number.isNaN(id)) return notFound();

  const query = await searchParams;
  const view = await getEstimateForView(id);
  if (!view) return notFound();

  const { estimate, customer } = view;
  const items = estimate.line_items ?? [];
  const isConverted = estimate.status === "converted";
  const canEdit = !isConverted;

  return (
    <div className="mx-auto max-w-3xl pb-24 lg:pb-0">
      <Link
        href="/admin/estimates"
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-[#F96302]"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Estimates
      </Link>

      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">
            Estimate #{estimate.id}
          </p>
          <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight md:text-4xl">
            {money(estimate.amount_cents)}
          </h1>
          {customer && <p className="mt-1 text-base text-muted">For {customer.name}</p>}
        </div>
        <span className="text-xs font-bold uppercase tracking-wide text-muted">
          Status: <span className="text-ink">{estimate.status}</span>
        </span>
      </header>

      {query.estimate === "created" && (
        <div className="mb-4 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Estimate created. Send it to the customer, then convert to an invoice once approved.
        </div>
      )}
      {query.updated && (
        <div className="mb-4 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Updated.
        </div>
      )}
      {query.sent && (
        <div className="mb-4 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Estimate emailed to the customer{customer?.email ? ` at ${customer.email}` : ""}, with the PDF attached.
        </div>
      )}
      {query.error && (
        <div className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(query.error)}
        </div>
      )}

      {isConverted && estimate.converted_invoice_id && (
        <div className="mb-4 border border-[#F96302]/40 bg-[#F96302]/5 px-4 py-3 text-sm">
          This estimate was converted to{" "}
          <Link href="/admin/invoices" className="font-bold text-[#F96302] hover:underline">
            invoice #{estimate.converted_invoice_id}
          </Link>
          . It is now locked.
        </div>
      )}

      {/* Actions */}
      <div className="mb-6 flex flex-wrap gap-2">
        <a
          href={`/api/admin/estimates/${estimate.id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-line bg-card px-4 py-2 text-sm font-bold uppercase tracking-wide text-ink hover:border-[#F96302] hover:text-[#F96302]"
        >
          <FileText className="h-4 w-4" aria-hidden="true" />
          PDF
        </a>

        {canEdit && (
          <Link
            href={`/admin/estimates/${estimate.id}/edit`}
            className="inline-flex items-center gap-2 border border-line bg-card px-4 py-2 text-sm font-bold uppercase tracking-wide text-ink hover:border-[#F96302] hover:text-[#F96302]"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit
          </Link>
        )}

        {/* The real send: emails the customer the branded estimate + PDF, then
            marks it sent. Available until converted; re-sending is fine. */}
        {!isConverted && (
          <form action={`/api/admin/estimates/${estimate.id}/send`} method="POST">
            <button
              type="submit"
              className="inline-flex items-center gap-2 border border-line bg-card px-4 py-2 text-sm font-bold uppercase tracking-wide text-ink hover:border-[#F96302] hover:text-[#F96302]"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              {estimate.status === "draft" ? "Send to customer" : "Resend"}
            </button>
          </form>
        )}
        {canEdit && (estimate.status === "sent" || estimate.status === "draft") && (
          <StatusButton id={estimate.id} status="approved" icon="check" label="Mark approved" />
        )}
        {canEdit && estimate.status === "sent" && (
          <StatusButton id={estimate.id} status="declined" icon="x" label="Declined" />
        )}

        {!isConverted && (
          <form action={`/api/admin/estimates/${estimate.id}/convert`} method="POST">
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-[#F96302] px-4 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-[#e05602]"
            >
              <ArrowRightCircle className="h-4 w-4" aria-hidden="true" />
              Convert to invoice
            </button>
          </form>
        )}
      </div>

      {/* Line items */}
      <div className="border border-line bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs font-bold uppercase tracking-wide text-muted">
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Qty</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-line last:border-0 align-top">
                <td className="whitespace-pre-wrap px-4 py-3 text-ink">{item.description}</td>
                <td className="px-4 py-3 text-right text-muted">{item.quantity}</td>
                <td className="px-4 py-3 text-right text-muted">{money(item.unit_price_cents)}</td>
                <td className="px-4 py-3 text-right font-semibold text-ink">{money(item.total_cents)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-muted">
                Estimate total
              </td>
              <td className="px-4 py-3 text-right font-display text-lg font-black text-ink">
                {money(estimate.amount_cents)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {estimate.notes && (
        <div className="mt-4 border border-line bg-surface p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted">Notes</p>
          <p className="whitespace-pre-wrap text-sm text-ink">{estimate.notes}</p>
        </div>
      )}
    </div>
  );
}

function StatusButton({
  id,
  status,
  icon,
  label,
}: {
  id: number;
  status: string;
  icon: "send" | "check" | "x";
  label: string;
}) {
  const Icon = icon === "send" ? Send : icon === "check" ? Check : X;
  return (
    <form action={`/api/admin/estimates/${id}/status`} method="POST">
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        className="inline-flex items-center gap-2 border border-line bg-card px-4 py-2 text-sm font-bold uppercase tracking-wide text-ink hover:border-[#F96302] hover:text-[#F96302]"
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
        {label}
      </button>
    </form>
  );
}
