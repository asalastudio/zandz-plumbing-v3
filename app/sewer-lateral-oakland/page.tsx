import type { Metadata } from "next";
import Link from "next/link";
import {
  Phone,
  ShieldCheck,
  AlertTriangle,
  Wrench,
  ChevronRight,
  Camera,
  Hammer,
  FileCheck,
  ClipboardList,
} from "lucide-react";
import { Section, SectionHeading } from "@/components/Section";
import { Button } from "@/components/Button";
import { TrustStrip } from "@/components/TrustStrip";
import { FaqAccordion } from "@/components/FaqAccordion";
import type { FaqItem } from "@/components/FaqAccordion";
import { TestimonialCard } from "@/components/TestimonialCard";
import { siteSettings } from "@/content/site-settings";
import { testimonials } from "@/content/testimonials";

export const metadata: Metadata = {
  title: "Sewer Lateral Oakland CA · EBMUD Compliance | Z and Z Plumbing",
  description:
    "EBMUD sewer lateral repair and compliance certificates in Oakland. Z and Z holds the rare A General Engineering license that legally covers street-side work. Call (510) 708-4237.",
  alternates: { canonical: `${siteSettings.siteUrl}/sewer-lateral-oakland/` },
  openGraph: {
    title: "Sewer Lateral Oakland · EBMUD Compliance | Z and Z Plumbing",
    description:
      "One crew, both licenses. C-36 plumbing plus A General Engineering. We handle the entire lateral, including the portion in the public right-of-way most plumbers cannot legally touch.",
    url: `${siteSettings.siteUrl}/sewer-lateral-oakland/`,
    type: "website",
  },
};

const PAGE_URL = `${siteSettings.siteUrl}/sewer-lateral-oakland/`;

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${siteSettings.siteUrl}/` },
    { "@type": "ListItem", position: 2, name: "Services", item: `${siteSettings.siteUrl}/services/` },
    { "@type": "ListItem", position: 3, name: "Sewer Lateral Oakland", item: PAGE_URL },
  ],
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${PAGE_URL}#service`,
  name: "Sewer Lateral Repair and EBMUD Compliance, Oakland",
  serviceType: "Sewer lateral repair and compliance certification",
  description:
    "EBMUD sewer lateral compliance certificates, repair, and trenchless replacement in Oakland, California. Z and Z Plumbing holds both the C-36 plumbing and A General Engineering CSLB licenses (CSLB #896116), allowing legal work in the public right-of-way most plumbers must subcontract.",
  url: PAGE_URL,
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
    "@type": "City",
    name: "Oakland",
    containedInPlace: { "@type": "State", name: "California" },
  },
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: "400",
    highPrice: "80000",
    offerCount: "6",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Sewer lateral services Oakland",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Sewer lateral CCTV inspection Oakland" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "EBMUD compliance certificate filing Oakland" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Trenchless sewer lateral repair Oakland" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Open-trench sewer lateral replacement Oakland" } },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Right-of-way sewer connection repair Oakland (A General Engineering)",
        },
      },
    ],
  },
};

const failureModes = [
  {
    title: "Offset joints in the parkway strip",
    detail:
      "The parkway is the planting strip between sidewalk and curb. Heavy trees pull clay joints apart through ground settling. Most common in Rockridge, Temescal, Montclair, and the older parts of Glenview. Repair is a spot dig and new joint, or a trenchless reline if the rest of the run is sound.",
  },
  {
    title: "Root intrusion at clay-to-iron transitions",
    detail:
      "Oakland homes built in the 1920s through 1950s often have clay laterals connecting to a cast-iron stack near the foundation. The transition joint is a magnet for root intrusion. Hydrojetting clears it temporarily; the permanent fix is a relined or replaced transition.",
  },
  {
    title: "Partial collapse near the city main",
    detail:
      "The portion under the street that connects to Oakland's main is where decades of traffic load and settling do the most damage. Common in the older flatland streets. Requires excavation in the right-of-way, which is the A General Engineering work.",
  },
  {
    title: "Failed saddle connections",
    detail:
      "Older Oakland properties were tapped into the main with a clay or iron saddle. When the saddle cracks, you get sewer backup plus street infiltration. Repair requires Oakland Public Works coordination, an A-license excavation, and a proper main-line tap installed.",
  },
  {
    title: "Non-compliant wyes from prior renovations",
    detail:
      "When a previous owner added a bathroom or kitchen, the new line was sometimes tied in with a code-deficient wye fitting. The connection holds for years, then fails. We re-cut the connection and install code-compliant fittings during the repair.",
  },
];

const processSteps = [
  {
    icon: Camera,
    step: "1",
    title: "Camera inspection",
    days: "Same or next day",
    detail:
      "We run a CCTV camera from the cleanout to the city main, document every failure with location and severity, and send you a recorded video. Inspection typically runs 60 to 90 minutes.",
  },
  {
    icon: ClipboardList,
    step: "2",
    title: "Written quote",
    days: "Day 1 to 3",
    detail:
      "A not-to-exceed price, clearly broken into property-side work (C-36) and right-of-way work (A General Engineering). If trenchless reline is an option, we quote that alternative with the trade-offs explained.",
  },
  {
    icon: FileCheck,
    step: "3",
    title: "Oakland Public Works permits",
    days: "Day 3 to 5",
    detail:
      "We pull permits directly with Oakland Public Works because we are a permitted A contractor. You do not coordinate with the city. We do.",
  },
  {
    icon: Hammer,
    step: "4",
    title: "Repair on site",
    days: "Day 5 to 10",
    detail:
      "Most lateral jobs run 2 to 4 working days on site. Trenchless relines finish in 1 day when the lateral is otherwise sound. Open-trench in the street adds 1 to 2 days for backfill and Oakland-standard pavement restoration.",
  },
  {
    icon: ShieldCheck,
    step: "5",
    title: "EBMUD certificate filed",
    days: "Day 10 to 14",
    detail:
      "We file the compliance certificate with EBMUD's Wastewater Capacity Charge office. You receive the certificate by mail, valid for 20 years. Your real-estate transaction can close.",
  },
];

const pricingRows: { label: string; range: string }[] = [
  { label: "Camera inspection only", range: "$400 to $800" },
  { label: "Spot repair (one failure point, property-side)", range: "$3,500 to $8,000" },
  { label: "Trenchless reline (40 to 60 ft lateral)", range: "$9,000 to $18,000" },
  { label: "Open-trench replacement, property-side only", range: "$7,000 to $15,000" },
  { label: "Open-trench replacement including street section", range: "$15,000 to $35,000" },
  { label: "Complex repair with multiple failure points + main-side reconstruction", range: "$25,000 to $80,000" },
];

const faqs: FaqItem[] = [
  {
    question: "Do I need an EBMUD sewer lateral compliance certificate to sell my Oakland home?",
    answer:
      "In nearly all cases, yes. Oakland's Private Sewer Lateral ordinance requires a compliance certificate at point-of-sale unless the home was built after 2007 and has documented certification from construction. The certificate is valid for 20 years from issue. We handle inspection, any required repair, and certificate filing.",
  },
  {
    question: "How long does the sewer lateral inspection take?",
    answer:
      "The inspection itself runs 60 to 90 minutes. We arrive with a CCTV camera rig, locate or excavate to the cleanout, and run the camera the full length of the lateral to the city main. You get a recorded video and a written summary the same day.",
  },
  {
    question: "What happens if my lateral fails the inspection?",
    answer:
      "You receive a written list of specific failure points with location and recommended repair. You typically have 21 to 90 days from the failure date to complete repairs and re-file for certification, depending on whether the trigger was a point-of-sale, a remodel permit, or a city-issued notice.",
  },
  {
    question: "Why does the A General Engineering license matter for sewer lateral work in Oakland?",
    answer:
      "Sewer laterals run from your house, through your yard, and continue under the sidewalk and into the street to connect to Oakland's main sewer line. The portion in the public right-of-way legally requires the A General Engineering license to repair. Most plumbing companies in Oakland only hold the C-36 plumbing license, so they sub-contract the right-of-way portion to another contractor. We hold both, so one crew handles the entire repair.",
  },
  {
    question: "What is the difference between trenchless and open-trench sewer lateral repair?",
    answer:
      "Trenchless inserts a new pipe inside the existing one using cured-in-place pipe or pipe bursting. Minimal digging, faster, less yard damage. Works only when the existing lateral has the right alignment and structural integrity. Open-trench digs up and directly replaces the existing lateral. Slower and more invasive, but works regardless of pipe condition. We quote both options when both are viable so you can pick.",
  },
  {
    question: "Do you handle Oakland Public Works permitting?",
    answer:
      "Yes. As a CSLB-licensed A General Engineering contractor we pull the encroachment permit and coordinate inspections with Oakland Public Works directly. You do not talk to the city. We do.",
  },
  {
    question: "How long does the full repair take?",
    answer:
      "From first phone call to filed EBMUD certificate is typically 7 to 14 business days, sometimes less when the lateral is in good shape and only needs certification. The actual excavation and repair work usually runs 2 to 4 working days on site.",
  },
  {
    question: "Are you EBMUD-approved?",
    answer:
      "EBMUD does not certify contractors. It certifies completed laterals. What matters for the contractor is the CSLB licensing (C-36 and A General Engineering) and Oakland Public Works permitting authority, both of which we hold.",
  },
];

export default function SewerLateralOaklandPage() {
  const oaklandTestimonials = testimonials.filter((t) => t.authorCity.toLowerCase() === "oakland");

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
          <span className="text-white">Sewer Lateral Oakland</span>
        </nav>
        <p className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#F96302] mb-4">
          Oakland Sewer Lateral · EBMUD Compliance
        </p>
        <h1 className="max-w-5xl font-display text-5xl md:text-7xl font-black uppercase leading-none tracking-tight text-white">
          Sewer Lateral Repair in Oakland. EBMUD Compliant. Both Licenses. One Crew.
        </h1>
        <p className="mt-6 max-w-3xl font-sans text-xl leading-relaxed text-white/80 md:text-2xl">
          Most Oakland plumbers can only work up to your property line. Z and Z holds A General Engineering plus C-36,
          which means we legally handle the entire lateral, including the portion in the street that connects to
          Oakland&apos;s main.
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
          <Button variant="inverse" size="xl" href="/contact/">
            Get a Quote in 24 Hours
          </Button>
        </div>
        <p className="mt-6 max-w-3xl text-sm font-semibold uppercase tracking-[0.12em] text-white/55">
          {siteSettings.cslb} · C-36 + A General Engineering · Oakland Public Works approved contractor · Since 2003
        </p>
      </Section>

      {/* Opening paragraph */}
      <Section bg="white" size="lg" narrow>
        <p className="font-sans text-lg leading-relaxed text-[#333333] md:text-xl">
          If you are searching for sewer lateral repair in Oakland, you are usually doing it for one of three reasons:
          a real-estate inspector flagged your lateral during a sale, you are getting recurring backups that augering
          will not fix, or the city sent you a Private Sewer Lateral compliance notice. In every case, you need a
          contractor who can do the whole job, not just the part on your property. Z and Z Plumbing is one of the few
          East Bay contractors that holds both the C-36 plumbing license and the A General Engineering license
          ({siteSettings.cslb}), which gives us legal authority to work in the public right-of-way between your property
          line and the city main. That is the part of your lateral other plumbers must subcontract. Call us at{" "}
          <a href={`tel:${siteSettings.phoneTel}`} className="font-bold text-[#F96302] underline">
            {siteSettings.phone}
          </a>{" "}
          for same-day inspection.
        </p>
      </Section>

      {/* H2: EBMUD compliance ordinance */}
      <Section bg="light-gray" size="lg" narrow>
        <SectionHeading
          eyebrow="The Ordinance"
          title="What Oakland's Sewer Lateral Compliance Ordinance Requires."
        />
        <div className="prose-section font-sans text-lg leading-relaxed text-[#333333] md:text-lg">
          <p className="mb-5">
            Oakland&apos;s Private Sewer Lateral ordinance is enforced by the East Bay Municipal Utility District
            (EBMUD) under the Wastewater Capacity Charge Program. A compliance certificate is required at three trigger
            points:
          </p>
          <ol className="ml-6 list-decimal space-y-3 mb-6">
            <li>
              <strong>Point of sale.</strong> Most common. Before you can close on a sale of property in Oakland, the
              lateral has to be inspected and certified. The certificate is valid for 20 years from issue.
            </li>
            <li>
              <strong>Major remodel.</strong> If your remodel adds bathrooms or significantly increases plumbing
              fixtures, EBMUD may require compliance verification as part of the permit.
            </li>
            <li>
              <strong>Failed lateral.</strong> If a backup or city sewer inspection identifies your lateral as the
              source, you have a fixed window (typically 21 to 90 days) to bring it into compliance.
            </li>
          </ol>
          <p className="mb-5">
            The compliance process has three steps: camera inspection from cleanout to city main, repair of any failed
            sections (joint failures, root intrusion, partial collapses, settling, offset connections), and final
            certificate filing with EBMUD&apos;s Wastewater Capacity Charge office.
          </p>
          <div className="mt-8 border-l-4 border-[#F96302] bg-white p-6">
            <p className="font-display text-xl font-black uppercase tracking-tight text-black md:text-2xl">
              The catch most homeowners discover too late.
            </p>
            <p className="mt-3 text-lg leading-relaxed text-[#333333]">
              The lateral runs from your house, across your yard, and continues under the sidewalk and into the street
              to where it joins Oakland&apos;s city main. Failures often happen in that street-side section because of
              tree roots, ground settling near the curb, and the older clay pipe Oakland used for decades. Repairing the
              street-side portion legally requires the A General Engineering classification. Without it, the contractor
              has to subcontract the right-of-way work to a separate company, which doubles coordination and adds a
              markup.
            </p>
          </div>
        </div>
      </Section>

      {/* H2: Why two licenses matter */}
      <Section bg="white" size="lg" narrow>
        <SectionHeading
          eyebrow="The License Stack"
          title="Why Two Licenses on One Crew Matters."
        />
        <p className="font-sans text-lg leading-relaxed text-[#333333] md:text-lg">
          The CSLB issues a separate classification for each type of work a contractor is qualified to do. The two
          relevant ones here:
        </p>
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          <article className="rounded-2xl border border-[#E5E5E5] bg-white p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center bg-[#F5F5F5]">
                <Wrench className="h-6 w-6 text-[#F96302]" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <p className="font-display text-3xl font-black uppercase tracking-tight text-black">C-36</p>
            </div>
            <p className="mt-3 font-sans text-base font-bold uppercase tracking-[0.08em] text-[#666666]">
              Plumbing
            </p>
            <p className="mt-2 text-lg leading-relaxed text-[#333333]">
              Covers plumbing inside your property line. Sinks, fixtures, water heaters, drain lines on your side of the
              curb. Every California plumber has this.
            </p>
          </article>
          <article className="rounded-2xl border-2 border-[#F96302] bg-white p-7 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center bg-[#F96302] text-white">
                <ShieldCheck className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <p className="font-display text-3xl font-black uppercase tracking-tight text-black">A General</p>
            </div>
            <p className="mt-3 font-sans text-base font-bold uppercase tracking-[0.08em] text-[#F96302]">
              General Engineering
            </p>
            <p className="mt-2 text-lg leading-relaxed text-[#333333]">
              Covers civil engineering work in the public right-of-way. Trenching in the street. Excavating to the city
              main. Work on the public-utility-owned portion of your service connection.{" "}
              <strong>Most plumbers do NOT hold this license.</strong>
            </p>
          </article>
        </div>
        <p className="mt-8 font-sans text-lg leading-relaxed text-[#333333] md:text-lg">
          Z and Z Plumbing has held both since 2012. {siteSettings.cslb}. You can verify directly at{" "}
          <a
            href="https://www.cslb.ca.gov/onlineservices/checklicenseII/checklicense.aspx"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#F96302] underline hover:text-[#e05602]"
          >
            cslb.ca.gov
          </a>
          .
        </p>
        <p className="mt-4 font-sans text-lg leading-relaxed text-[#333333] md:text-lg">
          What this means for your sewer lateral job: one crew, one truck, one permit pull at Oakland Public Works, one
          set of inspections, one quote, one invoice. Not a primary plumber plus a subcontractor chain that adds a week
          to your timeline and 10 to 15 percent to your bill.
        </p>
      </Section>

      {/* H2: 5 failure modes */}
      <Section bg="light-gray" size="lg">
        <SectionHeading
          eyebrow="Common Failure Modes"
          title="The Five Sewer Lateral Failures We Repair Most in Oakland."
          description="After 23 years of pulling laterals in Oakland, the failure modes are predictable."
        />
        <ol className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {failureModes.map((mode, i) => (
            <li
              key={mode.title}
              className="relative flex flex-col rounded-2xl border border-[#E5E5E5] bg-white p-6 md:p-7"
            >
              <span className="absolute -top-3 left-6 inline-flex items-center justify-center bg-[#F96302] px-3 py-1 font-display text-sm font-black uppercase tracking-wide text-white">
                {i + 1}
              </span>
              <h3 className="mt-3 font-display text-2xl font-black uppercase leading-tight tracking-tight text-black md:text-3xl">
                {mode.title}
              </h3>
              <p className="mt-3 text-lg leading-relaxed text-[#333333]">{mode.detail}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* H2: Process timeline */}
      <Section bg="white" size="lg">
        <SectionHeading
          eyebrow="End to End"
          title="What the Process Looks Like."
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
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-[#F96302]">{step.days}</p>
                <p className="mt-3 text-base leading-relaxed text-[#333333]">{step.detail}</p>
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
                Time-pressed by a closing date?
              </p>
              <p className="mt-2 max-w-2xl text-base text-white/85">
                Call {siteSettings.phone}. We can have a camera inspection and a quote in your hands within 24 hours,
                and we work directly with your title company and EBMUD&apos;s compliance office.
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

      {/* Pricing transparency */}
      <Section bg="white" size="lg" narrow>
        <SectionHeading
          eyebrow="Transparent Pricing"
          title="What an Oakland Sewer Lateral Job Typically Costs."
          description="Every job is different. Below are the typical Oakland ranges by job type. We quote every job up front with a not-to-exceed price."
        />
        <div className="overflow-hidden rounded-2xl border border-[#E5E5E5]">
          <table className="w-full text-left">
            <thead className="bg-black text-white">
              <tr>
                <th className="px-5 py-4 font-display text-sm font-black uppercase tracking-[0.12em] md:px-6">
                  Job type
                </th>
                <th className="px-5 py-4 text-right font-display text-sm font-black uppercase tracking-[0.12em] md:px-6">
                  Typical Oakland range
                </th>
              </tr>
            </thead>
            <tbody>
              {pricingRows.map((row, i) => (
                <tr
                  key={row.label}
                  className={i % 2 === 0 ? "bg-white" : "bg-[#F5F5F5]"}
                >
                  <td className="px-5 py-4 font-sans text-base text-[#333333] md:px-6">{row.label}</td>
                  <td className="px-5 py-4 text-right font-display text-base font-black uppercase tracking-tight text-black md:px-6">
                    {row.range}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-[#666666]">
          Selling your home and time-pressed? We can usually deliver a quote within 24 hours of inspection.
        </p>
      </Section>

      {/* Social proof (Oakland-filtered testimonials) */}
      {oaklandTestimonials.length > 0 && (
        <Section bg="light-gray" size="lg">
          <SectionHeading eyebrow="Oakland Reviews" title="What Oakland Customers Say." />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {oaklandTestimonials.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </Section>
      )}

      {/* FAQ */}
      <Section bg="white" size="lg" narrow>
        <SectionHeading
          eyebrow="Oakland Sewer Lateral FAQ"
          title="Common Questions."
        />
        <FaqAccordion items={faqs} />
      </Section>

      {/* Internal links block */}
      <Section bg="light-gray" size="md">
        <SectionHeading eyebrow="Related" title="Keep Reading." />
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Plumber in Oakland", href: "/plumber-oakland-ca/" },
            { label: "Sewer Lateral Service Hub", href: "/services/sewer-lateral/" },
            { label: "All East Bay Service Areas", href: "/service-areas/" },
            { label: "Contact Z and Z", href: "/contact/" },
          ].map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex items-center justify-between gap-2 border border-[#E5E5E5] bg-white px-5 py-4 font-display text-base font-black uppercase tracking-tight text-black transition-colors duration-150 hover:border-[#F96302] hover:text-[#F96302]"
              >
                <span>{link.label}</span>
                <ChevronRight className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
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
              One Crew. Both Licenses. EBMUD Compliant.
            </h2>
            <p className="mt-2 max-w-2xl font-sans text-base text-white/75">
              23 years in Oakland. {siteSettings.cslb}. Call {siteSettings.phone}.
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
              Call Now
            </Button>
            <Button variant="inverse" size="lg" href="/contact/">
              Get a Quote
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
