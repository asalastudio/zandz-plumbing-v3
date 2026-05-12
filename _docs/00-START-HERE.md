# START HERE

**Welcome to the Z and Z Plumbing v3 build.** Read this doc in full before you write a single line of code.

**Date:** 2026-05-11
**Project:** Marketing site for Z and Z Plumbing (East Bay plumber, HQ San Leandro, primary market Oakland)
**Working dir:** `Z&Zplumbing-v3/` (the folder this file lives in)
**Status:** Design locked. SEO baseline locked. Awaiting implementation.

---

## How to use this folder

1. Open `_docs/design-reference/locked-homepage-mockup.html` in a browser for layout and component behavior. Open `_docs/brand-package/brand-snapshot.html` for identity applications.
2. Read this doc top to bottom.
3. Skim `prd/prd.md` to understand the 12 implementation steps and acceptance criteria.
4. Skim `strategy/business-truth.md` to internalize the canonical facts.
5. Skim `brand-package/00-README.md`, `brand-package/MASTER-PROMPT.md`, `06-design-system.md` (v3), and `03-typography.md` (v3).
6. When ready, paste `kickoff-prompt.md` into a fresh Claude Code session and start building.

---

## Reading order (high to low priority)

### Tier 1: Read before coding

| File | Why |
|---|---|
| `00-START-HERE.md` (this file) | Orientation |
| `strategy/business-truth.md` | Canonical facts. NAP, license, phone, founding year, competitor-routing bug. Trust this over anything else. |
| `prd/prd.md` | The 12-step implementation plan with acceptance criteria and locked decisions section. |
| `brand-package/00-README.md` | Brand package index |
| `brand-package/MASTER-PROMPT.md` | Canonical identity-system input. Brand snapshot and image-gen prompt pack derive from this. |
| `brand-package/brand-snapshot.html` | Visual identity snapshot for logo, fleet, signage, apparel, web, and prompts. |
| `brand-package/00-brand-snapshot-and-image-gen-prompts.md` | Copy-ready image-gen prompt pack derived from the master prompt. |
| `brand-package/01-brand-strategy.md` | Why Home Depot-inspired, what we're saying with the brand |
| `brand-package/02-color-system.md` | Strict color tokens (`#F96302`, black, white, `#333333`, `#666666`, `#F2F2F2`) |
| `brand-package/03-typography.md` (v3) | Barlow Condensed for display/logo/headlines. Inter for body/UI. |
| `brand-package/05-voice-and-tone.md` | Voice rules. Banned phrases. No em-dashes. |
| `brand-package/06-design-system.md` (v3) | Components. Buttons `rounded-none`. Cards `rounded-2xl`. lucide-react icons. Motion patterns. |
| `brand-package/09-design-reference-v3.md` | How to read the locked mockup. What it locks, what it forbids. |
| `design-reference/locked-homepage-mockup.html` | Homepage layout and component-behavior reference. Open in a browser. |

### Tier 2: Read when you hit the relevant step

| File | Read it when |
|---|---|
| `brand-package/04-logo-system.md` | Step 5 (Logo asset pipeline) |
| `brand-package/07-image-direction.md` | Image curation and OG image generation |
| `brand-package/08-website-brand-spec.md` | Page-by-page brand application |
| `seo/gsc-baseline-summary.md` | Step 7 (priority service-plus-city pages) |
| `seo/keyword-priority-matrix.csv` | Page targeting decisions |
| `seo/url-migration-map-v4-FINAL.csv` | Step 10 (redirects) |
| `seo/next-config-redirects.js` | Step 10 (drop into `next.config.ts`) |
| `seo/indexed-urls-final-destinations.csv` | URL validation |
| `seo/content-migration-decisions.md` | Which legacy posts to keep vs retire |
| `seo/quick-wins-list.md` | Striking-distance opportunities |
| `seo/citation-audit-master.xlsx` | Off-page SEO and NAP correction list |
| `content-drafts/page-plumber-oakland.md` | Building `/plumber-oakland-ca/` |
| `content-drafts/page-sewer-lateral-oakland.md` | Building `/sewer-lateral-oakland/` (P0 page) |
| `content-drafts/service-city-page-template.md` | Building any service-plus-city page |
| `content-drafts/voice-of-customer-template.md` | Yelp review mining for testimonials |
| `content-drafts/blog-content-calendar-template.md` | Step 9 (blog content) |
| `content-drafts/home-care-club-program.md` | Maintenance plan upsell content |
| `integrations/hubspot-setup-checklist.md` | Step 8 (HubSpot wiring) |
| `integrations/servicetitan-integration-spec.md` | Step 8 (ServiceTitan Path B manual workflow) |
| `strategy/credentials-request.md` | What we still need from Jay |
| `strategy/diagnostic-for-jay.md` | The 19 diagnosed legacy-site issues |
| `strategy/integrated-roadmap-v2.md` | 90-day roadmap context |
| `strategy/address-transition-strategy.md` | Sterling Sky GBP 3-step process |
| `strategy/engagement-scope.md` | What's in scope vs out of scope |
| `strategy/project-rules-claude-md.md` | Project-level Claude rules |

---

## The 12 implementation steps (from `prd/prd.md`)

1. Repo scaffold and tooling (Next.js 16 App Router + Tailwind v4 + TypeScript)
2. Brand foundation: globals.css `@theme` tokens, layout.tsx with Barlow Condensed + Inter and LocalBusiness JSON-LD
3. Component library: Container, Section, Button (`rounded-none`), Logo (placeholder), Header, Footer, StickyMobileCTA (split light-gray + orange), ServiceCard, TestimonialCard + Carousel, FAQ with FAQPage schema, ZipCodeSearch, BookingWidget 4-step
4. Content layer: TypeScript constants in `/content/` (site-settings, services, service-areas, testimonials, team) plus MDX for blog
5. Page templates: homepage, about, services hub, service-areas hub, contact, reviews, financing, privacy, terms
6. Dynamic routes: `/services/[slug]/` (12 services), `/[cityslug]/` (10 cities), `/sewer-lateral-oakland/` static priority page
7. Priority service-plus-city pages: emergency-plumber-oakland, water-heater-oakland, drain-cleaning-oakland, repipe-oakland
8. Integrations: HubSpot Forms API in `app/api/lead/route.ts` with degraded mode; ServiceTitan Path B documented in this folder (no code)
9. Blog: `/blog/` index plus `/blog/[slug]/` MDX renderer; one starter post on EBMUD compliance
10. SEO: 79 redirects in `next.config.ts`, sitemap, robots, OG images, canonical URLs, alternates
11. QA: Lighthouse Mobile (P>=75, A>=95, BP>=95, SEO=100), Rich Results Test, manual mobile QA, grep for `tel:9255863212`, test lead end-to-end, spot-check 5 redirects
12. Vercel and DNS: `vercel link`, add domains, GoDaddy DNS, SSL, sitemap submission, GSC indexing requests for top 20 pages

---

## Things that are LOCKED (do not change)

### Brand
- Hero Orange `#F96302`, Black, White, Dark Gray `#333333`, Medium Gray `#666666`, Light Gray `#F2F2F2` or `#F5F5F5`, Border Gray `#E5E5E5`
- Tagline: "The Pros Other Plumbers Call"
- Supporting: "Two licenses. One crew. Same-day service."
- Barlow Condensed for display, logo, headlines, truck wraps, signage, apparel, social tiles, and large CTAs. Inter for body, UI, forms, cards, trust strips, captions, and metadata.
- Visual wordmark: `Z AND Z PLUMBING`, spelled out, all caps, no ampersand.
- lucide-react icons (only). No in-house SVG `Icon`/`Star`/`Chevron` components.
- Buttons `rounded-none`. Cards `rounded-2xl`. Inputs `rounded-md`.
- Button hover: `-translate-y-0.5` plus `shadow-lg`. Card hover: `-translate-y-1` plus orange border swap.

### Business facts
- HQ 3057 Teagarden Street, San Leandro, CA 94577
- Phone (510) 708-4237 (never tel:9255863212)
- CSLB #896116 C-36 (2007) plus A General Engineering (2012)
- Founded 2003. Sole owner Seifullah Zaki Zareef.

### Architecture
- Next.js 16 App Router. Server components by default.
- Tailwind v4 via `@theme` in `globals.css`. No `tailwind.config.ts`.
- HubSpot Starter for CRM.
- ServiceTitan Essentials Path B (no API).
- TypeScript content constants in `/content/` plus MDX for blog. No Sanity in v1.

### Voice
- No em-dashes.
- No "look no further", "in today's fast-paced world", "we pride ourselves on", "state-of-the-art", "top-notch", "unparalleled". No self-applied "premier" or "best".

---

## Things that are NOT locked (open questions or future)

- The refined logo SVGs are pending Jordan. Use the orange placeholder box with white Droplet lucide icon until then.
- HubSpot Portal ID and Form ID are pending Jay (after Jordan completes setup per `integrations/hubspot-setup-checklist.md`).
- ServiceTitan Marketing Pro inclusion is pending Jay's confirmation.
- DNS cutover at GoDaddy is the final step.
- Phase 2 backlog (do not touch in v1): Sanity Studio, ServiceTitan API (Path A), photo shoot, mascot exploration, more blog content.

---

## When ready to build

1. Open this folder in your IDE (Cursor, VS Code with Claude Code, etc.)
2. Start a fresh Claude Code session in this workspace
3. Paste `_docs/kickoff-prompt.md` into the chat
4. The agent reads the canonical context, then asks what to ship first
5. Reply with the priority item (or say "start with emergency-plumber-oakland" since it has the highest remaining GSC impression base at 20k)

---

## Cross-cutting reminders

- **Trailing slashes on every URL.** `/about/` not `/about`. `next.config.ts` enforces this.
- **Phone format:** `tel:+15107084237` or `siteSettings.phoneTel`.
- **Server components by default.** `"use client"` only when state or effects require it (TestimonialCarousel, Header mobile menu, ZipCodeSearch, BookingWidget).
- **Imports use `@/` aliases.** Configure in `tsconfig.json`.
- **Every page exports `metadata: Metadata`.** Title, description, alternates.canonical, openGraph.
- **Grep for `tel:9255863212` before every commit.** Should never appear.
- **Open the locked mockup and brand snapshot in browser tabs while building.** Diff layout against the mockup and identity against the snapshot.
- **Identity conflicts:** if typography, logo, color, fleet, signage, apparel, or image-gen rules conflict, `brand-package/MASTER-PROMPT.md` wins.
