import type { Metadata } from "next";
import Link from "next/link";
import { Phone, ChevronRight, BookOpen, Wrench } from "lucide-react";
import { Section, SectionHeading } from "@/components/Section";
import { Button } from "@/components/Button";
import { TrustStrip } from "@/components/TrustStrip";
import { siteSettings } from "@/content/site-settings";

export const metadata: Metadata = {
  title: "Z and Z Plumbing Blog | East Bay Plumbing Articles",
  description:
    "Articles, guides, and answers from Z and Z Plumbing. New blog posts are landing soon. In the meantime, browse our service pages for guidance on sewer lateral, water heater, drain cleaning, and emergency plumbing work in the East Bay.",
  alternates: { canonical: `${siteSettings.siteUrl}/blog/` },
  openGraph: {
    title: "Z and Z Plumbing Blog",
    description: "Plumbing guides and articles from Z and Z Plumbing in the East Bay.",
    url: `${siteSettings.siteUrl}/blog/`,
    type: "website",
  },
  robots: { index: true, follow: true },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${siteSettings.siteUrl}/` },
    { "@type": "ListItem", position: 2, name: "Blog", item: `${siteSettings.siteUrl}/blog/` },
  ],
};

const directions = [
  { label: "Services Hub", href: "/services/", detail: "All 12 plumbing service categories." },
  { label: "Sewer Lateral Oakland", href: "/sewer-lateral-oakland/", detail: "EBMUD compliance and street-side work." },
  { label: "Water Heater Oakland", href: "/water-heater-oakland/", detail: "Tank and tankless repair and install." },
  { label: "Drain Cleaning Oakland", href: "/drain-cleaning-oakland/", detail: "Snake, camera, hydrojet." },
  { label: "24/7 Emergency", href: "/emergency-plumber-oakland/", detail: "We answer the phone." },
  { label: "Service Areas", href: "/service-areas/", detail: "East Bay corridor coverage." },
];

export default function BlogIndexPage() {
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
          <span className="text-white">Blog</span>
        </nav>
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="h-5 w-5 text-[#F96302]" strokeWidth={1.5} aria-hidden="true" />
          <p className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#F96302]">
            Z and Z Plumbing Blog
          </p>
        </div>
        <h1 className="max-w-4xl font-display text-5xl md:text-7xl font-black uppercase leading-none tracking-tight text-white">
          New Articles Landing Soon.
        </h1>
        <p className="mt-6 max-w-2xl font-sans text-2xl leading-relaxed text-white/80 md:text-3xl">
          We are rebuilding our blog content library. The full archive of plumbing guides, neighborhood tips, and
          maintenance advice is in production and ships in the coming weeks. In the meantime, our service pages cover
          the work we run most often in the East Bay.
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
          <Button variant="inverse" size="lg" href="/services/">
            See Services
          </Button>
        </div>
      </Section>

      {/* Where to go next */}
      <Section bg="white" size="lg">
        <SectionHeading
          eyebrow="In the Meantime"
          title="Useful Pages Right Now."
          description="Skip the article and find the plumbing help you need directly."
        />
        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {directions.map((d) => (
            <li key={d.href}>
              <Link
                href={d.href}
                className="flex h-full items-start gap-4 rounded-2xl border border-[#E5E5E5] bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#F96302] md:p-7"
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center bg-[#F96302] text-white">
                  <Wrench className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <p className="font-display text-xl font-black uppercase leading-tight tracking-tight text-black md:text-2xl">
                    {d.label}
                  </p>
                  <p className="mt-2 text-lg leading-relaxed text-[#333333]">{d.detail}</p>
                  <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#F96302]">
                    Open
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* Trust strip */}
      <Section bg="light-gray" size="md">
        <SectionHeading eyebrow="Credentials" title="Two California Licenses. One Crew." />
        <TrustStrip />
      </Section>

      {/* CTA band */}
      <Section bg="hero-orange" size="md">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-4xl font-black uppercase leading-tight text-white md:text-5xl">
              Got a Plumbing Question?
            </h2>
            <p className="mt-2 font-sans text-base text-white/85">
              A plumber answers the phone. {siteSettings.phone}.
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
            <Button variant="secondary" size="lg" href="/book/">
              Schedule Online
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
