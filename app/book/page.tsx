import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/Container";
import { siteSettings } from "@/content/site-settings";
import BookBookingFormClient from "./BookBookingFormClient";

export const metadata: Metadata = {
  title: "Book a Plumber | Z and Z Plumbing | East Bay",
  description:
    "Book a licensed East Bay plumber in 60 seconds. Enter your ZIP, pick your issue, and we'll call you back within 15 minutes during business hours.",
  alternates: { canonical: "https://zandzplumbing.com/book/" },
  openGraph: {
    title: "Book a Plumber | Z and Z Plumbing",
    description:
      "Same-day East Bay plumbing service. Two licenses, one crew. Call (510) 708-4237 or book online.",
    url: "https://zandzplumbing.com/book/",
    type: "website",
  },
};

const trustPoints = [
  { value: "23", label: "Years in business" },
  { value: "5.0", label: "Avg review rating" },
  { value: "30-60", label: "Min response time" },
  { value: "24/7", label: "Emergency coverage" },
];

export default function BookPage() {
  return (
    <>
      <section className="bg-[#F5F5F5] pt-12 pb-16 md:pt-20 md:pb-24">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-start">
            <div>
              <p className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#F96302] mb-3">
                Book online · East Bay
              </p>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-black uppercase leading-[0.95] tracking-tight text-black">
                Get a Licensed Plumber Out Today.
              </h1>
              <p className="mt-5 max-w-xl font-sans text-lg text-[#333] leading-relaxed">
                Three quick questions, no account needed. We&apos;ll call you back within 15
                minutes during business hours to confirm and get the crew rolling.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 lg:max-w-xl">
                {trustPoints.map((t) => (
                  <div key={t.label} className="border-l-2 border-[#F96302] pl-3">
                    <p className="font-display text-3xl font-black uppercase leading-none text-black">
                      {t.value}
                    </p>
                    <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#666]">
                      {t.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 hidden rounded-xl bg-white p-5 border border-[#E5E5E5] lg:block">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#666]">
                  Two licenses · one crew
                </p>
                <p className="mt-1 font-display text-2xl font-black uppercase leading-tight text-black">
                  C-36 Plumbing + A General Engineering
                </p>
                <p className="mt-2 text-sm text-[#333]">
                  We&apos;re licensed for the whole job — from house plumbing to street-side
                  sewer lateral work. {siteSettings.cslb}.
                </p>
              </div>
            </div>

            <div className="lg:sticky lg:top-24">
              <Suspense fallback={<FormSkeleton />}>
                <BookBookingFormClient />
              </Suspense>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

function FormSkeleton() {
  return (
    <div className="w-full max-w-2xl">
      <div className="h-2 rounded bg-[#E5E5E5]" />
      <div className="mt-6 rounded-2xl border border-[#E5E5E5] bg-white p-8 shadow-2xl">
        <div className="h-8 w-3/4 rounded bg-[#F5F5F5]" />
        <div className="mt-3 h-4 w-1/2 rounded bg-[#F5F5F5]" />
        <div className="mt-6 h-14 rounded-xl bg-[#F5F5F5]" />
        <div className="mt-3 h-12 rounded-xl bg-[#F5F5F5]" />
      </div>
    </div>
  );
}
