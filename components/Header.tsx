"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { siteSettings } from "@/content/site-settings";

const navLinks = [
  { label: "Services", href: "/services/" },
  { label: "About", href: "/about/" },
  { label: "Service Area", href: "/service-areas/" },
  { label: "Reviews", href: "/reviews/" },
  { label: "Contact", href: "/contact/" },
];

const trustItems = [
  "Two Licenses, One Crew",
  `${siteSettings.cslb}`,
  "C-36 + A General Engineering",
  "Since 2003",
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header data-marketing="true" className="sticky top-0 z-50 bg-black">
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
            className="md:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
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

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-black border-t border-white/10">
          <nav className="mx-auto max-w-[1800px] px-6 py-4 flex flex-col gap-1" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="py-3 text-base font-medium text-white/80 hover:text-white border-b border-white/10 last:border-0 transition-colors duration-150 uppercase tracking-wide"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={`tel:${siteSettings.phoneTel}`}
              className="mt-4 flex items-center justify-center gap-2 bg-[#F96302] text-white py-4 text-base font-semibold"
            >
              <Phone className="h-5 w-5" aria-hidden="true" />
              {siteSettings.phone}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
