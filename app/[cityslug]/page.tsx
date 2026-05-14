import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Phone, ChevronRight, MapPin, Navigation } from "lucide-react";
import { Section, SectionHeading } from "@/components/Section";
import { Button } from "@/components/Button";
import { ServiceCard } from "@/components/ServiceCard";
import { TrustStrip } from "@/components/TrustStrip";
import { FaqAccordion } from "@/components/FaqAccordion";
import type { FaqItem } from "@/components/FaqAccordion";
import { TestimonialCard } from "@/components/TestimonialCard";
import { siteSettings } from "@/content/site-settings";
import { services, featuredServices } from "@/content/services";
import { serviceAreas } from "@/content/service-areas";
import { testimonials } from "@/content/testimonials";

export function generateStaticParams() {
  return serviceAreas.map((a) => ({ cityslug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ cityslug: string }> }): Promise<Metadata> {
  const { cityslug } = await params;
  const area = serviceAreas.find((a) => a.slug === cityslug);
  if (!area) return {};

  const title = `Plumber in ${area.city}, CA | Z and Z Plumbing | (510) 708-4237`;
  const description = `Licensed plumber serving ${area.city}, California. Z and Z Plumbing covers sewer lateral, drain cleaning, water heater, repipe, and 24/7 emergency work across ${area.city} and the East Bay. CSLB #896116.`;
  const url = `${siteSettings.siteUrl}/${area.slug}/`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article" },
  };
}

function buildCityFaqs(city: string, isHQ: boolean): FaqItem[] {
  return [
    {
      question: `How quickly can a Z and Z plumber respond in ${city}?`,
      answer: isHQ
        ? `${city} is home to our headquarters at ${siteSettings.address.street}, so response times are the fastest in our service area. Same-day appointments are typical, and emergency calls run 24/7.`
        : `From our San Leandro dispatch base, we typically reach ${city} within 30 to 60 minutes for standard calls. Emergency response runs 24/7 every day of the year.`,
    },
    {
      question: `What plumbing services do you offer in ${city}?`,
      answer: `Z and Z runs the full plumbing menu in ${city}, including sewer lateral, drain cleaning, water heater, whole-house repipe, hydrojetting, leak detection, gas line, water line, faucet, toilet, garbage disposal, and 24/7 emergency response. See our services page for the full list.`,
    },
    {
      question: `Are you licensed to work in ${city}, California?`,
      answer: `Yes. Z and Z holds California State License Board number 896116 with C-36 Plumbing and A General Engineering classifications. Both classifications are statewide California licenses valid in ${city} and across the East Bay.`,
    },
    {
      question: `Can you handle sewer lateral and street-side work in ${city}?`,
      answer: `Yes. Most plumbers stop at the property line because their C-36 license does not cover the public right-of-way. Z and Z holds the A General Engineering license that legally covers lateral, street, and right-of-way plumbing work in ${city}.`,
    },
    {
      question: `Do you provide emergency plumbing service in ${city}?`,
      answer: `Yes, 24/7. Z and Z answers emergency calls in ${city} every day of the year. A plumber picks up the phone, not a call center. Same number, same crew.`,
    },
  ];
}

export default async function CityPage({ params }: { params: Promise<{ cityslug: string }> }) {
  const { cityslug } = await params;
  const area = serviceAreas.find((a) => a.slug === cityslug);
  if (!area) notFound();

  const cityTestimonials = testimonials.filter((t) => t.authorCity.toLowerCase() === area.city.toLowerCase());
  const otherAreas = serviceAreas.filter((a) => a.slug !== area.slug);
  const featuredForCity = featuredServices;
  const faqs = buildCityFaqs(area.city, area.isHQ);
  const areaSchemaType = area.city.includes("County") ? "AdministrativeArea" : "City";

  const url = `${siteSettings.siteUrl}/${area.slug}/`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteSettings.siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Service Areas", item: `${siteSettings.siteUrl}/service-areas/` },
      { "@type": "ListItem", position: 3, name: `Plumber in ${area.city}`, item: url },
    ],
  };

  const cityServiceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: `Plumbing in ${area.city}, CA`,
    name: `Plumber in ${area.city}`,
    description: area.intro,
    url,
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
    areaServed: {
      "@type": areaSchemaType,
      name: area.city,
      address: {
        "@type": "PostalAddress",
        addressLocality: area.city,
        addressRegion: area.state,
        addressCountry: "US",
        postalCode: area.zips[0],
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cityServiceSchema) }}
      />

      {/* Hero */}
      <Section bg="black" size="lg">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs font-bold uppercase tracking-[0.12em] text-white/50">
          <Link href="/" className="hover:text-[#F96302]">Home</Link>
          <span className="mx-2 text-white/30">/</span>
          <Link href="/service-areas/" className="hover:text-[#F96302]">Service Areas</Link>
          <span className="mx-2 text-white/30">/</span>
          <span className="text-white">{area.city}</span>
        </nav>
        <div className="flex items-center gap-3 mb-4">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#F96302]">
            Plumber in {area.city}, CA
          </p>
          {area.isHQ && (
            <span className="inline-flex items-center bg-[#F96302] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white">
              HQ City
            </span>
          )}
        </div>
        <h1 className="max-w-4xl font-display text-5xl md:text-7xl font-black uppercase leading-none tracking-tight text-white">
          {area.city} Plumber.
        </h1>
        <p className="mt-6 max-w-2xl font-sans text-2xl leading-relaxed text-white/80 md:text-3xl">
          {area.intro}
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

      {/* Coverage facts */}
      <Section bg="white" size="md">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <p className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#F96302] mb-3">
              {area.city} Coverage
            </p>
            <h2 className="font-display text-4xl font-black uppercase leading-tight tracking-tight text-black md:text-5xl">
              Built for {area.city} Housing Stock.
            </h2>
            <p className="mt-5 font-sans text-xl leading-relaxed text-[#333333] md:text-lg">
              We run calls in {area.city} from our San Leandro dispatch base. Two California licenses on the truck, one
              crew on every job, and the East Bay knowledge to spot the issue fast.
            </p>

            {area.neighborhoods.length > 0 && (
              <div className="mt-8">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#666666] mb-3">
                  Neighborhoods we serve
                </p>
                <ul className="flex flex-wrap gap-2">
                  {area.neighborhoods.map((n) => (
                    <li
                      key={n}
                      className="inline-flex items-center border border-[#E5E5E5] bg-[#F5F5F5] px-3 py-1.5 text-sm font-semibold text-black"
                    >
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#E5E5E5] bg-[#F5F5F5] p-5">
              <p className="font-display text-3xl font-black uppercase leading-none text-black">
                {area.zips.length}
              </p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-[#666666]">
                {area.city} ZIP code{area.zips.length === 1 ? "" : "s"}
              </p>
              <p className="mt-1 break-words text-sm leading-snug text-[#333333]">
                {area.zips.join(", ")}
              </p>
            </div>
            <div className="rounded-2xl border border-[#E5E5E5] bg-[#F5F5F5] p-5">
              <p className="font-display text-3xl font-black uppercase leading-none text-black">
                {area.isHQ ? "0" : "30-60"}
              </p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-[#666666]">
                {area.isHQ ? "min, we are local" : "min response window"}
              </p>
            </div>
            <div className="rounded-2xl border border-[#E5E5E5] bg-[#F5F5F5] p-5 col-span-2">
              <div className="flex items-start gap-3">
                <Navigation className="h-5 w-5 flex-shrink-0 text-[#F96302]" strokeWidth={1.5} aria-hidden="true" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#666666]">Dispatch base</p>
                  <p className="mt-1 font-display text-lg font-black uppercase tracking-tight text-black">
                    San Leandro HQ
                  </p>
                  <address className="mt-1 not-italic text-sm text-[#333333]">
                    {siteSettings.address.full}
                  </address>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Services we offer in this city */}
      <Section bg="light-gray" size="lg">
        <SectionHeading
          eyebrow={`Services in ${area.city}`}
          title="Most-Called Work."
          description={`The three categories Z and Z runs most often in ${area.city}, and the licenses behind each one.`}
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {featuredForCity.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
        <div className="mt-8">
          <Link
            href="/services/"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-black hover:text-[#F96302]"
          >
            All 12 services
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Section>

      {/* Testimonials (filtered if any) */}
      {cityTestimonials.length > 0 && (
        <Section bg="white" size="lg">
          <SectionHeading
            eyebrow={`${area.city} Reviews`}
            title={`What ${area.city} Customers Say.`}
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cityTestimonials.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </Section>
      )}

      {/* FAQ */}
      <Section bg={cityTestimonials.length > 0 ? "light-gray" : "white"} size="lg" narrow>
        <SectionHeading
          eyebrow={`${area.city} FAQ`}
          title="Common Questions."
        />
        <FaqAccordion items={faqs} />
      </Section>

      {/* Other service areas */}
      <Section bg="white" size="md">
        <SectionHeading
          eyebrow="Nearby"
          title="Other East Bay Cities We Serve."
        />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {otherAreas.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/${a.slug}/`}
                className="block border border-[#E5E5E5] bg-white px-4 py-3 text-center font-display text-base font-black uppercase tracking-tight text-black transition-colors duration-150 hover:border-[#F96302] hover:text-[#F96302]"
              >
                {a.city}
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* Trust strip */}
      <Section bg="light-gray" size="md">
        <SectionHeading eyebrow="Credentials" title="Licensed. Insured. Local." />
        <TrustStrip />
        <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <MapPin className="h-5 w-5 text-[#F96302]" strokeWidth={1.5} aria-hidden="true" />
          <address className="not-italic font-sans text-base text-[#333333]">
            Dispatching from {siteSettings.address.full}
          </address>
        </div>
      </Section>

      {/* CTA band */}
      <Section bg="hero-orange" size="md">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-4xl font-black uppercase leading-tight text-white md:text-5xl">
              Need a {area.city} Plumber?
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
            <Button variant="secondary" size="lg" href="/contact/">
              Schedule Online
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
