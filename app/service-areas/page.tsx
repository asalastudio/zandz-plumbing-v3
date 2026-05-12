import type { Metadata } from "next";
import Link from "next/link";
import { Phone, MapPin, ChevronRight, Navigation, Clock } from "lucide-react";
import { Section, SectionHeading } from "@/components/Section";
import { Button } from "@/components/Button";
import { TrustStrip } from "@/components/TrustStrip";
import { siteSettings } from "@/content/site-settings";
import { serviceAreas } from "@/content/service-areas";

export const metadata: Metadata = {
  title: "Plumbing Service Areas | Oakland, San Leandro, Berkeley & East Bay",
  description:
    "Z and Z Plumbing serves 10 East Bay cities from our San Leandro headquarters. Oakland, San Leandro, Berkeley, Alameda, Hayward, Castro Valley, Richmond, Emeryville, Pinole, and Lafayette. 24/7 emergency response.",
  alternates: { canonical: `${siteSettings.siteUrl}/service-areas/` },
  openGraph: {
    title: "Service Areas | Z and Z Plumbing",
    description:
      "10 East Bay cities. Same-day plumbing service from our San Leandro base. Two licenses. One crew.",
    url: `${siteSettings.siteUrl}/service-areas/`,
    type: "website",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${siteSettings.siteUrl}/` },
    { "@type": "ListItem", position: 2, name: "Service Areas", item: `${siteSettings.siteUrl}/service-areas/` },
  ],
};

const mapEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(siteSettings.address.full)}&z=10&output=embed`;

export default function ServiceAreasHubPage() {
  const hq = serviceAreas.find((a) => a.isHQ);
  const others = serviceAreas.filter((a) => !a.isHQ);
  const ordered = hq ? [hq, ...others] : serviceAreas;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero */}
      <Section bg="black" size="lg">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs font-bold uppercase tracking-[0.12em] text-white/50">
          <Link href="/" className="hover:text-[#F96302]">Home</Link>
          <span className="mx-2 text-white/30">/</span>
          <span className="text-white">Service Areas</span>
        </nav>
        <p className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#F96302] mb-4">
          East Bay Coverage
        </p>
        <h1 className="max-w-4xl font-display text-5xl md:text-7xl font-black uppercase leading-none tracking-tight text-white">
          Ten East Bay Cities. One San Leandro Base.
        </h1>
        <p className="mt-6 max-w-2xl font-sans text-2xl leading-relaxed text-white/80 md:text-3xl">
          Z and Z Plumbing dispatches out of San Leandro and runs calls across Alameda and western Contra Costa counties.
          Oakland is our biggest market. Same-day response is typical inside our service map.
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

      {/* Map + coverage facts */}
      <Section bg="white" size="lg">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#F96302] mb-3">
              Where We Run Calls
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-black uppercase leading-tight tracking-tight text-black">
              Built for the East Bay.
            </h2>
            <p className="mt-5 font-sans text-xl leading-relaxed text-[#333333] md:text-lg">
              Our San Leandro headquarters at {siteSettings.address.street} sits right off I-880, with fast access to
              Oakland, Alameda, Berkeley, and the Contra Costa side of the Bay. We staff for same-day calls and 24/7
              emergency response.
            </p>

            <div className="mt-8 grid grid-cols-3 border border-[#E5E5E5]">
              <div className="border-r border-[#E5E5E5] p-4">
                <p className="font-display text-4xl font-black uppercase leading-none text-black">10</p>
                <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#666666]">East Bay cities</p>
              </div>
              <div className="border-r border-[#E5E5E5] p-4">
                <p className="font-display text-4xl font-black uppercase leading-none text-black">30-60</p>
                <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#666666]">min nearby response</p>
              </div>
              <div className="p-4">
                <p className="font-display text-4xl font-black uppercase leading-none text-black">24/7</p>
                <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#666666]">emergency</p>
              </div>
            </div>

            <div className="mt-8 border-l-4 border-[#F96302] bg-[#F5F5F5] p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center bg-black text-white">
                  <Navigation className="h-5 w-5 text-[#F96302]" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#666666]">Dispatch base</p>
                  <p className="mt-1 font-display text-2xl font-black uppercase leading-tight tracking-tight text-black">
                    San Leandro HQ
                  </p>
                  <address className="mt-2 not-italic text-sm text-[#333333]">
                    {siteSettings.address.full}
                  </address>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#E5E5E5] bg-[#F5F5F5]">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] bg-white px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center bg-[#F96302] text-white">
                  <MapPin className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#666666]">Coverage map</p>
                  <p className="font-display text-xl font-black uppercase leading-tight tracking-tight text-black">
                    East Bay service area
                  </p>
                </div>
              </div>
              <div className="hidden items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#666666] sm:flex">
                <Clock className="h-4 w-4 text-[#F96302]" strokeWidth={1.5} aria-hidden="true" />
                Same-day
              </div>
            </div>
            <iframe
              src={mapEmbedSrc}
              title="Z and Z Plumbing service area centered on San Leandro headquarters"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block h-[480px] w-full border-0"
              allowFullScreen
            />
          </div>
        </div>
      </Section>

      {/* 10-city grid */}
      <Section bg="light-gray" size="lg">
        <SectionHeading
          eyebrow="Choose Your City"
          title="10 East Bay Service Areas."
          description="Click a city to see the neighborhoods we serve and the services we run most often in that area."
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ordered.map((area) => (
            <Link key={area.slug} href={`/${area.slug}/`} className="group block">
              <article
                className={`flex h-full flex-col rounded-2xl border bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#F96302] hover:shadow-lg md:p-7 ${
                  area.isHQ ? "border-[#F96302]" : "border-[#E5E5E5]"
                }`}
              >
                <header className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center ${
                        area.isHQ ? "bg-black text-white" : "bg-[#F5F5F5] text-[#F96302]"
                      }`}
                    >
                      <MapPin className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                    </div>
                    <h3 className="font-display text-2xl font-black uppercase leading-tight tracking-tight text-black md:text-3xl">
                      {area.city}
                    </h3>
                  </div>
                  {area.isHQ && (
                    <span className="inline-flex items-center bg-[#F96302] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white">
                      HQ
                    </span>
                  )}
                </header>
                <p className="flex-1 text-lg leading-relaxed text-[#333333]">{area.intro}</p>
                {area.neighborhoods.length > 0 && (
                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-[#666666]">
                    {area.neighborhoods.slice(0, 3).join(" · ")}
                    {area.neighborhoods.length > 3 ? ` · +${area.neighborhoods.length - 3} more` : ""}
                  </p>
                )}
                <footer className="mt-5 flex items-center justify-between border-t border-[#E5E5E5] pt-4">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#666666]">
                    {area.zips.length} ZIP code{area.zips.length === 1 ? "" : "s"}
                  </span>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#F96302] group-hover:underline">
                    See {area.city}
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </footer>
              </article>
            </Link>
          ))}
        </div>
      </Section>

      {/* Trust strip */}
      <Section bg="white" size="md">
        <SectionHeading eyebrow="Credentials" title="Licensed for the Whole Job." />
        <TrustStrip />
      </Section>

      {/* CTA band */}
      <Section bg="hero-orange" size="md">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-4xl font-black uppercase leading-tight text-white md:text-5xl">
              Outside the Map? Still Call.
            </h2>
            <p className="mt-2 font-sans text-base text-white/85">
              We sometimes take calls outside our core 10 cities. Ring us and we will tell you straight.
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
