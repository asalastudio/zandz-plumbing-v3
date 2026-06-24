import Link from "next/link";
import { ChevronLeft, Send } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getCustomer, getCustomerJobs, getJob, STATUS_LABEL, type JobStatus } from "@/lib/db";
import InvoiceCustomerField, {
  type JobOption,
  type PickedCustomer,
} from "./InvoiceCustomerField";
import InvoiceLineItems from "../../_components/InvoiceLineItems";

export const dynamic = "force-dynamic";
export const metadata = { title: "New Invoice · Z and Z OS" };

const ERRORS: Record<string, string> = {
  name_required: "Enter the customer's name.",
  bad_phone: "That phone number is not a valid US number.",
  contact_required: "Add an email or phone so the invoice can be delivered.",
  invalid_items: "Add at least one line item with a description and price.",
  bad_request: "Something went wrong reading the form. Try again.",
  duplicate_unconfirmed:
    "That phone or email already belongs to an existing customer. Pick them, or choose “Create new anyway.”",
  error: "Could not create the invoice. Try again.",
};

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; customer_id?: string; job_id?: string }>;
}) {
  const { error, customer_id, job_id } = await searchParams;
  const errorMsg = error ? ERRORS[error] ?? "Could not create the invoice." : null;

  // Prefill from a customer or a job deep-link (e.g. the customer/job pages).
  let presetCustomer: PickedCustomer | null = null;
  let presetJobs: JobOption[] = [];
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

    if (presetCustomer) {
      const jobs = await getCustomerJobs(presetCustomer.id, 30);
      presetJobs = jobs.map((j) => ({
        id: j.id,
        label: j.service_label ?? j.service_type,
        statusLabel: STATUS_LABEL[j.status as JobStatus] ?? j.status,
      }));
    }
  }

  const inputCls =
    "w-full border border-line bg-card px-3 py-3 text-base text-ink outline-none placeholder:text-faint focus:border-[#F96302]";
  const labelCls = "mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-muted";

  return (
    <div className="pb-24 lg:pb-0">
      <Link
        href="/admin/invoices"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted hover:text-[#F96302]"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back to invoices
      </Link>

      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">New invoice</p>
        <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
          Custom Invoice
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted">
          Bill an existing customer or a new one. Search to attach the invoice to the right record
          (and optionally a specific job) so the name and history always stay correct.
        </p>
      </header>

      {errorMsg && (
        <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <form action="/api/admin/invoices" method="POST" className="max-w-3xl space-y-8">
        {/* Customer */}
        <section className="border border-line bg-surface p-4 md:p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.12em] text-muted">
            Customer
          </h2>
          <InvoiceCustomerField
            presetCustomer={presetCustomer}
            presetJobs={presetJobs}
            presetJobId={presetJobId}
          />
        </section>

        {/* Line items */}
        <section className="border border-line bg-surface p-4 md:p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.12em] text-muted">
            Line items
          </h2>
          <InvoiceLineItems defaultDescription={defaultDescription} />

          <label className="mt-4 block">
            <span className={labelCls}>Notes for customer</span>
            <textarea
              name="notes"
              rows={3}
              placeholder="Optional payment notes, warranty details, or thank-you message"
              className={`${inputCls} resize-none`}
            />
          </label>
        </section>

        {/* Delivery */}
        <section className="border border-line bg-surface p-4 md:p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.12em] text-muted">
            Send
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm text-muted">
              <input
                type="checkbox"
                name="send_now"
                defaultChecked
                className="h-5 w-5 accent-[#F96302]"
              />
              Send now (uncheck to save as a draft)
            </label>
            <label className="flex items-center gap-3 text-sm text-muted">
              <input
                type="checkbox"
                name="channel_email"
                defaultChecked
                className="h-5 w-5 accent-[#F96302]"
              />
              Email the invoice
            </label>
            <label className="flex items-center gap-3 text-sm text-muted">
              <input type="checkbox" name="channel_text" className="h-5 w-5 accent-[#F96302]" />
              Text the invoice
              <span className="text-xs text-muted">(activates once Twilio is live)</span>
            </label>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/invoices"
            className="inline-flex items-center bg-transparent border border-line px-6 py-3 text-sm font-bold uppercase tracking-wide text-muted hover:border-[#F96302] hover:text-[#F96302]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-[#F96302] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-transform duration-150 hover:-translate-y-0.5 hover:bg-[#e05602] hover:shadow-lg"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            Create invoice
          </button>
        </div>
      </form>
    </div>
  );
}
