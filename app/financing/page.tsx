import type { Metadata } from "next";
import Link from "next/link";
import { Phone, CreditCard, ShieldCheck, ClipboardCheck, Banknote, FileText } from "lucide-react";
import { Section, SectionHeading } from "@/components/Section";
import { Button } from "@/components/Button";
import { FaqAccordion } from "@/components/FaqAccordion";
import type { FaqItem } from "@/components/FaqAccordion";
import { TrustStrip } from "@/components/TrustStrip";
import { siteSettings } from "@/content/site-settings";

export const metadata: Metadata = {
  title: "Plumbing Financing in the East Bay | Z and Z Plumbing",
  description:
    "Z and Z Plumbing offers financing on major East Bay plumbing projects, including water heater replacement, whole-house repipes, sewer lateral work, and gas line installations. Call (510) 708-4237 to discuss options.",
  alternates: { canonical: `${siteSettings.siteUrl}/financing/` },
  openGraph: {
    title: "Plumbing Financing | Z and Z Plumbing",
    description:
      "Financing options for water heater, repipe, sewer lateral, and gas line projects across the East Bay.",
    url: `${siteSettings.siteUrl}/financing/`,
    type: "article",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${siteSettings.siteUrl}/` },
    { "@type": "ListItem", position: 2, name: "Financing", item: `${siteSettings.siteUrl}/financing/` },
  ],
};

const qualifyingJobs = [
  {
    icon: Banknote,
    title: "Whole house repipe",
    detail: "Galvanized to copper or PEX. Typical projects run multi-day and benefit from a financed term.",
  },
  {
    icon: Banknote,
    title: "Water heater replacement",
    detail: "Tank or tankless, including gas and venting work. Same-day installs financed when needed.",
  },
  {
    icon: Banknote,
    title: "Sewer lateral replacement",
    detail: "Trenchless or open-cut. Includes EBMUD compliance work and city permits when required.",
  },
  {
    icon: Banknote,
    title: "Gas line installation",
    detail: "New service lines or replacement runs. Includes the General Engineering license scope.",
  },
];

const howItWorks = [
  {
    step: "1",
    title: "Get a quote",
    detail:
      "Schedule an on-site assessment. We diagnose the job, scope the work, and write a clear price. No pressure, no surprise add-ons.",
  },
  {
    step: "2",
    title: "Pick a payment path",
    detail:
      "If the project size warrants it, we lay out the financing options available at the time of your quote. Terms vary by partner and creditworthiness.",
  },
  {
    step: "3",
    title: "Apply when you are ready",
    detail:
      "Applications are typically online and take a few minutes. Approval decisions are usually quick. We never start paid work until the path is set.",
  },
  {
    step: "4",
    title: "We do the work",
    detail:
      "Once approved, we schedule the job and run it start to finish. Payments follow the terms you signed with the financing partner.",
  },
];

const faqs: FaqItem[] = [
  {
    question: "What kinds of plumbing jobs qualify for financing?",
    answer:
      "Larger projects like water heater replacement, whole-house repipe, sewer lateral work, and gas line installation are the most common. Smaller service calls usually do not need financing. Call us with your job details and we will tell you which path makes sense.",
  },
  {
    question: "Do you finance through your own company?",
    answer:
      "No. Z and Z Plumbing does the plumbing work. Financing is provided by third-party lenders we partner with. We are not a lender and we do not set rates or terms. We do not collect or store financing applications.",
  },
  {
    question: "How is the rate or term determined?",
    answer:
      "Rates and terms are set by the financing partner and depend on your credit profile, the loan amount, and the term length you choose. We can share the typical options at the time of your quote so you know what to expect before applying.",
  },
  {
    question: "Will my information be shared if I apply?",
    answer:
      "Z and Z passes along only the contact and project details you provide. Once you apply with a financing partner, that company handles the credit check and application according to their privacy practices, which they will disclose at application time. See our Privacy Policy for what we collect and how we use it.",
  },
  {
    question: "What if I do not want financing?",
    answer:
      "No problem. Most jobs are paid at completion by check, card, or bank transfer. Financing is an option, not a requirement. We will tell you straight if the job size makes financing worth considering.",
  },
  {
    question: "Can I combine financing with rebates or tax credits?",
    answer:
      "Sometimes. Water heater upgrades and gas line work can qualify for utility rebates or federal energy tax credits. We will flag any rebates we know about at quote time so you can plan the total cost picture.",
  },
];

export default function FinancingPage() {
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
          <span className="text-white">Financing</span>
        </nav>
        <p className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#F96302] mb-4">
          Plumbing Project Financing
        </p>
        <h1 className="max-w-4xl font-display text-5xl md:text-7xl font-black uppercase leading-none tracking-tight text-white">
          Big Job? Spread the Cost.
        </h1>
        <p className="mt-6 max-w-2xl font-sans text-2xl leading-relaxed text-white/80 md:text-3xl">
          Water heaters, repipes, sewer laterals, and gas lines can run into real money. We partner with third-party
          lenders so East Bay homeowners can move on the work without writing one big check.
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
            Get a Quote
          </Button>
        </div>
      </Section>

      {/* Qualifying jobs */}
      <Section bg="white" size="lg">
        <SectionHeading
          eyebrow="What Qualifies"
          title="Projects We Typically Finance."
          description="Financing makes sense when the scope of work is bigger than a service call. These are the four categories where homeowners ask us about it most."
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {qualifyingJobs.map((job) => {
            const Icon = job.icon;
            return (
              <article
                key={job.title}
                className="flex items-start gap-5 rounded-2xl border border-[#E5E5E5] bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#F96302] md:p-8"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center bg-[#F96302]">
                  <Icon className="h-6 w-6 text-white" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-black uppercase leading-tight tracking-tight text-black md:text-3xl">
                    {job.title}
                  </h3>
                  <p className="mt-3 text-xl leading-relaxed text-[#333333]">{job.detail}</p>
                </div>
              </article>
            );
          })}
        </div>
      </Section>

      {/* How it works */}
      <Section bg="light-gray" size="lg">
        <SectionHeading
          eyebrow="How It Works"
          title="Four Steps. No Surprises."
        />
        <ol className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {howItWorks.map((s) => (
            <li
              key={s.step}
              className="relative flex flex-col rounded-2xl border border-[#E5E5E5] bg-white p-6"
            >
              <span className="absolute -top-3 left-6 inline-flex items-center justify-center bg-[#F96302] px-3 py-1 font-display text-sm font-black uppercase tracking-wide text-white">
                Step {s.step}
              </span>
              <h3 className="mt-3 font-display text-xl font-black uppercase leading-tight tracking-tight text-black">
                {s.title}
              </h3>
              <p className="mt-3 text-lg leading-relaxed text-[#333333]">{s.detail}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-start gap-3 rounded-2xl border border-[#E5E5E5] bg-white p-5">
            <ShieldCheck className="h-5 w-5 flex-shrink-0 text-[#F96302] mt-0.5" strokeWidth={1.5} aria-hidden="true" />
            <div>
              <p className="font-display text-base font-black uppercase tracking-tight text-black">
                No upfront credit pull
              </p>
              <p className="mt-1 text-sm text-[#333333]">
                You only apply when you choose to. We never run a credit check on the Z and Z side.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-[#E5E5E5] bg-white p-5">
            <ClipboardCheck className="h-5 w-5 flex-shrink-0 text-[#F96302] mt-0.5" strokeWidth={1.5} aria-hidden="true" />
            <div>
              <p className="font-display text-base font-black uppercase tracking-tight text-black">
                Clear written quote
              </p>
              <p className="mt-1 text-sm text-[#333333]">
                Scope and price in writing before any financing conversation. You always have the cash option.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-[#E5E5E5] bg-white p-5">
            <CreditCard className="h-5 w-5 flex-shrink-0 text-[#F96302] mt-0.5" strokeWidth={1.5} aria-hidden="true" />
            <div>
              <p className="font-display text-base font-black uppercase tracking-tight text-black">
                Third-party lenders
              </p>
              <p className="mt-1 text-sm text-[#333333]">
                Z and Z is not a lender. Approvals, rates, and terms come from the financing partner.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section bg="white" size="lg" narrow>
        <SectionHeading
          eyebrow="Financing FAQ"
          title="Common Questions."
          description="The straight answers homeowners ask before applying."
        />
        <FaqAccordion items={faqs} />
      </Section>

      {/* Trust strip */}
      <Section bg="light-gray" size="md">
        <SectionHeading eyebrow="Credentials" title="Licensed Contractor. CSLB #896116." />
        <TrustStrip />
        <p className="mt-6 max-w-2xl text-xs leading-relaxed text-[#666666]">
          <FileText className="mr-2 inline h-3.5 w-3.5 text-[#666666]" aria-hidden="true" />
          Financing offers are provided by independent third-party lenders. Z and Z Plumbing does not extend credit and
          is not responsible for credit decisions, rates, or terms. All financing terms are subject to applicant
          eligibility and lender approval. See the lender&apos;s disclosures for full details.
        </p>
      </Section>

      {/* CTA band */}
      <Section bg="hero-orange" size="md">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-4xl font-black uppercase leading-tight text-white md:text-5xl">
              Ready to Talk Through Options?
            </h2>
            <p className="mt-2 font-sans text-base text-white/85">
              Call us with your project. We will tell you what it costs and whether financing is worth considering.
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
