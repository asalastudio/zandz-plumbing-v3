import Link from "next/link";
import { Plus, FileSignature } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { listEstimates, type EstimateStatus } from "@/lib/estimates";

export const dynamic = "force-dynamic";
export const metadata = { title: "Estimates · Z and Z OS" };

function money(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}
function fmtDate(iso: string): string {
  return iso
    ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";
}

const STATUS_STYLE: Record<EstimateStatus, string> = {
  draft: "bg-neutral-100 text-neutral-600",
  sent: "bg-blue-100 text-blue-700",
  approved: "bg-emerald-100 text-emerald-700",
  declined: "bg-red-100 text-red-700",
  converted: "bg-[#F96302]/10 text-[#F96302]",
};

export default async function EstimatesPage() {
  if (!isSupabaseConfigured()) {
    return <p className="text-sm text-muted">Supabase is not configured.</p>;
  }

  const estimates = await listEstimates(200);

  return (
    <div className="pb-24 lg:pb-0">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">
            <FileSignature className="h-5 w-5" aria-hidden="true" />
            Estimates
          </p>
          <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight md:text-4xl">
            Estimates
          </h1>
        </div>
        <Link
          href="/admin/estimates/new"
          className="inline-flex items-center gap-2 bg-[#F96302] px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-[#e05602]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New estimate
        </Link>
      </header>

      {estimates.length === 0 ? (
        <div className="border border-line bg-card p-8 text-center">
          <p className="font-display text-xl font-black uppercase tracking-tight text-ink">
            No estimates yet
          </p>
          <p className="mt-2 text-sm text-muted">
            Create an estimate for a customer to approve, then convert it to an invoice.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-line bg-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-bold uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Estimate</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {estimates.map((e) => (
                <tr key={e.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-mono text-muted">#{e.id}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{e.customer_name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-xs font-bold uppercase ${STATUS_STYLE[e.status]}`}>
                      {e.status}
                    </span>
                    {e.converted_invoice_id && (
                      <Link
                        href={`/admin/invoices`}
                        className="ml-2 text-xs text-[#F96302] hover:underline"
                      >
                        → invoice #{e.converted_invoice_id}
                      </Link>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-ink">{money(e.amount_cents)}</td>
                  <td className="px-4 py-3 text-muted">{fmtDate(e.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/estimates/${e.id}`}
                      className="font-semibold text-[#F96302] hover:underline"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
