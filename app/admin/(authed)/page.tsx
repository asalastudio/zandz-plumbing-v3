import Link from "next/link";
import { CalendarCheck, Briefcase, Users, Star, ChevronRight } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function loadStats() {
  if (!isSupabaseConfigured()) {
    return {
      configured: false,
      pendingRequests: 0,
      sentLast7Days: 0,
      clickedLast30Days: 0,
      optedOut: 0,
    };
  }

  const sb = supabase();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [pending, sent, clicked, optedOut] = await Promise.all([
    sb
      .from("review_requests")
      .select("id", { count: "exact", head: true })
      .is("sent_at", null)
      .is("cancelled_at", null),
    sb
      .from("review_requests")
      .select("id", { count: "exact", head: true })
      .gte("sent_at", sevenDaysAgo),
    sb
      .from("review_requests")
      .select("id", { count: "exact", head: true })
      .gte("link_clicked_at", thirtyDaysAgo),
    sb.from("sms_opt_outs").select("phone_e164", { count: "exact", head: true }),
  ]);

  return {
    configured: true,
    pendingRequests: pending.count ?? 0,
    sentLast7Days: sent.count ?? 0,
    clickedLast30Days: clicked.count ?? 0,
    optedOut: optedOut.count ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const stats = await loadStats();

  const quickLinks = [
    { href: "/admin/dispatch", label: "Today's Dispatch", icon: CalendarCheck, ready: false },
    { href: "/admin/jobs", label: "All Jobs", icon: Briefcase, ready: false },
    { href: "/admin/customers", label: "Customers", icon: Users, ready: false },
    { href: "/admin/reviews", label: "Review Engine", icon: Star, ready: true },
  ];

  return (
    <div className="pb-24 lg:pb-0">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">Dashboard</p>
        <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
          Z and Z OS
        </h1>
        <p className="mt-3 max-w-2xl text-base text-white/70 md:text-lg">
          Single home for dispatch, jobs, customers, and the review engine. Replaces ServiceTitan
          one workflow at a time.
        </p>
      </header>

      {!stats.configured && (
        <div className="mb-8 border-l-4 border-[#F96302] bg-[#F96302]/10 p-6 md:p-7">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#F96302]">
            Setup needed
          </p>
          <p className="mt-2 text-base text-white/80 md:text-lg">
            Supabase env vars are not set. Open <code className="rounded bg-black/50 px-2 py-0.5 text-sm">WIRING.md</code>{" "}
            for the step-by-step. Stats will populate once the database is connected.
          </p>
        </div>
      )}

      {/* Stats */}
      <section className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Pending review SMS" value={stats.pendingRequests} />
        <Stat label="Sent · last 7 days" value={stats.sentLast7Days} />
        <Stat label="Clicks · last 30 days" value={stats.clickedLast30Days} />
        <Stat label="Opted out" value={stats.optedOut} />
      </section>

      {/* Quick links */}
      <section>
        <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-white/50">
          Quick links
        </h2>
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group flex items-center justify-between border border-white/10 bg-white/5 px-6 py-5 transition-colors duration-150 hover:border-[#F96302] hover:bg-white/10"
                >
                  <span className="flex items-center gap-4">
                    <Icon className="h-6 w-6 text-[#F96302]" strokeWidth={1.75} aria-hidden="true" />
                    <span className="font-display text-xl font-black uppercase tracking-tight md:text-2xl">
                      {link.label}
                    </span>
                    {!link.ready && (
                      <span className="inline-flex items-center bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/60">
                        Phase 2
                      </span>
                    )}
                  </span>
                  <ChevronRight className="h-5 w-5 text-white/40 group-hover:text-[#F96302]" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-white/10 bg-white/5 p-5 md:p-6">
      <p className="font-display text-4xl font-black uppercase leading-none md:text-5xl">
        {value.toLocaleString()}
      </p>
      <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-white/60">{label}</p>
    </div>
  );
}
