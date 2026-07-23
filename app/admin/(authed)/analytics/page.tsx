import Link from "next/link";
import { Phone, MapPin, TrendingUp, Users, Wrench, Clock, BarChart3, Timer, Cpu } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  getAnalytics,
  getResponseTimeStats,
  formatMoney,
  formatMoneyShort,
  formatDuration,
} from "@/lib/db";
import { getMonthUsage, formatMicros } from "@/lib/api-usage";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  if (!isSupabaseConfigured()) {
    return <NotConfigured />;
  }

  const [data, responseTime, usage] = await Promise.all([
    getAnalytics(),
    getResponseTimeStats(90),
    getMonthUsage(),
  ]);

  // For the monthly revenue bar chart — find the max value to normalize bar heights
  const monthlyMax = Math.max(1, ...data.monthlyRevenue.map((m) => m.revenueCents));

  return (
    <div className="pb-24 lg:pb-0">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">Analytics</p>
        <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
          Your Business in Numbers
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted md:text-lg">
          Real numbers from every invoice ever logged. {data.totals.invoiceCount.toLocaleString()}{" "}
          invoices across {data.totals.customersWithJobs.toLocaleString()} customers who have
          actually booked a job.
        </p>
      </header>

      {/* Speed to lead — the one number that decides how many leads convert. */}
      <section className="mb-12">
        <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-muted">
          <Timer className="h-4 w-4" aria-hidden="true" />
          Speed to lead · last 90 days
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <SummaryStat
            label="Median callback"
            value={formatDuration(responseTime.medianSeconds)}
            sub="Half of leads beat this"
            icon={Timer}
          />
          <SummaryStat
            label="Slowest 10%"
            value={formatDuration(responseTime.p90Seconds)}
            sub="90th percentile"
            icon={Clock}
          />
          <SummaryStat
            label="Leads measured"
            value={responseTime.sampleSize.toLocaleString()}
            sub="Contacted in window"
            icon={Users}
          />
          <SummaryStat
            label="Uncontacted now"
            value={responseTime.breaches.length.toLocaleString()}
            sub="Past the escalation ladder"
            icon={Phone}
          />
        </div>
        <p className="mt-2 text-xs text-faint">
          Measured from lead arrival to the moment the job leaves the New status. Tracking
          began with the speed-to-lead release, so this only covers leads handled since
          then. Do not publish a callback-time claim until the sample is meaningful.
        </p>
      </section>

      {/* API cost — what the platform's AI is spending this month. */}
      <section className="mb-12">
        <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-muted">
          <Cpu className="h-4 w-4" aria-hidden="true" />
          AI usage · {usage.monthLabel}
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {/* AI Gateway spend from the usage ledger */}
          <div className="border border-line bg-card p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">AI Gateway (Claude)</p>
            <p className="mt-1 font-display text-3xl font-black text-ink">
              {formatMicros(
                usage.byProvider.find((p) => p.provider === "ai_gateway")?.costMicros ?? 0
              )}
            </p>
            <p className="text-xs text-faint">
              {(usage.byProvider.find((p) => p.provider === "ai_gateway")?.calls ?? 0).toLocaleString()}{" "}
              calls · estimated
            </p>
          </div>

          {/* ElevenLabs, live from their API */}
          <div className="border border-line bg-card p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">ElevenLabs voice</p>
            {usage.elevenLabs ? (
              <>
                <p className="mt-1 font-display text-3xl font-black text-ink">
                  {usage.elevenLabs.nextInvoiceCents != null
                    ? `$${(usage.elevenLabs.nextInvoiceCents / 100).toFixed(2)}`
                    : "—"}
                </p>
                <p className="text-xs text-faint">
                  next invoice · {usage.elevenLabs.charactersUsed.toLocaleString()} /{" "}
                  {usage.elevenLabs.characterLimit.toLocaleString()} chars
                  {usage.elevenLabs.tier ? ` · ${usage.elevenLabs.tier}` : ""}
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-muted">Not connected (ELEVENLABS_API_KEY unset).</p>
            )}
          </div>

          {/* Total */}
          <div className="border border-[#F96302]/30 bg-[#F96302]/5 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[#F96302]">
              Metered AI this month
            </p>
            <p className="mt-1 font-display text-3xl font-black text-ink">
              {formatMicros(usage.totalMicros)}
            </p>
            <p className="text-xs text-faint">
              Gateway spend. Voice billed separately by ElevenLabs.
            </p>
          </div>
        </div>

        {usage.byProvider.length > 0 && (
          <p className="mt-2 text-xs text-faint">
            Estimated from token counts at published model rates — a gauge, not a bill.
          </p>
        )}
      </section>

      {/* Summary stats strip */}
      <section className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
        <SummaryStat
          label="Repeat customer rate"
          value={`${Math.round(data.totals.repeatCustomerRate * 100)}%`}
          sub={`${data.totals.customersWithJobs.toLocaleString()} have ever booked`}
          icon={Users}
        />
        <SummaryStat
          label="Avg ticket overall"
          value={
            data.totals.invoiceCount > 0
              ? formatMoneyShort(
                  Math.round(
                    data.jobTypeBreakdown.reduce((s, j) => s + j.revenueCents, 0) /
                      data.totals.invoiceCount
                  )
                )
              : "$0"
          }
          sub={`${data.totals.invoiceCount.toLocaleString()} jobs total`}
          icon={Wrench}
        />
        <SummaryStat
          label="Customer base"
          value={data.totals.customerCount.toLocaleString()}
          sub={`${(data.totals.customerCount - data.totals.customersWithJobs).toLocaleString()} leads · ${data.totals.customersWithJobs.toLocaleString()} served`}
          icon={Users}
        />
        <SummaryStat
          label="Dormant 12mo+"
          value={data.dormantCustomers.length === 25 ? "25+" : String(data.dormantCustomers.length)}
          sub="Re-engagement opportunities"
          icon={Clock}
        />
      </section>

      {/* Monthly revenue chart */}
      <section className="mb-12">
        <SectionHead icon={TrendingUp} title="Monthly revenue · last 24 months" />
        <div className="border border-line bg-card p-6">
          {data.monthlyRevenue.length === 0 ? (
            <p className="text-muted">No revenue data yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex min-w-max items-end gap-2 px-2 pb-4">
                {data.monthlyRevenue.map((m) => {
                  const heightPct = (m.revenueCents / monthlyMax) * 100;
                  return (
                    <div key={m.month} className="flex flex-col items-center" style={{ width: 42 }}>
                      <span
                        className="mb-1 text-[9px] font-bold tabular-nums text-muted"
                        title={formatMoney(m.revenueCents)}
                      >
                        {formatMoneyShort(m.revenueCents).replace("$", "")}
                      </span>
                      <div
                        className="w-full bg-[#F96302]/80 transition-colors hover:bg-[#F96302]"
                        style={{
                          height: `${Math.max(2, heightPct * 1.6)}px`,
                          minHeight: "2px",
                        }}
                        title={`${m.month} · ${formatMoney(m.revenueCents)} · ${m.invoiceCount} jobs`}
                      />
                      <span className="mt-2 rotate-[-60deg] text-[10px] font-bold uppercase tracking-wider text-muted">
                        {formatMonth(m.month)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-muted">
                Hover any bar to see exact revenue and job count. Tallest bar ={" "}
                {formatMoney(monthlyMax)}.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Job type breakdown */}
      <section className="mb-12">
        <SectionHead
          icon={Wrench}
          title="What kind of work makes you money"
          subtitle="Sorted by revenue. Click any row to see the underlying invoices someday — not yet wired."
        />
        <div className="overflow-hidden border border-line">
          <table className="w-full text-left">
            <thead className="bg-card">
              <tr>
                <Th>Job type</Th>
                <Th className="text-right">Jobs</Th>
                <Th className="text-right">Revenue</Th>
                <Th className="text-right">Avg ticket</Th>
                <Th>Share</Th>
              </tr>
            </thead>
            <tbody>
              {data.jobTypeBreakdown.map((row) => {
                const totalRev = data.jobTypeBreakdown.reduce((s, j) => s + j.revenueCents, 0);
                const pct = totalRev > 0 ? (row.revenueCents / totalRev) * 100 : 0;
                return (
                  <tr key={row.type} className="border-t border-line hover:bg-raised">
                    <td className="px-5 py-3 font-display text-lg font-black tracking-tight">
                      {row.type}
                    </td>
                    <td className="px-5 py-3 text-right text-sm text-muted tabular-nums">
                      {row.count.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right text-base font-bold tabular-nums">
                      {formatMoneyShort(row.revenueCents)}
                    </td>
                    <td className="px-5 py-3 text-right text-sm text-muted tabular-nums">
                      {formatMoneyShort(row.avgTicketCents)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="h-2 w-full bg-card">
                        <div
                          className="h-full bg-[#F96302]"
                          style={{ width: `${pct.toFixed(1)}%` }}
                          title={`${pct.toFixed(1)}%`}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Top 20 customers + Revenue by city · side by side on desktop */}
      <section className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <SectionHead icon={Users} title="Top 20 customers · lifetime revenue" />
          <div className="overflow-hidden border border-line">
            <table className="w-full text-left">
              <thead className="bg-card">
                <tr>
                  <Th>#</Th>
                  <Th>Customer</Th>
                  <Th className="text-right">Jobs</Th>
                  <Th className="text-right">Lifetime $</Th>
                </tr>
              </thead>
              <tbody>
                {data.topCustomers.map((c, i) => (
                  <tr key={c.id} className="border-t border-line hover:bg-raised">
                    <td className="px-4 py-2.5 text-xs font-bold text-muted tabular-nums">
                      {i + 1}
                    </td>
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="font-bold text-ink hover:text-[#F96302]"
                      >
                        {c.name}
                      </Link>
                      {c.city && (
                        <span className="ml-2 text-xs text-muted">{c.city}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right text-sm text-muted tabular-nums">
                      {c.jobCount}
                    </td>
                    <td className="px-4 py-2.5 text-right text-base font-bold tabular-nums">
                      {formatMoneyShort(c.revenueCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <SectionHead icon={MapPin} title="Revenue by city" />
          <div className="overflow-hidden border border-line">
            <table className="w-full text-left">
              <thead className="bg-card">
                <tr>
                  <Th>City</Th>
                  <Th className="text-right">Customers</Th>
                  <Th className="text-right">Jobs</Th>
                  <Th className="text-right">Revenue</Th>
                </tr>
              </thead>
              <tbody>
                {data.revenueByCity.map((c) => (
                  <tr key={c.city} className="border-t border-line hover:bg-raised">
                    <td className="px-4 py-2.5 font-bold text-ink">{c.city}</td>
                    <td className="px-4 py-2.5 text-right text-sm text-muted tabular-nums">
                      {c.customerCount}
                    </td>
                    <td className="px-4 py-2.5 text-right text-sm text-muted tabular-nums">
                      {c.jobCount}
                    </td>
                    <td className="px-4 py-2.5 text-right text-base font-bold tabular-nums">
                      {formatMoneyShort(c.revenueCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Dormant customers · re-engagement list */}
      <section className="mb-12">
        <SectionHead
          icon={Clock}
          title="Dormant customers · re-engagement candidates"
          subtitle="Past customers who haven't booked in 12+ months. Sorted by lifetime spend — these are the best candidates to win back."
        />
        <div className="overflow-hidden border border-line">
          <table className="w-full text-left">
            <thead className="bg-card">
              <tr>
                <Th>Customer</Th>
                <Th>Phone</Th>
                <Th>City</Th>
                <Th>Last service</Th>
                <Th className="text-right">Lifetime $</Th>
              </tr>
            </thead>
            <tbody>
              {data.dormantCustomers.map((c) => (
                <tr key={c.id} className="border-t border-line hover:bg-raised">
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/admin/customers/${c.id}`}
                      className="font-bold text-ink hover:text-[#F96302]"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    {c.phone_e164 ? (
                      <a
                        href={`tel:${c.phone_e164}`}
                        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-[#F96302]"
                      >
                        <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                        {c.phone_e164}
                      </a>
                    ) : (
                      <span className="text-faint">·</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-muted">{c.city ?? "·"}</td>
                  <td className="px-4 py-2.5 text-sm text-muted">
                    {c.lastCompletedOn
                      ? new Date(c.lastCompletedOn).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                        })
                      : "·"}
                  </td>
                  <td className="px-4 py-2.5 text-right text-base font-bold tabular-nums">
                    {formatMoneyShort(c.revenueCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.dormantCustomers.length === 25 && (
          <p className="mt-3 text-xs text-muted">
            Showing top 25 by lifetime value. Full dormant list available via{" "}
            <Link
              href="/admin/customers?filter=dormant&sort=revenue"
              className="text-[#F96302] hover:underline"
            >
              Customers → Dormant filter
            </Link>
            .
          </p>
        )}
      </section>

      {/* New customers per month */}
      <section className="mb-12">
        <SectionHead
          icon={BarChart3}
          title="New customers per month"
          subtitle="Customer records created. Reflects when a customer was first entered into ServiceTitan (not necessarily when they first paid)."
        />
        <div className="border border-line bg-card p-6">
          {data.newCustomersByMonth.length === 0 ? (
            <p className="text-muted">No data yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex min-w-max items-end gap-2 px-2 pb-4">
                {data.newCustomersByMonth.map((m) => {
                  const max = Math.max(
                    1,
                    ...data.newCustomersByMonth.map((x) => x.count)
                  );
                  const heightPct = (m.count / max) * 100;
                  return (
                    <div key={m.month} className="flex flex-col items-center" style={{ width: 42 }}>
                      <span className="mb-1 text-[10px] font-bold tabular-nums text-muted">
                        {m.count}
                      </span>
                      <div
                        className="w-full bg-emerald-500/70 hover:bg-emerald-400"
                        style={{ height: `${Math.max(2, heightPct * 1.4)}px`, minHeight: "2px" }}
                        title={`${m.month} · ${m.count} new customers`}
                      />
                      <span className="mt-2 rotate-[-60deg] text-[10px] font-bold uppercase tracking-wider text-muted">
                        {formatMonth(m.month)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function SectionHead({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-[#F96302]" strokeWidth={1.75} aria-hidden={true} />
        <h2 className="font-display text-2xl font-black uppercase tracking-tight md:text-3xl">
          {title}
        </h2>
      </div>
      {subtitle && <p className="mt-2 max-w-2xl text-sm text-muted">{subtitle}</p>}
    </div>
  );
}

function SummaryStat({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub: string;
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
      <p className="mt-2 text-xs text-muted">{sub}</p>
    </div>
  );
}

function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted ${className}`}
    >
      {children}
    </th>
  );
}

function formatMonth(yyyyMm: string): string {
  const [y, m] = yyyyMm.split("-");
  const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function NotConfigured() {
  return (
    <div className="pb-24 lg:pb-0">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">Analytics</p>
        <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
          Your Business in Numbers
        </h1>
      </header>
      <div className="border-l-4 border-[#F96302] bg-[#F96302]/10 p-6">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#F96302]">Setup needed</p>
        <p className="mt-2 text-base text-muted md:text-lg">
          Connect Supabase via WIRING.md, then this page populates automatically.
        </p>
      </div>
    </div>
  );
}
