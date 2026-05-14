"use client";

/**
 * HeroZipForm — single ZIP field for the home-page hero.
 *
 * On submit it pushes the visitor to /book/?zip=XXXXX, which preloads the
 * BookingForm at step 2 (issue selection).
 */

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { MapPin, ChevronRight } from "lucide-react";

export default function HeroZipForm({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) {
  const router = useRouter();
  const [zip, setZip] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const dark = variant === "dark";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\d{5}$/.test(zip)) return;
    setSubmitting(true);
    router.push(`/book/?zip=${zip}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={[
        "flex w-full flex-col gap-2 sm:flex-row sm:items-stretch",
        "max-w-md",
      ].join(" ")}
      aria-label="Check coverage by ZIP code"
    >
      <div className="relative flex-1">
        <MapPin
          className={[
            "pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2",
            dark ? "text-white/40" : "text-[#999]",
          ].join(" ")}
          strokeWidth={1.5}
        />
        <input
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          enterKeyHint="go"
          pattern="\d{5}"
          maxLength={5}
          placeholder="Enter ZIP code"
          value={zip}
          onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
          aria-label="ZIP code"
          className={[
            "h-14 w-full rounded-xl py-3 pl-11 pr-4 text-base font-semibold tracking-wide focus:outline-none md:h-auto md:py-3.5",
            dark
              ? "border-2 border-white/15 bg-white/10 text-white placeholder:text-white/50 backdrop-blur focus:border-[#F96302]"
              : "border-2 border-black/15 bg-white text-black placeholder:text-[#999] focus:border-[#F96302]",
          ].join(" ")}
        />
      </div>
      <button
        type="submit"
        disabled={zip.length !== 5 || submitting}
        className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#F96302] px-6 py-3 text-base font-black uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#d95400] disabled:cursor-not-allowed disabled:bg-[#cccccc] md:min-h-0 md:py-3.5 md:text-sm"
      >
        Get Help
        <ChevronRight className="h-4 w-4" />
      </button>
    </form>
  );
}
