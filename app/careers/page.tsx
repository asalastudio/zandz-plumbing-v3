import type { Metadata } from "next";
import Link from "next/link";
import {
  Phone,
  Mail,
  Briefcase,
  ShieldCheck,
  Wrench,
  Truck,
  Users,
  Award,
  Clock,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { Section, SectionHeading } from "@/components/Section";
import { Button } from "@/components/Button";
import { TrustStrip } from "@/components/TrustStrip";
import { siteSettings } from "@/content/site-settings";

const CAREERS_EMAIL = "careers@zandzplumbing.com";

export const metadata: Metadata = {
  title: "Careers at Z and Z Plumbing | East Bay Plumber Jobs",
  description:
    "Z and Z Plumbing hires licensed plumbers, apprentices, and helpers for residential and commercial work across the East Bay. CSLB-licensed crew, San Leandro base. Call (510) 708-4237.",
  alternates: { canonical: `${siteSettings.siteUrl}/careers/` },
  openGraph: {
    title: "Careers at Z and Z Plumbing",
    description:
      "Join an East Bay crew that runs real licensed plumbing work. C-36 + A General Engineering jobs available.",
    url: `${siteSettings.siteUrl}/careers/`,
    type: "website",
  },
  robots: { index: true, follow: true },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${siteSettings.siteUrl}/` },
    { "@type": "ListItem", position: 2, name: "Careers", item: `${siteSettings.siteUrl}/careers/` },
  ],
};

const roles = [
  {
    icon: ShieldCheck,
    title: "Licensed Plumber (C-36)",
    detail:
      "California-licensed plumbers with C-36 certification and at least 2 years field experience. You will run residential and commercial calls from kitchen drains to sewer laterals. Z and Z provides the truck, tools, and dispatch.",
    requirements: ["Active C-36 California license", "Clean driving record", "East Bay or willing to commute to San Leandro"],
  },
  {
    icon: Wrench,
    title: "Plumber Apprentice",
    detail:
      "Apprentices working toward their hours with us on real licensed jobs. You will start on routine calls and grow into full lateral, repipe, and emergency work. We support the path to C-36.",
    requirements: ["Active apprentice registration or close to it", "Reliable transportation", "Comfortable on residential and light commercial sites"],
  },
  {
    icon: Truck,
    title: "Plumber Helper / Laborer",
    detail:
      "Field helpers who back up the crew on excavation, trenchless rigs, and water-heater installs. Physical role, daytime hours, with a clear path to apprenticeship if you want it.",
    requirements: ["Lift 50 lb routinely", "Reliable transportation", "Willingness to learn the trade"],
  },
];

const benefits = [
  {
    icon: Award,
    title: "Real licensed work",
    detail:
      "We hold C-36 and A General Engineering. That means crew members get experience on jobs other plumbing shops can't legally run. Sewer laterals, street-side excavation, EBMUD compliance.",
  },
  {
    icon: Users,
    title: "Small, named crew",
    detail:
      "We do not staff through agencies. We do not run a call center. When you join Z and Z, you join Seif's crew. Same number, same trucks, same people every day.",
  },
  {
    icon: Clock,
    title: "Steady East Bay work",
    detail:
      "23 years in the same East Bay service area. Oakland, San Leandro, Berkeley, Alameda, Fremont, Union City, Newark, Dublin, Pleasanton, Walnut Creek, and nearby corridor calls. No long-distance travel. No nights unless you sign up for the on-call emergency rotation.",
  },
  {
    icon: MapPin,
    title: "San Leandro dispatch base",
    detail: `Our yard is at ${siteSettings.address.full}. Easy I-880 access. Trucks stocked here. Most jobs are within 30 minutes of the yard.`,
  },
];

export default function CareersPage() {
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
          <span className="text-white">Careers</span>
        </nav>
        <div className="flex items-center gap-3 mb-4">
          <Briefcase className="h-5 w-5 text-[#F96302]" strokeWidth={1.5} aria-hidden="true" />
          <p className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#F96302]">
            Careers at Z and Z Plumbing
          </p>
        </div>
        <h1 className="max-w-4xl font-display text-5xl md:text-7xl font-black uppercase leading-none tracking-tight text-white">
          Join an East Bay Crew That Runs Real Work.
        </h1>
        <p className="mt-6 max-w-3xl font-sans text-2xl leading-relaxed text-white/80 md:text-3xl">
          Z and Z is a small, named, licensed plumbing crew based in San Leandro. We are open to hearing from licensed
          plumbers, apprentices working toward their hours, and field helpers who want a steady seat on a real crew.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button
            variant="primary"
            size="xl"
            href={`mailto:${CAREERS_EMAIL}?subject=Z%20and%20Z%20Plumbing%20-%20application`}
            icon={<Mail className="h-5 w-5" />}
            external
          >
            Email a Resume
          </Button>
          <Button
            variant="inverse"
            size="xl"
            href={`tel:${siteSettings.phoneTel}`}
            icon={<Phone className="h-5 w-5" />}
            external
          >
            Call {siteSettings.phone}
          </Button>
        </div>
      </Section>

      {/* Open roles */}
      <Section bg="white" size="lg">
        <SectionHeading
          eyebrow="Open Roles"
          title="Who We Hire."
          description="We hire when the right person walks in. These are the roles we run. If you fit one, send us a resume and tell us about the work you have done."
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <article
                key={r.title}
                className="flex h-full flex-col rounded-2xl border border-[#E5E5E5] bg-white p-7 transition-all duration-200 hover:-translate-y-1 hover:border-[#F96302] md:p-8"
              >
                <div className="flex h-14 w-14 items-center justify-center bg-[#F96302] mb-5">
                  <Icon className="h-7 w-7 text-white" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <h3 className="font-display text-2xl font-black uppercase leading-tight tracking-tight text-black md:text-3xl">
                  {r.title}
                </h3>
                <p className="mt-4 text-xl leading-relaxed text-[#333333]">{r.detail}</p>
                <ul className="mt-6 flex flex-col gap-3 border-t border-[#E5E5E5] pt-5">
                  {r.requirements.map((req) => (
                    <li key={req} className="flex items-start gap-3 text-base text-[#333333]">
                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 bg-[#F96302]" aria-hidden="true" />
                      {req}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </Section>

      {/* Why work here */}
      <Section bg="light-gray" size="lg">
        <SectionHeading
          eyebrow="Why Work at Z and Z"
          title="A Real Crew. Real Licenses. Real Work."
          description="We do not run agency labor or call-center dispatch. Z and Z is owner-operated under CSLB #896116 and has been in the East Bay since 2003. Here is what that means for the crew."
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <article
                key={b.title}
                className="flex items-start gap-5 rounded-2xl border border-[#E5E5E5] bg-white p-7 md:p-8"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center bg-[#F96302]">
                  <Icon className="h-6 w-6 text-white" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-black uppercase leading-tight tracking-tight text-black md:text-3xl">
                    {b.title}
                  </h3>
                  <p className="mt-3 text-xl leading-relaxed text-[#333333]">{b.detail}</p>
                </div>
              </article>
            );
          })}
        </div>
      </Section>

      {/* How to apply */}
      <Section bg="white" size="lg" narrow>
        <SectionHeading
          eyebrow="How to Apply"
          title="Tell Us About Your Work."
          description="No portal, no application form. Send a resume and a quick note. If we have a seat to fill, we will reach out within a week."
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <a
            href={`mailto:${CAREERS_EMAIL}?subject=Z%20and%20Z%20Plumbing%20-%20application`}
            className="flex items-start gap-5 rounded-2xl border border-[#E5E5E5] bg-white p-7 transition-all duration-200 hover:-translate-y-1 hover:border-[#F96302] md:p-8"
          >
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center bg-[#F96302] text-white">
              <Mail className="h-7 w-7" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#666666]">Email</p>
              <p className="mt-2 font-display text-2xl font-black uppercase leading-tight tracking-tight text-black md:text-3xl">
                {CAREERS_EMAIL}
              </p>
              <p className="mt-3 text-xl leading-relaxed text-[#333333]">
                Attach a resume. Mention any active license, years of experience, and which role fits.
              </p>
            </div>
          </a>

          <a
            href={`tel:${siteSettings.phoneTel}`}
            className="flex items-start gap-5 rounded-2xl border border-[#E5E5E5] bg-white p-7 transition-all duration-200 hover:-translate-y-1 hover:border-[#F96302] md:p-8"
          >
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center bg-[#F96302] text-white">
              <Phone className="h-7 w-7" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#666666]">Phone</p>
              <p className="mt-2 font-display text-2xl font-black uppercase leading-tight tracking-tight text-black md:text-3xl">
                {siteSettings.phone}
              </p>
              <p className="mt-3 text-xl leading-relaxed text-[#333333]">
                Call during business hours and ask to talk about working at Z and Z. Brief conversation, no pressure.
              </p>
            </div>
          </a>
        </div>

        <div className="mt-10 rounded-2xl border-l-4 border-[#F96302] bg-[#F5F5F5] p-7 md:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#F96302]">
            What to include in your message
          </p>
          <ul className="mt-4 flex flex-col gap-3 text-xl leading-relaxed text-[#333333]">
            <li className="flex items-start gap-3">
              <span className="mt-3 h-1.5 w-1.5 flex-shrink-0 bg-[#F96302]" aria-hidden="true" />
              Which role you are applying for
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-3 h-1.5 w-1.5 flex-shrink-0 bg-[#F96302]" aria-hidden="true" />
              Your license status (active C-36, registered apprentice, neither)
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-3 h-1.5 w-1.5 flex-shrink-0 bg-[#F96302]" aria-hidden="true" />
              Years of plumbing field experience
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-3 h-1.5 w-1.5 flex-shrink-0 bg-[#F96302]" aria-hidden="true" />
              Where you live in the East Bay
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-3 h-1.5 w-1.5 flex-shrink-0 bg-[#F96302]" aria-hidden="true" />
              A note on what kind of plumbing work you are best at
            </li>
          </ul>
        </div>
      </Section>

      {/* Trust strip */}
      <Section bg="light-gray" size="md">
        <SectionHeading eyebrow="About the Company" title="Licensed. Local. Family-Run Since 2003." />
        <TrustStrip />
        <p className="mt-8 max-w-3xl text-xl leading-relaxed text-[#333333]">
          Z and Z Plumbing is owner-operated by Seifullah Zaki Zareef under California State License Board number
          896116. We are not a franchise. We are not part of a call-center network. We are a small East Bay crew that
          has run real licensed plumbing work in the same neighborhoods for 23 years. Read more on the{" "}
          <Link href="/about/" className="font-bold text-[#F96302] underline hover:text-[#e05602]">
            About page
          </Link>
          .
        </p>
      </Section>

      {/* CTA band */}
      <Section bg="hero-orange" size="md">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-4xl font-black uppercase leading-tight text-white md:text-5xl">
              Ready to Send a Resume?
            </h2>
            <p className="mt-3 max-w-2xl font-sans text-lg text-white/90 md:text-xl">
              Email {CAREERS_EMAIL} or call {siteSettings.phone}. We respond within a week if there is a seat to fill.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="inverse"
              size="lg"
              href={`mailto:${CAREERS_EMAIL}?subject=Z%20and%20Z%20Plumbing%20-%20application`}
              icon={<Mail className="h-5 w-5" />}
              external
            >
              Email Resume
            </Button>
            <Button
              variant="secondary"
              size="lg"
              href={`tel:${siteSettings.phoneTel}`}
              icon={<Phone className="h-5 w-5" />}
              external
            >
              {siteSettings.phone}
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
