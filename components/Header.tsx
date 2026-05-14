"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  Menu,
  Phone,
  X,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { siteSettings } from "@/content/site-settings";

const desktopNavLinks = [
  { label: "Services", href: "/services/" },
  { label: "Service Areas", href: "/service-areas/" },
  ...(siteSettings.features.coupons
    ? [{ label: "Coupons", href: "/coupons/" }]
    : []),
  { label: "Videos", href: "/videos/" },
  { label: "About", href: "/about/" },
  { label: "Contact", href: "/contact/" },
];

const mobileServiceLinks = [
  { label: "All Services", href: "/services/" },
  { label: "Emergency Plumbing", href: "/services/emergency/" },
  { label: "Drain Cleaning", href: "/services/drain-cleaning/" },
  { label: "Water Heaters", href: "/services/water-heater/" },
  { label: "Sewer Lines", href: "/services/sewer-lateral/" },
  { label: "Service Areas", href: "/service-areas/" },
];

const trustItems = [
  "Two Licenses, One Crew",
  `${siteSettings.cslb}`,
  "C-36 + A General Engineering",
  "Since 2003",
];

function isActivePath(pathname: string | null, href: string) {
  if (!pathname) return false;
  const cleanPath = pathname !== "/" ? pathname.replace(/\/$/, "") : pathname;
  const cleanHref = href !== "/" ? href.replace(/\/$/, "") : href;
  return cleanPath === cleanHref || cleanPath.startsWith(`${cleanHref}/`);
}

function isExactPath(pathname: string | null, href: string) {
  if (!pathname) return false;
  const cleanPath = pathname !== "/" ? pathname.replace(/\/$/, "") : pathname;
  const cleanHref = href !== "/" ? href.replace(/\/$/, "") : href;
  return cleanPath === cleanHref;
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <header data-marketing="true" className="sticky top-0 z-[90] bg-black">
      {/* Main nav row */}
      <div className="mx-auto max-w-[1800px] px-6 md:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16 md:h-18">
          <Logo variant="light" />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Primary navigation">
            {desktopNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-white/80 hover:text-white transition-colors duration-150 uppercase tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop phone CTA */}
          <a
            href={`tel:${siteSettings.phoneTel}`}
            className="hidden md:inline-flex items-center gap-2 bg-[#F96302] text-white px-5 py-2.5 text-sm font-semibold rounded-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:bg-[#e05602]"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {siteSettings.phone}
          </a>

          {/* Mobile menu toggle */}
          {!mobileOpen && (
            <button
              type="button"
              className="inline-flex min-h-12 min-w-12 items-center justify-center text-white md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded="false"
              aria-controls="mobile-menu"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Trust strip */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[1800px] px-6 md:px-8 lg:px-12">
          <div className="flex min-h-10 items-center justify-center gap-3 md:hidden">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-white/70">
              CSLB #896116
            </span>
            <span className="text-xs text-[#F96302]" aria-hidden="true">|</span>
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-white/70">
              Since 2003
            </span>
          </div>
          <div className="hidden items-center gap-0 overflow-x-auto py-2 hide-scrollbar md:flex">
            {trustItems.map((item, i) => (
              <span key={item} className="flex items-center flex-shrink-0">
                <span className="text-xs font-semibold text-white/70 uppercase tracking-[0.06em] whitespace-nowrap">
                  {item}
                </span>
                {i < trustItems.length - 1 && (
                  <span className="mx-4 text-[#F96302] text-xs" aria-hidden="true">|</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile full-screen menu */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className="fixed inset-0 z-[80] bg-black text-white md:hidden"
        >
          <div className="flex h-dvh min-h-screen flex-col overflow-y-auto">
            <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-white/10 px-6">
              <Logo variant="light" />
              <button
                type="button"
                onClick={closeMobileMenu}
                className="inline-flex min-h-12 min-w-12 items-center justify-center text-white"
                aria-label="Close menu"
              >
                <X className="h-7 w-7" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-shrink-0 border-b border-white/10 px-5">
              <div className="flex min-h-10 items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-[0.1em] text-white/60">
                <span>CSLB #896116</span>
                <span className="text-[#F96302]" aria-hidden="true">|</span>
                <span>Since 2003</span>
              </div>
            </div>

            <div className="flex flex-1 flex-col px-5 py-4">
              <div className="rounded-lg border border-white/15 bg-white/[0.04] p-3.5">
                <div>
                  <div>
                    <p className="font-display text-[1.35rem] font-black uppercase leading-none">
                      Book in 60 seconds
                    </p>
                    <p className="mt-1 text-sm leading-snug text-white/60">
                      ZIP, issue, info. We call to lock it in.
                    </p>
                  </div>
                </div>

                <Link
                  href="/book/"
                  onClick={closeMobileMenu}
                  className="mt-3 flex min-h-14 items-center justify-center gap-2 rounded-lg bg-[#F96302] px-5 text-base font-black uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#d95400]"
                >
                  Schedule online
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </Link>
                <a
                  href={`tel:${siteSettings.phoneTel}`}
                  className="mt-2 flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-black text-black"
                  aria-label={`Call Z and Z Plumbing at ${siteSettings.phone}`}
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  Call {siteSettings.phone}
                </a>
              </div>

              <nav className="mt-5" aria-label="Mobile navigation">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-white/45">
                    Services
                  </p>
                  {(pathname?.startsWith("/services") || pathname?.startsWith("/service-areas")) && (
                    <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#F96302]">
                      Current
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-1 pt-2">
                  {mobileServiceLinks.map((link) => {
                    const active =
                      link.href === "/services/"
                        ? isExactPath(pathname, link.href)
                        : isActivePath(pathname, link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={closeMobileMenu}
                        aria-current={active ? "page" : undefined}
                        className={[
                          "flex min-h-12 items-center justify-between rounded-lg px-3 text-base font-bold transition-colors duration-150",
                          active
                            ? "bg-white/[0.08] text-white ring-1 ring-[#F96302]/70"
                            : "text-white/75 hover:bg-white/[0.06] hover:text-white",
                        ].join(" ")}
                      >
                        {link.label}
                        <ChevronRight
                          className={[
                            "h-4 w-4",
                            active ? "text-[#F96302]" : "text-white/30",
                          ].join(" ")}
                          aria-hidden="true"
                        />
                      </Link>
                    );
                  })}
                </div>

                {siteSettings.features.coupons && (
                  <div className="mt-3 border-t border-white/10 pt-3">
                    <Link
                      href="/coupons/"
                      onClick={closeMobileMenu}
                      aria-current={isActivePath(pathname, "/coupons/") ? "page" : undefined}
                      className={[
                        "flex min-h-[54px] items-center justify-between rounded-lg px-3 text-[1.25rem] font-black uppercase tracking-wide transition-colors duration-150",
                        isActivePath(pathname, "/coupons/")
                          ? "bg-white/[0.08] text-white ring-1 ring-[#F96302]/70"
                          : "text-white hover:bg-white/[0.06] hover:text-[#F96302]",
                      ].join(" ")}
                    >
                      Coupons
                      <ChevronRight className="h-5 w-5 text-white/35" aria-hidden="true" />
                    </Link>
                  </div>
                )}
              </nav>
              <p className="mt-auto pb-4 pt-5 text-center text-xs leading-relaxed text-white/40">
                Two licenses, one East Bay crew.
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
