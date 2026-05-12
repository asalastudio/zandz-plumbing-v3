# 08 · Website Brand Spec

**Status:** Locked 2026-05-11
**Purpose:** Map every brand decision in docs 01 through 07 to the specific files and components in `Z&Zplumbing-v3/`. This is the integration spec the dev follows during implementation.
**Identity source:** `MASTER-PROMPT.md`

## Tailwind v4 theme tokens

`Z&Zplumbing-v3/app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-hero-orange: #F96302;
  --color-brand-black: #000000;
  --color-brand-white: #FFFFFF;
  --color-dark-gray: #333333;
  --color-medium-gray: #666666;
  --color-light-gray: #F2F2F2;
  --font-display: var(--font-barlow-condensed), "Barlow Condensed", system-ui, sans-serif;
  --font-sans: var(--font-inter), Inter, system-ui, sans-serif;
}
```

Do not create `tailwind.config.ts`.

## Font loading

`Z&Zplumbing-v3/app/layout.tsx`:

```typescript
import { Barlow_Condensed, Inter } from "next/font/google";

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${barlow.variable} ${inter.variable}`}>
      <body className="font-sans text-base text-[#333333] bg-white">
        {children}
      </body>
    </html>
  );
}
```

## Component file plan

| File | Maps to brand spec |
|---|---|
| `components/Button.tsx` | Doc 06: Primary, Secondary, Tertiary CTA variants with sizing tiers sm/md/lg/xl |
| `components/Header.tsx` | Doc 06: Sticky header (mobile + desktop) |
| `components/StickyMobileCTA.tsx` | Doc 06: Fixed bottom Call + Schedule bar |
| `components/Footer.tsx` | Doc 06: 4-column footer with logo, services, areas, company info |
| `components/Hero.tsx` | Doc 06: Homepage hero pattern |
| `components/PageHero.tsx` | Doc 06: Service / city page hero pattern |
| `components/ServiceCard.tsx` | Doc 06: Service card |
| `components/TestimonialCard.tsx` | Doc 06: Testimonial card |
| `components/TestimonialCarousel.tsx` | Wraps TestimonialCard with shadcn Carousel |
| `components/TrustBadge.tsx` | Doc 06: Trust badge pill component |
| `components/TrustStrip.tsx` | Wraps multiple TrustBadge components in a horizontal scroll row |
| `components/Section.tsx` | Doc 06: Section padding wrapper with background variant prop |
| `components/Container.tsx` | Doc 06: Max-width container with responsive padding |
| `components/FAQ.tsx` | shadcn Accordion wrapper styled to brand spec |
| `components/LateralDiagram.tsx` | Doc 07: The sewer lateral cross-section SVG component |
| `components/forms/FormField.tsx` | Doc 06: Form input + label + error styling |
| `components/forms/FormSelect.tsx` | shadcn Select wrapped with brand styling |
| `components/forms/FormDatePicker.tsx` | shadcn Calendar + Popover wrapped |
| `components/service-area/ZipCodeSearch.tsx` | Doc 06: Zip-code search input with map (see PRD Step 6) |
| `components/booking/BookingWidget.tsx` | Doc 06: 4-step booking flow (see PRD Step 6) |
| `components/Logo.tsx` | Doc 04: Renders the correct logo variant by prop (primary, white, black, icon-only) |

## Page layout templates

| Template file | Used by |
|---|---|
| `app/(marketing)/layout.tsx` | All public marketing pages: Header + page content + StickyMobileCTA + Footer |
| `app/(marketing)/page.tsx` | Homepage |
| `app/(marketing)/about/page.tsx` | About page |
| `app/(marketing)/services/page.tsx` | Services hub |
| `app/(marketing)/services/[slug]/page.tsx` | Individual service pages (dynamic) |
| `app/(marketing)/service-areas/page.tsx` | Service Areas hub with zip search + map |
| `app/(marketing)/[cityslug]/page.tsx` | Individual city pages (dynamic, e.g., /plumber-oakland-ca/) |
| `app/(marketing)/[servicecity]/page.tsx` | Service+city pages (dynamic, e.g., /sewer-lateral-oakland/) |
| `app/(marketing)/contact/page.tsx` | Contact page with booking widget |
| `app/(marketing)/reviews/page.tsx` | Reviews / testimonials hub |
| `app/(marketing)/blog/page.tsx` | Blog index |
| `app/(marketing)/blog/[slug]/page.tsx` | Blog post (dynamic, MDX-rendered) |
| `app/(marketing)/financing/page.tsx` | Financing info |
| `app/(marketing)/privacy-policy/page.tsx` | Legal |
| `app/(marketing)/terms/page.tsx` | Legal |
| `app/api/lead/route.ts` | Form submission endpoint, posts to HubSpot |
| `_docs/integrations/servicetitan-integration-spec.md` | ServiceTitan Path B manual workflow documentation. No ServiceTitan API code in v1. |

## Image asset plan

| File path | Source | Purpose |
|---|---|---|
| `public/logos/logo.svg` | From Jordan's logo refinement | Header primary lockup |
| `public/logos/logo-white.svg` | Same | Footer + dark backgrounds |
| `public/logos/logo-black.svg` | Same | Print + monochrome |
| `public/logos/icon.svg` | Same | Favicon + app icons + sticky CTA badges |
| `public/favicon.ico` | Same, exported | Browser tab |
| `public/apple-touch-icon.png` | Same, 180x180 PNG | iOS home screen |
| `public/og/default.jpg` | TBD design | Default Open Graph image |
| `public/og/[page-slug].jpg` | Per-page | Page-specific OG images |
| `public/images/...` | Per doc 07 inventory | All photography |

## Schema and metadata templates

Sitewide `LocalBusiness` schema lives in `app/layout.tsx` head:

```typescript
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "Plumber",
  "name": "Z and Z Plumbing",
  "url": "https://zandzplumbing.com",
  "telephone": "+15107084237",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "3057 Teagarden Street",
    "addressLocality": "San Leandro",
    "addressRegion": "CA",
    "postalCode": "94577",
    "addressCountry": "US"
  },
  "areaServed": [
    "Oakland", "San Leandro", "Berkeley", "Alameda",
    "Hayward", "Castro Valley", "Richmond", "Lafayette",
    "Pinole", "Emeryville"
  ],
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
    "opens": "00:00",
    "closes": "23:59"
  },
  "hasCredential": {
    "@type": "EducationalOccupationalCredential",
    "credentialCategory": "license",
    "name": "CSLB #896116",
    "recognizedBy": {
      "@type": "GovernmentOrganization",
      "name": "California Contractors State License Board"
    }
  }
};
```

Per-page Service + FAQPage schema lives in each page component.

## Content data layer

Per PRD Step 4 (Sanity deferred), content lives in TypeScript constants:

```
Z&Zplumbing-v3/content/
├── site-settings.ts     SiteSettings (phone, address, tagline, license, social)
├── services.ts          Service[] (12 services with full content)
├── service-areas.ts     ServiceArea[] (10 cities with zips, intro, neighborhoods)
├── testimonials.ts      Testimonial[] (review quotes)
├── team.ts              TeamMember[] (Jay, Seif, crew)
└── blog/                MDX files for blog posts
```

Type definitions in `Z&Zplumbing-v3/types/content.ts`:

```typescript
export interface SiteSettings {
  phone: string;
  phoneTel: string;
  address: { street: string; city: string; state: string; zip: string };
  email: string;
  hours: string;
  tagline: string;
  taglineSupporting: string;
  license: { number: string; classifications: string[]; sinceYear: number };
  social: { facebook?: string; instagram?: string; youtube?: string };
}

export interface Service {
  slug: string;
  title: string;
  shortTitle: string;
  summary: string;
  description: string;
  pricingRange?: { low: number; high: number; typical?: { low: number; high: number } };
  faqs: Faq[];
  relatedServiceSlugs: string[];
  icon: string; // lucide-react icon name
  heroImage?: string;
}

export interface ServiceArea {
  slug: string;
  cityName: string;
  zips: string[];
  introCopy: string;
  neighborhoods: string[];
  housingEras: string[];
  isHQ: boolean;
}

export interface Testimonial {
  quote: string;
  authorFirstName: string;
  city: string;
  date: string;
  rating: number;
  source?: 'google' | 'yelp' | 'direct';
  servicePerformed?: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  photo: string;
  licenseInfo?: string;
}

export interface Faq {
  question: string;
  answer: string;
}
```

## Phase 2 Sanity swap path

When Sanity comes online in Phase 2:

1. Define Sanity schemas matching the TypeScript types above
2. Migrate content from `content/*.ts` files into Sanity documents
3. Build GROQ queries that return the same TypeScript types
4. Replace import statements in pages from `import { services } from '@/content/services'` to `import { services } from '@/lib/sanity-queries'`

The type contracts stay stable, so the swap is mechanical.

## Implementation order for Step 5

When the dev builds the design system in code, follow this order:

1. Tailwind config + font loading
2. `Container` and `Section` (foundation)
3. `Button` with all variants (used everywhere)
4. `Logo` component (every layout needs it)
5. `Header` (uses Logo + Button)
6. `Footer` (uses Logo + links)
7. `StickyMobileCTA` (uses Button)
8. `TrustBadge` and `TrustStrip`
9. `ServiceCard`
10. `TestimonialCard` and `TestimonialCarousel`
11. `Hero` and `PageHero` (use everything above)
12. `FAQ` accordion
13. `LateralDiagram` (SVG component)
14. Form primitives (`FormField`, `FormSelect`, `FormDatePicker`)
15. `ZipCodeSearch` (uses Form primitives + Container)
16. `BookingWidget` (uses Form primitives + Button + Dialog)

After these, the page-level templates in Step 7 are mostly composition.
