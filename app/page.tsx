import type { Metadata } from "next";
import Link from "next/link";
import {
  Phone,
  Shield,
  Award,
  Wrench,
  MapPin,
  Star,
  ChevronRight,
} from "lucide-react";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { ServiceCard } from "@/components/ServiceCard";
import { siteSettings } from "@/content/site-settings";
import { featuredServices, services } from "@/content/services";
import { testimonials } from "@/content/testimonials";
import { serviceAreas } from "@/content/service-areas";

export const metadata: Metadata = {
  title: "Z and Z Plumbing | East Bay Plumber | San Leandro, CA",
  description:
    "Licensed East Bay plumber headquartered in San Leandro. C-36 + A General Engineering. Same-day plumbing service. Call (510) 708-4237.",
  alternates: { canonical: "https://zandzplumbing.com/" },
  openGraph: {
    title: "Z and Z Plumbing | East Bay Plumber",
    description:
      "Two licenses. One crew. Same-day service across Oakland, Berkeley, Alameda, and the East Bay.",
    url: "https://zandzplumbing.com/",
    type: "website",
  },
};

const heroBadges = [
  { icon: Shield, label: "Licensed for the Whole Job" },
  { icon: Award, label: "Two Licenses, One Crew" },
  { icon: Wrench, label: "Serious Plumbing, Serious Crew" },
  { icon: MapPin, label: "Local. Reliable. On Time." },
];

const reviewPlatforms = [
  {
    name: "Google",
    rating: "4.6",
    count: "19 reviews",
    color: "#4285F4",
    quote:
      "Z and Z showed up same day and fixed a sewer issue first try. Professional, clean, and the job was done right.",
    reviewer: "Jason R.",
  },
  {
    name: "Yelp",
    rating: "4.5",
    count: "238 reviews",
    color: "#D32323",
    quote:
      "These guys know what they're doing. Licensed for the whole job. Professional, and the work was done right the first time.",
    reviewer: "Melissa T.",
  },
  {
    name: "Buildzoom",
    rating: "5.0",
    count: "Verified contractor",
    color: "#F96302",
    quote:
      "We use Z and Z for all our commercial property work. They handle the tough jobs other plumbers won't touch.",
    reviewer: "Project Manager",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ========== HERO ========== */}
      <section className="bg-[#F5F5F5]">
        <Container className="pt-12 pb-16 md:pt-16 md:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: copy + CTAs */}
            <div>
              <p className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#F96302] mb-4">
                Same-Day East Bay Plumbing.
              </p>
              <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-none tracking-tight text-black mb-6">
                The Pros Other Plumbers Call.
              </h1>
              <p className="font-sans text-lg text-[#333333] leading-relaxed mb-8 max-w-lg">
                Licensed for the whole job. From house lines to street-side work, we handle it all on time and built to last.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Button
                  variant="primary"
                  size="xl"
                  href={`tel:${siteSettings.phoneTel}`}
                  icon={<Phone className="h-5 w-5" />}
                  iconPosition="left"
                  external
                >
                  Call {siteSettings.phone}
                </Button>
                <Button variant="ghost" size="xl" href="/contact/">
                  Schedule Online
                </Button>
              </div>
              {/* Icon badges */}
              <div className="grid grid-cols-2 gap-4">
                {heroBadges.map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <div key={badge.label} className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-[#F96302] flex-shrink-0" strokeWidth={1.5} aria-hidden="true" />
                      <span className="text-xs font-semibold text-[#333333] uppercase tracking-wide">
                        {badge.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: van image placeholder + credential card */}
            <div className="relative">
              {/* Van image placeholder — replace with <Image> once photo is available */}
              <div className="w-full aspect-[4/3] bg-[#E5E5E5] rounded-2xl flex items-center justify-center">
                <span className="text-[#999] font-sans text-sm">Van photo — add to public/images/</span>
              </div>
              {/* Credential overlay */}
              <div className="absolute bottom-4 right-4 bg-black text-white p-5 rounded-none shadow-xl max-w-[180px]">
                <p className="text-xs font-bold text-[#F96302] uppercase tracking-widest mb-3">
                  {siteSettings.cslb}
                </p>
                <p className="text-xs text-white/70 mb-1">C-36 Plumbing</p>
                <p className="text-xs text-white/70 mb-1">A General Engineering</p>
                <p className="text-xs text-white/70">Since {siteSettings.foundedYear}</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ========== SERVICES (black section) ========== */}
      <section className="bg-black py-20 md:py-32">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#F96302] mb-3">
                Built for More than Houses.
              </p>
              <h2 className="font-display text-5xl md:text-6xl font-black uppercase leading-tight text-white">
                We Handle the Jobs Others Can&apos;t.
              </h2>
            </div>
            <Link
              href="/services/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-[#F96302] transition-colors duration-150 uppercase tracking-wide flex-shrink-0"
            >
              View All Services
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredServices.map((service) => (
              <ServiceCard key={service.slug} service={service} dark />
            ))}
          </div>
        </Container>
      </section>

      {/* ========== SERVICE AREAS ========== */}
      <section className="bg-[#F5F5F5] py-20 md:py-28">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#F96302] mb-3">
                East Bay Coverage.
              </p>
              <h2 className="font-display text-5xl md:text-6xl font-black uppercase leading-tight text-black">
                We Serve 10 East Bay Cities.
              </h2>
            </div>
            <Link
              href="/service-areas/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-black/60 hover:text-[#F96302] transition-colors duration-150 uppercase tracking-wide flex-shrink-0"
            >
              See All Areas
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {serviceAreas.map((area) => (
              <Link
                key={area.slug}
                href={`/${area.slug}/`}
                className="group bg-white rounded-2xl border border-[#E5E5E5] p-4 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-[#F96302]"
              >
                <p className="font-sans text-sm font-semibold text-black group-hover:text-[#F96302] transition-colors">
                  {area.city}
                </p>
                {area.isHQ && (
                  <p className="text-xs text-[#F96302] font-medium mt-1">HQ</p>
                )}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ========== REVIEWS (dark section) ========== */}
      <section className="bg-[#111111] py-20 md:py-32">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left: heading + aggregate */}
            <div className="lg:col-span-1">
              <p className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#F96302] mb-4">
                Trusted by Contractors.
              </p>
              <h2 className="font-display text-5xl md:text-6xl font-black uppercase leading-tight text-white mb-6">
                Proven by Results.
              </h2>
              <div className="flex items-center gap-3 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-[#F96302]" fill="#F96302" aria-hidden="true" />
                ))}
              </div>
              <p className="text-sm font-semibold text-white/60 uppercase tracking-wide">
                5.0 average rating from 100+ reviews
              </p>
            </div>

            {/* Right: platform review cards */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              {reviewPlatforms.map((platform) => (
                <div
                  key={platform.name}
                  className="bg-white/5 rounded-2xl border border-white/10 p-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-sans font-bold text-white text-sm">
                      {platform.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-[#F96302]" fill="#F96302" aria-hidden="true" />
                      <span className="text-sm font-bold text-white">{platform.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-white/50 mb-4">{platform.count}</p>
                  <blockquote className="text-sm text-white/70 leading-relaxed mb-4 italic">
                    &ldquo;{platform.quote}&rdquo;
                  </blockquote>
                  <p className="text-xs font-semibold text-white/50">&mdash; {platform.reviewer}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ========== FINAL CTA BAND ========== */}
      <section className="bg-[#F96302] py-16 md:py-20">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="font-display text-5xl md:text-6xl font-black uppercase leading-tight text-white">
                Need Help Now?
              </h2>
              <p className="font-sans text-base text-white/80 mt-2">
                Call us or schedule online. We respond within 30 minutes during business hours.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
              <Button
                variant="inverse"
                size="lg"
                href={`tel:${siteSettings.phoneTel}`}
                icon={<Phone className="h-5 w-5" />}
                iconPosition="left"
                external
              >
                {siteSettings.phone}
              </Button>
              <Button variant="secondary" size="lg" href="/contact/">
                Schedule Online
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Bottom padding for mobile sticky CTA */}
      <div className="h-16 md:hidden" aria-hidden="true" />
    </>
  );
}
