import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { listCustomers, listCrew, getCustomer } from "@/lib/db";
import { services } from "@/content/services";

export const dynamic = "force-dynamic";
export const metadata = { title: "New Job · Z and Z OS" };

export default async function NewJobPage({
  searchParams,
}: {
  searchParams: Promise<{ customer_id?: string }>;
}) {
  const params = await searchParams;
  const presetCustomerId = params.customer_id ? parseInt(params.customer_id, 10) : null;

  const configured = isSupabaseConfigured();
  const [customers, crew, presetCustomer] = configured
    ? await Promise.all([
        listCustomers({ limit: 500 }),
        listCrew({ activeOnly: true }),
        presetCustomerId ? getCustomer(presetCustomerId) : Promise.resolve(null),
      ])
    : [{ rows: [], count: 0 }, [], null];

  return (
    <div className="pb-24 lg:pb-0">
      <Link
        href="/admin/jobs"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white/60 hover:text-[#F96302]"
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
          <p className="mt-3 text-base text-white/70 md:text-lg">
            For <span className="text-white">{presetCustomer.name}</span>
          </p>
        )}
      </header>

      {!configured ? (
        <div className="border-l-4 border-[#F96302] bg-[#F96302]/10 p-6">
          <p className="text-base text-white/80">Connect Supabase to create jobs.</p>
        </div>
      ) : (
        <form action="/api/admin/jobs" method="POST" className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Field label="Service type *" required>
            <select
              name="service_type"
              required
              className="w-full border border-white/15 bg-black px-4 py-3 text-base text-white outline-none focus:border-[#F96302]"
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
              className="w-full border border-white/15 bg-black px-4 py-3 text-base text-white outline-none focus:border-[#F96302]"
            />
          </Field>

          <Field label="Customer *" required full>
            <select
              name="customer_id"
              required
              defaultValue={presetCustomerId ?? ""}
              className="w-full border border-white/15 bg-black px-4 py-3 text-base text-white outline-none focus:border-[#F96302]"
            >
              <option value="">· Select customer ·</option>
              {customers.rows.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.phone_e164 ? ` · ${c.phone_e164}` : ""}
                  {c.city ? ` · ${c.city}` : ""}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-white/50">
              Don&apos;t see them?{" "}
              <Link href="/admin/customers/new" className="text-[#F96302] underline">
                Create a new customer
              </Link>{" "}
              first.
            </p>
          </Field>

          <Field label="Scheduled start (local time)">
            <input
              name="scheduled_start"
              type="datetime-local"
              className="w-full border border-white/15 bg-black px-4 py-3 text-base text-white outline-none focus:border-[#F96302]"
            />
          </Field>

          <Field label="Scheduled end (optional)">
            <input
              name="scheduled_end"
              type="datetime-local"
              className="w-full border border-white/15 bg-black px-4 py-3 text-base text-white outline-none focus:border-[#F96302]"
            />
          </Field>

          <Field label="Assign to crew">
            <select
              name="assigned_to"
              className="w-full border border-white/15 bg-black px-4 py-3 text-base text-white outline-none focus:border-[#F96302]"
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
              className="w-full border border-white/15 bg-black px-4 py-3 text-base text-white outline-none focus:border-[#F96302]"
            />
          </Field>

          <Field label="Job address (if different from customer)" full>
            <input
              name="job_address"
              type="text"
              placeholder="Street address"
              className="w-full border border-white/15 bg-black px-4 py-3 text-base text-white outline-none focus:border-[#F96302]"
            />
          </Field>

          <Field label="City">
            <input
              name="job_city"
              type="text"
              defaultValue="Oakland"
              className="w-full border border-white/15 bg-black px-4 py-3 text-base text-white outline-none focus:border-[#F96302]"
            />
          </Field>

          <Field label="ZIP">
            <input
              name="job_zip"
              type="text"
              className="w-full border border-white/15 bg-black px-4 py-3 text-base text-white outline-none focus:border-[#F96302]"
            />
          </Field>

          <Field label="Customer-facing notes (visible if we share the job)" full>
            <textarea
              name="customer_notes"
              rows={3}
              className="w-full border border-white/15 bg-black px-4 py-3 text-base text-white outline-none focus:border-[#F96302]"
            />
          </Field>

          <Field label="Internal notes (crew only)" full>
            <textarea
              name="internal_notes"
              rows={3}
              className="w-full border border-white/15 bg-black px-4 py-3 text-base text-white outline-none focus:border-[#F96302]"
            />
          </Field>

          <div className="md:col-span-2 flex justify-end gap-3">
            <Link
              href="/admin/jobs"
              className="inline-flex items-center bg-transparent border border-white/15 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white/70 hover:border-[#F96302] hover:text-[#F96302]"
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
      <label className="block text-sm font-bold uppercase tracking-[0.12em] text-white/60 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
