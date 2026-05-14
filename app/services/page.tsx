import type { Metadata } from "next";
import { Phone, ChevronRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/Section";
import { Button } from "@/components/Button";
import { ServiceCard } from "@/components/ServiceCard";
import { TrustStrip } from "@/components/TrustStrip";
import { siteSettings } from "@/content/site-settings";
import { services } from "@/content/services";

export const metadata: Metadata = {
  title: "Plumbing Services in the East Bay | Z and Z Plumbing",
  description:
    "Full residential and commercial plumbing services across Oakland, San Leandro, Berkeley, and the East Bay. Sewer lateral, drain cleaning, water heater, repipe, hydrojetting, leak detection, gas line, emergency, and more. Two licenses. One crew.",
  alternates: { canonical: `${siteSettings.siteUrl}/services/` },
  openGraph: {
    title: "Plumbing Services | Z and Z Plumbing",
    description:
      "Sewer lateral, drain cleaning, water heater, repipe, hydrojetting, leak detection, gas line, and 24/7 emergency. Two licenses. One crew.",
    url: `${siteSettings.siteUrl}/services/`,
    type: "website",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: `${siteSettings.siteUrl}/`,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Services",
      item: `${siteSettings.siteUrl}/services/`,
    },
  ],
};

export default function ServicesHubPage() {
  const featured = services.filter((s) => s.featured);
  const standard = services.filter((s) => !s.featured);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero */}
      <Section bg="black" size="lg">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs font-bold uppercase tracking-[0.12em] text-white/50">
          <a href="/" className="hover:text-[#F96302]">Home</a>
          <span className="mx-2 text-white/30">/</span>
          <span className="text-white">Services</span>
        </nav>
        <p className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#F96302] mb-4">
          Full East Bay Plumbing Services
        </p>
        <h1 className="max-w-4xl font-display text-5xl md:text-7xl font-black uppercase leading-none tracking-tight text-white">
          We Handle the Whole Job.
        </h1>
        <p className="mt-6 max-w-2xl font-sans text-2xl leading-relaxed text-white/80 md:text-3xl">
          From house lines to street-side work, Z and Z holds the licenses to take the job from diagnosis to completion.
          Twelve service categories. One crew. Same-day response across the East Bay corridor.
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
          <Button variant="inverse" size="lg" href="/contact/">
            Schedule Online
          </Button>
        </div>
      </Section>

      {/* Featured services */}
      <Section bg="white" size="lg">
        <SectionHeading
          eyebrow="Most Requested"
          title="Where Z and Z Earns Its Reputation."
          description="Three service categories where the General Engineering license, the crew depth, and the East Bay knowledge come together. These are the calls other plumbers send our way."
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {featured.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </Section>

      {/* All services */}
      <Section bg="light-gray" size="lg">
        <SectionHeading
          eyebrow="Full Service Menu"
          title="Twelve Services. One Number."
          description="From a dripping faucet to a full repipe, Z and Z runs the call from start to finish."
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {standard.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
        <div className="mt-10 flex flex-col items-start gap-4 rounded-2xl border border-[#E5E5E5] bg-white p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <p className="font-display text-2xl font-black uppercase tracking-tight text-black md:text-3xl">
              Don&apos;t See Your Job?
            </p>
            <p className="mt-2 font-sans text-base text-[#333333]">
              Most plumbing work falls in one of these categories. Call us with the details. If it&apos;s a job we run, we
              will quote it.
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            href={`tel:${siteSettings.phoneTel}`}
            icon={<Phone className="h-5 w-5" />}
            external
            className="flex-shrink-0"
          >
            Talk to a Plumber
          </Button>
        </div>
      </Section>

      {/* Trust strip */}
      <Section bg="white" size="md">
        <SectionHeading
          eyebrow="Credentials"
          title="Licensed. Insured. Local."
        />
        <TrustStrip />
      </Section>

      {/* CTA band */}
      <Section bg="hero-orange" size="md">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-4xl font-black uppercase leading-tight text-white md:text-5xl">
              Same-Day East Bay Service.
            </h2>
            <p className="mt-2 font-sans text-base text-white/85">
              Call us or book online. 24/7 emergency response across the East Bay.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="inverse"
              size="lg"
              href={`tel:${siteSettings.phoneTel}`}
              icon={<Phone className="h-5 w-5" />}
              external
            >
              {siteSettings.phone}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              href="/service-areas/"
              icon={<ChevronRight className="h-5 w-5" />}
              iconPosition="right"
            >
              See Service Areas
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
