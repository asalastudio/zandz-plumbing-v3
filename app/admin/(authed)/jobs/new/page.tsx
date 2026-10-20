import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { listCrew, getCustomer } from "@/lib/db";
import { services } from "@/content/services";
import { ScheduleTimeFields } from "../../_components/ScheduleTimeFields";
import InvoiceCustomerField, { type PickedCustomer } from "../../invoices/new/InvoiceCustomerField";

export const dynamic = "force-dynamic";
export const metadata = { title: "New Job · Z and Z OS" };

const ERRORS: Record<string, string> = {
  missing: "Pick a customer and a service type.",
  db: "Could not save the job. Try again.",
};

export default async function NewJobPage({
  searchParams,
}: {
  searchParams: Promise<{ customer_id?: string; customer?: string; error?: string }>;
}) {
  const params = await searchParams;
  // ?customer_id= is what the customer page links with; ?customer= is accepted too.
  const presetRaw = params.customer_id ?? params.customer;
  const presetCustomerId = presetRaw ? parseInt(presetRaw, 10) : null;
  const errorMsg = params.error ? ERRORS[params.error] ?? "Could not create the job." : null;

  const configured = isSupabaseConfigured();
  const [crew, presetCustomer] = configured
    ? await Promise.all([
        listCrew({ activeOnly: true }),
        presetCustomerId && !Number.isNaN(presetCustomerId)
          ? getCustomer(presetCustomerId)
          : Promise.resolve(null),
      ])
    : [[], null];

  // The picker searches all customers server-side, so the form no longer has
  // to ship (and silently cap) the whole customer list.
  const pickedCustomer: PickedCustomer | null = presetCustomer
    ? {
        id: presetCustomer.id,
        name: presetCustomer.name,
        phone_e164: presetCustomer.phone_e164,
        email: presetCustomer.email,
        city: presetCustomer.city,
      }
    : null;

  return (
    <div className="pb-24 lg:pb-0">
      <Link
        href="/admin/jobs"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted hover:text-[#F96302]"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back to jobs
      </Link>

      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">New job</p>
        <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
          Schedule Work
        </h1>
        {presetCustomer && (
          <p className="mt-3 text-base text-muted md:text-lg">
            For <span className="text-ink">{presetCustomer.name}</span>
          </p>
        )}
      </header>

      {errorMsg && (
        <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {!configured ? (
        <div className="border-l-4 border-[#F96302] bg-[#F96302]/10 p-6">
          <p className="text-base text-muted">Connect Supabase to create jobs.</p>
        </div>
      ) : (
        <form action="/api/admin/jobs" method="POST" className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Field label="Service type *" required>
            <select
              name="service_type"
              required
              className="w-full border border-line bg-card px-4 py-3 text-base text-ink outline-none focus:border-[#F96302]"
            >
              {services.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.title}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Custom label (optional)">
            <input
              name="service_label"
              type="text"
              placeholder="e.g. Sewer lateral EBMUD compliance"
              className="w-full border border-line bg-card px-4 py-3 text-base text-ink outline-none focus:border-[#F96302]"
            />
          </Field>

          <Field label="Customer *" required full>
            <InvoiceCustomerField
              presetCustomer={pickedCustomer}
              allowNew={false}
              allowJobLink={false}
              required
            />
            <p className="mt-2 text-xs text-muted">
              Don&apos;t see them?{" "}
              <Link href="/admin/customers/new" className="text-[#F96302] underline">
                Create a new customer
              </Link>{" "}
              first.
            </p>
          </Field>

          <ScheduleTimeFields className="md:col-span-2" />

          <Field label="Assign to crew">
            <select
              name="assigned_to"
              className="w-full border border-line bg-card px-4 py-3 text-base text-ink outline-none focus:border-[#F96302]"
            >
              <option value="">· Unassigned ·</option>
              {crew.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.role.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Estimated amount (USD)">
            <input
              name="estimated_amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full border border-line bg-card px-4 py-3 text-base text-ink outline-none focus:border-[#F96302]"
            />
          </Field>

          <Field label="Job address (if different from customer)" full>
            <input
              name="job_address"
              type="text"
              placeholder="Street address"
              className="w-full border border-line bg-card px-4 py-3 text-base text-ink outline-none focus:border-[#F96302]"
            />
          </Field>

          <Field label="City">
            <input
              name="job_city"
              type="text"
              defaultValue="Oakland"
              className="w-full border border-line bg-card px-4 py-3 text-base text-ink outline-none focus:border-[#F96302]"
            />
          </Field>

          <Field label="ZIP">
            <input
              name="job_zip"
              type="text"
              className="w-full border border-line bg-card px-4 py-3 text-base text-ink outline-none focus:border-[#F96302]"
            />
          </Field>

          <Field label="Customer-facing notes (visible if we share the job)" full>
            <textarea
              name="customer_notes"
              rows={3}
              className="w-full border border-line bg-card px-4 py-3 text-base text-ink outline-none focus:border-[#F96302]"
            />
          </Field>

          <Field label="Internal notes (crew only)" full>
            <textarea
              name="internal_notes"
              rows={3}
              className="w-full border border-line bg-card px-4 py-3 text-base text-ink outline-none focus:border-[#F96302]"
            />
          </Field>

          <div className="md:col-span-2 flex justify-end gap-3">
            <Link
              href="/admin/jobs"
              className="inline-flex items-center bg-transparent border border-line px-6 py-3 text-sm font-bold uppercase tracking-wide text-muted hover:border-[#F96302] hover:text-[#F96302]"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex items-center bg-[#F96302] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:bg-[#e05602]"
            >
              Create job
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  children,
  full = false,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  full?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-sm font-bold uppercase tracking-[0.12em] text-muted mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
