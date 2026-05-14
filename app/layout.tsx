import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { siteSettings } from "@/content/site-settings";
import { serviceAreas } from "@/content/service-areas";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-barlow-condensed",
  weight: ["700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteSettings.siteUrl),
  title: {
    default: "Z and Z Plumbing | East Bay Plumber | San Leandro, CA",
    template: "%s | Z and Z Plumbing",
  },
  description:
    "Licensed East Bay plumber headquartered in San Leandro. C-36 + A General Engineering. Same-day service across Oakland, Berkeley, Alameda, and the East Bay. Call (510) 708-4237.",
  openGraph: {
    siteName: "Z and Z Plumbing",
    locale: "en_US",
    type: "website",
  },
  robots: { index: true, follow: true },
};

// Citation profiles AI agents use for entity reconciliation. Order: most
// authoritative for plumbing first, then social, then directory tier 2.
const sameAsProfiles = [
  siteSettings.social.google,
  siteSettings.social.yelp,
  siteSettings.social.bbb,
  siteSettings.social.facebook,
  siteSettings.social.instagram,
  siteSettings.social.nextdoor,
  siteSettings.social.homeAdvisor,
  siteSettings.social.chamberOfCommerce,
].filter((url): url is string => Boolean(url));

const cslbAuthority = {
  "@type": "GovernmentOrganization" as const,
  name: "California Contractors State License Board",
  alternateName: "CSLB",
  url: "https://www.cslb.ca.gov",
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["Plumber", "LocalBusiness"],
  "@id": `${siteSettings.siteUrl}/#organization`,
  name: siteSettings.name,
  legalName: siteSettings.legalName,
  alternateName: "Z & Z Plumbing",
  url: siteSettings.siteUrl,
  telephone: siteSettings.phoneTel,
  email: siteSettings.email,
  slogan: siteSettings.supportingLine,
  address: {
    "@type": "PostalAddress",
    streetAddress: siteSettings.address.street,
    addressLocality: siteSettings.address.city,
    addressRegion: siteSettings.address.state,
    postalCode: siteSettings.address.zip,
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: siteSettings.geo.lat,
    longitude: siteSettings.geo.lng,
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "00:00",
    closes: "23:59",
  },
  foundingDate: String(siteSettings.foundedYear),
  priceRange: "$$",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.6",
    reviewCount: "238",
    bestRating: "5",
  },
  areaServed: serviceAreas.map((area) => ({
    "@type": area.city.includes("County") ? "AdministrativeArea" : "City",
    name: area.city,
  })),
  // Entity reconciliation: explicit cross-links to every citation profile so
  // AI agents (Knowledge Graph, ChatGPT, Claude, Perplexity, Gemini) can
  // unify "Z and Z" and "Z & Z" references across the web.
  sameAs: sameAsProfiles,
  // Founder Person schema. Tightly couples the business to a named human,
  // which strengthens the Knowledge Graph entity and helps with E-E-A-T.
  founder: {
    "@type": "Person",
    name: siteSettings.owner,
    jobTitle: "Owner and Master Plumber",
    worksFor: { "@id": `${siteSettings.siteUrl}/#organization` },
  },
  // Two distinct CSLB classifications under one license number. Surfaced as
  // two credential entries so AI agents see both the C-36 plumbing license
  // and the rarer A General Engineering license that lets Z and Z legally
  // work in the public right-of-way (street, sidewalk, lateral past the
  // property line) where most competitors must subcontract.
  hasCredential: [
    {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "license",
      name: "C-36 Plumbing Contractor License",
      identifier: "896116",
      dateCreated: "2007",
      recognizedBy: cslbAuthority,
    },
    {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "license",
      name: "A General Engineering Contractor License",
      identifier: "896116",
      dateCreated: "2012",
      recognizedBy: cslbAuthority,
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body className="font-sans antialiased bg-white text-black">
        <Header />
        <main>{children}</main>
        <Footer />
        <StickyMobileCTA />
      </body>
    </html>
  );
}
