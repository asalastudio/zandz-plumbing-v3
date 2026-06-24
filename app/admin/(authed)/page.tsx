import Link from "next/link";
import {
  CalendarCheck,
  Briefcase,
  Users,
  Star,
  ChevronRight,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Wrench,
  Inbox,
  PhoneCall,
} from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  getDashboardKpis,
  listNewLeadNotifications,
  formatMoneyShort,
  formatMoney,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  if (!isSupabaseConfigured()) {
    return <NotConfigured />;
  }

  const [kpis, newLeads] = await Promise.all([
    getDashboardKpis(),
    listNewLeadNotifications(4),
  ]);
  const yoyDelta =
    kpis.revenuePrev12MoCents > 0
      ? Math.round(
          (100 * (kpis.revenueLast12MoCents - kpis.revenuePrev12MoCents)) /
            kpis.revenuePrev12MoCents
        )
      : null;

  const quickLinks = [
    { href: "/admin/dispatch", label: "Today's Dispatch", icon: CalendarCheck },
    { href: "/admin/jobs", label: "All Jobs", icon: Briefcase },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/reviews", label: "Review Engine", icon: Star },
  ];

  return (
    <div className="pb-24 lg:pb-0">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">Dashboard</p>
        <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
          Z and Z OS
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted md:text-lg">
          Your business at a glance. Numbers refresh every page load.
        </p>
      </header>

      <section className="mb-8">
        <Link
          href="/admin/leads"
          className={`group block border p-5 transition-colors duration-150 md:p-6 ${
            newLeads.count > 0
              ? "border-[#F96302] bg-[#F96302]/10 hover:bg-[#F96302]/15"
              : "border-line bg-card hover:bg-line"
          }`}
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">
                <Inbox className="h-5 w-5" aria-hidden="true" />
                Lead inbox
              </p>
              <h2 className="mt-2 font-display text-3xl font-black uppercase tracking-tight md:text-4xl">
                {newLeads.count > 0
                  ? `${newLeads.count} new ${newLeads.count === 1 ? "lead" : "leads"}`
                  : "No new leads"}
              </h2>
              <p className="mt-2 text-base text-muted">
                New website submissions land here before they become scheduled jobs.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-bold text-ink group-hover:text-[#F96302]">
              Review leads
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </span>
          </div>

          {newLeads.rows.length > 0 && (
            <ul className="mt-5 grid grid-cols-1 gap-2 md:grid-cols-2">
              {newLeads.rows.map((lead) => (
                <li key={lead.id} className="border border-line bg-surface px-4 py-3">
                  <p className="truncate text-base font-bold text-ink">
                    {lead.customer?.name ?? "New lead"}
                  </p>
                  <p className="mt-1 flex items-center gap-2 truncate text-sm text-muted">
                    <PhoneCall className="h-4 w-4 shrink-0 text-[#F96302]" aria-hidden="true" />
                    {lead.service_label ?? lead.service_type}
                    {lead.job_zip ? ` · ${lead.job_zip}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Link>
      </section>

      {/* Primary KPIs · revenue */}
      <section className="mb-6">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-muted">
          Revenue
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <KpiCard
            label="Lifetime revenue"
            value={formatMoneyShort(kpis.lifetimeRevenueCents)}
            sub={formatMoney(kpis.lifetimeRevenueCents)}
            icon={DollarSign}
          />
          <KpiCard
            label="Last 12 months"
            value={formatMoneyShort(kpis.revenueLast12MoCents)}
            sub={
              yoyDelta != null ? (
                <span className={yoyDelta >= 0 ? "text-emerald-700" : "text-red-700"}>
                  {yoyDelta >= 0 ? "+" : ""}
                  {yoyDelta}% vs prior year
                </span>
              ) : (
                <span className="text-muted">·</span>
              )
            }
            icon={TrendingUp}
          />
          <KpiCard
            label="This month"
            value={formatMoneyShort(kpis.revenueThisMonthCents)}
            sub={
              kpis.topJobTypeThisMonth
                ? `Top: ${kpis.topJobTypeThisMonth.type}`
                : "No completed work yet"
            }
            icon={Wrench}
          />
        </div>
      </section>

      {/* Outstanding A/R + customers */}
      <section className="mb-10">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-muted">
          Receivables and customers
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <KpiCard
            label="Open balance"
            value={formatMoneyShort(kpis.unpaidBalanceCents)}
            sub={`${kpis.unpaidInvoiceCount} invoices unpaid`}
            icon={AlertCircle}
            tone={kpis.unpaidBalanceCents > 100_000_00 ? "warn" : "default"}
          />
          <KpiCard
            label="Customers"
            value={kpis.customerCount.toLocaleString()}
            sub={`${kpis.activeCustomerCount.toLocaleString()} active last 12 mo`}
            icon={Users}
          />
          <KpiCard
            label="Jobs this week"
            value={kpis.jobsThisWeek.toLocaleString()}
            sub="On the schedule"
            icon={CalendarCheck}
          />
        </div>
      </section>

      {/* Quick links */}
      <section>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-muted">
          Quick links
        </h2>
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group flex items-center justify-between border border-line bg-card px-6 py-5 transition-colors duration-150 hover:border-[#F96302] hover:bg-line"
                >
                  <span className="flex items-center gap-4">
                    <Icon
                      className="h-6 w-6 text-[#F96302]"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                    <span className="font-display text-xl font-black uppercase tracking-tight md:text-2xl">
                      {link.label}
                    </span>
                  </span>
                  <ChevronRight
                    className="h-5 w-5 text-muted group-hover:text-[#F96302]"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  sub: React.ReactNode;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  tone?: "default" | "warn";
}) {
  const accent = tone === "warn" ? "text-red-700" : "text-[#F96302]";
  return (
    <div className="border border-line bg-card p-5 md:p-6">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
          {label}
        </span>
        <Icon className={`h-5 w-5 ${accent}`} strokeWidth={1.75} aria-hidden={true} />
      </div>
      <p className="font-display text-4xl font-black uppercase leading-none tracking-tight md:text-5xl">
        {value}
      </p>
      <p className="mt-3 text-sm text-muted">{sub}</p>
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
