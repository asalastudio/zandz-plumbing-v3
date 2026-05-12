import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  LayoutDashboard,
  CalendarCheck,
  Briefcase,
  Users,
  Star,
  HardHat,
  LogOut,
} from "lucide-react";
import { isAuthenticated } from "@/lib/auth";
import { FaucetMark } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Z and Z OS · Admin",
  robots: { index: false, follow: false },
};

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/dispatch", label: "Dispatch", icon: CalendarCheck },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/crew", label: "Crew", icon: HardHat },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAuthenticated();
  if (!authed) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-6 py-4">
          <Link href="/admin" className="flex items-center gap-3">
            <FaucetMark size={36} />
            <div className="flex flex-col leading-none">
              <span className="font-display text-lg font-black uppercase tracking-tight">
                Z and Z OS
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#F96302]">
                Admin
              </span>
            </div>
          </Link>
          <form action="/api/admin/logout" method="POST">
            <button
              type="submit"
              className="inline-flex items-center gap-2 border border-white/15 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white/80 transition-colors duration-150 hover:border-[#F96302] hover:text-[#F96302]"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* Layout: sidebar + main */}
      <div className="mx-auto flex max-w-[1800px] gap-8 px-6 py-8">
        <aside className="hidden w-56 flex-shrink-0 lg:block">
          <nav className="sticky top-24 flex flex-col gap-1">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-3 border border-transparent px-4 py-3 text-base font-semibold text-white/70 transition-colors duration-150 hover:border-white/10 hover:bg-white/5 hover:text-white"
                >
                  <Icon className="h-5 w-5 flex-shrink-0 text-white/40 group-hover:text-[#F96302]" strokeWidth={1.75} aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Admin"
        className="fixed bottom-0 inset-x-0 z-40 grid grid-cols-6 border-t border-white/10 bg-black lg:hidden"
      >
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-bold uppercase tracking-wide text-white/60 transition-colors duration-150 hover:text-[#F96302]"
            >
              <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
