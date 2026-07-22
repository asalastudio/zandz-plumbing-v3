import Link from "next/link";
import {
  CalendarCheck,
  Briefcase,
  Users,
  ChevronRight,
  AlertCircle,
  Inbox,
  Phone,
  ReceiptText,
  UserPlus,
  FileText,
  Timer,
  TriangleAlert,
} from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  getDashboardKpis,
  getResponseTimeStats,
  listNewLeadNotifications,
  formatMoneyShort,
  formatDuration,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  if (!isSupabaseConfigured()) {
    return <NotConfigured />;
  }

  const [kpis, newLeads, responseTime] = await Promise.all([
    getDashboardKpis(),
    listNewLeadNotifications(4),
    getResponseTimeStats(30),
  ]);

  const today = new Date().toLocaleDateString("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const yoyDelta =
    kpis.revenuePrev12MoCents > 0
      ? Math.round(
          (100 * (kpis.revenueLast12MoCents - kpis.revenuePrev12MoCents)) /
            kpis.revenuePrev12MoCents
        )
      : null;

  return (
    <div className="pb-24 lg:pb-0">
      {/* Compact header + date */}
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">Dashboard</p>
          <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight md:text-4xl">
            Z and Z OS
          </h1>
        </div>
        <p className="hidden text-sm font-bold uppercase tracking-wide text-muted sm:block">
          {today}
        </p>
      </header>

      {/* Quick actions — the operator's most common "create" tasks */}
      <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <ActionButton href="/admin/invoices/new" icon={ReceiptText} label="New invoice" primary />
        <ActionButton href="/admin/jobs/new" icon={Briefcase} label="New job" />
        <ActionButton href="/admin/customers/new" icon={UserPlus} label="New customer" />
      </section>

      {/* Lead inbox — most time-sensitive; each lead is tappable + tap-to-call */}
      <section className="mb-8">
        <div
          className={`border p-5 md:p-6 ${
            newLeads.count > 0 ? "border-[#F96302] bg-[#F96302]/5" : "border-line bg-card"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">
                <Inbox className="h-5 w-5" aria-hidden="true" />
                Lead inbox
              </p>
              <h2 className="mt-1 font-display text-2xl font-black uppercase tracking-tight md:text-3xl">
                {newLeads.count > 0
                  ? `${newLeads.count} new ${newLeads.count === 1 ? "lead" : "leads"}`
                  : "No new leads"}
              </h2>
            </div>
            <Link
              href="/admin/leads"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-ink hover:text-[#F96302]"
            >
              Review all
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {newLeads.rows.length > 0 ? (
            <ul className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
              {newLeads.rows.map((lead) => (
                <li
                  key={lead.id}
                  className="flex items-center justify-between gap-3 border border-line bg-card px-4 py-3"
                >
                  <Link href={`/admin/jobs/${lead.id}`} className="group min-w-0">
                    <p className="truncate text-base font-bold text-ink group-hover:text-[#F96302]">
                      {lead.customer?.name ?? "New lead"}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-muted">
                      {lead.service_label ?? lead.service_type}
                      {lead.job_zip ? ` · ${lead.job_zip}` : ""}
                    </p>
                  </Link>
                  {lead.customer?.phone_e164 && (
                    <a
                      href={`tel:${lead.customer.phone_e164}`}
                      className="inline-flex shrink-0 items-center gap-1.5 bg-[#F96302] px-3 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-[#e05602]"
                    >
                      <Phone className="h-4 w-4" aria-hidden="true" />
                      Call
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">
              New website submissions land here before they become scheduled jobs.
            </p>
          )}
        </div>
      </section>

      {/* Speed to lead — how fast leads actually get called back, plus anything
          that has already blown through the escalation ladder. */}
      <section className="mb-8">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-muted">
          Speed to lead
        </h2>

        {responseTime.breaches.length > 0 && (
          <div className="mb-3 border border-red-300 bg-red-50 p-5">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-red-700">
              <TriangleAlert className="h-5 w-5" aria-hidden="true" />
              {responseTime.breaches.length} lead
              {responseTime.breaches.length === 1 ? "" : "s"} still not contacted
            </p>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {responseTime.breaches.slice(0, 4).map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/admin/jobs/${b.id}`}
                    className="group flex items-center justify-between gap-3 border border-red-200 bg-card px-4 py-3"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-base font-bold text-ink group-hover:text-[#F96302]">
                        {b.customerName ?? `Job ${b.id}`}
                      </span>
                      <span className="mt-0.5 block truncate text-sm text-muted">
                        {b.serviceLabel ?? "Service request"}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-bold text-red-700">
                      {formatDuration(b.waitingMinutes * 60)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile
            href="/admin/leads"
            label="Median callback"
            value={formatDuration(responseTime.medianSeconds)}
            sub="Last 30 days"
            icon={Timer}
          />
          <StatTile
            href="/admin/leads"
            label="Slowest 10%"
            value={formatDuration(responseTime.p90Seconds)}
            sub="90th percentile"
            icon={Timer}
            highlight={
              responseTime.p90Seconds !== null && responseTime.p90Seconds > 3600
                ? "red"
                : undefined
            }
          />
        </div>

        <p className="mt-2 text-xs text-faint">
          {responseTime.sampleSize === 0
            ? "No contacted leads yet. Timing starts once leads are worked out of the New status."
            : `Based on ${responseTime.sampleSize} lead${
                responseTime.sampleSize === 1 ? "" : "s"
              } contacted in the last 30 days.`}
        </p>
      </section>

      {/* At a glance — every tile navigates; attention states highlight */}
      <section className="mb-8">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-muted">At a glance</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile
            href="/admin/dispatch"
            label="Jobs this week"
            value={kpis.jobsThisWeek.toLocaleString()}
            sub="On the schedule"
            icon={CalendarCheck}
          />
          <StatTile
            href="/admin/jobs?status=complete"
            label="Ready to invoice"
            value={kpis.jobsReadyToInvoice.toLocaleString()}
            sub="Completed jobs"
            icon={FileText}
            highlight={kpis.jobsReadyToInvoice > 0 ? "orange" : undefined}
          />
          <StatTile
            href="/admin/invoices"
            label="Open balance"
            value={formatMoneyShort(kpis.unpaidBalanceCents)}
            sub={`${kpis.unpaidInvoiceCount} unpaid`}
            icon={AlertCircle}
            highlight={kpis.unpaidBalanceCents > 0 ? "red" : undefined}
          />
          <StatTile
            href="/admin/customers"
            label="Customers"
            value={kpis.customerCount.toLocaleString()}
            sub={`${kpis.activeCustomerCount.toLocaleString()} active`}
            icon={Users}
          />
        </div>
      </section>

      {/* Revenue — secondary reference */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Revenue</h2>
          <Link
            href="/admin/analytics"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted hover:text-[#F96302]"
          >
            View analytics
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <RevenueTile label="Lifetime" value={formatMoneyShort(kpis.lifetimeRevenueCents)} />
          <RevenueTile
            label="Last 12 months"
            value={formatMoneyShort(kpis.revenueLast12MoCents)}
            sub={
              yoyDelta != null ? (
                <span className={yoyDelta >= 0 ? "text-emerald-700" : "text-red-700"}>
                  {yoyDelta >= 0 ? "+" : ""}
                  {yoyDelta}% vs prior year
                </span>
              ) : null
            }
          />
          <RevenueTile
            label="This month"
            value={formatMoneyShort(kpis.revenueThisMonthCents)}
            sub={
              kpis.topJobTypeThisMonth ? `Top: ${kpis.topJobTypeThisMonth.type}` : "No completed work yet"
            }
          />
        </div>
      </section>
    </div>
  );
}

function ActionButton({
  href,
  icon: Icon,
  label,
  primary = false,
}: {
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-center gap-2 px-4 py-4 text-sm font-bold uppercase tracking-wide transition-colors duration-150 sm:text-base ${
        primary
          ? "bg-[#F96302] text-white hover:bg-[#e05602]"
          : "border border-line bg-card text-ink hover:border-[#F96302] hover:text-[#F96302]"
      }`}
    >
      <Icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
      {label}
    </Link>
  );
}

function StatTile({
  href,
  label,
  value,
  sub,
  icon: Icon,
  highlight,
}: {
  href: string;
  label: string;
  value: string;
  sub: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  highlight?: "orange" | "red";
}) {
  const shell =
    highlight === "orange"
      ? "border-[#F96302] bg-[#F96302]/5"
      : highlight === "red"
        ? "border-red-300 bg-red-50"
        : "border-line bg-card";
  const accent = highlight === "red" ? "text-red-700" : "text-[#F96302]";
  return (
    <Link
      href={href}
      className={`group border p-5 transition-colors duration-150 hover:border-[#F96302] ${shell}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{label}</span>
        <Icon className={`h-5 w-5 ${accent}`} strokeWidth={1.75} aria-hidden={true} />
      </div>
      <p className="font-display text-3xl font-black uppercase leading-none tracking-tight md:text-4xl">
        {value}
      </p>
      <p className="mt-2 flex items-center gap-1 text-sm text-muted">
        {sub}
        <ChevronRight
          className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        />
      </p>
    </Link>
  );
}

function RevenueTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: React.ReactNode;
}) {
  return (
    <div className="border border-line bg-card p-5">
      <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{label}</span>
      <p className="mt-2 font-display text-2xl font-black uppercase tracking-tight md:text-3xl">
        {value}
      </p>
      {sub ? <p className="mt-1 text-sm text-muted">{sub}</p> : null}
    </div>
  );
}

function NotConfigured() {
  return (
    <div className="pb-24 lg:pb-0">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">Dashboard</p>
        <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
          Z and Z OS
        </h1>
      </header>
      <div className="mb-8 border-l-4 border-[#F96302] bg-[#F96302]/10 p-6 md:p-7">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#F96302]">Setup needed</p>
        <p className="mt-2 text-base text-muted md:text-lg">
          Supabase env vars are not set. Open{" "}
          <code className="rounded bg-surface px-2 py-0.5 text-sm">WIRING.md</code> for the
          step-by-step. Stats will populate once the database is connected.
        </p>
      </div>
    </div>
  );
}
