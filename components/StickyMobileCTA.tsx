"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone } from "lucide-react";
import { siteSettings } from "@/content/site-settings";

export function StickyMobileCTA() {
  const pathname = usePathname();
  if (pathname?.startsWith("/book")) return null;

  return (
    <div
      data-marketing="true"
      className="fixed bottom-0 inset-x-0 z-50 md:hidden grid grid-cols-2 border-t border-[#E5E5E5]"
      style={{ height: "64px" }}
    >
      <a
        href={`tel:${siteSettings.phoneTel}`}
        className="flex items-center justify-center gap-2 bg-[#F96302] font-bold text-white text-sm"
        aria-label={`Call Z and Z Plumbing at ${siteSettings.phone}`}
      >
        <Phone className="h-5 w-5" aria-hidden="true" />
        {siteSettings.phone}
      </a>
      <Link
        href="/book/"
        className="bg-black text-white flex items-center justify-center font-semibold text-sm"
      >
        Schedule
      </Link>
    </div>
  );
}
