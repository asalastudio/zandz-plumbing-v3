import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getInvoiceForView } from "@/lib/invoices";
import InvoiceLineItems, {
  type InitialLine,
} from "../../../_components/InvoiceLineItems";

export const dynamic = "force-dynamic";

export default async function EditInvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; return_to?: string }>;
}) {
  if (!isSupabaseConfigured()) return notFound();

  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (!id || Number.isNaN(id)) return notFound();

  const query = await searchParams;
  const view = await getInvoiceForView(id);
  if (!view) return notFound();

  const { invoice, customer } = view;
  const returnTo = query.return_to ?? "/admin/invoices";
  const isPaid = Boolean(invoice.paid_at);

  const initialLines: InitialLine[] = (invoice.line_items ?? []).map((l) => ({
    description: l.description,
    quantity: l.quantity,
    unitPriceCents: l.unit_price_cents,
  }));

  return (
    <div className="mx-auto max-w-3xl pb-24 lg:pb-0">
      <Link
        href={returnTo}
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-[#F96302]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </Link>

      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">
          Invoice #{invoice.id}
        </p>
        <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight md:text-4xl">
          Edit invoice
        </h1>
        {customer && <p className="mt-2 text-base text-muted">For {customer.name}</p>}
      </header>

      {query.error && (
        <div className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(query.error)}
        </div>
      )}

      {isPaid ? (
        <div className="flex items-start gap-3 border border-line bg-card p-5">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
          <div>
            <p className="font-bold text-ink">This invoice is paid and locked.</p>
            <p className="mt-1 text-sm text-muted">
              The amount on a paid invoice is settled, so its lines can&rsquo;t be edited.
              If something is wrong, create a corrected invoice instead.
            </p>
          </div>
        </div>
      ) : (
        <form action={`/api/admin/invoices/${invoice.id}/update`} method="POST" className="space-y-6">
          <input type="hidden" name="return_to" value={returnTo} />

          <InvoiceLineItems initialLines={initialLines} />

          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-muted">
              Notes (optional)
            </span>
            <textarea
              name="notes"
              defaultValue={invoice.notes ?? ""}
              rows={2}
              placeholder="Anything the customer should see on the invoice"
              className="w-full resize-y border border-line bg-card px-3 py-2.5 text-base text-ink outline-none placeholder:text-faint focus:border-[#F96302]"
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
              href={returnTo}
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
