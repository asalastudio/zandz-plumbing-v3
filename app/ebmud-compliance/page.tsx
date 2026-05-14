import type { Metadata } from "next";
import Link from "next/link";
import {
  Phone,
  ShieldCheck,
  FileCheck,
  ClipboardList,
  Camera,
  Hammer,
  MapPin,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Award,
} from "lucide-react";
import { Section, SectionHeading } from "@/components/Section";
import { Button } from "@/components/Button";
import { TrustStrip } from "@/components/TrustStrip";
import { FaqAccordion } from "@/components/FaqAccordion";
import type { FaqItem } from "@/components/FaqAccordion";
import { siteSettings } from "@/content/site-settings";

export const metadata: Metadata = {
  title: "EBMUD PSL Compliance · Sewer Lateral Contractor | Z and Z Plumbing",
  description:
    "Listed on EBMUD's PSL Contractor List with full coverage across all five service categories. C-36 plumbing plus A General Engineering. Inspection, repair, certificate-ready. Call (510) 708-4237.",
  alternates: { canonical: `${siteSettings.siteUrl}/ebmud-compliance/` },
  openGraph: {
    title: "EBMUD PSL Compliance Hub | Z and Z Plumbing",
    description:
      "Z and Z Plumbing is listed on the official EBMUD PSL Contractor List with full coverage across all five rated service categories. Serving the EBMUD wastewater service area since 2003.",
    url: `${siteSettings.siteUrl}/ebmud-compliance/`,
    type: "website",
  },
};

const PAGE_URL = `${siteSettings.siteUrl}/ebmud-compliance/`;

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${siteSettings.siteUrl}/` },
    { "@type": "ListItem", position: 2, name: "Services", item: `${siteSettings.siteUrl}/services/` },
    { "@type": "ListItem", position: 3, name: "EBMUD PSL Compliance", item: PAGE_URL },
  ],
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${PAGE_URL}#service`,
  name: "EBMUD Private Sewer Lateral Compliance",
  serviceType:
    "Sewer lateral inspection, testing, repair, replacement, and EBMUD compliance certification support",
  description:
    "Z and Z Plumbing is listed on the official EBMUD PSL Contractor List with full service coverage across all five rated categories. We perform PSL inspection, testing, repair, and replacement across the EBMUD wastewater service area (Oakland, Piedmont, El Cerrito, Kensington, Richmond Annex, Emeryville). Holds both C-36 Plumbing and A General Engineering CSLB licenses under #896116, which is required for work in the public right-of-way.",
  url: PAGE_URL,
  provider: { "@id": `${siteSettings.siteUrl}/#organization` },
  areaServed: [
    { "@type": "City", name: "Oakland" },
    { "@type": "City", name: "Piedmont" },
    { "@type": "City", name: "El Cerrito" },
    { "@type": "City", name: "Kensington" },
    { "@type": "City", name: "Emeryville" },
    { "@type": "Place", name: "Richmond Annex" },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "EBMUD PSL services",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Residential PSL camera inspection" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Private main and private manhole testing" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Commercial property PSL testing" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "PSL map preparation for HOAs and multilateral properties" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "CAP/CAWP documentation for properties over 1,000 feet of PSL" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Trenchless sewer lateral replacement" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Open-trench sewer lateral replacement including right-of-way" } },
    ],
  },
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: "200",
    highPrice: "80000",
    offerCount: "7",
  },
};

const coverageRows: { label: string; description: string }[] = [
  {
    label: "Residential (single family home) PSL testing",
    description: "Camera inspection and pressure or water testing for standard residential laterals.",
  },
  {
    label: "Private main (PM) and private manhole (PMH) testing",
    description: "Testing for shared private mains and the manholes serving multi-property groups.",
  },
  {
    label: "Commercial property PSL testing",
    description: "Compliance testing for commercial buildings, mixed-use properties, and small business sites.",
  },
  {
    label: "PSL maps for HOAs and multilateral properties",
    description: "Preparation of the lateral maps that HOAs and multi-parcel properties need for compliance documentation.",
  },
  {
    label: "CAP/CAWP documentation for properties over 1,000 ft of PSL",
    description: "Condition Assessment Plans and Corrective Action Work Plans for large-parcel groups and HOAs with extensive lateral runs.",
  },
];

const processSteps = [
  {
    icon: Camera,
    step: "1",
    title: "Camera inspection",
    timing: "$200 to $500",
    detail:
      "We run a CCTV camera from the cleanout to the city main, document every failure with location and severity, and send you a recorded video. Inspection typically runs 60 to 90 minutes.",
  },
  {
    icon: ClipboardList,
    step: "2",
    title: "Written quote",
    timing: "Same day",
    detail:
      "If the lateral passes, we coordinate the EBMUD inspection appointment. If it fails, you receive a clear written quote on the repair or replacement options before any work starts.",
  },
  {
    icon: Hammer,
    step: "3",
    title: "Repair or replace",
    timing: "1 to 14 days",
    detail:
      "Repairs typically start around $3,000. A full residential lateral replacement usually lands in the $12,000 to $17,000 range. Outliers run higher. We pull the permits and coordinate with the city directly.",
  },
  {
    icon: ShieldCheck,
    step: "4",
    title: "City and EBMUD inspection",
    timing: "On completion",
    detail:
      "The pressure or water test is witnessed by your city's inspector and EBMUD's field inspector. We schedule, coordinate, and stay on-site through the test.",
  },
  {
    icon: FileCheck,
    step: "5",
    title: "Certificate issued",
    timing: "2 to 4 weeks",
    detail:
      "EBMUD issues the compliance certificate after the work passes. Valid 20 years for a complete replacement, 7 years for a passed test without full replacement. Your escrow can close.",
  },
];

const triggerEvents = [
  {
    title: "Selling your property",
    detail:
      "A compliant lateral is part of escrow. Most buyers and lenders will not close without the certificate. This is the most common trigger.",
  },
  {
    title: "Remodel or building project over $100,000",
    detail:
      "If your permit value exceeds $100,000, EBMUD requires PSL compliance verification as part of the permit process.",
  },
  {
    title: "Upsizing your water service",
    detail:
      "Anything that increases your water meter or service line size triggers PSL inspection at the same time.",
  },
  {
    title: "Voluntary compliance",
    detail:
      "Many owners of older East Bay homes pursue compliance voluntarily. A failed lateral mid-storm is one of the most expensive plumbing emergencies you can have.",
  },
];

const coverageAreas = [
  { city: "Oakland", note: "Our largest service market" },
  { city: "Piedmont", note: "Full residential coverage" },
  { city: "El Cerrito", note: "Including hillside laterals" },
  { city: "Kensington", note: "Full residential coverage" },
  { city: "Richmond Annex", note: "EBMUD service area portion" },
  { city: "Emeryville", note: "Residential and small commercial" },
];

const pricingRows: { label: string; range: string }[] = [
  { label: "Camera inspection only", range: "$200 to $500" },
  { label: "Spot repair (one failure point)", range: "$3,000 to $8,000" },
  { label: "Trenchless reline (typical residential lateral)", range: "$9,000 to $18,000" },
  { label: "Open-trench replacement, property-side only", range: "$7,000 to $15,000" },
  { label: "Full replacement including right-of-way section", range: "$12,000 to $17,000" },
  { label: "Complex jobs (hillside, multi-unit, long laterals)", range: "$25,000 to $80,000" },
];

const faqs: FaqItem[] = [
  {
    question: "Do I really need PSL compliance to sell my home?",
    answer:
      "If your property is inside the EBMUD wastewater service area, yes. The compliance certificate is part of escrow and most buyers and lenders will not close without it. A small number of edge cases exist (some new construction with current certificates, certain commercial transactions) but for residential resale inside the EBMUD service area, plan on needing it.",
  },
  {
    question: "How much does the EBMUD PSL inspection cost?",
    answer:
      "Typical inspection cost runs $200 to $500. Variables include lateral length, access conditions, and whether the cleanout is in good working order. We provide a written quote before we run the camera.",
  },
  {
    question: "What does a full sewer lateral replacement cost in the East Bay?",
    answer:
      "For a standard residential lateral, the typical range is $12,000 to $17,000. Repairs (rather than full replacement) start around $3,000. Hillside properties, multi-unit buildings, long laterals, or street excavation under heavy traffic can push the work higher (up to $80,000 in rare cases). We quote every job in writing before starting.",
  },
  {
    question: "How long is the EBMUD compliance certificate valid?",
    answer:
      "20 years if the work was a complete lateral replacement. 7 years if the lateral passed via repair or via original pressure or water test without major work. The certificate document itself states the validity period.",
  },
  {
    question: "Why does the A General Engineering license matter?",
    answer:
      "Because the portion of your sewer lateral in the public right-of-way (the street, the sidewalk, sometimes the parkway strip) requires an A General Engineering license to work on legally. C-36-only plumbers cannot do that section themselves. Z and Z holds both C-36 and A General, so one crew handles the entire lateral from house to main.",
  },
  {
    question: "Can I do the EBMUD PSL inspection myself?",
    answer:
      "No. The inspection must be performed by a contractor who is eligible to schedule EBMUD inspection appointments. Z and Z is on the official EBMUD PSL Contractor List with full service coverage across all five rated categories.",
  },
  {
    question: "What is the difference between a repair and a replacement?",
    answer:
      "A repair addresses a specific section of the lateral, often where a tree root has cracked the pipe or a joint has separated. A replacement replaces the entire lateral, usually from cleanout to city main. Replacement costs more but extends the compliance certificate from 7 years to 20 years and resets the clock on lateral failures.",
  },
  {
    question: "Does homeowner's insurance cover this work?",
    answer:
      "Usually not, unless the damage is sudden and from a covered peril (a tree falling on the property and rupturing the line, for example). Slow degradation from age, root intrusion, or soil shift is generally not covered. We are happy to provide documentation if you want to file a claim.",
  },
  {
    question: "What is CAP/CAWP documentation, and do I need it?",
    answer:
      "CAP stands for Condition Assessment Plan. CAWP stands for Corrective Action Work Plan. These documents are required for properties with over 1,000 linear feet of private sewer lateral, which usually means HOAs, mobile home parks, large commercial buildings, or multi-parcel groups. Z and Z is one of the contractors on EBMUD's list authorized to prepare CAP/CAWP documentation. Most single-family homeowners do not need it.",
  },
  {
    question: "Is Z and Z really on the official EBMUD PSL Contractor List?",
    answer:
      "Yes. You can verify by downloading the current contractor list from EBMUD's regional PSL site at eastbaypsl.com. Look for Z and Z Plumbing, License #896116, 3057 Teagarden St, San Leandro, CA 94577. All five service columns are marked Y.",
  },
];

export default function EbmudCompliancePage() {
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
          <span className="text-white">EBMUD PSL Compliance</span>
        </nav>
        <p className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#F96302] mb-4">
          EBMUD Private Sewer Lateral · Regional Hub
        </p>
        <h1 className="max-w-5xl font-display text-5xl md:text-7xl font-black uppercase leading-none tracking-tight text-white">
          EBMUD Sewer Lateral Compliance Across the East Bay.
        </h1>
        <p className="mt-6 max-w-3xl font-sans text-2xl leading-relaxed text-white/80 md:text-3xl">
          Listed on the official EBMUD PSL Contractor List with full service coverage. C-36 plumbing plus A General
          Engineering. We handle the entire lateral, including the section in the public right-of-way most plumbers
          cannot legally touch.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            variant="primary"
            size="xl"
            href={`tel:${siteSettings.phoneTel}`}
            icon={<Phone className="h-5 w-5" />}
            external
          >
            Call {siteSettings.phone}
          </Button>
          <Button variant="inverse" size="xl" href="/contact/?service=ebmud-psl">
            Schedule a PSL inspection
          </Button>
        </div>
        <p className="mt-6 max-w-3xl text-sm font-semibold uppercase tracking-[0.12em] text-white/55">
          {siteSettings.cslb} · C-36 + A General Engineering · On the EBMUD PSL Contractor List · Since 2003
        </p>
      </Section>

      {/* Featured-snippet first paragraph */}
      <Section bg="white" size="lg" narrow>
        <p className="font-sans text-xl leading-relaxed text-[#333333] md:text-xl">
          Z and Z Plumbing is listed on the official EBMUD Private Sewer Lateral (PSL) Contractor List with full service
          coverage across all five categories the list rates. We perform PSL inspection, testing, repair, and
          replacement across the EBMUD wastewater service area: Oakland, Piedmont, El Cerrito, Kensington, the Richmond
          Annex, and Emeryville. The combination of our C-36 plumbing license and our A General Engineering license
          ({siteSettings.cslb}) lets one crew handle the entire lateral, from the cleanout at your house all the way
          to the city main in the street. Call us at{" "}
          <a href={`tel:${siteSettings.phoneTel}`} className="font-bold text-[#F96302] underline">
            {siteSettings.phone}
          </a>{" "}
          for a same-day inspection.
        </p>
      </Section>

      {/* Quick stats strip · skim-readable credibility band */}
      <Section bg="black" size="sm">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { value: "5 / 5", label: "EBMUD service columns" },
            { value: "23", label: "Years across the East Bay" },
            { value: "6", label: "PSL service area cities" },
            { value: "24 / 7", label: "Emergency response" },
          ].map((stat) => (
            <div key={stat.label} className="border-l-2 border-[#F96302] pl-5">
              <p className="font-display text-5xl font-black uppercase tracking-tight text-white md:text-6xl">
                {stat.value}
              </p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-white/60">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* H2: What EBMUD PSL compliance is */}
      <Section bg="light-gray" size="lg" narrow>
        <SectionHeading
          eyebrow="The Program"
          title="What EBMUD PSL Compliance Is, and Who Needs It."
        />
        <div className="prose-section font-sans text-xl leading-relaxed text-[#333333] md:text-lg">
          <p className="mb-5">
            EBMUD&apos;s Private Sewer Lateral Program is a regional ordinance that requires property owners in the
            EBMUD wastewater service area to have a properly functioning sewer lateral. The lateral is the pipe that
            runs from your house to the city&apos;s sanitary sewer main, usually under the street. When that pipe leaks
            or breaks, sewage and groundwater mix where they should not. The PSL ordinance is how the region keeps that
            from happening at scale.
          </p>
          <p className="mb-5">
            Compliance is triggered by four events:
          </p>
        </div>
        <ol className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {triggerEvents.map((event, i) => (
            <li
              key={event.title}
              className="relative flex flex-col rounded-2xl border border-[#E5E5E5] bg-white p-6 md:p-7"
            >
              <span className="absolute -top-3 left-6 inline-flex items-center justify-center bg-[#F96302] px-3 py-1 font-display text-sm font-black uppercase tracking-wide text-white">
                {i + 1}
              </span>
              <h3 className="mt-3 font-display text-2xl font-black uppercase leading-tight tracking-tight text-black md:text-3xl">
                {event.title}
              </h3>
              <p className="mt-3 text-xl leading-relaxed text-[#333333]">{event.detail}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 font-sans text-xl leading-relaxed text-[#333333] md:text-lg">
          The compliance certificate is the document that proves your lateral meets EBMUD standards. EBMUD issues it
          after a contractor performs the inspection, repairs or replaces what needs fixing, and the work passes a
          pressure or water test witnessed by both the city inspector and EBMUD&apos;s field inspector. Once issued,
          the certificate is valid for 20 years if the work was a complete replacement, or 7 years if the lateral
          passed via repair or original test.
        </p>
      </Section>

      {/* On-brand divider · thin orange line with center diamond */}
      <div className="bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-6 py-10 md:py-14">
          <div className="h-px w-12 bg-[#F96302]" aria-hidden="true"></div>
          <div className="mx-3 h-2 w-2 rotate-45 bg-[#F96302]" aria-hidden="true"></div>
          <div className="h-px w-12 bg-[#F96302]" aria-hidden="true"></div>
        </div>
      </div>

      {/* Pull quote · transition from "the program" to "the license" */}
      <Section bg="white" size="md" narrow>
        <blockquote className="border-l-4 border-[#F96302] pl-7 md:pl-9">
          <p className="font-display text-4xl font-black uppercase leading-[1.05] tracking-tight text-black md:text-5xl">
            The lateral runs from your house, through your yard, and continues under the sidewalk into the street.
          </p>
          <p className="mt-5 font-sans text-lg leading-relaxed text-[#666666] md:text-xl">
            Most plumbers cannot legally touch the part in the public right-of-way. We can.
          </p>
        </blockquote>
      </Section>

      {/* H2: Why two licenses matter */}
      <Section bg="white" size="lg" narrow>
        <SectionHeading
          eyebrow="The License Stack"
          title="Why a Single Crew with Both Licenses Matters."
        />
        <p className="font-sans text-xl leading-relaxed text-[#333333] md:text-lg">
          Most plumbers can do part of the work. Fewer can do all of it. The piece that splits the market is the
          section of lateral between your property line and the city main. That stretch sits in the public
          right-of-way (the street, the sidewalk, sometimes a parkway strip). Working in the right-of-way requires
          an A General Engineering license from the California Contractors State License Board. C-36-only plumbers
          cannot legally do that work themselves. They have to subcontract it.
        </p>
        <p className="mt-4 font-sans text-xl leading-relaxed text-[#333333] md:text-lg">
          Subcontracting works, but it adds scheduling friction, two sets of insurance, two sets of warranties, and
          often a markup on the right-of-way portion. A single licensed crew handling the entire lateral is faster and
          clearer in scope. Z and Z holds both licenses under one CSLB number, {siteSettings.cslb}:
        </p>
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          <article className="rounded-2xl border border-[#E5E5E5] bg-white p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center bg-[#F5F5F5]">
                <ShieldCheck className="h-6 w-6 text-[#F96302]" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <p className="font-display text-3xl font-black uppercase tracking-tight text-black">C-36</p>
            </div>
            <p className="mt-3 font-sans text-base font-bold uppercase tracking-[0.08em] text-[#666666]">
              Plumbing · Since 2007
            </p>
            <p className="mt-2 text-xl leading-relaxed text-[#333333]">
              Covers plumbing inside your property line. Sinks, fixtures, water heaters, drain lines on your side of
              the curb.
            </p>
          </article>
          <article className="rounded-2xl border-2 border-[#F96302] bg-white p-7 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center bg-[#F96302] text-white">
                <Award className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <p className="font-display text-3xl font-black uppercase tracking-tight text-black">A General</p>
            </div>
            <p className="mt-3 font-sans text-base font-bold uppercase tracking-[0.08em] text-[#F96302]">
              General Engineering · Since 2012
            </p>
            <p className="mt-2 text-xl leading-relaxed text-[#333333]">
              Covers civil engineering work in the public right-of-way. Trenching in the street. Excavating to the
              city main. <strong>Most plumbers do not hold this license.</strong>
            </p>
          </article>
        </div>
        <p className="mt-6 font-sans text-base text-[#666666]">
          Verify both licenses directly at{" "}
          <a
            href="https://www.cslb.ca.gov/onlineservices/checklicenseII/checklicense.aspx"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#F96302] underline hover:text-[#e05602]"
          >
            cslb.ca.gov
          </a>
          {" "}using license number 896116.
        </p>
      </Section>

      {/* EBMUD list entry · receipt-style credibility moment */}
      <Section bg="black" size="md" narrow>
        <p className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#F96302] mb-5">
          Our entry on EBMUD&apos;s official PSL Contractor List · August 2025
        </p>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-7 md:p-9">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <p className="font-display text-3xl font-black uppercase leading-tight tracking-tight text-white md:text-4xl">
                Z and Z Plumbing
              </p>
              <p className="mt-4 font-sans text-sm font-bold uppercase tracking-[0.12em] text-white/50">
                Contact information
              </p>
              <p className="mt-2 text-base text-white/85">License: 896116</p>
              <p className="text-base text-white/85">(510) 708-4237</p>
              <p className="text-base text-white/85">3057 Teagarden St</p>
              <p className="text-base text-white/85">San Leandro, CA 94577</p>
            </div>
            <div>
              <p className="font-sans text-sm font-bold uppercase tracking-[0.12em] text-white/50">
                Services certified
              </p>
              <ul className="mt-3 space-y-3">
                {[
                  "Residential PSL testing",
                  "Private main and private manhole testing",
                  "Commercial property PSL testing",
                  "PSL maps for HOAs and multilateral properties",
                  "CAP and CAWP documentation",
                ].map((service) => (
                  <li key={service} className="flex items-start gap-3">
                    <CheckCircle
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#F96302]"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    <span className="text-base text-white">
                      {service}
                      <span className="ml-2 font-display text-sm font-black tracking-wide text-[#F96302]">Y</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-5 text-sm text-white/50">
          Verify our entry directly at{" "}
          <a
            href="https://www.eastbaypsl.com/doc/ContractorList.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[#F96302] underline hover:text-[#e05602]"
          >
            eastbaypsl.com/doc/ContractorList.pdf
          </a>
          .
        </p>
      </Section>

      {/* H2: Full coverage on EBMUD list */}
      <Section bg="light-gray" size="lg" narrow>
        <SectionHeading
          eyebrow="EBMUD Contractor List"
          title="Full Service Coverage on All Five Rated Categories."
          description="The EBMUD PSL Contractor List rates every contractor across five service categories. Z and Z is marked Y in all five."
        />
        <ul className="grid grid-cols-1 gap-4">
          {coverageRows.map((row) => (
            <li
              key={row.label}
              className="flex items-start gap-4 rounded-2xl border border-[#E5E5E5] bg-white p-5 md:p-6"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-[#F96302] text-white">
                <CheckCircle className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
              </div>
              <div>
                <p className="font-display text-xl font-black uppercase leading-tight tracking-tight text-black md:text-2xl">
                  {row.label}
                </p>
                <p className="mt-2 text-lg leading-relaxed text-[#333333]">{row.description}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-8 border-l-4 border-[#F96302] bg-white p-6">
          <p className="font-display text-xl font-black uppercase tracking-tight text-black md:text-2xl">
            Two notes on what list inclusion means.
          </p>
          <p className="mt-3 text-lg leading-relaxed text-[#333333]">
            First, EBMUD does not endorse any contractor and does not represent that inclusion on the list reflects
            skill or quality (that is their language, not ours). What inclusion does mean is that the contractor has
            voluntarily certified each service column and committed to following PSL Program procedures. Second, you
            are responsible for confirming any contractor you hire is currently eligible to perform PSL inspections.
            We confirm our own eligibility before every job we quote.
          </p>
          <p className="mt-4 text-base text-[#666666]">
            Verify our entry directly in the current contractor list at{" "}
            <a
              href="https://www.eastbaypsl.com/doc/ContractorList.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#F96302] underline hover:text-[#e05602]"
            >
              eastbaypsl.com/doc/ContractorList.pdf
            </a>
            .
          </p>
        </div>
      </Section>

      {/* H2: Process steps */}
      <Section bg="white" size="lg">
        <SectionHeading
          eyebrow="End to End"
          title="The Compliance Process, Step by Step."
          description="From your first phone call to a filed EBMUD compliance certificate."
        />
        <ol className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-5">
          {processSteps.map((step) => {
            const Icon = step.icon;
            return (
              <li
                key={step.step}
                className="relative flex flex-col rounded-2xl border border-[#E5E5E5] bg-[#F5F5F5] p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-9 w-9 items-center justify-center bg-black font-display text-base font-black uppercase tracking-wide text-white">
                    {step.step}
                  </span>
                  <Icon className="h-6 w-6 text-[#F96302]" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-display text-xl font-black uppercase leading-tight tracking-tight text-black">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-[#F96302]">{step.timing}</p>
                <p className="mt-3 text-lg leading-relaxed text-[#333333]">{step.detail}</p>
              </li>
            );
          })}
        </ol>
      </Section>

      {/* Mid-page CTA card */}
      <Section bg="hero-orange" size="md">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center bg-black text-white">
              <AlertTriangle className="h-6 w-6 text-[#F96302]" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <div>
              <p className="font-display text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
                Closing date pressure?
              </p>
              <p className="mt-2 max-w-2xl text-base text-white/85">
                Call {siteSettings.phone}. We can have a camera inspection and a written quote in your hands within
                24 hours and work directly with your title company and EBMUD&apos;s compliance office.
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

      {/* H2: Pricing */}
      <Section bg="white" size="lg" narrow>
        <SectionHeading
          eyebrow="Transparent Pricing"
          title="What EBMUD PSL Work Typically Costs in the East Bay."
          description="Every job is different. Below are the typical East Bay ranges by job type. We quote every job up front in writing."
        />
        <div className="overflow-hidden rounded-2xl border border-[#E5E5E5]">
          <table className="w-full text-left">
            <thead className="bg-black text-white">
              <tr>
                <th className="px-5 py-4 font-display text-sm font-black uppercase tracking-[0.12em] md:px-6">
                  Job type
                </th>
                <th className="px-5 py-4 text-right font-display text-sm font-black uppercase tracking-[0.12em] md:px-6">
                  Typical range
                </th>
              </tr>
            </thead>
            <tbody>
              {pricingRows.map((row, i) => (
                <tr key={row.label} className={i % 2 === 0 ? "bg-white" : "bg-[#F5F5F5]"}>
                  <td className="px-5 py-4 font-sans text-base text-[#333333] md:px-6">{row.label}</td>
                  <td className="px-5 py-4 text-right font-sans text-lg font-extrabold leading-snug text-black md:px-6">
                    {row.range}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-[#666666]">
          Inspection range is from EBMUD&apos;s own guidance. Repair and replacement ranges are based on East Bay
          market rates Z and Z has seen over two decades of PSL work. Every job is quoted in writing before work
          begins.
        </p>
      </Section>

      {/* H2: Coverage area */}
      <Section bg="light-gray" size="lg" narrow>
        <SectionHeading
          eyebrow="Service Area"
          title="Where We Do EBMUD PSL Work."
          description="The EBMUD wastewater service area covers six East Bay jurisdictions. We work in all of them."
        />
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {coverageAreas.map((area) => (
            <li
              key={area.city}
              className="flex items-start gap-3 rounded-2xl border border-[#E5E5E5] bg-white p-5"
            >
              <MapPin className="h-5 w-5 flex-shrink-0 text-[#F96302]" strokeWidth={1.5} aria-hidden="true" />
              <div>
                <p className="font-display text-xl font-black uppercase leading-tight tracking-tight text-black">
                  {area.city}
                </p>
                <p className="mt-1 text-sm text-[#666666]">{area.note}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6 font-sans text-base text-[#666666]">
          Z and Z is headquartered in San Leandro, and the rest of the East Bay is also our standard service area.
          PSL compliance specifically applies to properties inside the EBMUD wastewater service area listed above.
        </p>
      </Section>

      {/* On-brand divider · before the FAQ to mark a content shift */}
      <div className="bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-6 py-10 md:py-14">
          <div className="h-px w-12 bg-[#F96302]" aria-hidden="true"></div>
          <div className="mx-3 h-2 w-2 rotate-45 bg-[#F96302]" aria-hidden="true"></div>
          <div className="h-px w-12 bg-[#F96302]" aria-hidden="true"></div>
        </div>
      </div>

      {/* FAQ */}
      <Section bg="white" size="lg" narrow>
        <SectionHeading
          eyebrow="EBMUD PSL FAQ"
          title="Common Questions."
        />
        <FaqAccordion items={faqs} />
      </Section>

      {/* Internal links block */}
      <Section bg="light-gray" size="md">
        <SectionHeading eyebrow="Related" title="Keep Reading." />
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Sewer Lateral in Oakland", href: "/sewer-lateral-oakland/" },
            { label: "Sewer Lateral Service Hub", href: "/services/sewer-lateral/" },
            { label: "Plumber in Oakland", href: "/plumber-oakland-ca/" },
            { label: "All East Bay Service Areas", href: "/service-areas/" },
          ].map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex min-h-20 items-center justify-between gap-4 border border-[#D8D8D8] bg-white px-5 py-5 font-sans text-lg font-extrabold leading-snug text-black transition-colors duration-150 hover:border-[#F96302] hover:text-[#F96302] md:px-6 md:text-xl"
              >
                <span>{link.label}</span>
                <ChevronRight className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
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

      {/* Final CTA band */}
      <Section bg="black" size="md">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-4xl font-black uppercase leading-tight text-white md:text-5xl">
              On the EBMUD List. Full Coverage. One Crew.
            </h2>
            <p className="mt-2 max-w-2xl font-sans text-base text-white/75">
              23 years across the East Bay. {siteSettings.cslb}. Call {siteSettings.phone}.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="primary"
              size="lg"
              href={`tel:${siteSettings.phoneTel}`}
              icon={<Phone className="h-5 w-5" />}
              external
            >
              Call now
            </Button>
            <Button variant="inverse" size="lg" href="/contact/?service=ebmud-psl">
              Schedule inspection
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
