import { Phone } from "lucide-react";
import { siteSettings } from "@/content/site-settings";

export function StickyMobileCTA() {
  return (
    <div
      data-marketing="true"
      className="fixed bottom-0 inset-x-0 z-50 md:hidden grid grid-cols-2 border-t border-[#E5E5E5]"
      style={{ height: "64px" }}
    >
      <a
        href={`tel:${siteSettings.phoneTel}`}
        className="bg-[#F5F5F5] flex items-center justify-center gap-2 font-semibold text-black text-sm"
        aria-label={`Call Z and Z Plumbing at ${siteSettings.phone}`}
      >
        <Phone className="h-5 w-5" aria-hidden="true" />
        {siteSettings.phone}
      </a>
      <a
        href="/contact/#schedule"
        className="bg-black text-white flex items-center justify-center font-semibold text-sm"
      >
        Schedule
      </a>
    </div>
  );
}
