import type { Metadata } from "next";
import Link from "next/link";
import {
  Phone,
  Thermometer,
  Flame,
  Zap,
  AlertTriangle,
  ChevronRight,
  ClipboardList,
  Truck,
  Wrench,
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
  title: "Water Heater Repair & Install Oakland CA | Same-Day | Z and Z Plumbing",
  description:
    "Same-day water heater repair and install in Oakland. Tank and tankless, gas and electric. Z and Z Plumbing diagnoses, sources, and installs with both California licenses on the truck. Call (510) 708-4237.",
  alternates: { canonical: `${siteSettings.siteUrl}/water-heater-oakland/` },
  openGraph: {
    title: "Water Heater Oakland | Repair & Install | Z and Z Plumbing",
    description:
      "Same-day water heater service in Oakland. Tank or tankless, gas or electric. CSLB #896116.",
    url: `${siteSettings.siteUrl}/water-heater-oakland/`,
    type: "website",
  },
};

const PAGE_URL = `${siteSettings.siteUrl}/water-heater-oakland/`;

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${siteSettings.siteUrl}/` },
    { "@type": "ListItem", position: 2, name: "Services", item: `${siteSettings.siteUrl}/services/` },
    { "@type": "ListItem", position: 3, name: "Water Heater Oakland", item: PAGE_URL },
  ],
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${PAGE_URL}#service`,
  name: "Water Heater Repair and Installation, Oakland",
  serviceType: "Water heater service",
  description:
    "Water heater repair, replacement, and installation in Oakland, California. Tank and tankless units, gas and electric. Z and Z Plumbing handles diagnosis, brand sourcing, permit work, install, and haul-away under CSLB #896116.",
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
};

const failureModes = [
  {
    title: "Sediment buildup in the tank",
    detail:
      "Hard water in Oakland leaves mineral sediment at the bottom of tank heaters. Symptoms include popping noises during heat cycles, longer recovery times, and eventually a burned-out lower element or burner. The fix is a tank flush or, for older units, replacement.",
  },
  {
    title: "Failed gas valve or thermocouple",
    detail:
      "On gas tank heaters, a failed gas valve, dirty thermocouple, or weak pilot setup is the most common reason for no hot water. We diagnose, source the part, and bring the unit back online same day when possible.",
  },
  {
    title: "T&P relief valve discharge",
    detail:
      "If water is dripping or streaming from the temperature and pressure relief valve, the tank is over-pressured or over-heated. This is a safety issue. Stop using hot water and call. Most often a thermostat or expansion tank problem.",
  },
  {
    title: "Anode rod exhaustion",
    detail:
      "The sacrificial anode rod inside a tank heater protects the tank from corrosion. Once it is consumed, the tank itself starts to corrode and leak. Anodes can be swapped to extend tank life; once the tank weeps, replacement is the only path.",
  },
  {
    title: "Tankless scaling and ignition issues",
    detail:
      "Tankless units in Oakland accumulate scale on the heat exchanger over time. Symptoms include reduced flow, error codes, ignition failures, and inconsistent temperature. Annual descaling extends unit life by years.",
  },
];

const installSteps = [
  {
    icon: ClipboardList,
    step: "1",
    title: "Assessment",
    detail:
      "We visit, diagnose the failure, and discuss repair-versus-replace. We also flag any code or venting upgrades the install will require under current Oakland and California energy code.",
  },
  {
    icon: Wrench,
    step: "2",
    title: "Decision and quote",
    detail:
      "Tank or tankless? Gas or electric? We lay out the trade-offs (upfront cost, lifespan, energy use, recovery rate, space needs) and quote each path so you can pick.",
  },
  {
    icon: Truck,
    step: "3",
    title: "Source and schedule",
    detail:
      "We source the unit from a Bay Area supplier and book the install. Most standard tank replacements are same-day or next-day. Tankless installs and gas line upgrades may need 1 to 3 days for sourcing and permits.",
  },
  {
    icon: Flame,
    step: "4",
    title: "Install and code",
    detail:
      "We install per Oakland and California code, including venting, gas connection, T&P discharge, expansion tank, seismic strapping, and combustion air requirements. Anything that needs a permit, we pull.",
  },
  {
    icon: ShieldCheck,
    step: "5",
    title: "Haul-away and warranty",
    detail:
      "We haul away the old unit, register the manufacturer warranty in your name, and walk you through normal operation and what to watch for. Workmanship is warrantied separately.",
  },
];

const tankVsTankless = [
  {
    type: "Tank",
    capacity: "40, 50, 75 gal common",
    lifespan: "8 to 12 years",
    upfront: "Lower",
    notes:
      "Hot water on demand from a stored tank. Familiar, fast to replace, lower upfront cost. Best for households whose hot water use is moderate and bunched (one or two showers at a time).",
  },
  {
    type: "Tankless",
    capacity: "Sized by GPM, not gallons",
    lifespan: "15 to 20 years",
    upfront: "Higher",
    notes:
      "Heats water on demand. No standby losses. Endless hot water at the rated flow. Best for households with high simultaneous demand, finished basement installs where tank space is tight, or homeowners optimizing for lifetime energy cost.",
  },
];

const faqs: FaqItem[] = [
  {
    question: "Can Z and Z install or replace a water heater same day in Oakland?",
    answer:
      "In most cases, yes for tank heaters. We carry common tank sizes on our trucks and can pull from supplier inventory the same day. Tankless installs that require gas line upgrades or permit work typically run 1 to 3 days.",
  },
  {
    question: "Should I replace my tank heater with a tankless?",
    answer:
      "It depends on your hot water use, the available space and venting, your gas service capacity, and your budget horizon. Tankless costs more upfront but lasts roughly twice as long and uses less energy. We lay out the trade-offs at quote time so you can decide.",
  },
  {
    question: "Do you handle both gas and electric water heaters?",
    answer:
      "Yes. We service and install both. Gas units involve venting, gas line sizing, and combustion air requirements that California code enforces tightly. Electric units involve breaker capacity and wire gauge sizing. We handle the full install either way.",
  },
  {
    question: "What brands do you install?",
    answer:
      "We work with the standard Bay Area supplier brands across tank (Bradford White, Rheem, A.O. Smith, Bosch electric) and tankless (Rinnai, Navien, Noritz, Rheem). We do not push one brand. At quote time we lay out what we have access to and what makes sense for your install.",
  },
  {
    question: "Does Oakland require a permit for water heater replacement?",
    answer:
      "Yes. California requires a permit for water heater replacement and tankless installation. We pull the permit, install to current code, and coordinate the inspection. The permit fee is typically passed through at cost.",
  },
  {
    question: "How long should a water heater last in Oakland?",
    answer:
      "A tank unit typically runs 8 to 12 years. Tankless units run 15 to 20 years with annual descaling. Oakland's harder water tends to push the low end of those ranges if maintenance is skipped. Sediment flush every year extends tank life noticeably.",
  },
  {
    question: "Can financing cover water heater replacement?",
    answer:
      "Yes. Water heater replacement is one of the most common projects we finance. See our financing page for the process. Z and Z is not a lender; financing is provided by third-party partners.",
  },
];

export default function WaterHeaterOaklandPage() {
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
          <span className="text-white">Water Heater Oakland</span>
        </nav>
        <p className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#F96302] mb-4">
          Oakland Water Heater · Repair & Install
        </p>
        <h1 className="max-w-5xl font-display text-5xl md:text-7xl font-black uppercase leading-none tracking-tight text-white">
          Water Heater Repair and Install in Oakland. Often Same Day.
        </h1>
        <p className="mt-6 max-w-3xl font-sans text-2xl leading-relaxed text-white/80 md:text-3xl">
          Tank or tankless. Gas or electric. Z and Z Plumbing diagnoses on site, sources from Bay Area suppliers, and
          installs to current California and Oakland code with the permit pulled. CSLB licensed across plumbing and
          general engineering.
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
          <Button variant="inverse" size="xl" href="/book/?zip=94601&service=water-heater">
            Get a Quote
          </Button>
        </div>
        <p className="mt-6 max-w-3xl text-sm font-semibold uppercase tracking-[0.12em] text-white/55">
          {siteSettings.cslb} · C-36 + A General Engineering · Same-day install common · 23 years in Oakland
        </p>
      </Section>

      {/* Opening paragraph */}
      <Section bg="white" size="lg" narrow>
        <p className="font-sans text-xl leading-relaxed text-[#333333] md:text-xl">
          A failed water heater is the kind of plumbing problem you notice fast. No hot water for the morning shower,
          a puddle around the tank, a pilot that will not stay lit. Z and Z Plumbing has been replacing Oakland water
          heaters since 2003 and carries common tank sizes on the truck. Most standard tank replacements wrap up the
          same day. Tankless installs and gas line upgrades take a little longer because of code and permitting. Call{" "}
          <a href={`tel:${siteSettings.phoneTel}`} className="font-bold text-[#F96302] underline">
            {siteSettings.phone}
          </a>{" "}
          and we will tell you which path your setup is on.
        </p>
      </Section>

      {/* H2: Common failure modes */}
      <Section bg="light-gray" size="lg">
        <SectionHeading
          eyebrow="Common Failures"
          title="The Five Water Heater Issues We See Most in Oakland."
          description="Tank and tankless. Gas and electric. Most failures fall in one of these buckets."
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {failureModes.map((m, i) => (
            <article
              key={m.title}
              className="relative rounded-2xl border border-[#E5E5E5] bg-white p-6 md:p-7"
            >
              <span className="absolute -top-3 left-6 inline-flex items-center justify-center bg-[#F96302] px-3 py-1 font-display text-sm font-black uppercase tracking-wide text-white">
                {i + 1}
              </span>
              <h3 className="mt-3 font-display text-2xl font-black uppercase leading-tight tracking-tight text-black md:text-3xl">
                {m.title}
              </h3>
              <p className="mt-3 text-xl leading-relaxed text-[#333333]">{m.detail}</p>
            </article>
          ))}
        </div>
      </Section>

      {/* H2: Tank vs tankless */}
      <Section bg="white" size="lg">
        <SectionHeading
          eyebrow="The Decision"
          title="Tank or Tankless?"
          description="The honest trade-off. We do not push one over the other. We lay out the facts and let you choose."
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {tankVsTankless.map((t, i) => (
            <article
              key={t.type}
              className={`flex flex-col rounded-2xl border bg-white p-7 ${
                i === 0 ? "border-[#E5E5E5]" : "border-2 border-[#F96302] shadow-lg"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center ${
                    i === 0 ? "bg-[#F5F5F5]" : "bg-[#F96302] text-white"
                  }`}
                >
                  {i === 0 ? (
                    <Thermometer className="h-6 w-6 text-[#F96302]" strokeWidth={1.5} aria-hidden="true" />
                  ) : (
                    <Zap className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
                  )}
                </div>
                <p className="font-display text-3xl font-black uppercase tracking-tight text-black">{t.type}</p>
              </div>
              <dl className="grid grid-cols-3 gap-3 mb-4">
                <div className="rounded-lg bg-[#F5F5F5] p-3">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#666666]">Capacity</dt>
                  <dd className="mt-1 text-sm font-bold text-black">{t.capacity}</dd>
                </div>
                <div className="rounded-lg bg-[#F5F5F5] p-3">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#666666]">Lifespan</dt>
                  <dd className="mt-1 text-sm font-bold text-black">{t.lifespan}</dd>
                </div>
                <div className="rounded-lg bg-[#F5F5F5] p-3">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#666666]">Upfront</dt>
                  <dd className="mt-1 text-sm font-bold text-black">{t.upfront}</dd>
                </div>
              </dl>
              <p className="text-xl leading-relaxed text-[#333333]">{t.notes}</p>
            </article>
          ))}
        </div>
      </Section>

      {/* H2: Install process */}
      <Section bg="light-gray" size="lg">
        <SectionHeading
          eyebrow="The Install"
          title="What an Oakland Water Heater Install Looks Like."
          description="From the first phone call to a registered manufacturer warranty."
        />
        <ol className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-5">
          {installSteps.map((s) => {
            const Icon = s.icon;
            return (
              <li
                key={s.step}
                className="relative flex flex-col rounded-2xl border border-[#E5E5E5] bg-white p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-9 w-9 items-center justify-center bg-black font-display text-base font-black uppercase tracking-wide text-white">
                    {s.step}
                  </span>
                  <Icon className="h-6 w-6 text-[#F96302]" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-display text-xl font-black uppercase leading-tight tracking-tight text-black">
                  {s.title}
                </h3>
                <p className="mt-3 text-lg leading-relaxed text-[#333333]">{s.detail}</p>
              </li>
            );
          })}
        </ol>
      </Section>

      {/* Code callout */}
      <Section bg="white" size="md" narrow>
        <article className="rounded-2xl border-l-4 border-[#F96302] bg-[#F5F5F5] p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center bg-[#F96302] text-white">
              <AlertTriangle className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <div>
              <p className="font-display text-2xl font-black uppercase leading-tight tracking-tight text-black md:text-3xl">
                Oakland code requires a permit.
              </p>
              <p className="mt-3 text-xl leading-relaxed text-[#333333]">
                California Plumbing and Mechanical Code requires a permit for water heater replacement and installation.
                That covers venting, gas connection, expansion tank, T&P discharge routing, seismic strapping, and
                combustion air. Z and Z pulls the permit, installs to code, and coordinates the inspection. Permit
                fees pass through at cost.
              </p>
            </div>
          </div>
        </article>
      </Section>

      {/* Mid-page CTA */}
      <Section bg="hero-orange" size="md">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
              No hot water this morning?
            </p>
            <p className="mt-2 max-w-2xl text-base text-white/85">
              Call {siteSettings.phone}. We carry common tank sizes on the truck and can usually have your house back
              to hot water by end of day.
            </p>
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
          eyebrow="Water Heater FAQ"
          title="Common Questions."
        />
        <FaqAccordion items={faqs} />
      </Section>

      {/* Internal links */}
      <Section bg="white" size="md">
        <SectionHeading eyebrow="Related" title="Keep Reading." />
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Plumber in Oakland", href: "/plumber-oakland-ca/" },
            { label: "Water Heater Service Hub", href: "/services/water-heater/" },
            { label: "Financing Options", href: "/financing/" },
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
        <SectionHeading eyebrow="Credentials" title="Licensed for the Whole Install." />
        <TrustStrip />
      </Section>

      {/* Final CTA */}
      <Section bg="black" size="md">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-4xl font-black uppercase leading-tight text-white md:text-5xl">
              Ready for Hot Water?
            </h2>
            <p className="mt-2 max-w-2xl font-sans text-base text-white/75">
              Same-day Oakland service. Permit pulled. Warranty registered.
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
              Call {siteSettings.phone}
            </Button>
            <Button variant="inverse" size="lg" href="/book/?zip=94601&service=water-heater">
              Schedule Online
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
