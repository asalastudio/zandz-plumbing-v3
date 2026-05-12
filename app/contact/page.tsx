import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, AlertTriangle } from "lucide-react";
import { Section, SectionHeading } from "@/components/Section";
import { Button } from "@/components/Button";
import { TrustStrip } from "@/components/TrustStrip";
import { siteSettings } from "@/content/site-settings";
import { serviceAreas } from "@/content/service-areas";

export const metadata: Metadata = {
  title: "Contact Z and Z Plumbing | Call (510) 708-4237 | San Leandro, CA",
  description:
    "Call (510) 708-4237 for same-day East Bay plumbing service. Z and Z Plumbing is headquartered at 3057 Teagarden Street in San Leandro. 24/7 emergency response across Oakland, Berkeley, Alameda, and the East Bay.",
  alternates: { canonical: `${siteSettings.siteUrl}/contact/` },
  openGraph: {
    title: "Contact Z and Z Plumbing",
    description: `Call ${siteSettings.phone} or visit our San Leandro headquarters. 24/7 emergency plumbing service across the East Bay.`,
    url: `${siteSettings.siteUrl}/contact/`,
    type: "website",
  },
};

const contactPageSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  url: `${siteSettings.siteUrl}/contact/`,
  name: `Contact ${siteSettings.name}`,
  description: `Contact details for ${siteSettings.name}, an East Bay plumber headquartered in San Leandro.`,
  mainEntity: {
    "@type": "Plumber",
    name: siteSettings.name,
    telephone: siteSettings.phoneTel,
    email: siteSettings.email,
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
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${siteSettings.siteUrl}/` },
    { "@type": "ListItem", position: 2, name: "Contact", item: `${siteSettings.siteUrl}/contact/` },
  ],
};

const mapEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(siteSettings.address.full)}&z=14&output=embed`;

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero: massive phone CTA. The clearest possible message. */}
      <Section bg="black" size="lg">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs font-bold uppercase tracking-[0.12em] text-white/50">
          <Link href="/" className="hover:text-[#F96302]">Home</Link>
          <span className="mx-2 text-white/30">/</span>
          <span className="text-white">Contact</span>
        </nav>

        <p className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#F96302] mb-4">
          Reach Z and Z Plumbing
        </p>
        <h1 className="font-display text-5xl md:text-7xl lg:text-[6.5rem] font-black uppercase leading-none tracking-tight text-white">
          Call. We Answer.
        </h1>
        <p className="mt-6 max-w-3xl font-sans text-xl leading-relaxed text-white/80 md:text-2xl">
          A plumber picks up the phone. Not a call center, not a voicemail menu. We respond within 30 minutes during
          business hours, and 24 hours a day for emergencies across the East Bay.
        </p>

        {/* Massive phone */}
        <a
          href={`tel:${siteSettings.phoneTel}`}
          className="mt-10 inline-flex items-center gap-4 border-b-2 border-[#F96302] pb-3 font-display text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-none tracking-tight text-white transition-colors duration-150 hover:text-[#F96302]"
          aria-label={`Call ${siteSettings.phone}`}
        >
          <Phone className="h-10 w-10 text-[#F96302] md:h-12 md:w-12 lg:h-14 lg:w-14" strokeWidth={1.5} aria-hidden="true" />
          {siteSettings.phone}
        </a>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button
            variant="primary"
            size="xl"
            href={`tel:${siteSettings.phoneTel}`}
            icon={<Phone className="h-5 w-5" />}
            external
          >
            Call Now
          </Button>
          <Button
            variant="inverse"
            size="xl"
            href={`mailto:${siteSettings.email}`}
            icon={<Mail className="h-5 w-5" />}
            external
          >
            Email Us
          </Button>
        </div>
      </Section>

      {/* Emergency callout */}
      <Section bg="hero-orange" size="md">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center bg-black text-white">
              <AlertTriangle className="h-7 w-7 text-[#F96302]" strokeWidth={1.75} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-white">24/7 Emergency</p>
              <p className="mt-2 font-display text-3xl font-black uppercase leading-tight tracking-tight text-white md:text-4xl">
                Burst pipe? Sewer backup? Call now.
              </p>
              <p className="mt-3 max-w-2xl text-lg leading-relaxed text-white/90 md:text-xl">
                Emergency calls go straight to the on-call plumber. We answer at 2am the same way we answer at 2pm.
              </p>
            </div>
          </div>
          <Button
            variant="inverse"
            size="lg"
            href={`tel:${siteSettings.phoneTel}`}
            icon={<Phone className="h-5 w-5" />}
            external
            className="flex-shrink-0"
          >
            {siteSettings.phone}
          </Button>
        </div>
      </Section>

      {/* Hours + Address + Email */}
      <Section bg="white" size="lg" id="schedule">
        <SectionHeading
          eyebrow="Headquarters"
          title="Visit the San Leandro Yard."
          description="Our dispatch base is at 3057 Teagarden Street in San Leandro. Easy access to I-880, Oakland, Alameda, Berkeley, and the Contra Costa side of the East Bay."
        />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
          {/* Contact cards */}
          <dl className="grid grid-cols-1 gap-5">
            <div className="flex items-start gap-5 rounded-2xl border border-[#E5E5E5] bg-white p-7">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center bg-[#F96302] text-white">
                <MapPin className="h-7 w-7" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <div>
                <dt className="text-sm font-bold uppercase tracking-[0.12em] text-[#666666]">Address</dt>
                <dd className="mt-2 font-display text-2xl font-black uppercase leading-tight tracking-tight text-black md:text-3xl">
                  <address className="not-italic">{siteSettings.address.full}</address>
                </dd>
              </div>
            </div>

            <a
              href={`tel:${siteSettings.phoneTel}`}
              className="flex items-start gap-5 rounded-2xl border border-[#E5E5E5] bg-white p-7 transition-all duration-200 hover:-translate-y-1 hover:border-[#F96302]"
            >
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center bg-[#F96302] text-white">
                <Phone className="h-7 w-7" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <div>
                <dt className="text-sm font-bold uppercase tracking-[0.12em] text-[#666666]">Phone</dt>
                <dd className="mt-2 font-display text-2xl font-black uppercase leading-tight tracking-tight text-black md:text-3xl">
                  {siteSettings.phone}
                </dd>
                <p className="mt-2 text-base text-[#666666]">Tap to call. A plumber picks up.</p>
              </div>
            </a>

            <a
              href={`mailto:${siteSettings.email}`}
              className="flex items-start gap-5 rounded-2xl border border-[#E5E5E5] bg-white p-7 transition-all duration-200 hover:-translate-y-1 hover:border-[#F96302]"
            >
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center bg-[#F96302] text-white">
                <Mail className="h-7 w-7" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <div>
                <dt className="text-sm font-bold uppercase tracking-[0.12em] text-[#666666]">Email</dt>
                <dd className="mt-2 font-display text-xl font-black uppercase leading-tight tracking-tight text-black md:text-2xl break-all">
                  {siteSettings.email}
                </dd>
                <p className="mt-2 text-base text-[#666666]">Slower than calling. Use for non-urgent questions.</p>
              </div>
            </a>

            <div className="flex items-start gap-5 rounded-2xl border border-[#E5E5E5] bg-white p-7">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center bg-[#F96302] text-white">
                <Clock className="h-7 w-7" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <div>
                <dt className="text-sm font-bold uppercase tracking-[0.12em] text-[#666666]">Hours</dt>
                <dd className="mt-2 font-display text-2xl font-black uppercase leading-tight tracking-tight text-black md:text-3xl">
                  Mon to Fri, 7am to 5pm
                </dd>
                <p className="mt-2 text-base text-[#333333]">24/7 emergency service every day of the year.</p>
              </div>
            </div>
          </dl>

          {/* Map */}
          <div className="overflow-hidden rounded-2xl border border-[#E5E5E5]">
            <iframe
              src={mapEmbedSrc}
              title="Z and Z Plumbing headquarters at 3057 Teagarden Street, San Leandro"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block h-[560px] w-full border-0"
              allowFullScreen
            />
          </div>
        </div>
      </Section>

      {/* Service area pills */}
      <Section bg="light-gray" size="md">
        <SectionHeading
          eyebrow="Service Area"
          title="10 East Bay Cities."
          description="Tap any city to see what we cover there."
        />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {serviceAreas.map((area) => (
            <li key={area.slug}>
              <Link
                href={`/${area.slug}/`}
                className="block border border-[#E5E5E5] bg-white px-5 py-4 text-center font-display text-lg font-black uppercase tracking-tight text-black transition-colors duration-150 hover:border-[#F96302] hover:text-[#F96302]"
              >
                {area.city}
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* Trust strip */}
      <Section bg="white" size="md">
        <SectionHeading eyebrow="Credentials" title="Licensed for the Whole Job." />
        <TrustStrip />
      </Section>

      {/* Final CTA */}
      <Section bg="black" size="md">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-4xl font-black uppercase leading-tight text-white md:text-5xl">
              Need a Plumber Now?
            </h2>
            <p className="mt-3 max-w-2xl font-sans text-lg text-white/80 md:text-xl">
              A plumber answers the phone. {siteSettings.cslb}.
            </p>
          </div>
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
      </Section>
    </>
  );
}
