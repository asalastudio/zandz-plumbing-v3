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
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (!id || Number.isNaN(id)) notFound();

  if (!isSupabaseConfigured()) {
    return (
      <div className="border-l-4 border-[#F96302] bg-[#F96302]/10 p-6">
        <p className="text-base text-white/80">Connect Supabase to view customer detail.</p>
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
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white/60 hover:text-[#F96302]"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back to customers
      </Link>

      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">
            Customer
            {customer.customer_type && (
              <span className="ml-3 inline-flex items-center bg-white/10 px-2 py-0.5 text-[10px] tracking-[0.12em] text-white/70">
                {customer.customer_type}
              </span>
            )}
          </p>
          <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
            {customer.name}
          </h1>
          <div className="mt-2 flex flex-wrap gap-3 text-sm">
            {customer.servicetitan_customer_id && (
              <span className="font-bold uppercase tracking-[0.12em] text-white/40">
                ST · {customer.servicetitan_customer_id}
              </span>
            )}
            {customer.hubspot_contact_id && (
              <span className="font-bold uppercase tracking-[0.12em] text-emerald-300">
                HubSpot · {customer.hubspot_contact_id}
              </span>
            )}
          </div>
        </div>
        <Link
          href={`/admin/jobs/new?customer_id=${id}`}
          className="inline-flex items-center gap-2 bg-[#F96302] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:bg-[#e05602]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New job
        </Link>
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
              className="flex items-center justify-center gap-3 border border-white/15 bg-white/5 px-5 py-4 font-display text-base font-black uppercase tracking-tight text-white transition-colors hover:border-[#F96302] hover:text-[#F96302]"
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
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-white/50">
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
        <div className="mb-10 border-l-4 border-red-500 bg-red-500/10 p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="mt-1 h-6 w-6 text-red-400" strokeWidth={2} aria-hidden="true" />
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-red-300">
                Outstanding balance
              </p>
              <p className="mt-1 font-display text-3xl font-black uppercase leading-none tracking-tight text-white md:text-4xl">
                {formatMoney(stats.totalBalanceCents)}
              </p>
              <p className="mt-2 text-sm text-white/70">
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
            <span className="text-white">
              {customer.street_address}
              {customer.city ? (
                <>
                  <br />
                  {customer.city}, {customer.state} {customer.zip}
                </>
              ) : null}
            </span>
          ) : (
            <span className="text-white/40">·</span>
          )}
        </Card>
        <Card icon={Phone} label="Phone alt / Email">
          <div className="space-y-1.5 text-white/80">
            {!customer.phone_e164 && !customer.email && (
              <span className="text-white/40">No contact info on file</span>
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

      {/* Notes */}
      {(customer.neighborhood || customer.notes) && (
        <section className="mb-12 border border-white/10 bg-white/5 p-6 md:p-7">
          {customer.neighborhood && (
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-[#F96302]">
              {customer.neighborhood}
            </p>
          )}
          {customer.notes && (
            <p className="text-sm leading-relaxed text-white/70 whitespace-pre-line">
              {customer.notes}
            </p>
          )}
        </section>
      )}

      {/* Open / active jobs (in Z and Z OS, not yet historical) */}
      {jobs.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 font-display text-2xl font-black uppercase tracking-tight md:text-3xl">
            Active jobs
            <span className="ml-3 text-base font-bold text-white/40">({jobs.length})</span>
          </h2>
          <div className="overflow-hidden border border-white/10">
            <table className="w-full text-left">
              <thead className="bg-white/5">
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
                    className="border-t border-white/5 transition-colors duration-150 hover:bg-white/5"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/jobs/${j.id}`}
                        className="font-display text-lg font-black uppercase tracking-tight text-white hover:text-[#F96302]"
                      >
                        {j.service_label ?? j.service_type}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-base text-white/70">
                      {formatDateTime(j.scheduled_start)}
                    </td>
                    <td className="px-5 py-4 text-base text-white/70">
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
          <span className="ml-3 text-base font-bold text-white/40">
            ({invoiceHistory.length})
          </span>
        </h2>
        {invoiceHistory.length === 0 ? (
          <div className="border border-dashed border-white/15 bg-white/[0.02] px-8 py-12 text-center">
            <FileText className="mx-auto h-8 w-8 text-white/30" aria-hidden="true" />
            <p className="mt-3 text-base text-white/60">No invoice history for this customer.</p>
            {jobs.length === 0 && (
              <Link
                href={`/admin/jobs/new?customer_id=${id}`}
                className="mt-4 inline-flex items-center gap-2 bg-[#F96302] px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-[#e05602]"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create the first job
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-hidden border border-white/10">
            <table className="w-full text-left">
              <thead className="bg-white/5">
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
                    className="border-t border-white/5 transition-colors duration-150 hover:bg-white/5"
                  >
                    <td className="px-5 py-4 text-sm text-white/80">
                      {inv.completed_on
                        ? new Date(inv.completed_on).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "·"}
                    </td>
                    <td className="px-5 py-4 text-sm text-white">{inv.job_type ?? "·"}</td>
                    <td className="px-5 py-4 text-sm text-white/60">{inv.technician ?? "·"}</td>
                    <td className="px-5 py-4 font-display text-base font-black tracking-tight text-white">
                      {formatMoney(inv.total_cents)}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      {inv.balance_cents > 0 ? (
                        <span className="font-bold text-red-400">
                          {formatMoney(inv.balance_cents)}
                        </span>
                      ) : (
                        <span className="text-emerald-400">Paid</span>
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
    <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white/60">
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
    <div className="border border-white/10 bg-white/5 p-4 md:p-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/60">
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
    <div className="border border-white/10 bg-white/5 p-5 md:p-6">
      <div className="mb-3 flex items-center gap-3">
        <Icon className="h-5 w-5 text-[#F96302]" strokeWidth={1.75} aria-hidden={true} />
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/60">{label}</span>
      </div>
      <div className="text-base md:text-lg">{children}</div>
    </div>
  );
}
