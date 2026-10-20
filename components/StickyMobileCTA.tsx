"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone } from "lucide-react";
import { siteSettings } from "@/content/site-settings";

/**
 * Phone-width Call | Schedule bar, visible from first paint so a tap-to-call
 * action is on the first screen of every public page.
 *
 * - Hidden on /admin and /field (internal tools).
 * - On /book/ only the Call half shows: the page itself is the schedule flow.
 * - Renders a spacer in normal flow (after the footer in the root layout) so
 *   the fixed bar never covers the end of the footer or a form's last button.
 */
export function StickyMobileCTA() {
  const pathname = usePathname() ?? "";

  if (pathname.startsWith("/admin") || pathname.startsWith("/field")) return null;

  const onBookPage = pathname.startsWith("/book");

  return (
    <>
      {/* Keeps focused fields, validation jumps, and anchor targets clear of the bar. */}
      <style href="sticky-mobile-cta" precedence="default">
        {`@media (max-width: 767px) { html { scroll-padding-bottom: calc(64px + env(safe-area-inset-bottom)); } }`}
      </style>
      <div
        data-marketing="true"
        aria-hidden="true"
        className="h-[calc(64px+env(safe-area-inset-bottom))] bg-black md:hidden"
      />
      <div
        data-marketing="true"
        className={[
          "fixed inset-x-0 bottom-0 z-50 grid border-t border-[#E5E5E5] bg-black pb-[env(safe-area-inset-bottom)] md:hidden",
          onBookPage ? "grid-cols-1" : "grid-cols-2",
        ].join(" ")}
      >
        <a
          href={`tel:${siteSettings.phoneTel}`}
          className="flex h-16 items-center justify-center gap-2 bg-[#F96302] text-sm font-bold text-white"
          aria-label={`Call Z and Z Plumbing at ${siteSettings.phone}`}
        >
          <Phone className="h-5 w-5" aria-hidden="true" />
          {onBookPage ? `Call ${siteSettings.phone}` : siteSettings.phone}
        </a>
        {!onBookPage && (
          <Link
            href="/book/"
            className="flex h-16 items-center justify-center bg-black text-sm font-semibold text-white"
          >
            Schedule
          </Link>
        )}
      </div>
    </>
  );
}
