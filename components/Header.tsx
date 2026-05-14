"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  ChevronRight,
  Menu,
  Phone,
  ShieldCheck,
  Wrench,
  X,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { siteSettings } from "@/content/site-settings";

const navLinks = [
  { label: "Services", href: "/services/" },
  { label: "About", href: "/about/" },
  { label: "Service Area", href: "/service-areas/" },
  { label: "Videos", href: "/videos/" },
  { label: "Coupons", href: "/coupons/" },
  { label: "Contact", href: "/contact/" },
];

const featuredLinks = [
  { label: "Emergency", href: "/services/emergency/" },
  { label: "Drains", href: "/services/drain-cleaning/" },
  { label: "Water Heaters", href: "/services/water-heater/" },
  { label: "Sewer Lines", href: "/services/sewer-lateral/" },
];

const trustItems = [
  "Two Licenses, One Crew",
  `${siteSettings.cslb}`,
  "C-36 + A General Engineering",
  "Since 2003",
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

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
            {navLinks.map((link) => (
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
          <button
            type="button"
            className="inline-flex min-h-12 min-w-12 items-center justify-center text-white md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Trust strip */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[1800px] px-6 md:px-8 lg:px-12">
          <div className="flex items-center gap-0 overflow-x-auto py-2 hide-scrollbar">
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

            <div className="flex-shrink-0 border-b border-white/10 px-6">
              <div className="flex items-center gap-0 overflow-x-auto py-3 hide-scrollbar">
                {trustItems.map((item, i) => (
                  <span key={item} className="flex flex-shrink-0 items-center">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-white/70 whitespace-nowrap">
                      {item}
                    </span>
                    {i < trustItems.length - 1 && (
                      <span className="mx-4 text-xs text-[#F96302]" aria-hidden="true">|</span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-1 flex-col px-6 py-5">
              <div className="rounded-lg border border-white/15 bg-white/[0.04] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F96302]">
                    <CalendarClock className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-display text-2xl font-black uppercase leading-none">
                      Book in 60 seconds
                    </p>
                    <p className="mt-1 text-sm leading-snug text-white/65">
                      Enter ZIP, pick the issue, and get a callback to lock the window.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {["ZIP", "Issue", "Callback"].map((label, index) => (
                    <div key={label} className="rounded-lg bg-black/35 px-2 py-3">
                      <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#F96302] text-sm font-black">
                        {index + 1}
                      </span>
                      <span className="mt-2 block text-[11px] font-black uppercase tracking-[0.08em] text-white/75">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/book/"
                  onClick={closeMobileMenu}
                  className="mt-4 flex min-h-14 items-center justify-center gap-2 rounded-lg bg-[#F96302] px-5 text-base font-black uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#d95400]"
                >
                  Schedule online
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </Link>
              </div>

              <nav className="mt-5 flex flex-col" aria-label="Mobile navigation">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="flex min-h-14 items-center justify-between border-b border-white/10 py-3 text-2xl font-black uppercase tracking-wide text-white transition-colors duration-150 hover:text-[#F96302]"
                  >
                    {link.label}
                    <ChevronRight className="h-5 w-5 text-white/35" aria-hidden="true" />
                  </Link>
                ))}
              </nav>

              <div className="mt-5">
                <p className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-white/45">
                  <Wrench className="h-4 w-4 text-[#F96302]" aria-hidden="true" />
                  Fast paths
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {featuredLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMobileMenu}
                      className="flex min-h-12 items-center rounded-lg border border-white/10 px-3 text-sm font-bold text-white/75 transition-colors hover:border-[#F96302] hover:text-white"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 pb-4">
                <a
                  href={`tel:${siteSettings.phoneTel}`}
                  className="flex min-h-14 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white text-base font-black text-black"
                >
                  <Phone className="h-5 w-5" aria-hidden="true" />
                  {siteSettings.phone}
                </a>
                <p className="flex items-start gap-2 text-sm leading-relaxed text-white/45">
                  <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#F96302]" aria-hidden="true" />
                  CSLB #896116. C-36 Plumbing and A General Engineering. Serving the East Bay since 2003.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
