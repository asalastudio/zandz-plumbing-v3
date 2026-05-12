import type { Metadata } from "next";
import Link from "next/link";
import {
  Phone,
  Pipette,
  Wrench,
  Camera,
  Droplet,
  AlertTriangle,
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
  title: "Drain Cleaning Oakland CA | Snake, Camera, Hydrojet | Z and Z Plumbing",
  description:
    "Drain cleaning in Oakland. Snaking, camera inspection, and hydrojetting from a licensed contractor that can also handle the sewer lateral if your drain problem turns out to be deeper. Call (510) 708-4237.",
  alternates: { canonical: `${siteSettings.siteUrl}/drain-cleaning-oakland/` },
  openGraph: {
    title: "Drain Cleaning Oakland | Z and Z Plumbing",
    description:
      "Snake, camera, hydrojet, lateral. One crew handles the full diagnostic path under CSLB #896116.",
    url: `${siteSettings.siteUrl}/drain-cleaning-oakland/`,
    type: "website",
  },
};

const PAGE_URL = `${siteSettings.siteUrl}/drain-cleaning-oakland/`;

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${siteSettings.siteUrl}/` },
    { "@type": "ListItem", position: 2, name: "Services", item: `${siteSettings.siteUrl}/services/` },
    { "@type": "ListItem", position: 3, name: "Drain Cleaning Oakland", item: PAGE_URL },
  ],
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${PAGE_URL}#service`,
  name: "Drain Cleaning, Oakland",
  serviceType: "Drain cleaning and hydrojetting",
  description:
    "Drain cleaning, hydrojetting, and camera inspection in Oakland, California. Z and Z Plumbing handles kitchen, bath, floor drain, and main sewer line clearing, plus EBMUD-compliant cleanouts under CSLB #896116.",
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

const commonClogs = [
  {
    title: "Kitchen sink and disposal lines",
    detail:
      "Grease, food waste, and starch build a hard scale inside the line over time. Augering clears the immediate clog. Hydrojetting clears the scale and prevents recurrence.",
  },
  {
    title: "Bathroom drains, hair and soap scum",
    detail:
      "Tubs, showers, and bath sinks clog from hair and soap residue. A short auger or zip-it pull usually solves it. Recurring clogs in the same drain often point to a vent issue or a deeper line problem.",
  },
  {
    title: "Floor drains and laundry standpipes",
    detail:
      "Lint, sediment, and the rare lost sock cause backups in laundry standpipes. A floor drain backing up usually means the main line is partially blocked further down. Camera inspection answers it.",
  },
  {
    title: "Toilets that gurgle and back up",
    detail:
      "If flushing a toilet backs up the tub or makes the sink gurgle, the clog is in the main line, not the fixture. That is when the camera comes out.",
  },
  {
    title: "Root intrusion in older Oakland clay sewer lateral",
    detail:
      "Pre-1970s Oakland sewer laterals are often clay. Tree roots find the joints and grow into the line. Hydrojetting cuts the roots; long-term fix is reline or replace.",
  },
];

const methods = [
  {
    icon: Wrench,
    title: "Snake / Auger",
    when: "Single fixture, single clog, no recurrence",
    detail:
      "A cable with a cutter head, fed into the line to break through the blockage. Fast, low-cost, low-mess. The default first move for most kitchen and bath clogs.",
  },
  {
    icon: Camera,
    title: "Camera inspection",
    when: "Recurring clog, multi-fixture backup, before any big spend",
    detail:
      "A CCTV camera run through the line to see exactly what is causing the issue. The right tool before quoting a hydrojet or a lateral repair. We record the run and send you the video.",
  },
  {
    icon: Pipette,
    title: "Hydrojetting",
    when: "Scale, grease, light root intrusion, restaurant lines",
    detail:
      "High-pressure water (often 3,000+ PSI through a specialized nozzle) scours the pipe wall back to bare surface. Removes years of buildup that augering only cuts through.",
  },
  {
    icon: AlertTriangle,
    title: "Lateral repair",
    when: "Camera shows broken pipe, offset joints, collapsed section",
    detail:
      "When the issue is the lateral itself, augering and hydrojetting only buy time. We hold the A General Engineering license required for the street-side portion. See our Sewer Lateral Oakland page for full detail.",
  },
];

const faqs: FaqItem[] = [
  {
    question: "How much does drain cleaning cost in Oakland?",
    answer:
      "A standard single-fixture auger call typically runs in the low hundreds. Hydrojetting runs higher because of the equipment and labor involved. Camera inspections are quoted separately when needed. We always quote before paid work starts so there are no surprises.",
  },
  {
    question: "When is hydrojetting worth it instead of just snaking?",
    answer:
      "Snaking cuts a hole through the clog. Hydrojetting scours the pipe wall. If the same drain clogs repeatedly, the line is fundamentally fouled and snaking only buys time. Hydrojetting clears the underlying buildup. Common for kitchen lines, restaurant lines, and laterals with light root intrusion.",
  },
  {
    question: "Do I need a camera inspection?",
    answer:
      "Probably yes if any of these apply: the clog keeps coming back, more than one fixture is backing up, you have a known older clay sewer lateral, you are selling your Oakland home (EBMUD compliance), or the price of the next round of cleaning is starting to add up to what a lateral repair would cost.",
  },
  {
    question: "Can you handle main sewer line clogs?",
    answer:
      "Yes. We carry the auger, jetter, and camera needed for main line clearing. We also hold the A General Engineering license required if the main line problem turns out to be in the street section of your lateral. One crew, full diagnostic path.",
  },
  {
    question: "What if my drain problem is actually a sewer lateral issue?",
    answer:
      "It happens. A recurring main-line backup often means the lateral itself is failing. We camera the line, document the issue, and quote either continued cleaning or a lateral repair. See our Sewer Lateral Oakland page for the full repair detail and EBMUD compliance process.",
  },
  {
    question: "Will the chemical drain cleaners I bought from the store ruin anything?",
    answer:
      "They can. Caustic drain cleaners damage older clay and cast iron over time, and they pose a real safety risk to anyone who has to work on the line later. We avoid them. The mechanical and water-jet methods clear the same clog without the corrosion or fume hazard.",
  },
  {
    question: "How fast can Z and Z get to a drain clog in Oakland?",
    answer:
      "Most drain cleaning calls book inside the day. Our San Leandro dispatch base puts most Oakland addresses 30 to 60 minutes from a route-ready truck during business hours. Emergency calls run 24/7.",
  },
];

export default function DrainCleaningOaklandPage() {
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
          <span className="text-white">Drain Cleaning Oakland</span>
        </nav>
        <p className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#F96302] mb-4">
          Oakland Drain Cleaning · Snake · Camera · Hydrojet
        </p>
        <h1 className="max-w-5xl font-display text-5xl md:text-7xl font-black uppercase leading-none tracking-tight text-white">
          Drain Cleaning in Oakland. Snake, Camera, Hydrojet.
        </h1>
        <p className="mt-6 max-w-3xl font-sans text-2xl leading-relaxed text-white/80 md:text-3xl">
          Kitchen lines, bath drains, floor drains, and main sewer lines. Z and Z runs the right tool for the clog, and
          when the clog turns out to be a deeper sewer lateral issue, we are licensed to handle that too.
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
        <p className="font-sans text-xl leading-relaxed text-[#333333] md:text-xl">
          Most drain clogs in Oakland are routine. A kitchen sink slows down, a tub backs up, a floor drain fills during
          laundry. The right tool clears them fast. The problem is the OTHER kind of clog: the one that keeps coming
          back, the one where two fixtures back up at once, the one in a pre-1970s clay sewer lateral. That clog needs
          a camera before any cleaning, because the answer might be reline or replace, not another auger run. Z and Z
          Plumbing carries snake, jetter, and camera on every drain call, and holds the A General Engineering license
          if your drain problem turns out to be in the street section of your lateral. Call{" "}
          <a href={`tel:${siteSettings.phoneTel}`} className="font-bold text-[#F96302] underline">
            {siteSettings.phone}
          </a>{" "}
          for same-day Oakland service.
        </p>
      </Section>

      {/* H2: Common clogs */}
      <Section bg="light-gray" size="lg">
        <SectionHeading
          eyebrow="Common Clogs"
          title="The Five We Clear Most in Oakland."
          description="Same-day work, almost always. The right method depends on the line."
        />
        <ol className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {commonClogs.map((c, i) => (
            <li
              key={c.title}
              className="relative flex flex-col rounded-2xl border border-[#E5E5E5] bg-white p-6 md:p-7"
            >
              <span className="absolute -top-3 left-6 inline-flex items-center justify-center bg-[#F96302] px-3 py-1 font-display text-sm font-black uppercase tracking-wide text-white">
                {i + 1}
              </span>
              <h3 className="mt-3 font-display text-2xl font-black uppercase leading-tight tracking-tight text-black md:text-3xl">
                {c.title}
              </h3>
              <p className="mt-3 text-xl leading-relaxed text-[#333333]">{c.detail}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* H2: Methods */}
      <Section bg="white" size="lg">
        <SectionHeading
          eyebrow="Methods"
          title="Right Tool for the Line."
          description="Augering is the default. Camera and hydrojet are how we tell whether the same clog will be back next month."
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {methods.map((m) => {
            const Icon = m.icon;
            return (
              <article
                key={m.title}
                className="flex flex-col rounded-2xl border border-[#E5E5E5] bg-[#F5F5F5] p-6 md:p-7"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-11 w-11 items-center justify-center bg-[#F96302]">
                    <Icon className="h-5 w-5 text-white" strokeWidth={1.5} aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-2xl font-black uppercase tracking-tight text-black md:text-3xl">
                    {m.title}
                  </h3>
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#F96302] mb-3">
                  When: {m.when}
                </p>
                <p className="text-xl leading-relaxed text-[#333333]">{m.detail}</p>
              </article>
            );
          })}
        </div>
      </Section>

      {/* When clog is actually a lateral */}
      <Section bg="light-gray" size="lg" narrow>
        <article className="rounded-2xl border-l-4 border-[#F96302] bg-white p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center bg-[#F96302] text-white">
              <Droplet className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#F96302]">
                When a drain clog is actually a lateral problem
              </p>
              <p className="mt-2 font-display text-2xl font-black uppercase leading-tight tracking-tight text-black md:text-3xl">
                If the same clog keeps coming back, the line is not the line.
              </p>
              <p className="mt-4 text-xl leading-relaxed text-[#333333]">
                Recurring main-line backups, multi-fixture backups, and main-line clogs that clear for a month and then
                return. These usually point to a failing sewer lateral. Augering keeps buying time. A camera tells you
                what is actually happening. If the lateral is the answer, Z and Z is licensed to repair it under the A
                General Engineering classification.
              </p>
              <Link
                href="/sewer-lateral-oakland/"
                className="mt-5 inline-flex items-center gap-2 text-base font-bold uppercase tracking-wide text-[#F96302] hover:underline"
              >
                Sewer Lateral Oakland & EBMUD Compliance
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </article>
      </Section>

      {/* Mid-page CTA */}
      <Section bg="hero-orange" size="md">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
              Backed-up drain today?
            </p>
            <p className="mt-2 max-w-2xl text-base text-white/85">
              Most Oakland drain calls book inside the day. Call {siteSettings.phone} and we will tell you the right
              method for your line before we run the truck.
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

      {/* Why the license matters */}
      <Section bg="white" size="lg" narrow>
        <SectionHeading
          eyebrow="License Stack"
          title="One Crew Through the Full Diagnostic Path."
        />
        <p className="font-sans text-xl leading-relaxed text-[#333333] md:text-lg">
          A standard C-36 plumbing license covers drain cleaning, snaking, hydrojetting, and camera inspection up to
          your property line. It does not cover repair or replacement of the lateral in the street. If a drain call in
          Oakland turns out to be a lateral issue, a C-36-only contractor has to stop and hand off the street portion to
          a separate A General Engineering contractor. Z and Z holds both. That means the diagnostic path runs end to
          end on one truck.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl border border-[#E5E5E5] bg-[#F5F5F5] p-5">
            <ShieldCheck className="h-5 w-5 flex-shrink-0 text-[#F96302]" strokeWidth={1.5} aria-hidden="true" />
            <p className="text-sm font-bold uppercase tracking-tight text-black">C-36 Plumbing</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#E5E5E5] bg-[#F5F5F5] p-5">
            <ShieldCheck className="h-5 w-5 flex-shrink-0 text-[#F96302]" strokeWidth={1.5} aria-hidden="true" />
            <p className="text-sm font-bold uppercase tracking-tight text-black">A General Engineering</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#E5E5E5] bg-[#F5F5F5] p-5">
            <ShieldCheck className="h-5 w-5 flex-shrink-0 text-[#F96302]" strokeWidth={1.5} aria-hidden="true" />
            <p className="text-sm font-bold uppercase tracking-tight text-black">{siteSettings.cslb}</p>
          </div>
        </div>
      </Section>

      {/* Social proof */}
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
          eyebrow="Drain Cleaning FAQ"
          title="Common Questions."
        />
        <FaqAccordion items={faqs} />
      </Section>

      {/* Internal links */}
      <Section bg="light-gray" size="md">
        <SectionHeading eyebrow="Related" title="Keep Reading." />
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Plumber in Oakland", href: "/plumber-oakland-ca/" },
            { label: "Drain Cleaning Service Hub", href: "/services/drain-cleaning/" },
            { label: "Sewer Lateral Oakland", href: "/sewer-lateral-oakland/" },
            { label: "Hydrojetting Service", href: "/services/hydrojetting/" },
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
        <SectionHeading eyebrow="Credentials" title="Both Licenses on One Truck." />
        <TrustStrip />
      </Section>

      {/* Final CTA */}
      <Section bg="black" size="md">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-4xl font-black uppercase leading-tight text-white md:text-5xl">
              Clear It Today.
            </h2>
            <p className="mt-2 max-w-2xl font-sans text-base text-white/75">
              Most Oakland drain calls book inside the day. {siteSettings.cslb}.
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
            <Button variant="inverse" size="lg" href="/contact/">
              Schedule Online
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
