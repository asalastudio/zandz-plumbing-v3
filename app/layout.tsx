import type { Metadata } from "next";
import Script from "next/script";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { AnalyticsEvents } from "@/components/AnalyticsEvents";
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
  // Pages set only the keyword part of their title; the template appends the
  // brand once. Never put "Z and Z Plumbing" in a child page's `title` (it
  // doubles up), and keep the full rendered title at or under ~60 characters.
  title: {
    default: "East Bay Plumber in San Leandro, CA | Z and Z Plumbing",
    template: "%s | Z and Z Plumbing",
  },
  description:
    "Z and Z Plumbing is a licensed East Bay plumber in San Leandro. C-36 and A General Engineering, same-day service, and 24/7 emergencies. (510) 708-4237.",
  openGraph: {
    siteName: "Z and Z Plumbing",
    locale: "en_US",
    type: "website",
  },
  robots: { index: true, follow: true },
};

// Citation profiles AI agents use for entity reconciliation. Order: most
// authoritative for plumbing first, then social, then directory tier 2.
// Only real profile URLs belong here. The Google search URL in
// siteSettings.social.google is not a Business Profile, so it stays out until
// a confirmed Maps CID URL (https://maps.google.com/?cid=...) replaces it.
// HomeAdvisor was dropped because its URL now 301s to an unrelated business.
const sameAsProfiles = [
  siteSettings.social.yelp,
  siteSettings.social.bbb,
  siteSettings.social.facebook,
  siteSettings.social.instagram,
  siteSettings.social.nextdoor,
  siteSettings.social.chamberOfCommerce,
].filter((url): url is string => Boolean(url));

const ORGANIZATION_ID = `${siteSettings.siteUrl}/#organization`;
const WEBSITE_ID = `${siteSettings.siteUrl}/#website`;

const cslbAuthority = {
  "@type": "GovernmentOrganization" as const,
  name: "California Contractors State License Board",
  alternateName: "CSLB",
  url: "https://www.cslb.ca.gov",
};

const localBusinessSchema = {
  "@type": ["Plumber", "LocalBusiness"],
  "@id": ORGANIZATION_ID,
  name: siteSettings.name,
  legalName: siteSettings.legalName,
  alternateName: "Z & Z Plumbing",
  url: siteSettings.siteUrl,
  // Dark-text wordmark so the logo reads on Google's white surfaces. The
  // image is the generated 1200x630 brand card from app/opengraph-image.tsx
  // (trailing slash: trailingSlash:true 308s the bare path).
  logo: `${siteSettings.siteUrl}/logo-wordmark.svg`,
  image: `${siteSettings.siteUrl}/opengraph-image/`,
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
  // Staffed office hours only. The previous value claimed 00:00-23:59 seven
  // days a week, which misrepresents the business: 24/7 refers to emergency
  // dispatch, not to the office being open. Google surfaces these hours
  // directly, so an inflated value reads as "open now" at 2am on a Sunday.
  // The 24/7 emergency capability is communicated in copy instead.
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "07:00",
    closes: "17:00",
  },
  foundingDate: String(siteSettings.foundedYear),
  priceRange: "$$",
  // NOTE: aggregateRating intentionally omitted. Google's structured-data
  // policy disallows self-serving aggregateRating on your own LocalBusiness
  // unless it reflects genuine, first-party reviews collected and displayed
  // on-site. The prior value mixed Google's rating (4.6) with Yelp's count
  // (238), which is inaccurate and risks a manual action / star suppression.
  // To surface star ratings legitimately, either (a) rely on third-party
  // platform stars (Google/Yelp profiles) or (b) implement genuine on-page
  // Review markup tied to real, displayed customer reviews from one source.
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
    worksFor: { "@id": ORGANIZATION_ID },
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

const websiteSchema = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: siteSettings.name,
  url: `${siteSettings.siteUrl}/`,
  inLanguage: "en-US",
  publisher: { "@id": ORGANIZATION_ID },
};

// One graph for the site-wide entities. Page-level Service nodes reference the
// organization by ORGANIZATION_ID instead of redefining it inline.
const siteSchema = {
  "@context": "https://schema.org",
  "@graph": [localBusinessSchema, websiteSchema],
};

// Analytics IDs come from env so we never hardcode tracking IDs and can keep
// them out of non-production builds. Set in Vercel project settings:
//   NEXT_PUBLIC_GA_ID       e.g. "G-XXXXXXXXXX"  (GA4 Measurement ID)
//   NEXT_PUBLIC_CLARITY_ID  e.g. "abcdefghij"    (Microsoft Clarity project ID)
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
        />
      </head>
      <body className="font-sans antialiased bg-white text-black">
        <Header />
        <main>{children}</main>
        <Footer />
        <StickyMobileCTA />
        <AnalyticsEvents />

        {/* Google Analytics 4 — only rendered when NEXT_PUBLIC_GA_ID is set */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
            </Script>
          </>
        )}

        {/* Microsoft Clarity — only rendered when NEXT_PUBLIC_CLARITY_ID is set */}
        {CLARITY_ID && (
          <Script id="ms-clarity" strategy="afterInteractive">
            {`(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${CLARITY_ID}");`}
          </Script>
        )}
      </body>
    </html>
  );
}
