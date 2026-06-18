"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Site-wide conversion event tracking via event delegation.
 * Mounted once in the root layout so it covers every tel: and /book/ link
 * (header, sticky CTA, page CTAs, footer) without editing each component.
 *
 * - click_to_call : any <a href="tel:..."> tap
 * - schedule_click: any link to the /book/ page
 *
 * generate_lead is fired separately from the form success handlers
 * (QuickLeadForm, BookingForm) so it only counts real submissions.
 */
export function AnalyticsEvents() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = e.target as HTMLElement | null;
      const anchor = el?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href") || "";

      if (href.startsWith("tel:")) {
        trackEvent("click_to_call", {
          phone: href.replace("tel:", ""),
          link_url: window.location.pathname,
        });
      } else if (href.includes("/book")) {
        trackEvent("schedule_click", {
          link_url: window.location.pathname,
        });
      }
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
