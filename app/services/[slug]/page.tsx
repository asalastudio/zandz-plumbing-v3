import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Phone, ChevronRight, ChevronLeft, MapPin } from "lucide-react";
import { Section, SectionHeading } from "@/components/Section";
import { Button } from "@/components/Button";
import { ServiceCard } from "@/components/ServiceCard";
import { TrustStrip } from "@/components/TrustStrip";
import { FaqAccordion } from "@/components/FaqAccordion";
import type { FaqItem } from "@/components/FaqAccordion";
import { QuickLeadForm } from "@/components/QuickLeadForm";
import { siteSettings } from "@/content/site-settings";
import { services } from "@/content/services";
import { serviceAreas } from "@/content/service-areas";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) return {};

  const title = `${service.title} in the East Bay | Z and Z Plumbing`;
  const description = `${service.summary} Z and Z Plumbing handles ${service.title.toLowerCase()} across Oakland, San Leandro, Berkeley, and the East Bay. CSLB #896116. Call ${siteSettings.phone}.`;
  const url = `${siteSettings.siteUrl}/services/${service.slug}/`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article" },
  };
}

function buildFaqs(serviceTitle: string): FaqItem[] {
  return [
    {
      question: `How fast can Z and Z get a plumber out for ${serviceTitle.toLowerCase()}?`,
      answer: `Z and Z dispatches from San Leandro and typically responds within 30 to 60 minutes inside our core East Bay service corridor. Emergency calls run 24/7 every day of the year.`,
    },
    {
      question: `Are your plumbers licensed and insured?`,
      answer: `Yes. Z and Z holds California State License Board number 896116 with two classifications: C-36 Plumbing (2007) and A General Engineering (2012). The combination lets us legally handle work most other plumbers cannot.`,
    },
    {
      question: `Where do you offer this service?`,
      answer: `Alameda County and Contra Costa County, including Oakland, San Leandro, Berkeley, Alameda, Hayward, Castro Valley, Union City, Fremont, Newark, Dublin, Pleasanton, Walnut Creek, and the surrounding East Bay corridor. See our service areas page for full coverage and ZIP details.`,
    },
    {
      question: `Do you provide a written estimate before starting work?`,
      answer: `Always. We assess the job on-site, scope the work, and write a clear price. We never start paid work without your approval, and we never add surprise charges after the quote.`,
    },
    {
      question: `Is financing available for this work?`,
      answer: `Financing is available for larger projects like water heater replacement, repipe, sewer lateral, and gas line work. We partner with third-party lenders. See our financing page or ask at the time of your quote.`,
    },
  ];
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  const related = services.filter((s) => s.slug !== service.slug).slice(0, 3);
  const faqs = buildFaqs(service.title);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteSettings.siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Services", item: `${siteSettings.siteUrl}/services/` },
      {
        "@type": "ListItem",
        position: 3,
        name: service.title,
        item: `${siteSettings.siteUrl}/services/${service.slug}/`,
      },
    ],
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: service.title,
    name: service.title,
    description: service.description,
    url: `${siteSettings.siteUrl}/services/${service.slug}/`,
    provider: {
      "@type": "Plumber",
      name: siteSettings.name,
      telephone: siteSettings.phoneTel,
      url: siteSettings.siteUrl,
      address: {
        "@type": "PostalAddress",
        streetAddress: siteSettings.address.street,
        addressLocality: siteSettings.address.city,
        addressRegion: siteSettings.address.state,
        postalCode: siteSettings.address.zip,
        addressCountry: "US",
      },
    },
    areaServed: serviceAreas.map((a) => ({ "@type": "City", name: a.city })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      {/* Hero */}
      <Section bg="black" size="lg">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs font-bold uppercase tracking-[0.12em] text-white/50">
          <Link href="/" className="hover:text-[#F96302]">Home</Link>
          <span className="mx-2 text-white/30">/</span>
          <Link href="/services/" className="hover:text-[#F96302]">Services</Link>
          <span className="mx-2 text-white/30">/</span>
          <span className="text-white">{service.title}</span>
        </nav>
        <p className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#F96302] mb-4">
          East Bay {service.shortTitle}
        </p>
        <h1 className="max-w-4xl font-display text-5xl md:text-7xl font-black uppercase leading-none tracking-tight text-white">
          {service.title}.
        </h1>
        <p className="mt-6 max-w-2xl font-sans text-2xl leading-relaxed text-white/80 md:text-3xl">
          {service.summary}
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
          <Button variant="inverse" size="lg" href="#service-intake">
            Get a quote
          </Button>
        </div>
      </Section>

      {/* Detailed description */}
      <Section bg="white" size="lg" narrow>
        <p className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#F96302] mb-3">
          What We Do
        </p>
        <h2 className="font-display text-4xl md:text-5xl font-black uppercase leading-tight tracking-tight text-black mb-6">
          {service.title} the Right Way.
        </h2>
        <p className="font-sans text-xl leading-relaxed text-[#333333] md:text-xl">
          {service.description}
        </p>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#E5E5E5] bg-[#F5F5F5] p-5">
            <p className="font-display text-3xl font-black uppercase leading-none text-black">2</p>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-[#666666]">
              California licenses
            </p>
            <p className="mt-1 text-sm text-[#333333]">C-36 + A General Engineering.</p>
          </div>
          <div className="rounded-2xl border border-[#E5E5E5] bg-[#F5F5F5] p-5">
            <p className="font-display text-3xl font-black uppercase leading-none text-black">30-60</p>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-[#666666]">
              min response window
            </p>
            <p className="mt-1 text-sm text-[#333333]">Same-day across the East Bay.</p>
          </div>
          <div className="rounded-2xl border border-[#E5E5E5] bg-[#F5F5F5] p-5">
            <p className="font-display text-3xl font-black uppercase leading-none text-black">24/7</p>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-[#666666]">
              emergency response
            </p>
            <p className="mt-1 text-sm text-[#333333]">A plumber answers the phone.</p>
          </div>
        </div>
      </Section>

      {/* Service intake */}
      <Section bg="black" size="md" id="service-intake">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#F96302] mb-3">
              Book {service.shortTitle}
            </p>
            <h2 className="font-display text-4xl font-black uppercase leading-tight tracking-tight text-white md:text-5xl">
              Send the Basics. We&apos;ll Call.
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/75">
              This short form creates a new lead in Z and Z&apos;s dashboard for {service.title.toLowerCase()}.
              The crew can confirm the address, scope, and schedule on the callback.
            </p>
            <ul className="mt-6 space-y-3 text-base font-semibold text-white/80">
              <li className="border-l-2 border-[#F96302] pl-3">First name, last name, phone, and email.</li>
              <li className="border-l-2 border-[#F96302] pl-3">Optional note so the call starts faster.</li>
              <li className="border-l-2 border-[#F96302] pl-3">For emergencies, call {siteSettings.phone}.</li>
            </ul>
          </div>
          <QuickLeadForm
            title={`${service.shortTitle} request`}
            description="Tell us who to call and what is happening. We will confirm the details before dispatch."
            serviceInterest={service.slug}
            serviceLabel={service.title}
            sourcePage={`/services/${service.slug}/`}
          />
        </div>
      </Section>

      {/* Where we run this service */}
      <Section bg="light-gray" size="lg">
        <SectionHeading
          eyebrow="Where We Run Calls"
          title={`${service.shortTitle} Across the East Bay.`}
          description="We dispatch from San Leandro and cover the East Bay corridor. Tap any area to see local detail."
        />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {serviceAreas.map((area) => (
            <li key={area.slug}>
              <Link
                href={`/${area.slug}/`}
                className="flex min-h-20 items-center justify-between gap-4 border border-[#D8D8D8] bg-white px-5 py-5 font-sans text-lg font-extrabold leading-snug text-black transition-colors duration-150 hover:border-[#F96302] hover:text-[#F96302] md:px-6 md:text-xl"
              >
                <span>{area.city}</span>
                <ChevronRight className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* FAQ */}
      <Section bg="white" size="lg" narrow>
        <SectionHeading
          eyebrow="FAQ"
          title="Common Questions."
        />
        <FaqAccordion items={faqs} />
      </Section>

      {/* Related services */}
      <Section bg="light-gray" size="lg">
        <SectionHeading
          eyebrow="More Services"
          title="Often Called Together."
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {related.map((r) => (
            <ServiceCard key={r.slug} service={r} />
          ))}
        </div>
        <div className="mt-8">
          <Link
            href="/services/"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-black hover:text-[#F96302]"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            All services
          </Link>
        </div>
      </Section>

      {/* Trust strip */}
      <Section bg="white" size="md">
        <SectionHeading eyebrow="Credentials" title="Licensed. Insured. Local." />
        <TrustStrip />
        <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <MapPin className="h-5 w-5 text-[#F96302]" strokeWidth={1.5} aria-hidden="true" />
          <address className="not-italic font-sans text-base text-[#333333]">
            {siteSettings.address.full}
          </address>
        </div>
      </Section>

      {/* CTA band */}
      <Section bg="hero-orange" size="md">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-4xl font-black uppercase leading-tight text-white md:text-5xl">
              Need {service.shortTitle} Now?
            </h2>
            <p className="mt-2 font-sans text-base text-white/85">
              Call us or book online. A plumber answers the phone.
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
            <Button variant="secondary" size="lg" href="#service-intake">
              Schedule online
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
