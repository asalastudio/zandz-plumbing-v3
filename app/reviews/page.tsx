import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Star, ExternalLink } from "lucide-react";
import { Section, SectionHeading } from "@/components/Section";
import { Button } from "@/components/Button";
import { TestimonialCard } from "@/components/TestimonialCard";
import { TestimonialCarousel } from "@/components/TestimonialCarousel";
import { TrustStrip } from "@/components/TrustStrip";
import { siteSettings } from "@/content/site-settings";
import { testimonials } from "@/content/testimonials";

export const metadata: Metadata = {
  title: "Z and Z Plumbing Reviews | 4.6 Stars, 257+ Reviews | East Bay",
  description:
    "Read what East Bay homeowners and contractors say about Z and Z Plumbing. 4.6 stars on Google, 4.5 stars on Yelp, with 257+ verified reviews across Oakland, San Leandro, Berkeley, and the rest of the East Bay.",
  alternates: { canonical: `${siteSettings.siteUrl}/reviews/` },
  openGraph: {
    title: "Reviews | Z and Z Plumbing",
    description:
      "4.6 stars on Google. 4.5 stars on Yelp. 257+ East Bay customers reviewing Z and Z Plumbing.",
    url: `${siteSettings.siteUrl}/reviews/`,
    type: "website",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${siteSettings.siteUrl}/` },
    { "@type": "ListItem", position: 2, name: "Reviews", item: `${siteSettings.siteUrl}/reviews/` },
  ],
};

const platforms = [
  {
    name: "Google",
    rating: "4.6",
    count: "19",
    href: siteSettings.social.google ?? "#",
    summary: "Verified Google Business reviews from East Bay customers since 2020.",
  },
  {
    name: "Yelp",
    rating: "4.5",
    count: "238",
    href: siteSettings.social.yelp ?? "#",
    summary: "Yelp reviews across two decades of East Bay plumbing work.",
  },
  {
    name: "Buildzoom",
    rating: "5.0",
    count: "Verified",
    href: "https://www.buildzoom.com/contractor/z-and-z-plumbing",
    summary: "Licensed contractor profile with verified CSLB credentials.",
  },
];

export default function ReviewsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero */}
      <Section bg="near-black" size="lg">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs font-bold uppercase tracking-[0.12em] text-white/50">
          <Link href="/" className="hover:text-[#F96302]">Home</Link>
          <span className="mx-2 text-white/30">/</span>
          <span className="text-white">Reviews</span>
        </nav>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#F96302] mb-4">
              What East Bay Customers Say
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-black uppercase leading-none tracking-tight text-white">
              4.6 Stars. 257+ Reviews.
            </h1>
            <p className="mt-6 max-w-2xl font-sans text-xl leading-relaxed text-white/80 md:text-2xl">
              Z and Z Plumbing earns its reviews on the job site. Two licenses, one crew, same-day East Bay response.
              Here is what customers across Oakland, San Leandro, Berkeley, and the East Bay had to say.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-2 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-[#F96302]" fill="#F96302" aria-hidden="true" />
                ))}
              </div>
              <p className="font-display text-5xl font-black uppercase leading-none tracking-tight text-white">
                4.6 / 5.0
              </p>
              <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-white/60">
                Aggregate rating across Google + Yelp + Buildzoom
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Platform breakdown */}
      <Section bg="white" size="lg">
        <SectionHeading
          eyebrow="By Platform"
          title="Where the Reviews Live."
          description="We send happy customers to Google and Yelp. Both platforms have years of public history."
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {platforms.map((p) => (
            <article
              key={p.name}
              className="flex flex-col rounded-2xl border border-[#E5E5E5] bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#F96302] md:p-7"
            >
              <header className="mb-4 flex items-center justify-between">
                <p className="font-display text-2xl font-black uppercase tracking-tight text-black md:text-3xl">
                  {p.name}
                </p>
                <div className="flex items-center gap-1.5">
                  <Star className="h-5 w-5 text-[#F96302]" fill="#F96302" aria-hidden="true" />
                  <span className="font-display text-2xl font-black leading-none tracking-tight text-black">
                    {p.rating}
                  </span>
                </div>
              </header>
              <p className="text-base leading-relaxed text-[#333333]">{p.summary}</p>
              <footer className="mt-6 border-t border-[#E5E5E5] pt-4 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#666666]">
                  {p.count === "Verified" ? "Verified contractor" : `${p.count} reviews`}
                </span>
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#F96302] hover:underline"
                >
                  Open {p.name}
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </footer>
            </article>
          ))}
        </div>
      </Section>

      {/* Carousel */}
      <Section bg="light-gray" size="lg">
        <SectionHeading
          eyebrow="Featured Reviews"
          title="In Their Own Words."
          description="A rotating selection of recent East Bay reviews. Swipe through or click the dots."
        />
        <div className="mx-auto max-w-2xl">
          <TestimonialCarousel testimonials={testimonials} />
        </div>
      </Section>

      {/* Full grid */}
      <Section bg="white" size="lg">
        <SectionHeading
          eyebrow="All Reviews"
          title="Every Testimonial."
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </div>
      </Section>

      {/* Trust strip */}
      <Section bg="light-gray" size="md">
        <SectionHeading eyebrow="Credentials" title="Backed by License and Track Record." />
        <TrustStrip />
      </Section>

      {/* CTA band */}
      <Section bg="hero-orange" size="md">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-4xl font-black uppercase leading-tight text-white md:text-5xl">
              Worked With Z and Z?
            </h2>
            <p className="mt-2 max-w-xl font-sans text-base text-white/85">
              Leave us a review on Google or Yelp. It helps East Bay neighbors find a licensed plumber they can call.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {siteSettings.social.google && (
              <Button variant="inverse" size="lg" href={siteSettings.social.google} external>
                Review on Google
              </Button>
            )}
            {siteSettings.social.yelp && (
              <Button variant="secondary" size="lg" href={siteSettings.social.yelp} external>
                Review on Yelp
              </Button>
            )}
            <Button
              variant="ghost"
              size="lg"
              href={`tel:${siteSettings.phoneTel}`}
              icon={<Phone className="h-5 w-5" />}
              external
              className="border-white text-white hover:bg-white hover:text-[#F96302]"
            >
              {siteSettings.phone}
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
