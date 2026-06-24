import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  Phone,
  Mail,
  MapPin,
  FileText,
  Plus,
  DollarSign,
  Briefcase,
  Calendar,
  AlertCircle,
  ReceiptText,
} from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  getCustomer,
  getCustomerJobs,
  getCustomerInvoiceHistory,
  getCustomerLifetimeStats,
  STATUS_LABEL,
  STATUS_COLOR,
  formatDateTime,
  formatMoney,
  formatMoneyShort,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id: idStr } = await params;
  const { saved, error: errorParam } = await searchParams;
  const id = parseInt(idStr, 10);
  if (!id || Number.isNaN(id)) notFound();

  if (!isSupabaseConfigured()) {
    return (
      <div className="border-l-4 border-[#F96302] bg-[#F96302]/10 p-6">
        <p className="text-base text-muted">Connect Supabase to view customer detail.</p>
      </div>
    );
  }

  const customer = await getCustomer(id);
  if (!customer) notFound();

  const [jobs, invoiceHistory, stats] = await Promise.all([
    getCustomerJobs(id),
    getCustomerInvoiceHistory(id),
    getCustomerLifetimeStats(id),
  ]);

  const avgTicketCents =
    stats.invoiceCount > 0 ? Math.round(stats.totalRevenueCents / stats.invoiceCount) : 0;

  return (
    <div className="pb-24 lg:pb-0">
      <Link
        href="/admin/customers"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted hover:text-[#F96302]"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back to customers
      </Link>

      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">
            Customer
            {customer.customer_type && (
              <span className="ml-3 inline-flex items-center bg-line px-2 py-0.5 text-[10px] tracking-[0.12em] text-muted">
                {customer.customer_type}
              </span>
            )}
          </p>
          <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
            {customer.name}
          </h1>
          <div className="mt-2 flex flex-wrap gap-3 text-sm">
            {customer.servicetitan_customer_id && (
              <span className="font-bold uppercase tracking-[0.12em] text-muted">
                ST · {customer.servicetitan_customer_id}
              </span>
            )}
            {customer.hubspot_contact_id && (
              <span className="font-bold uppercase tracking-[0.12em] text-emerald-700">
                HubSpot · {customer.hubspot_contact_id}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/admin/invoices/new?customer_id=${id}`}
            className="inline-flex items-center gap-2 bg-[#F96302] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:bg-[#e05602]"
          >
            <ReceiptText className="h-4 w-4" aria-hidden="true" />
            Create invoice
          </Link>
          <Link
            href={`/admin/jobs/new?customer_id=${id}`}
            className="inline-flex items-center gap-2 border border-line bg-card px-5 py-3 text-sm font-bold uppercase tracking-wide text-muted transition-colors hover:border-[#F96302] hover:text-[#F96302]"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New job
          </Link>
        </div>
      </header>

      {/* Sticky tap-to-call + tap-to-email */}
      {(customer.phone_e164 || customer.email) && (
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {customer.phone_e164 && (
            <a
              href={`tel:${customer.phone_e164}`}
              className="flex items-center justify-center gap-3 bg-[#F96302] px-5 py-4 font-display text-xl font-black uppercase tracking-tight text-white transition-transform duration-150 hover:-translate-y-0.5 hover:bg-[#e05602]"
            >
              <Phone className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
              {customer.phone_e164}
            </a>
          )}
          {customer.email && (
            <a
              href={`mailto:${customer.email}`}
              className="flex items-center justify-center gap-3 border border-line bg-card px-5 py-4 font-display text-base font-black uppercase tracking-tight text-ink transition-colors hover:border-[#F96302] hover:text-[#F96302]"
            >
              <Mail className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
              <span className="truncate">{customer.email}</span>
            </a>
          )}
        </div>
      )}

      {/* Lifetime summary */}
      {stats.invoiceCount > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-muted">
            Lifetime
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <SummaryStat
              label="Total spent"
              value={formatMoneyShort(stats.totalRevenueCents)}
              icon={DollarSign}
            />
            <SummaryStat
              label="Jobs completed"
              value={stats.invoiceCount.toLocaleString()}
              icon={Briefcase}
            />
            <SummaryStat
              label="Avg ticket"
              value={formatMoneyShort(avgTicketCents)}
              icon={ReceiptText}
            />
            <SummaryStat
              label="Last service"
              value={
                stats.lastCompletedOn
                  ? new Date(stats.lastCompletedOn).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "·"
              }
              icon={Calendar}
            />
          </div>
        </section>
      )}

      {/* Open balance callout */}
      {stats.totalBalanceCents > 0 && (
        <div className="mb-10 border-l-4 border-red-500 bg-red-50 p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="mt-1 h-6 w-6 text-red-700" strokeWidth={2} aria-hidden="true" />
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-red-700">
                Outstanding balance
              </p>
              <p className="mt-1 font-display text-3xl font-black uppercase leading-none tracking-tight text-ink md:text-4xl">
                {formatMoney(stats.totalBalanceCents)}
              </p>
              <p className="mt-2 text-sm text-muted">
                Across one or more invoices. May reflect stale ServiceTitan statuses. Verify
                payment before following up.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contact details */}
      <section className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card icon={MapPin} label="Address">
          {customer.street_address ? (
            <span className="text-ink">
              {customer.street_address}
              {customer.city ? (
                <>
                  <br />
                  {customer.city}, {customer.state} {customer.zip}
                </>
              ) : null}
            </span>
          ) : (
            <span className="text-muted">·</span>
          )}
        </Card>
        <Card icon={Phone} label="Phone alt / Email">
          <div className="space-y-1.5 text-muted">
            {!customer.phone_e164 && !customer.email && (
              <span className="text-muted">No contact info on file</span>
            )}
            {customer.email && (
              <a
                href={`mailto:${customer.email}`}
                className="block break-all hover:text-[#F96302]"
              >
                {customer.email}
              </a>
            )}
          </div>
        </Card>
      </section>

      {/* Notes editor */}
      <section className="mb-12 border border-line bg-card p-6 md:p-7">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-black uppercase tracking-tight text-ink md:text-2xl">
            Notes &amp; details
          </h2>
          {saved === "1" && (
            <span className="inline-flex items-center bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">
              ✓ Saved
            </span>
          )}
          {errorParam === "update" && (
            <span className="inline-flex items-center bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-red-700">
              ✗ Save failed
            </span>
          )}
        </div>

        <form action={`/api/admin/customers/${id}/update`} method="POST" className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-muted">
              Neighborhood / area tag
            </label>
            <input
              name="neighborhood"
              type="text"
              defaultValue={customer.neighborhood ?? ""}
              placeholder="e.g. Rockridge, Adams Point, Glenview"
              className="w-full border border-line bg-card px-4 py-3 text-base text-ink outline-none focus:border-[#F96302]"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-muted">
              Notes
            </label>
            <p className="mb-2 text-xs text-muted">
              Tribal knowledge worth remembering. Examples: &ldquo;Dog in yard, use side
              gate.&rdquo; · &ldquo;Old galvanized pipes upstairs.&rdquo; · &ldquo;Backflow
              test due May.&rdquo; · &ldquo;Always pays late, require deposit.&rdquo;
            </p>
            <textarea
              name="notes"
              rows={6}
              defaultValue={customer.notes ?? ""}
              placeholder="Add anything Eddie/Pablo/Sergio should know before they roll out."
              className="w-full border border-line bg-card px-4 py-3 text-sm leading-relaxed text-ink outline-none focus:border-[#F96302]"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-[#F96302] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:bg-[#e05602]"
            >
              Save notes
            </button>
          </div>
        </form>
      </section>

      {/* Open / active jobs (in Z and Z OS, not yet historical) */}
      {jobs.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 font-display text-2xl font-black uppercase tracking-tight md:text-3xl">
            Active jobs
            <span className="ml-3 text-base font-bold text-muted">({jobs.length})</span>
          </h2>
          <div className="overflow-hidden border border-line">
            <table className="w-full text-left">
              <thead className="bg-card">
                <tr>
                  <Th>Service</Th>
                  <Th>Scheduled</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr
                    key={j.id}
                    className="border-t border-line transition-colors duration-150 hover:bg-raised"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/jobs/${j.id}`}
                        className="font-display text-lg font-black uppercase tracking-tight text-ink hover:text-[#F96302]"
                      >
                        {j.service_label ?? j.service_type}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-base text-muted">
                      {formatDateTime(j.scheduled_start)}
                    </td>
                    <td className="px-5 py-4 text-base text-muted">
                      {formatMoney(j.final_amount_cents ?? j.estimated_amount_cents)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${STATUS_COLOR[j.status]}`}
                      >
                        {STATUS_LABEL[j.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Invoice history (from ServiceTitan archive) */}
      <section>
        <h2 className="mb-4 font-display text-2xl font-black uppercase tracking-tight md:text-3xl">
          Invoice history
          <span className="ml-3 text-base font-bold text-muted">
            ({invoiceHistory.length})
          </span>
        </h2>
        {invoiceHistory.length === 0 ? (
          <div className="border border-dashed border-line bg-raised px-8 py-12 text-center">
            <FileText className="mx-auto h-8 w-8 text-faint" aria-hidden="true" />
            <p className="mt-3 text-base text-muted">No invoice history for this customer.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Link
                href={`/admin/invoices/new?customer_id=${id}`}
                className="inline-flex items-center gap-2 bg-[#F96302] px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-[#e05602]"
              >
                <ReceiptText className="h-4 w-4" aria-hidden="true" />
                Create invoice
              </Link>
              {jobs.length === 0 && (
                <Link
                  href={`/admin/jobs/new?customer_id=${id}`}
                  className="inline-flex items-center gap-2 border border-line px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-muted hover:border-[#F96302] hover:text-[#F96302]"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Create the first job
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-hidden border border-line">
            <table className="w-full text-left">
              <thead className="bg-card">
                <tr>
                  <Th>Completed</Th>
                  <Th>Job type</Th>
                  <Th>Tech</Th>
                  <Th>Total</Th>
                  <Th>Balance</Th>
                </tr>
              </thead>
              <tbody>
                {invoiceHistory.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-t border-line transition-colors duration-150 hover:bg-raised"
                  >
                    <td className="px-5 py-4 text-sm text-muted">
                      {inv.completed_on
                        ? new Date(inv.completed_on).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "·"}
                    </td>
                    <td className="px-5 py-4 text-sm text-ink">{inv.job_type ?? "·"}</td>
                    <td className="px-5 py-4 text-sm text-muted">{inv.technician ?? "·"}</td>
                    <td className="px-5 py-4 font-display text-base font-black tracking-tight text-ink">
                      {formatMoney(inv.total_cents)}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      {inv.balance_cents > 0 ? (
                        <span className="font-bold text-red-700">
                          {formatMoney(inv.balance_cents)}
                        </span>
                      ) : (
                        <span className="text-emerald-700">Paid</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-muted">
      {children}
    </th>
  );
}

function SummaryStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) {
  return (
    <div className="border border-line bg-card p-4 md:p-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
          {label}
        </span>
        <Icon className="h-4 w-4 text-[#F96302]" strokeWidth={1.75} aria-hidden={true} />
      </div>
      <p className="font-display text-2xl font-black uppercase leading-none tracking-tight md:text-3xl">
        {value}
      </p>
    </div>
  );
}

function Card({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-line bg-card p-5 md:p-6">
      <div className="mb-3 flex items-center gap-3">
        <Icon className="h-5 w-5 text-[#F96302]" strokeWidth={1.75} aria-hidden={true} />
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{label}</span>
      </div>
      <div className="text-base md:text-lg">{children}</div>
    </div>
  );
}
