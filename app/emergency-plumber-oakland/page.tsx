import type { Metadata } from "next";
import Link from "next/link";
import {
  Phone,
  AlertTriangle,
  Droplet,
  Flame,
  Wrench,
  Clock,
  Navigation,
  ChevronRight,
  ShieldCheck,
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
  title: "24/7 Emergency Plumber Oakland CA | Same Crew | Z and Z Plumbing",
  description:
    "24/7 emergency plumber in Oakland. Burst pipes, sewer backups, water heater failure, gas leaks. Z and Z answers the phone, dispatches from San Leandro, and runs both licenses. Call (510) 708-4237.",
  alternates: { canonical: `${siteSettings.siteUrl}/emergency-plumber-oakland/` },
  openGraph: {
    title: "24/7 Emergency Plumber in Oakland | Z and Z Plumbing",
    description:
      "A plumber answers the phone. Two California licenses, one crew, same number 24 hours a day across Oakland.",
    url: `${siteSettings.siteUrl}/emergency-plumber-oakland/`,
    type: "website",
  },
};

const PAGE_URL = `${siteSettings.siteUrl}/emergency-plumber-oakland/`;

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${siteSettings.siteUrl}/` },
    { "@type": "ListItem", position: 2, name: "Services", item: `${siteSettings.siteUrl}/services/` },
    { "@type": "ListItem", position: 3, name: "Emergency Plumber Oakland", item: PAGE_URL },
  ],
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${PAGE_URL}#service`,
  name: "24/7 Emergency Plumber, Oakland",
  serviceType: "Emergency plumbing service",
  description:
    "24/7 emergency plumbing service in Oakland, California. Burst pipes, sewer backups, water heater failure, gas leaks, and main water line breaks. Z and Z Plumbing dispatches from San Leandro under CSLB #896116 with C-36 and A General Engineering licenses.",
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
  hoursAvailable: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "00:00",
    closes: "23:59",
  },
};

const emergencyTypes = [
  {
    icon: Droplet,
    title: "Burst pipe or active leak",
    detail:
      "Water spraying or pooling, pressure dropping, ceiling staining. Shut off the main if you can locate it, then call. Burst pipe response is the fastest call we run.",
  },
  {
    icon: AlertTriangle,
    title: "Sewer backup",
    detail:
      "Sewage backing up into a tub, floor drain, or yard cleanout means the lateral is blocked or has failed. Stop using all drains and call. We carry hydrojet and camera gear on every emergency run.",
  },
  {
    icon: Wrench,
    title: "Water heater failure",
    detail:
      "Tank rupture, gas valve failure, T&P relief release, or no hot water in winter. We replace failed units same day in most cases when stock is available.",
  },
  {
    icon: Flame,
    title: "Gas line leak",
    detail:
      "If you smell gas, leave the building first, then call PG&E (1-800-743-5000) and the fire department. After you are safe, call us for the repair. We hold the A General Engineering license required for street-side gas line work.",
  },
  {
    icon: Navigation,
    title: "Main water line break",
    detail:
      "The line that runs from the street meter to your house. When it breaks, water can surface in the yard, the parkway strip, or the street. Repair often crosses the property line, which legally requires the A General Engineering classification we carry.",
  },
];

const responseSteps = [
  {
    step: "1",
    title: "Call",
    detail: `A plumber picks up. Not a call center. ${siteSettings.phone} routes straight to dispatch every hour of the day.`,
  },
  {
    step: "2",
    title: "Dispatch",
    detail:
      "We send the nearest available crew from our San Leandro yard. Most Oakland addresses see a 30 to 60 minute response window during the day, longer at night depending on traffic and active calls.",
  },
  {
    step: "3",
    title: "Containment guidance",
    detail:
      "While we are en route, the dispatcher walks you through what to shut off and what to move. Stopping the bleed is the priority before we arrive.",
  },
  {
    step: "4",
    title: "Assess on site",
    detail:
      "Camera, leak detection gear, gas sniffer, and pressure tools come on every emergency truck. We diagnose first, then explain what is needed before we touch anything paid.",
  },
  {
    step: "5",
    title: "Stabilize and quote",
    detail:
      "We stabilize the situation (cap a line, shut off gas, install a temporary fix) and then write a quote for the permanent repair. You decide whether to proceed tonight or schedule for daylight.",
  },
];

const neighborhoodCoverage = [
  { name: "West Oakland", note: "Older flatland sewer lines. Fast access from San Leandro via I-880." },
  { name: "East Oakland", note: "I-580 corridor coverage. Heavy industrial and residential mix." },
  { name: "Fruitvale", note: "Older clay laterals common. Same-day root and backup work." },
  { name: "Temescal", note: "Pre-war housing stock. Galvanized water lines and clay sewer." },
  { name: "Rockridge", note: "Heavy tree cover means recurring lateral root intrusion." },
  { name: "Grand Lake", note: "Mixed mid-century and craftsman. Slab leaks common." },
  { name: "Montclair", note: "Hillside homes. Pressure-regulator failures and slab leaks." },
  { name: "Glenview", note: "Older clay laterals. EBMUD point-of-sale work common." },
];

const faqs: FaqItem[] = [
  {
    question: "How fast can a Z and Z emergency plumber reach me in Oakland?",
    answer:
      "Most Oakland addresses see a 30 to 60 minute response window during business hours. After hours and at night, response can run longer depending on traffic and active calls already in progress. We dispatch from our San Leandro yard with route-ready trucks.",
  },
  {
    question: "Do you actually answer the phone at 2 AM?",
    answer:
      "Yes. A plumber picks up the phone, not a call center. Same number, same crew, every hour of the day, every day of the year.",
  },
  {
    question: "What should I do while I wait for the plumber?",
    answer:
      "If water is spraying or pooling, shut off the main water valve at the meter or where the line enters the house. If you smell gas, leave the building, then call PG&E (1-800-743-5000) and 911. The dispatcher will walk you through next steps when you call us.",
  },
  {
    question: "Is there an after-hours surcharge?",
    answer:
      "Emergency calls outside standard business hours and on weekends typically carry an after-hours rate. We tell you the rate when you call so there are no surprises on the invoice. The diagnostic and quote remain free of charge before paid work begins.",
  },
  {
    question: "Do you handle sewer backups and burst main water lines?",
    answer:
      "Yes. We hold both the C-36 plumbing license and the A General Engineering license, which legally covers work in the public right-of-way. That matters for main water line breaks at the curb and sewer lateral failures in the street. Most plumbers do not hold the A and have to subcontract that part of the job.",
  },
  {
    question: "Will you give me a quote before doing the work?",
    answer:
      "Always. We diagnose and stabilize first. Then we write a clear quote for the permanent repair. You decide whether to proceed immediately or schedule for daylight. We never start paid work without your approval.",
  },
  {
    question: "Can you handle gas leaks?",
    answer:
      "Yes, for the repair side. If you currently smell gas, leave the building first, call PG&E (1-800-743-5000) and 911. Once the area is safe and PG&E has shut off service, we hold the licensing to do interior and street-side gas line repair under the A General Engineering classification.",
  },
];

export default function EmergencyPlumberOaklandPage() {
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
          <span className="text-white">Emergency Plumber Oakland</span>
        </nav>
        <div className="flex items-center gap-3 mb-4">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#F96302]">
            24/7 Emergency Plumber · Oakland
          </p>
          <span className="inline-flex items-center bg-[#F96302] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white">
            We answer
          </span>
        </div>
        <h1 className="max-w-5xl font-display text-5xl md:text-7xl font-black uppercase leading-none tracking-tight text-white">
          24/7 Emergency Plumber in Oakland. We Answer the Phone.
        </h1>
        <p className="mt-6 max-w-3xl font-sans text-xl leading-relaxed text-white/80 md:text-2xl">
          Burst pipes, sewer backups, water heater failure, gas leaks, main water line breaks. Z and Z Plumbing
          dispatches from San Leandro 24 hours a day and runs both licenses on every truck. A plumber picks up the
          phone every hour of every day.
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
            Schedule Online
          </Button>
        </div>
        <p className="mt-6 max-w-3xl text-sm font-semibold uppercase tracking-[0.12em] text-white/55">
          {siteSettings.cslb} · C-36 + A General Engineering · 23 years in Oakland · Same crew on every call
        </p>
      </Section>

      {/* Opening paragraph */}
      <Section bg="white" size="lg" narrow>
        <p className="font-sans text-lg leading-relaxed text-[#333333] md:text-xl">
          Plumbing emergencies do not wait for business hours. A burst pipe at 2 AM, a sewer backup on Sunday morning,
          a water heater rupture on Thanksgiving. Z and Z Plumbing runs the same number for all of them. When you call{" "}
          <a href={`tel:${siteSettings.phoneTel}`} className="font-bold text-[#F96302] underline">
            {siteSettings.phone}
          </a>
          , a plumber picks up. Not a call center. Not a voicemail. Dispatch leaves the San Leandro yard and runs the
          most direct route to your Oakland address. Two California contractor licenses on every truck, which means the
          same crew handles property-side work, street-side work, and the public right-of-way without subcontracting.
        </p>
      </Section>

      {/* H2: Common emergencies */}
      <Section bg="light-gray" size="lg">
        <SectionHeading
          eyebrow="What Counts as an Emergency"
          title="The Five Calls We Run Most at Night in Oakland."
          description="If any of these are happening to you right now, do not wait until morning."
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {emergencyTypes.map((e) => {
            const Icon = e.icon;
            return (
              <article
                key={e.title}
                className="flex items-start gap-5 rounded-2xl border border-[#E5E5E5] bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#F96302] md:p-7"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center bg-[#F96302]">
                  <Icon className="h-6 w-6 text-white" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-black uppercase leading-tight tracking-tight text-black md:text-3xl">
                    {e.title}
                  </h3>
                  <p className="mt-3 text-lg leading-relaxed text-[#333333]">{e.detail}</p>
                </div>
              </article>
            );
          })}
        </div>
      </Section>

      {/* H2: Response process */}
      <Section bg="white" size="lg">
        <SectionHeading
          eyebrow="How We Respond"
          title="From Your Call to Stabilization."
          description="The same playbook every call: pickup, dispatch, contain, assess, stabilize."
        />
        <ol className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-5">
          {responseSteps.map((s) => (
            <li
              key={s.step}
              className="relative flex flex-col rounded-2xl border border-[#E5E5E5] bg-[#F5F5F5] p-6"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center bg-[#F96302] font-display text-base font-black uppercase tracking-wide text-white">
                {s.step}
              </span>
              <h3 className="mt-4 font-display text-xl font-black uppercase leading-tight tracking-tight text-black">
                {s.title}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-[#333333]">{s.detail}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* H2: Why two licenses matter for emergencies */}
      <Section bg="light-gray" size="lg" narrow>
        <SectionHeading
          eyebrow="Why Two Licenses Matter at Night"
          title="The Calls Most Oakland Plumbers Hand Off."
        />
        <p className="font-sans text-lg leading-relaxed text-[#333333] md:text-lg">
          A standard C-36 plumbing license covers everything inside your property line. It does not cover the public
          right-of-way: the parkway strip, sidewalk, or street. That matters in three emergency scenarios.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          <article className="rounded-2xl border border-[#E5E5E5] bg-white p-6">
            <Navigation className="h-7 w-7 text-[#F96302]" strokeWidth={1.5} aria-hidden="true" />
            <h3 className="mt-4 font-display text-xl font-black uppercase tracking-tight text-black">
              Main water line break
            </h3>
            <p className="mt-3 text-base leading-relaxed text-[#333333]">
              The line from your meter to your house often breaks at the curb. C-36 plumbers cannot legally excavate in
              the street. A General Engineering can.
            </p>
          </article>
          <article className="rounded-2xl border border-[#E5E5E5] bg-white p-6">
            <AlertTriangle className="h-7 w-7 text-[#F96302]" strokeWidth={1.5} aria-hidden="true" />
            <h3 className="mt-4 font-display text-xl font-black uppercase tracking-tight text-black">
              Sewer lateral failure
            </h3>
            <p className="mt-3 text-base leading-relaxed text-[#333333]">
              When the failure is in the street section of the lateral, only an A General Engineering crew can repair
              it. Z and Z carries both licenses on one truck.
            </p>
          </article>
          <article className="rounded-2xl border border-[#E5E5E5] bg-white p-6">
            <Flame className="h-7 w-7 text-[#F96302]" strokeWidth={1.5} aria-hidden="true" />
            <h3 className="mt-4 font-display text-xl font-black uppercase tracking-tight text-black">
              Street-side gas line
            </h3>
            <p className="mt-3 text-base leading-relaxed text-[#333333]">
              Service-line gas leaks in the public right-of-way require A General Engineering licensing. PG&E shuts off
              the gas; we handle the repair.
            </p>
          </article>
        </div>
        <p className="mt-8 font-sans text-lg leading-relaxed text-[#333333] md:text-lg">
          For an emergency, that means one phone call, one crew, one ETA. Not a primary plumber stabilizing on site
          while waiting for a subcontracted excavator to show up the next morning.
        </p>
      </Section>

      {/* Mid-page CTA */}
      <Section bg="hero-orange" size="md">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center bg-black text-white">
              <Phone className="h-6 w-6 text-[#F96302]" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <div>
              <p className="font-display text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
                Right now. Not in the morning.
              </p>
              <p className="mt-2 max-w-2xl text-base text-white/85">
                Call {siteSettings.phone}. A plumber picks up. Dispatch leaves the San Leandro yard and routes the
                fastest way to your Oakland address.
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

      {/* Coverage by Oakland neighborhood */}
      <Section bg="white" size="lg">
        <SectionHeading
          eyebrow="Oakland Coverage"
          title="Same Crew. Every Neighborhood."
          description="We run emergency calls across all Oakland neighborhoods. The notes below reflect what we see most often by area."
        />
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {neighborhoodCoverage.map((n) => (
            <li
              key={n.name}
              className="rounded-2xl border border-[#E5E5E5] bg-[#F5F5F5] p-5"
            >
              <p className="font-display text-lg font-black uppercase tracking-tight text-black">{n.name}</p>
              <p className="mt-2 text-base leading-relaxed text-[#333333]">{n.note}</p>
            </li>
          ))}
        </ul>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl border border-[#E5E5E5] bg-white p-5">
            <Clock className="h-5 w-5 flex-shrink-0 text-[#F96302]" strokeWidth={1.5} aria-hidden="true" />
            <div>
              <p className="font-display text-base font-black uppercase tracking-tight text-black">
                30-60 min daytime
              </p>
              <p className="mt-1 text-sm text-[#333333]">Most Oakland addresses during business hours.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#E5E5E5] bg-white p-5">
            <Clock className="h-5 w-5 flex-shrink-0 text-[#F96302]" strokeWidth={1.5} aria-hidden="true" />
            <div>
              <p className="font-display text-base font-black uppercase tracking-tight text-black">
                Night and weekend
              </p>
              <p className="mt-1 text-sm text-[#333333]">Same crew, same number, after-hours rate applies.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#E5E5E5] bg-white p-5">
            <ShieldCheck className="h-5 w-5 flex-shrink-0 text-[#F96302]" strokeWidth={1.5} aria-hidden="true" />
            <div>
              <p className="font-display text-base font-black uppercase tracking-tight text-black">
                Licensed for it all
              </p>
              <p className="mt-1 text-sm text-[#333333]">C-36 + A General Engineering on every truck.</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Pricing transparency */}
      <Section bg="light-gray" size="lg" narrow>
        <SectionHeading
          eyebrow="Transparent Pricing"
          title="What an Emergency Call Costs."
          description="Pricing is straightforward and quoted before paid work starts. The diagnostic and the quote are always free of charge."
        />
        <div className="space-y-4">
          <article className="rounded-2xl border border-[#E5E5E5] bg-white p-6">
            <p className="font-display text-xl font-black uppercase tracking-tight text-black">
              Standard hours: 7 AM to 5 PM, Monday to Friday
            </p>
            <p className="mt-2 text-lg leading-relaxed text-[#333333]">
              Standard service rate. Same fast dispatch. Most non-emergency calls book inside the day.
            </p>
          </article>
          <article className="rounded-2xl border border-[#E5E5E5] bg-white p-6">
            <p className="font-display text-xl font-black uppercase tracking-tight text-black">
              After-hours: evenings, nights, weekends, holidays
            </p>
            <p className="mt-2 text-lg leading-relaxed text-[#333333]">
              After-hours surcharge applies on top of the standard repair quote. We tell you the rate when you call so
              there are no surprises. The diagnostic and stabilize visit are free of charge. You only pay for repair
              work you approve.
            </p>
          </article>
          <article className="rounded-2xl border-l-4 border-[#F96302] bg-white p-6">
            <p className="font-display text-xl font-black uppercase tracking-tight text-black">
              No paid work without your written approval.
            </p>
            <p className="mt-2 text-lg leading-relaxed text-[#333333]">
              We diagnose, stabilize, and quote first. You approve the price before anything billable starts. If you
              want to stop after stabilization and wait for daylight, that is your call.
            </p>
          </article>
        </div>
      </Section>

      {/* Social proof */}
      {oaklandTestimonials.length > 0 && (
        <Section bg="white" size="lg">
          <SectionHeading eyebrow="Oakland Reviews" title="What Oakland Customers Say." />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {oaklandTestimonials.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </Section>
      )}

      {/* FAQ */}
      <Section bg="light-gray" size="lg" narrow>
        <SectionHeading
          eyebrow="Emergency Plumber FAQ"
          title="Common Questions at 2 AM."
        />
        <FaqAccordion items={faqs} />
      </Section>

      {/* Internal links */}
      <Section bg="white" size="md">
        <SectionHeading eyebrow="Related" title="Keep Reading." />
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Plumber in Oakland", href: "/plumber-oakland-ca/" },
            { label: "24/7 Emergency Service", href: "/services/emergency/" },
            { label: "Sewer Lateral Oakland", href: "/sewer-lateral-oakland/" },
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
      <Section bg="light-gray" size="md">
        <SectionHeading eyebrow="Credentials" title="Two Licenses. One Crew. 23 Years." />
        <TrustStrip />
      </Section>

      {/* Final CTA */}
      <Section bg="black" size="md">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-4xl font-black uppercase leading-tight text-white md:text-5xl">
              Right Now? Call.
            </h2>
            <p className="mt-2 max-w-2xl font-sans text-base text-white/75">
              A plumber answers the phone every hour of the day. {siteSettings.cslb}.
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
