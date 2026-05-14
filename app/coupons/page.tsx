import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Tag, Scissors } from "lucide-react";
import { Section, SectionHeading } from "@/components/Section";
import { Button } from "@/components/Button";
import { TrustStrip } from "@/components/TrustStrip";
import { isSupabaseConfigured } from "@/lib/supabase";
import { listCoupons, MAX_PUBLISHED_COUPONS, formatDate, type Coupon } from "@/lib/db";
import { siteSettings } from "@/content/site-settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Plumbing Coupons & Specials | Z and Z Plumbing",
  description:
    "Current coupons and special deals from Z and Z Plumbing. Save on sewer lateral, drain cleaning, water heater, and other East Bay plumbing service. Call (510) 708-4237.",
  alternates: { canonical: `${siteSettings.siteUrl}/coupons/` },
  openGraph: {
    title: "Plumbing Coupons & Specials | Z and Z Plumbing",
    description:
      "Save on East Bay plumbing service. Current Z and Z Plumbing specials, valid for a limited time.",
    url: `${siteSettings.siteUrl}/coupons/`,
    type: "website",
  },
};

async function loadCoupons(): Promise<Coupon[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const all = await listCoupons({ publishedOnly: true });
    return all.slice(0, MAX_PUBLISHED_COUPONS);
  } catch {
    return [];
  }
}

export default async function CouponsPage() {
  const coupons = await loadCoupons();

  return (
    <>
      {/* Hero */}
      <Section bg="black" size="lg">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 text-xs font-bold uppercase tracking-[0.12em] text-white/50"
        >
          <Link href="/" className="hover:text-[#F96302]">
            Home
          </Link>
          <span className="mx-2 text-white/30">/</span>
          <span className="text-white">Coupons</span>
        </nav>
        <p className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#F96302] mb-4">
          Special deals
        </p>
        <h1 className="max-w-4xl font-display text-5xl md:text-7xl font-black uppercase leading-none tracking-tight text-white">
          Current Coupons.
        </h1>
        <p className="mt-6 max-w-2xl font-sans text-2xl leading-relaxed text-white/80 md:text-3xl">
          Three live deals. Mention them when you book and we will apply the discount on your invoice.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            variant="primary"
            size="lg"
            href={`tel:${siteSettings.phoneTel}`}
            icon={<Phone className="h-5 w-5" />}
            external
          >
            Call {siteSettings.phone}
          </Button>
          <Button variant="inverse" size="lg" href="/book/">
            Schedule Service
          </Button>
        </div>
      </Section>

      {/* Coupons grid */}
      <Section bg="light-gray" size="lg">
        {coupons.length === 0 ? (
          <div className="border border-dashed border-[#E5E5E5] bg-white px-8 py-16 text-center">
            <Tag className="mx-auto h-10 w-10 text-[#F96302]" strokeWidth={1.5} aria-hidden="true" />
            <p className="mt-4 font-display text-2xl font-black uppercase leading-tight tracking-tight text-black md:text-3xl">
              No active coupons right now.
            </p>
            <p className="mt-3 max-w-xl mx-auto text-xl leading-relaxed text-[#333333] md:text-lg">
              Call us anyway. We quote every job before paid work starts and we are always honest
              about pricing.
            </p>
            <div className="mt-6 flex justify-center">
              <Button
                variant="primary"
                size="lg"
                href={`tel:${siteSettings.phoneTel}`}
                icon={<Phone className="h-5 w-5" />}
                external
              >
                Call {siteSettings.phone}
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 gap-6 ${
              coupons.length === 1 ? "max-w-2xl mx-auto" : coupons.length === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {coupons.map((c) => (
              <CouponCard key={c.id} coupon={c} />
            ))}
          </div>
        )}
      </Section>

      {/* Trust strip */}
      <Section bg="white" size="md">
        <SectionHeading eyebrow="Credentials" title="Licensed for the Whole Job." />
        <TrustStrip />
      </Section>

      {/* CTA */}
      <Section bg="hero-orange" size="md">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-4xl font-black uppercase leading-tight text-white md:text-5xl">
              Ready to book?
            </h2>
            <p className="mt-3 max-w-2xl font-sans text-lg text-white/90 md:text-xl">
              Mention the coupon when you call. We will apply it on your invoice.
            </p>
          </div>
          <Button
            variant="inverse"
            size="lg"
            href={`tel:${siteSettings.phoneTel}`}
            icon={<Phone className="h-5 w-5" />}
            external
          >
            {siteSettings.phone}
          </Button>
        </div>
      </Section>
    </>
  );
}

function CouponCard({ coupon }: { coupon: Coupon }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden border-2 border-[#F96302] bg-white shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl">
      {/* Top scissors notch */}
      <div className="flex items-center justify-between border-b-2 border-dashed border-[#E5E5E5] bg-[#F96302] px-6 py-3">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white">
          <Tag className="h-4 w-4" aria-hidden="true" />
          Z and Z Coupon
        </span>
        <Scissors className="h-5 w-5 text-white/80" aria-hidden="true" />
      </div>

      {coupon.image_url && (
        <div className="relative aspect-[16/9] bg-[#F5F5F5]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coupon.image_url}
            alt=""
            className="h-full w-full object-cover"
            aria-hidden="true"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-7 md:p-8">
        <h2 className="font-display text-3xl font-black uppercase leading-tight tracking-tight text-black md:text-4xl">
          {coupon.headline}
        </h2>
        {coupon.subheadline && (
          <p className="mt-3 text-xl leading-relaxed text-[#333333] md:text-xl">
            {coupon.subheadline}
          </p>
        )}

        {coupon.code && (
          <div className="mt-6 inline-flex items-center gap-3 border-2 border-dashed border-[#F96302] bg-[#F5F5F5] px-5 py-3">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#666666]">
              Code
            </span>
            <span className="font-mono text-2xl font-black uppercase tracking-wider text-[#F96302]">
              {coupon.code}
            </span>
          </div>
        )}

        {(coupon.valid_from || coupon.valid_until) && (
          <p className="mt-4 text-sm text-[#666666]">
            Valid{" "}
            {coupon.valid_from ? `from ${formatDate(coupon.valid_from)}` : "now"}
            {coupon.valid_until ? ` through ${formatDate(coupon.valid_until)}` : ""}
          </p>
        )}

        {coupon.terms && (
          <p className="mt-4 border-t border-[#E5E5E5] pt-4 text-sm leading-relaxed text-[#666666]">
            {coupon.terms}
          </p>
        )}

        <div className="mt-auto pt-6">
          <Button
            variant="primary"
            size="lg"
            href={`tel:${siteSettings.phoneTel}`}
            icon={<Phone className="h-5 w-5" />}
            external
            className="w-full"
          >
            Book This Deal
          </Button>
        </div>
      </div>
    </article>
  );
}
