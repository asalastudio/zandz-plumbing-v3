import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { siteSettings } from "@/content/site-settings";

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

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["Plumber", "LocalBusiness"],
  name: "Z and Z Plumbing",
  url: siteSettings.siteUrl,
  telephone: siteSettings.phoneTel,
  email: siteSettings.email,
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
  areaServed: [
    "Oakland", "San Leandro", "Berkeley", "Alameda", "Hayward",
    "Castro Valley", "Richmond", "Emeryville", "Pinole", "Lafayette",
  ].map((name) => ({ "@type": "City", name })),
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
