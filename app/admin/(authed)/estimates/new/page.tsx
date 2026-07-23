import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getCustomer, getJob } from "@/lib/db";
import InvoiceCustomerField, {
  type JobOption,
  type PickedCustomer,
} from "../../invoices/new/InvoiceCustomerField";
import InvoiceLineItems from "../../_components/InvoiceLineItems";

export const dynamic = "force-dynamic";
export const metadata = { title: "New Estimate · Z and Z OS" };

export default async function NewEstimatePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; customer_id?: string; job_id?: string; return_to?: string }>;
}) {
  const { error, customer_id, job_id, return_to } = await searchParams;

  let presetCustomer: PickedCustomer | null = null;
  const presetJobs: JobOption[] = [];
  let presetJobId: number | null = null;
  let defaultDescription = "";

  if (isSupabaseConfigured()) {
    const jobIdNum = job_id ? parseInt(job_id, 10) : null;
    if (jobIdNum && !Number.isNaN(jobIdNum)) {
      const job = await getJob(jobIdNum);
      if (job?.customer) {
        presetCustomer = {
          id: job.customer.id,
          name: job.customer.name,
          phone_e164: job.customer.phone_e164,
          email: job.customer.email,
          city: job.customer.city,
        };
        presetJobId = job.id;
        defaultDescription = `${job.service_label ?? job.service_type} service`;
      }
    }
    const customerIdNum = customer_id ? parseInt(customer_id, 10) : null;
    if (!presetCustomer && customerIdNum && !Number.isNaN(customerIdNum)) {
      const customer = await getCustomer(customerIdNum);
      if (customer) {
        presetCustomer = {
          id: customer.id,
          name: customer.name,
          phone_e164: customer.phone_e164,
          email: customer.email,
          city: customer.city,
        };
      }
    }
  }

  const inputCls =
    "w-full border border-line bg-card px-3 py-3 text-base text-ink outline-none placeholder:text-faint focus:border-[#F96302]";
  const labelCls = "mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-muted";

  return (
    <div className="pb-24 lg:pb-0">
      <Link
        href="/admin/estimates"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted hover:text-[#F96302]"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back to estimates
      </Link>

      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">New estimate</p>
        <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
          Estimate
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted">
          Build the scope and price for the customer to approve. Once they sign off, convert it to
          an invoice in one click and nothing gets retyped.
        </p>
      </header>

      {error && (
        <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action="/api/admin/estimates" method="POST" className="max-w-3xl space-y-8">
        {return_to && <input type="hidden" name="return_to" value={return_to} />}

        <section className="border border-line bg-surface p-4 md:p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.12em] text-muted">Customer</h2>
          <InvoiceCustomerField
            presetCustomer={presetCustomer}
            presetJobs={presetJobs}
            presetJobId={presetJobId}
          />
        </section>

        <section className="border border-line bg-surface p-4 md:p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.12em] text-muted">Line items</h2>
          <InvoiceLineItems defaultDescription={defaultDescription} />

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className={labelCls}>Valid until (optional)</span>
              <input type="date" name="valid_until" className={inputCls} />
            </label>
          </div>

          <label className="mt-4 block">
            <span className={labelCls}>Notes for customer</span>
            <textarea
              name="notes"
              rows={3}
              placeholder="Optional scope notes, assumptions, or a thank-you"
              className={`${inputCls} resize-none`}
            />
          </label>
        </section>

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/estimates"
            className="inline-flex items-center border border-line px-6 py-3 text-sm font-bold uppercase tracking-wide text-muted hover:border-ink hover:text-ink"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center bg-[#F96302] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-[#e05602]"
          >
            Create estimate
          </button>
        </div>
      </form>
    </div>
  );
}
