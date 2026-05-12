import type { Metadata } from "next";
import Link from "next/link";
import {
  Phone,
  ShieldCheck,
  Award,
  MapPin,
  Wrench,
  Building2,
  Clock,
  Users,
  Briefcase,
  ChevronRight,
} from "lucide-react";
import { Section, SectionHeading } from "@/components/Section";
import { Button } from "@/components/Button";
import { TrustStrip } from "@/components/TrustStrip";
import { siteSettings } from "@/content/site-settings";
import { team } from "@/content/team";

export const metadata: Metadata = {
  title: "About Z and Z Plumbing | Two-License East Bay Plumber Since 2003",
  description:
    "Z and Z Plumbing has served the East Bay since 2003 from our San Leandro base. Two California licenses, C-36 Plumbing and A General Engineering, mean we handle work most other plumbers can't. CSLB #896116. Call (510) 708-4237.",
  alternates: { canonical: `${siteSettings.siteUrl}/about/` },
  openGraph: {
    title: "About Z and Z Plumbing | East Bay Since 2003",
    description:
      "Two licenses. One crew. The Pros Other Plumbers Call. Serving Oakland, San Leandro, Berkeley, and the East Bay since 2003.",
    url: `${siteSettings.siteUrl}/about/`,
    type: "article",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${siteSettings.siteUrl}/` },
    { "@type": "ListItem", position: 2, name: "About", item: `${siteSettings.siteUrl}/about/` },
  ],
};

const timeline = [
  {
    year: "2003",
    title: "Founded in the East Bay",
    detail:
      "Seifullah Zaki Zareef founded Z and Z Plumbing in the East Bay and started running calls across Oakland, San Leandro, and Alameda.",
  },
  {
    year: "2007",
    title: "C-36 Plumbing License",
    detail:
      "Seif earned the C-36 Plumbing classification with the California Contractors State License Board. CSLB #896116.",
  },
  {
    year: "2012",
    title: "A General Engineering License",
    detail:
      "Added the A General Engineering classification. That license opened street-side work, sewer lateral replacements, and trenchless projects most plumbers cannot legally touch.",
  },
  {
    year: "Today",
    title: "San Leandro headquarters",
    detail: `Z and Z runs out of ${siteSettings.address.street} in San Leandro and serves 10 East Bay cities, with Oakland as our largest market.`,
  },
];

const reasons = [
  {
    icon: ShieldCheck,
    title: "Two California licenses",
    detail:
      "C-36 Plumbing for everything inside the property line. A General Engineering for the lateral, the street, and the public right-of-way. Other plumbers stop at the curb. We do not.",
  },
  {
    icon: Wrench,
    title: "One crew, start to finish",
    detail:
      "The same Z and Z crew that diagnoses the job does the work. No subcontracting the hard parts. No handoffs that lose context. No mystery charges.",
  },
  {
    icon: Clock,
    title: "Same-day service",
    detail:
      "We answer the phone and we show up. Emergency calls run 24/7 across the East Bay. Standard calls usually book inside the day.",
  },
  {
    icon: Award,
    title: "23 years in the East Bay",
    detail:
      "Family-run since 2003. We know the housing stock, the older clay sewer laterals, EBMUD compliance, and Oakland Public Works permitting. We have done this work for two decades in the same neighborhoods.",
  },
  {
    icon: Building2,
    title: "Other contractors call us",
    detail:
      "Plumbing companies that only hold the C-36 license call Z and Z when a job needs the General Engineering classification. That is where the tagline came from. We are the pros other plumbers call.",
  },
  {
    icon: Users,
    title: "Written quotes, no surprises",
    detail:
      "Every job gets a clear written quote with a not-to-exceed price before any paid work starts. If a financed path makes sense for a bigger project, we lay out the options at quote time.",
  },
];

export default function AboutPage() {
  const owner = team[0];

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
          <span className="text-white">About</span>
        </nav>
        <div className="max-w-4xl">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#F96302] mb-4">
            About Z and Z Plumbing
          </p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-[6.5rem] font-black uppercase leading-none tracking-tight text-white">
            The Pros Other Plumbers Call.
          </h1>
          <p className="mt-6 max-w-3xl font-sans text-xl leading-relaxed text-white/80 md:text-2xl">
            Family-run out of San Leandro since 2003. Two California contractor licenses. One crew. The East Bay&apos;s
            go-to for the plumbing work other crews send over.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
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
        </div>
      </Section>

      {/* Why Choose Us */}
      <Section bg="white" size="lg" id="why-choose-us">
        <SectionHeading
          eyebrow="Why Choose Z and Z"
          title="Built for the Jobs Other Plumbers Won't Take."
          description="Most plumbing companies hold a single C-36 license. Z and Z holds two. That is the difference, and it is why other plumbers call us for the work they cannot legally do."
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r) => {
            const Icon = r.icon;
            return (
              <article
                key={r.title}
                className="flex flex-col gap-5 rounded-2xl border border-[#E5E5E5] bg-white p-7 transition-all duration-200 hover:-translate-y-1 hover:border-[#F96302] md:p-8"
              >
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center bg-[#F96302]">
                  <Icon className="h-7 w-7 text-white" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-black uppercase leading-tight tracking-tight text-black md:text-3xl">
                    {r.title}
                  </h3>
                  <p className="mt-3 text-lg leading-relaxed text-[#333333]">{r.detail}</p>
                </div>
              </article>
            );
          })}
        </div>
      </Section>

      {/* Our Story (timeline) */}
      <Section bg="light-gray" size="lg">
        <SectionHeading
          eyebrow="Our Story"
          title="23 Years Serving the East Bay."
          description="Z and Z Plumbing started small, earned the licenses that mattered, and built a reputation in the trade. Here is the short version."
        />
        <ol className="grid grid-cols-1 gap-5 md:grid-cols-4">
          {timeline.map((item, i) => (
            <li
              key={item.year}
              className="relative flex flex-col rounded-2xl border border-[#E5E5E5] bg-white p-7"
            >
              <span className="absolute -top-3 left-7 inline-flex items-center justify-center bg-[#F96302] px-3 py-1 font-display text-sm font-black uppercase tracking-wide text-white">
                Step {i + 1}
              </span>
              <p className="font-display text-5xl font-black uppercase leading-none tracking-tight text-black">
                {item.year}
              </p>
              <h3 className="mt-4 font-display text-xl font-black uppercase leading-tight tracking-tight text-black">
                {item.title}
              </h3>
              <p className="mt-3 text-lg leading-relaxed text-[#333333]">{item.detail}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Team */}
      <Section bg="white" size="lg" id="team">
        <SectionHeading
          eyebrow="Meet the Team"
          title="One Crew. One License Stack. One Owner."
          description="Z and Z is owner-operated. When you call, you get the same crew on every job."
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-2xl border-2 border-[#F96302] bg-white p-8 shadow-lg md:p-10">
            <div className="flex items-start gap-5">
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center bg-black text-white">
                <span className="font-display text-4xl font-black uppercase">
                  {owner.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-display text-3xl font-black uppercase leading-tight tracking-tight text-black md:text-4xl">
                  {owner.name}
                </h3>
                <p className="mt-2 text-sm font-bold uppercase tracking-[0.12em] text-[#F96302]">
                  {owner.role}
                </p>
              </div>
            </div>
            <p className="mt-6 text-lg leading-relaxed text-[#333333]">{owner.bio}</p>
            {owner.licenseInfo && (
              <p className="mt-5 border-t border-[#E5E5E5] pt-5 text-sm font-bold uppercase tracking-[0.12em] text-[#666666]">
                {owner.licenseInfo}
              </p>
            )}
          </article>

          <article className="flex flex-col justify-center rounded-2xl border border-[#E5E5E5] bg-[#F5F5F5] p-8 md:p-10">
            <div className="flex h-14 w-14 items-center justify-center bg-[#F96302] mb-5">
              <Users className="h-7 w-7 text-white" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#666666]">
              The crew
            </p>
            <p className="mt-2 font-display text-3xl font-black uppercase leading-tight tracking-tight text-black md:text-4xl">
              Trained. Licensed. Trucks Stocked.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-[#333333]">
              Our field crew runs out of the San Leandro yard with route-ready trucks stocked for emergency, repipe,
              sewer lateral, and water-heater work. Same number, same crew, same standards on every job. No call
              centers. No subcontractors handling the hard parts.
            </p>
          </article>
        </div>
      </Section>

      {/* Careers callout */}
      <Section bg="light-gray" size="md" id="careers">
        <article className="grid grid-cols-1 gap-8 rounded-2xl border-l-4 border-[#F96302] bg-white p-8 md:grid-cols-[1fr_auto] md:items-center md:p-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Briefcase className="h-6 w-6 text-[#F96302]" strokeWidth={1.5} aria-hidden="true" />
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#F96302]">Careers</p>
            </div>
            <h2 className="font-display text-3xl font-black uppercase leading-tight tracking-tight text-black md:text-4xl">
              We Hire Licensed Plumbers.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[#333333]">
              Z and Z is a small East Bay crew that runs real plumbing work, not call-center dispatch. If you hold a
              C-36 (or are close to your hours), live in the East Bay, and want a steady seat on a licensed crew, we
              want to talk.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button variant="primary" size="lg" href="/careers/" icon={<ChevronRight className="h-5 w-5" />} iconPosition="right">
              See Open Roles
            </Button>
          </div>
        </article>
      </Section>

      {/* Credentials / trust strip */}
      <Section bg="white" size="md">
        <SectionHeading
          eyebrow="Credentials"
          title="Licensed. Insured. Local."
          description={`${siteSettings.cslb}. Two California State License Board classifications. Headquartered at ${siteSettings.address.street} in ${siteSettings.address.city}.`}
        />
        <TrustStrip />
        <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <MapPin className="h-5 w-5 text-[#F96302]" strokeWidth={1.5} aria-hidden="true" />
          <address className="not-italic font-sans text-lg text-[#333333]">
            {siteSettings.address.full}
          </address>
        </div>
      </Section>

      {/* CTA band */}
      <Section bg="hero-orange" size="md">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-4xl font-black uppercase leading-tight text-white md:text-5xl">
              Ready When You Are.
            </h2>
            <p className="mt-3 max-w-2xl font-sans text-lg text-white/90 md:text-xl">
              Call us or schedule online. We respond within 30 minutes during business hours.
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
