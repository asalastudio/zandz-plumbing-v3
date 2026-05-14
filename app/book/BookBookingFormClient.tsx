"use client";

import { useSearchParams } from "next/navigation";
import BookingForm from "@/components/BookingForm";

/**
 * Reads ?zip= and ?service= query params and forwards them to BookingForm.
 * Kept in a separate client component so the parent page can stay a server
 * component with full metadata + SSR.
 */
export default function BookBookingFormClient() {
  const params = useSearchParams();
  const zip = (params.get("zip") ?? "").replace(/\D/g, "").slice(0, 5);
  const service = params.get("service") ?? "";
  return (
    <BookingForm
      initialZip={zip}
      initialService={service}
      sourcePage="/book"
    />
  );
}
