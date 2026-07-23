import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getEstimateForView } from "@/lib/estimates";
import InvoiceLineItems, { type InitialLine } from "../../../_components/InvoiceLineItems";

export const dynamic = "force-dynamic";

export default async function EditEstimatePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  if (!isSupabaseConfigured()) return notFound();

  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (!id || Number.isNaN(id)) return notFound();

  const query = await searchParams;
  const view = await getEstimateForView(id);
  if (!view) return notFound();

  const { estimate, customer } = view;
  const locked = estimate.status === "converted";

  const initialLines: InitialLine[] = (estimate.line_items ?? []).map((l) => ({
    description: l.description,
    quantity: l.quantity,
    unitPriceCents: l.unit_price_cents,
  }));

  const inputCls =
    "w-full border border-line bg-card px-3 py-2.5 text-base text-ink outline-none placeholder:text-faint focus:border-[#F96302]";
  const labelCls = "mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-muted";

  return (
    <div className="mx-auto max-w-3xl pb-24 lg:pb-0">
      <Link
        href={`/admin/estimates/${id}`}
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-[#F96302]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </Link>

      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">
          Estimate #{estimate.id}
        </p>
        <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight md:text-4xl">
          Edit estimate
        </h1>
        {customer && <p className="mt-2 text-base text-muted">For {customer.name}</p>}
      </header>

      {query.error && (
        <div className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(query.error)}
        </div>
      )}

      {locked ? (
        <div className="flex items-start gap-3 border border-line bg-card p-5">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
          <div>
            <p className="font-bold text-ink">This estimate was converted and is locked.</p>
            <p className="mt-1 text-sm text-muted">Edit the resulting invoice instead.</p>
          </div>
        </div>
      ) : (
        <form action={`/api/admin/estimates/${estimate.id}/update`} method="POST" className="space-y-6">
          <InvoiceLineItems initialLines={initialLines} />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className={labelCls}>Valid until (optional)</span>
              <input
                type="date"
                name="valid_until"
                defaultValue={estimate.valid_until ?? ""}
                className={inputCls}
              />
            </label>
          </div>

          <label className="block">
            <span className={labelCls}>Notes (optional)</span>
            <textarea
              name="notes"
              defaultValue={estimate.notes ?? ""}
              rows={2}
              className={`${inputCls} resize-y`}
            />
          </label>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-[#F96302] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-[#e05602]"
            >
              Save changes
            </button>
            <Link
              href={`/admin/estimates/${estimate.id}`}
              className="inline-flex items-center gap-2 border border-line px-6 py-3 text-sm font-semibold text-muted hover:border-ink hover:text-ink"
            >
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
