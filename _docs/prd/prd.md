# Plan: Z and Z Plumbing Website + Brand Redesign PRD

**Created:** 2026-05-11
**Status:** Locked, ready for /implement (open questions resolved by Jordan 2026-05-11 evening)
**Request:** Full website rebuild and brand refresh for Z and Z Plumbing on Next.js + HubSpot + ServiceTitan, with Home Depot-inspired brand direction and "The Pros Other Plumbers Call" positioning. Benchmarked against Roto-Rooter, Mr. Rooter, and Benjamin Franklin Plumbing.

---

## Decisions Locked 2026-05-11 (Jordan resolved all 7 open questions)

1. **ServiceTitan plan tier:** **Essentials.** Marketing Pro is included so the post-job SMS review engine is available. API access is The Works only, so the booking flow uses **Path B (manual workflow)**: HubSpot deal-created → email to Jay and Seif → manual entry into ServiceTitan. To confirm with Jay or ServiceTitan account manager: that the current Essentials subscription does in fact include Marketing Pro (it usually does, but tiers occasionally get renamed).
2. **Logo refinement scope:** **Jordan does it in-house.** PRD removes the external-designer path. Asset deliverables (SVG primary + secondary lockups, icon-only, 4 color variants) land at `06_Brand Package-v2/assets/logos/` and `Z&Zplumbing-v2/public/logos/`.
3. **Photography:** **Use existing Z and Z assets for v1 launch.** A proper photo shoot is planned but does NOT block launch. The shoot is treated as a Phase 2 brand-asset upgrade.
4. **HubSpot tier at launch:** **Starter ($20/mo).** Unlocks workflow automation, marketing-email sending, and more forms. Architecture simplifies: HubSpot Starter handles the customer-confirmation email natively (no separate Resend integration needed for that flow). Resend is still useful for any transactional email outside HubSpot.
5. **DNS host at cutover:** **Vercel.** Migrate DNS from GoDaddy to Vercel at launch. Records managed in the Vercel dashboard.
6. **Sanity Studio:** **Deferred to Phase 2 (post-launch add-on).** v1 ships with content in TypeScript constants under `Z&Zplumbing-v2/content/` (services, service areas, testimonials) plus MDX for blog posts. Content shapes are designed to swap cleanly into Sanity GROQ queries when Sanity lands in Phase 2.
7. **Brand walkthrough with Jay + Seif:** **Direction approved.** Home Depot-inspired palette and "The Pros Other Plumbers Call" positioning are locked. No separate brand-review call needed before /implement.

---

## Overview

### What This Plan Accomplishes

A complete tear-down and rebuild of zandzplumbing.com on a modern stack (Next.js App Router on Vercel, Sanity headless CMS, HubSpot for CRM, ServiceTitan for field service) anchored on a confident contractor-authority brand identity in the lineage of Home Depot, Roto-Rooter, and the national plumbing chains. Replaces the existing WordPress site and the Asala-influenced heritage brand direction in `06_Brand Package/`.

### Why This Matters

Per the GSC baseline at `outputs/zandz-plumbing/gsc-baseline-2026-05-11/`, the legacy site converts only 325 of 221,300 search impressions to clicks over 16 months (0.147% CTR vs 2 to 3% industry baseline). The site does almost no acquisition work. 67% of clicks are brand searches from people who already know Z and Z. The new site closes the 75,800 striking-distance impression gap on non-brand commercial queries while replacing the Asala-toned "two licenses, one crew" heritage messaging with the dominant contractor-authority voice that matches how Z and Z's bread-and-butter Oakland market actually shops for plumbers.

---

## Current State

### Relevant Existing Structure

- **Legacy site:** `zandzplumbing.com` on WordPress + Astra + Beaver Builder + SiteGround. Stale since January 2023. Retiring at launch.
- **Existing Next.js scaffold:** `clients/Z & Z Plumbing/Z&Zplumbing-v2/` (Next.js App Router project, partially set up, see `Z&Zplumbing-v2/app/` for current page structure)
- **Existing PRD:** `clients/Z & Z Plumbing/00_Project Brain/website-prd.md` (816 lines, contains pre-pivot content with Oakland-first positioning and heritage brand)
- **Existing brand package:** `clients/Z & Z Plumbing/06_Brand Package/` (22 files defining Asala-influenced heritage system with Prussian Blue, Warm Gold, "Old House Specialists" positioning). This PRD supersedes that direction.
- **Page drafts already written under the new brand:**
  - `clients/Z & Z Plumbing/03_Content Strategy/page-plumber-oakland-2026-05-11.md` (Oakland city hub)
  - `clients/Z & Z Plumbing/03_Content Strategy/page-sewer-lateral-oakland-2026-05-11.md` (Sewer Lateral Oakland service+city)
- **Business ground truth:** `clients/Z & Z Plumbing/00_Project Brain/business-truth.md` (canonical, locked)
- **GSC baseline:** `outputs/zandz-plumbing/gsc-baseline-2026-05-11/` (full keyword + URL data)
- **URL migration map v4 FINAL:** `outputs/zandz-plumbing/gsc-baseline-2026-05-11/url-migration-map-v4-FINAL.csv` (83 legacy URLs mapped to new-site destinations)
- **Address transition strategy:** `clients/Z & Z Plumbing/00_Project Brain/address-transition-strategy-2026-05-11.md` (GBP + Yelp move playbook, runs in parallel with the website build)

### Gaps or Problems Being Addressed

1. **Brand direction reversal.** Existing `06_Brand Package/` is built around heritage, craftsmanship, and Old-House-Specialist positioning with Prussian Blue + Warm Gold. Jordan's pivot is to dominant contractor authority in Home Depot orange. The Asala-toned aesthetic was a design assumption from the original engagement scope, not a client-validated direction. The Roto-Rooter / Mr. Rooter / Benjamin Franklin lineage is closer to how plumbing customers actually shop.
2. **Existing PRD references retired facts.** `website-prd.md` was written before the 5/10 corrections that locked San Leandro HQ, founding-year 2003, and the (925) competitor-routing kill. Some sections are still valid (information architecture, schema requirements, page-level content briefs) but the brand and positioning sections need to be replaced.
3. **Tech stack expansion.** Original engagement spec was Next.js + Vercel only. This PRD adds Sanity as headless CMS so Jay or a future content manager can update services, testimonials, blog posts, and site settings without developer intervention. Also locks HubSpot (free tier) as CRM and ServiceTitan as the FSM with which the booking flow integrates.
4. **No defined booking flow.** Existing PRD has a generic "contact form" without HubSpot or ServiceTitan integration. Roto-Rooter and the nationals have a multi-step booking widget (contact info, location, date/time, service). This PRD specifies that.
5. **No zip-code service area UX.** Existing PRD treated city pages as a flat grid. Roto-Rooter and the nationals use a map + zip-code search that routes the user to the right city page or confirms coverage. That's the pattern to follow.

---

## Proposed Changes

### Summary of Changes

- Replace the brand system in `06_Brand Package/` (archive the existing folder, build a new `06_Brand Package/` with Home Depot-inspired direction)
- Refine the existing faucet logomark into a confident professional tool mark (not cartoonish, no mascot in v1)
- Rebuild the website on Next.js (App Router) + Sanity CMS + Tailwind + shadcn/ui, deployed to Vercel
- Build site structure mirroring Roto-Rooter information architecture, anchored on a zip-code search hero
- Integrate HubSpot Forms API for all lead capture, with Free tier (Starter as a future upgrade)
- Integrate ServiceTitan via API where available, fallback to manual workflow
- Carry forward the URL migration map v4 (83 legacy URLs) as the launch-day redirect set
- Inherit the page drafts already written for Plumber Oakland and Sewer Lateral Oakland under the new brand
- Build out the remaining priority pages from the GSC baseline (Services hub, San Leandro hub, Emergency Plumber Oakland, Water Heater Oakland, Drain Cleaning Oakland, 8 secondary city pages)

### New Files to Create

| File Path | Purpose |
|---|---|
| `plans/2026-05-11-zandz-website-brand-redesign-prd.md` | This PRD (you are reading it) |
| `clients/Z & Z Plumbing/06_Brand Package-v2/` | New brand package folder under the Home Depot-inspired direction. Old `06_Brand Package/` archived to `_archive/2026-05-11_pre-redesign-brand/`. |
| `clients/Z & Z Plumbing/06_Brand Package-v2/01-brand-strategy.md` | Positioning, audience, brand personality |
| `clients/Z & Z Plumbing/06_Brand Package-v2/02-color-system.md` | Home Depot-inspired palette with hex codes |
| `clients/Z & Z Plumbing/06_Brand Package-v2/03-typography.md` | Display and body type system |
| `clients/Z & Z Plumbing/06_Brand Package-v2/04-logo-system.md` | Logomark refinement direction + usage rules |
| `clients/Z & Z Plumbing/06_Brand Package-v2/05-voice-and-tone.md` | Tonal guidelines for site, ads, GBP, emails |
| `clients/Z & Z Plumbing/06_Brand Package-v2/06-design-system.md` | Buttons, cards, forms, sticky CTAs, badges |
| `clients/Z & Z Plumbing/06_Brand Package-v2/07-image-direction.md` | Photography and illustration guidance |
| `clients/Z & Z Plumbing/06_Brand Package-v2/08-website-brand-spec.md` | Brand-to-component mapping for the Next.js site |
| `clients/Z & Z Plumbing/Z&Zplumbing-v2/sanity/` | Sanity Studio config + schema files |
| `clients/Z & Z Plumbing/Z&Zplumbing-v2/sanity/schemas/*.ts` | Document and object schemas (siteSettings, homepage, service, serviceArea, teamMember, testimonial, post, etc.) |
| `clients/Z & Z Plumbing/Z&Zplumbing-v2/lib/hubspot.ts` | HubSpot Forms API client + lead-submission helper |
| `clients/Z & Z Plumbing/Z&Zplumbing-v2/lib/servicetitan.ts` | ServiceTitan API client (or stub with manual-workflow fallback) |
| `clients/Z & Z Plumbing/Z&Zplumbing-v2/lib/sanity.ts` | Sanity client + GROQ query helpers |
| `clients/Z & Z Plumbing/Z&Zplumbing-v2/components/booking/BookingWidget.tsx` | Multi-step booking flow (contact, location, date/time, service) |
| `clients/Z & Z Plumbing/Z&Zplumbing-v2/components/service-area/ZipCodeSearch.tsx` | Zip-code search with map |
| `clients/Z & Z Plumbing/Z&Zplumbing-v2/components/StickyMobileCTA.tsx` | Sticky bottom-of-screen click-to-call + Book Now |
| `clients/Z & Z Plumbing/Z&Zplumbing-v2/next.config.ts` | Updated with the 83-URL redirect map from `outputs/zandz-plumbing/gsc-baseline-2026-05-11/next-config-redirects.js` |
| `clients/Z & Z Plumbing/Z&Zplumbing-v2/public/robots.txt` | Per `outputs/zandz-plumbing/gsc-baseline-2026-05-11/content-migration-decisions.md` section 13 |
| `clients/Z & Z Plumbing/03_Content Strategy/page-services-hub-2026-05-11.md` | Services hub page draft |
| `clients/Z & Z Plumbing/03_Content Strategy/page-emergency-plumber-oakland-2026-05-11.md` | Emergency Plumber Oakland service+city draft |
| `clients/Z & Z Plumbing/03_Content Strategy/page-water-heater-oakland-2026-05-11.md` | Water Heater Oakland service+city draft |
| `clients/Z & Z Plumbing/03_Content Strategy/page-drain-cleaning-oakland-2026-05-11.md` | Drain Cleaning Oakland service+city draft |
| `clients/Z & Z Plumbing/03_Content Strategy/page-plumber-san-leandro-2026-05-11.md` | San Leandro city hub draft (HQ city, rebuild of legacy /plumbers-san-leandro-ca/) |
| `clients/Z & Z Plumbing/00_Project Brain/hubspot-setup-checklist-2026-05-11.md` | Step-by-step HubSpot account, contact properties, deal pipeline, workflow setup |
| `clients/Z & Z Plumbing/00_Project Brain/servicetitan-integration-spec-2026-05-11.md` | API endpoint plan + manual workflow fallback |

### Files to Modify

| File Path | Changes |
|---|---|
| `clients/Z & Z Plumbing/00_Project Brain/website-prd.md` | Mark as superseded by this PRD at the top. Keep for historical reference. Carry forward the IA + schema sections that remain valid into this PRD. |
| `clients/Z & Z Plumbing/index.html` | Update the client hub to surface this PRD as a top tile alongside the integrated roadmap and the diagnostic for Jay. Remove or archive tiles that point to the old `06_Brand Package/`. |
| `CLAUDE.md` (workspace root) | Update the "Client Projects" table to reflect Brand Package v2 and the PRD location. |

### Files to Delete (if any)

No deletions. The existing `06_Brand Package/` and `website-prd.md` move to `_archive/2026-05-11_pre-redesign-brand/` and `_archive/2026-05-11_pre-redesign-prd/` respectively per the hub cleanup plan at `00_Project Brain/hub-audit-and-cleanup-2026-05-11.md`. Archive, do not delete.

---

## Design Decisions

### Key Decisions Made

1. **Home Depot-inspired palette, not Roto-Rooter purple.** Hex orange #F96302 anchors the brand as primary CTA color. Black + white + warm gray supporting. Reasoning: the existing faucet logomark has red in it which already pairs better with orange than purple. Home Depot's brand also carries broader "professional contractor" trust signal beyond the plumbing category. Roto-Rooter's purple is iconic but cannot be ethically borrowed without trademark concerns.

2. **Sanity as the CMS.** Considered: WordPress (cleanly retire), Webflow, Contentful, just-hardcoded-JSON. Sanity wins on: (a) free tier is generous for a single-site contractor, (b) GROQ + structured content map cleanly to Next.js, (c) preview workflow is mature, (d) developer experience is best-in-class for the kind of contractor we'd hand this off to in year 2.

3. **HubSpot Free tier as the starting CRM.** Free tier supports up to 1M contacts, basic deal pipeline, email tracking, and meeting scheduling. Free tier does not include workflows (that's Starter at $20/mo or so). Starting on free, upgrading to Starter once volume justifies it. Migration from HubSpot Free to Starter is one click, no data loss.

4. **ServiceTitan API integration: aspirational, manual workflow as the floor.** ServiceTitan API access requires the "The Works" plan tier (per their published feature matrix). Jay has not yet confirmed the plan tier (open in the credentials request). If The Works: build the API integration. If Essentials or Starter: implement a Zapier-style manual workflow where HubSpot deal-created webhooks email Jay/Seif with the lead details for manual entry into ServiceTitan. PRD treats both paths as implementable, plan ahead for both.

5. **Zip-code search service area UX, not a tile grid.** Per the Roto-Rooter benchmark screenshots Jordan shared. Plumber customers usually know their own zip code and want to confirm coverage immediately. A map + zip field reads as "service area business that knows where it serves," which is the SAB classification we're moving the GBP listing to anyway. A grid of 10 city tiles reads as "directory," which is the wrong vibe.

6. **"The Pros Other Plumbers Call" as primary brand promise.** Reasoning: this is the only positioning that turns Z and Z's A General Engineering license into a customer-facing benefit without requiring the customer to understand CSLB classification minutiae. Other plumbers literally have to call Z and Z (or someone like them) for street-side work. The tagline is the user-friendly proof of the differentiator. Backup positioning at lower priority: "Two licenses, one crew."

7. **Logo refinement, not full redesign.** The existing faucet mark at `zandzplumbing.com/wp-content/uploads/2020/09/logo-1.png` has equity in the local market (it appears on their trucks, business cards, GBP). A full redesign throws away brand recognition and forces a fleet-graphics expense. A REFINEMENT keeps the faucet silhouette as the identifying mark, cleans up the lettering, removes any childlike/cartoonish lines, and standardizes color values to the new palette.

8. **No mascot in v1.** Jordan explicitly defers this. Many plumbing brands (Mr. Rooter, Benjamin Franklin) use a mascot. We can revisit in 6 to 12 months once the new brand is established.

9. **Mobile-first build, not mobile-adapted.** All component states designed for mobile first. Sticky bottom CTA is mandatory. Click-to-call is the primary action above the fold. Roto-Rooter benchmark mobile views (in Jordan's screenshots) are the reference.

10. **Schema and SEO requirements inherited from the GSC baseline work.** No re-derivation needed. The schema templates in the existing page drafts (Plumber + Service + FAQPage + LocalBusiness + BreadcrumbList) carry forward. NAP is locked at 3057 Teagarden St San Leandro, CSLB #896116, (510) 708-4237.

### Alternatives Considered

- **Webflow instead of Next.js + Sanity.** Rejected because Jordan's existing dev capacity is Next.js + Vercel, and Webflow's lock-in is real. Sanity gives us the editorial UX Jay needs without sacrificing developer flexibility.
- **Salesforce or Pipedrive as CRM instead of HubSpot.** Rejected because HubSpot Free is genuinely free and the integration ecosystem is broader, especially Zapier and the website form embed.
- **Tailwind only, no shadcn/ui.** Considered. Adding shadcn/ui because the booking widget, form fields, and dialog components benefit from a consistent unstyled-but-accessible primitive layer. Tailwind handles styling.
- **Build the city pages as static MDX instead of Sanity entries.** Considered. Sanity wins because Jay or a future content manager can edit city page intros without touching the codebase. The page TEMPLATE lives in code, the per-city CONTENT lives in Sanity.
- **Keep the existing brand package and just update the address.** Rejected because the Asala-influenced heritage brand is fundamentally a different positioning than what Jordan now wants. Refresh, not patch.

### Open Questions (RESOLVED 2026-05-11)

All 7 open questions answered. See "Decisions Locked 2026-05-11" section at the top of this PRD. Summary:

1. ServiceTitan plan: **Essentials** → Path B (manual workflow)
2. Logo refinement: **Jordan in-house**
3. Photography: **existing assets for v1, planned shoot Phase 2**
4. HubSpot tier: **Starter at launch**
5. DNS: **Vercel**
6. Sanity Studio: **deferred to Phase 2, v1 uses TypeScript content + MDX blog**
7. Brand walkthrough: **direction locked, no separate call needed**

One remaining confirmation needed before /implement, NOT blocking PRD approval:

- **Confirm with Jay or ServiceTitan account manager that Essentials includes Marketing Pro.** If yes, the post-job SMS review automation is ready for Phase 2 launch. If no, HubSpot Starter workflow handles the review-request email as fallback.

---

## Step-by-Step Tasks

Execute these in order during `/implement`. The plan assumes the 8-week sprint targeting launch on or around 2026-07-06 (8 weeks from drafting).

### Step 1: Archive existing brand package and PRD

Move `06_Brand Package/` and `00_Project Brain/website-prd.md` to date-stamped archive subfolders. Add `SUPERSEDED.md` notes pointing to this PRD and the new brand package location.

**Actions:**

- Create `_archive/2026-05-11_pre-redesign-brand/` and move all 22 files from `06_Brand Package/`
- Create `_archive/2026-05-11_pre-redesign-prd/` and move `website-prd.md` and `website-prd.html`
- Drop `SUPERSEDED.md` in each archive folder explaining the supersession

**Files affected:**

- `clients/Z & Z Plumbing/06_Brand Package/*` (22 files)
- `clients/Z & Z Plumbing/00_Project Brain/website-prd.md`
- `clients/Z & Z Plumbing/00_Project Brain/website-prd.html`

### Step 2: Build the new Brand Package v2

Create `06_Brand Package-v2/` with 8 brand docs anchored on Home Depot-inspired direction.

**Actions:**

- Write `01-brand-strategy.md` covering positioning, target audience, brand personality, competitor landscape
- Write `02-color-system.md` with the exact palette below
- Write `03-typography.md` selecting display font (recommendation: Roboto Condensed or Barlow Condensed for headlines, Inter for body) and pairing rules
- Write `04-logo-system.md` with the logomark refinement direction, primary and secondary lockups, clear-space rules, color variants
- Write `05-voice-and-tone.md` with sample copy snippets that demonstrate the dominant contractor-authority voice
- Write `06-design-system.md` covering buttons (orange primary, black secondary, white-bordered tertiary), cards, forms, badges, sticky CTAs
- Write `07-image-direction.md` covering photography style (Roto-Rooter and Home Depot photography references), illustration usage (minimal, functional, not playful)
- Write `08-website-brand-spec.md` mapping each brand component to the Next.js codebase

**Color palette (locked):**

| Token | Hex | Usage |
|---|---|---|
| `hero-orange` | `#F96302` | Primary CTA fills, accent badges, hover states on dark backgrounds |
| `black` | `#000000` | Page headers, primary text on light backgrounds, footer band, sticky mobile CTA bar |
| `white` | `#FFFFFF` | Page backgrounds, button text on dark/orange fills, breathing room |
| `warm-gray` | `#5C5C5C` | Body text, secondary copy, form labels |
| `light-gray` | `#F5F5F5` | Section backgrounds, card fills, form input backgrounds |

No Prussian Blue, no Warm Gold, no Bone, no heritage tones. The palette is intentionally industrial.

**Tagline (primary):** "The Pros Other Plumbers Call"
**Tagline (supporting):** "Two licenses. One crew. Same-day service."

### Step 3: Refine the logomark

Take the existing faucet mark at `zandzplumbing.com/wp-content/uploads/2020/09/logo-1.png` (or the file Jordan attached to chat once it lands in `context/import/`) and produce a refined direction.

**Actions:**

- Trace the existing faucet into a clean vector (SVG)
- Standardize the line weights to a confident, slightly heavy stroke
- Replace the cartoon water droplet with either a single straight drip line or remove it entirely depending on which reads stronger
- Set the wordmark in the chosen display font (likely Barlow Condensed Bold or Roboto Condensed Black)
- Lock the primary lockup (icon + wordmark) horizontal and vertical variants
- Lock the icon-only variant for favicons, app icons, social avatars
- Specify color variants: full-color, single-color black, single-color white, single-color orange
- Save outputs to `06_Brand Package-v2/assets/logos/` and `Z&Zplumbing-v2/public/logos/`

**Files affected:**

- `clients/Z & Z Plumbing/06_Brand Package-v2/04-logo-system.md` (spec)
- `clients/Z & Z Plumbing/06_Brand Package-v2/assets/logos/` (artwork)
- `clients/Z & Z Plumbing/Z&Zplumbing-v2/public/logos/` (production assets)

### Step 4: Content layer (v1: TypeScript constants + MDX, Sanity deferred to Phase 2)

Per the locked decision 6: Sanity is deferred to Phase 2. v1 ships with content in code, structured to swap cleanly to Sanity GROQ later.

**Actions for v1:**

- Build `Z&Zplumbing-v2/content/` directory with typed TypeScript modules that mirror the eventual Sanity document shapes
- `content/site-settings.ts` exports a single `SiteSettings` object (logo, phone, email, address, social URLs, hours, taglines, license info)
- `content/services.ts` exports a `Service[]` array (one entry per service hub)
- `content/service-areas.ts` exports a `ServiceArea[]` array (10 cities with zips, intro copy, neighborhoods)
- `content/testimonials.ts` exports a `Testimonial[]` array
- `content/team.ts` exports a `TeamMember[]` array (Jay, Seif, key crew if applicable)
- `content/site-settings.ts` and the other files use plain TypeScript types defined in `types/content.ts`
- Blog posts live as MDX files at `content/blog/*.mdx` with frontmatter (title, slug, date, author, excerpt, hero image, SEO fields)
- Use `next-mdx-remote` or `contentlayer` for MDX compilation
- Each page reads content from these modules at build time (Next.js static generation)

**Phase 2 swap path (post-launch):**

- Install Sanity, define the same shapes as Sanity schemas
- Build GROQ queries that return the same TypeScript types
- Swap the import statements in pages from `import { services } from '@/content/services'` to `import { services } from '@/lib/sanity-queries'`
- Add the `/studio` route for the embedded Sanity Studio
- Migrate existing content from the TS files into Sanity documents (one-time copy-paste or scripted)

**Files affected (v1):**

- `clients/Z & Z Plumbing/Z&Zplumbing-v2/content/site-settings.ts`
- `clients/Z & Z Plumbing/Z&Zplumbing-v2/content/services.ts`
- `clients/Z & Z Plumbing/Z&Zplumbing-v2/content/service-areas.ts`
- `clients/Z & Z Plumbing/Z&Zplumbing-v2/content/testimonials.ts`
- `clients/Z & Z Plumbing/Z&Zplumbing-v2/content/team.ts`
- `clients/Z & Z Plumbing/Z&Zplumbing-v2/content/blog/*.mdx`
- `clients/Z & Z Plumbing/Z&Zplumbing-v2/types/content.ts`

### Step 5: Build the design system in code

Implement the Brand Package v2 spec as a Tailwind + shadcn/ui component library.

**Actions:**

- Update `Z&Zplumbing-v2/tailwind.config.ts` to expose the brand tokens (`hero-orange`, `warm-gray`, etc.) and the chosen display + body fonts
- Install shadcn/ui primitives we need: Button, Input, Form, Dialog, Sheet, Accordion, Card
- Build the primary button variants: orange-fill, black-fill, white-outline (border-black)
- Build the sticky mobile CTA bar (`StickyMobileCTA.tsx`): orange Call button + black Book Now button, full-width bottom-fixed
- Build the trust strip component (`TrustStrip.tsx`): badges for CSLB number, license classifications, 24/7 emergency, since 2003
- Build the testimonial card and carousel
- Build the service card grid component
- Build the FAQ accordion

**Files affected:**

- `clients/Z & Z Plumbing/Z&Zplumbing-v2/tailwind.config.ts`
- `clients/Z & Z Plumbing/Z&Zplumbing-v2/components/ui/*.tsx` (shadcn primitives)
- `clients/Z & Z Plumbing/Z&Zplumbing-v2/components/Button.tsx`
- `clients/Z & Z Plumbing/Z&Zplumbing-v2/components/StickyMobileCTA.tsx`
- `clients/Z & Z Plumbing/Z&Zplumbing-v2/components/TrustStrip.tsx`
- `clients/Z & Z Plumbing/Z&Zplumbing-v2/components/ServiceCard.tsx`
- `clients/Z & Z Plumbing/Z&Zplumbing-v2/components/TestimonialCarousel.tsx`
- `clients/Z & Z Plumbing/Z&Zplumbing-v2/components/FaqAccordion.tsx`

### Step 6: Build the zip-code search and booking flow

Two flagship interactive components. Both submit to HubSpot.

**Actions:**

- Build `ZipCodeSearch.tsx`: input + button + result panel that resolves the zip to one of the 10 service cities or shows "out of area" with an option to enter contact info anyway
- Pre-populate the city-zip mapping as a JSON config (`lib/service-area-zips.ts`) covering all 10 cities and the zips we serve in each
- Embed a static map (Google Static Maps API or Mapbox) showing the East Bay with the 10 cities highlighted in orange
- Build `BookingWidget.tsx`: four-step flow modeled on Roto-Rooter (Contact Info → Location → Date & Time → Service Details)
- Each step uses shadcn `Form` with `react-hook-form` + `zod` validation
- Final submit calls `/api/lead` which POSTs to HubSpot Forms API + (if API available) creates a ServiceTitan job + sends a confirmation email via Resend
- Confirmation screen shows "We'll call you back within 30 minutes during business hours" + a click-to-call as a backup

**Files affected:**

- `clients/Z & Z Plumbing/Z&Zplumbing-v2/components/service-area/ZipCodeSearch.tsx`
- `clients/Z & Z Plumbing/Z&Zplumbing-v2/components/booking/BookingWidget.tsx`
- `clients/Z & Z Plumbing/Z&Zplumbing-v2/components/booking/StepContact.tsx`
- `clients/Z & Z Plumbing/Z&Zplumbing-v2/components/booking/StepLocation.tsx`
- `clients/Z & Z Plumbing/Z&Zplumbing-v2/components/booking/StepDateTime.tsx`
- `clients/Z & Z Plumbing/Z&Zplumbing-v2/components/booking/StepService.tsx`
- `clients/Z & Z Plumbing/Z&Zplumbing-v2/lib/service-area-zips.ts`
- `clients/Z & Z Plumbing/Z&Zplumbing-v2/lib/hubspot.ts`
- `clients/Z & Z Plumbing/Z&Zplumbing-v2/lib/servicetitan.ts`
- `clients/Z & Z Plumbing/Z&Zplumbing-v2/app/api/lead/route.ts`

### Step 7: Build the page set

Build every page in the site map below. Page-level content drafts already exist for two of them.

**Actions:**

- Implement each page as a Next.js App Router page reading content from Sanity via GROQ
- Embed schema JSON-LD blocks per the existing page drafts (LocalBusiness + Plumber + Service + FAQPage + BreadcrumbList)
- Wire up the URL migration map at the Next.js config level
- For each city page, render the canonical service+city template with content pulled from Sanity
- Generate the sitemap.xml dynamically from Sanity content
- Generate robots.txt per the spec in `outputs/zandz-plumbing/gsc-baseline-2026-05-11/content-migration-decisions.md`

**Files affected:** see Site Structure section below

### Step 8: Set up HubSpot Starter ($20/mo, locked per decision 4)

Create the HubSpot Starter account and configure contact properties, deal pipeline, workflows, and form integrations.

**Actions:**

- Sign up for HubSpot Starter at hubspot.com/products/get-started using a dedicated Z and Z business email (or `jordan@asala.ai` for now, transfer to Jay later)
- Create contact custom properties: `service_interest` (dropdown of 10 services), `zip_code` (string), `preferred_callback_time` (text), `source_page` (text), `service_address` (text)
- Create deal pipeline: `New Lead → Contacted → Quoted → Won` and `Lost`
- Build a HubSpot Form (in HubSpot UI) that mirrors the booking widget fields. Submit from the Next.js site via the Forms API using the form ID.
- **Workflow 1 (lead notification):** new contact created → email to Jay AND Seif with all form fields + a link to the deal. Native HubSpot workflow.
- **Workflow 2 (customer confirmation):** new contact created → branded email to the customer confirming we received their request, callback expectation, and a click-to-call as a backup. Native HubSpot workflow with marketing email template.
- **Workflow 3 (post-job review request, deferred to Phase 2):** deal moved to Won → SMS or email with the Google review link. Coordinate with ServiceTitan Marketing Pro for the SMS side (they should be the system of record for the customer-relationship messaging, not HubSpot).
- Document the portal ID, form ID, API key in `hubspot-setup-checklist-2026-05-11.md` (production secrets in `.env.local`, not committed)

**Files affected:**

- `clients/Z & Z Plumbing/00_Project Brain/hubspot-setup-checklist-2026-05-11.md`
- `.env.local` in `Z&Zplumbing-v2/` (`HUBSPOT_PORTAL_ID`, `HUBSPOT_FORM_ID`, `HUBSPOT_PRIVATE_APP_TOKEN`)
- `clients/Z & Z Plumbing/Z&Zplumbing-v2/lib/hubspot.ts`

### Step 9: ServiceTitan integration via Path B (manual workflow, locked per decision 1)

ServiceTitan Essentials does not include API access. Booking goes through HubSpot Starter, then a human enters the job in ServiceTitan.

**Workflow:**

1. Customer submits the booking widget on the new site
2. Next.js API route `/api/lead` posts to HubSpot Starter via the Forms API, creating a contact and (via HubSpot workflow) a deal in "New Lead"
3. HubSpot Workflow 1 fires: notification email to Jay and Seif with all fields and a deep link to the deal
4. Jay or Seif call the customer back, then manually enter the job into ServiceTitan (typical 2-3 minute task per lead)
5. When the job completes, ServiceTitan Marketing Pro fires the post-job review-request SMS (separate workstream)
6. Jay or Seif manually move the HubSpot deal stage to track funnel state

**To confirm with Jay or ServiceTitan account manager (PRE-LAUNCH BLOCKER):**

- Confirm that the current Essentials plan includes Marketing Pro. If not, ServiceTitan upgrade may be warranted for the review-request SMS automation.
- If Marketing Pro is NOT on the plan: HubSpot Starter workflow can send the review-request email as a fallback (less effective than SMS but functional).

**Phase 2 path (post-launch, if ServiceTitan upgrades to The Works):**

- Add API integration per the original Path A spec (OAuth 2.0, `createJob`, `getAvailability` endpoints, webhook listener)
- Replace the manual entry step with automatic job creation triggered by deal stage changes
- Surface real availability in the booking widget date/time step

**Files affected:**

- `clients/Z & Z Plumbing/00_Project Brain/servicetitan-integration-spec-2026-05-11.md`
- `clients/Z & Z Plumbing/Z&Zplumbing-v2/lib/servicetitan.ts` (stub for Phase 2 API, exports manual-workflow helpers for now)

### Step 10: Migrate URLs and configure redirects

Paste the URL migration map v4 into Next.js redirects.

**Actions:**

- Copy the 97-line `outputs/zandz-plumbing/gsc-baseline-2026-05-11/next-config-redirects.js` content into `Z&Zplumbing-v2/next.config.ts` under the `redirects()` async function
- Test that the top 10 URLs by clicks resolve correctly to the new destinations
- Test that the 33 retire-to-/blog/ URLs all redirect to `/blog/`
- Configure `public/robots.txt` to block the WP-system and query-param URLs per the migration decisions doc

**Files affected:**

- `clients/Z & Z Plumbing/Z&Zplumbing-v2/next.config.ts`
- `clients/Z & Z Plumbing/Z&Zplumbing-v2/public/robots.txt`

### Step 11: Pre-launch QA

Comprehensive checks before DNS cutover.

**Actions:**

- Lighthouse audit: target Mobile Performance ≥ 75, Accessibility ≥ 95, Best Practices ≥ 95, SEO 100
- Rich Results Test for every page type: pass LocalBusiness, Plumber, Service, FAQPage, BreadcrumbList
- Manual mobile QA on a real iPhone and a real Android device
- Confirm the sticky mobile CTA always shows the canonical `tel:5107084237` and never `tel:9255863212`
- Test the booking widget end-to-end with a real submission to HubSpot Free
- Test 5 representative 301 redirects from the legacy URLs
- Verify the canonical tag on every page resolves to `https://zandzplumbing.com`
- Submit sitemap.xml to Google Search Console (use the new property we have access to)

### Step 12: Launch + post-launch monitoring

DNS cutover and watch.

**Actions:**

- Day 0: Add `zandzplumbing.com` and `www.zandzplumbing.com` to Vercel domain settings
- Day 0: Update A and AAAA records at GoDaddy to point to Vercel
- Day 0: Verify SSL provisioning completes
- Day 0: Submit fresh sitemap to GSC; URL inspection on top 20 new pages, request indexing
- Day 1: Verify all 83 redirects firing correctly
- Days 1 to 7: Daily check of GSC Coverage report, Core Web Vitals, indexing
- Day 7: First weekly performance report cadence begins
- Day 14: First check that the address transition is propagating (this runs in parallel per `address-transition-strategy-2026-05-11.md`)

---

## Site Structure

Mirrors Roto-Rooter / Mr. Rooter / Benjamin Franklin info architecture. Anchored on zip-code search.

```
/                                  Homepage (hero + zip search + trust + services + reviews + booking)
/about/                            Jay's story, team, credentials, history
/services/                         Services hub (list of all services with cards)
  /services/sewer-lateral/         Sewer lateral hub
  /services/repipe/                Repipe hub
  /services/hydrojetting/          Hydrojetting hub
  /services/water-heater/          Water heater hub
  /services/drain-cleaning/        Drain cleaning hub
  /services/emergency/             24/7 emergency hub
  /services/gas-line/              Gas line hub
  /services/leak-detection/        Leak detection hub
  /services/water-line/            Water line hub
  /services/faucet/                Faucet services hub
  /services/toilet/                Toilet services hub
  /services/garbage-disposal/      Garbage disposal hub
/service-areas/                    Service Areas hub with map + zip search
  /plumber-san-leandro-ca/         San Leandro (HQ) city hub
  /plumber-oakland-ca/             Oakland city hub (already drafted)
  /plumber-berkeley-ca/            Berkeley city hub
  /plumber-alameda-ca/             Alameda city hub
  /plumber-hayward-ca/             Hayward city hub
  /plumber-castro-valley-ca/       Castro Valley city hub
  /plumber-richmond-ca/            Richmond city hub
  /plumber-emeryville-ca/          Emeryville city hub
  /plumber-pinole-ca/              Pinole city hub
  /plumber-lafayette-ca/           Lafayette city hub
/sewer-lateral-oakland/            High-priority service+city (already drafted)
/emergency-plumber-oakland/        High-priority service+city
/water-heater-oakland/             High-priority service+city
/drain-cleaning-oakland/           High-priority service+city
/repipe-oakland/                   Service+city (replaces legacy blog post via 301)
/leak-detection-oakland/           Service+city
/gas-line-oakland/                 Service+city (catches the natural-gas blog 301)
/slab-leak-san-leandro/            Service+city (replaces legacy /san-leandro-slab-leak-repair/)
/reviews/                          Testimonials hub (pulls from Sanity)
/blog/                             Sanity-powered blog
  /blog/[slug]/                    Individual blog posts
/contact/                          Contact page with booking widget + click-to-call
/privacy-policy/                   Legal
/terms/                            Legal
/financing/                        Financing info (kept from legacy)
/studio/                           Embedded Sanity Studio (admin)
```

### Homepage Section Inventory (above the fold to below)

1. Sticky header: logo, phone CTA, mobile menu toggle
2. Hero: H1 "The Pros Other Plumbers Call in [DETECTED CITY OR "the East Bay"]" + sub: "Same-day plumbing service. Two licenses. One crew." + zip-code search input + secondary CTA "Schedule Online" button
3. Trust strip band: CSLB #896116 · C-36 + A General Engineering · Since 2003 · 4.6 stars × 19 Google reviews · 4.5 stars × 238 Yelp reviews
4. Services grid: 6 service cards (Sewer Lateral, Drain Cleaning, Water Heater, Emergency, Repipe, Hydrojetting) each linking to its hub
5. Service area band: small map + "We serve 10 East Bay cities" + link to /service-areas/
6. Booking widget (mid-page, optional click-to-expand)
7. Testimonials carousel: 3 to 5 reviews pulled from Sanity, badge "★ 4.6 on Google" and "★ 4.5 on Yelp"
8. About teaser: photo of Jay or the crew + 80-word intro + link to /about/
9. Why two licenses matters: short explainer with diagram showing property-line vs right-of-way
10. FAQ accordion: 5 common questions
11. CTA band: "Call (510) 708-4237 or Book Online" full-width orange
12. Footer: services list, service areas list, contact, social links, license info, sitemap

---

## Sanity CMS Structure

Document schemas (each = a singleton or a collection):

| Schema | Type | Fields |
|---|---|---|
| `siteSettings` | singleton | logo, phone, email, address (street, city, state, zip), social URLs, business hours, primary tagline, secondary tagline, license number, license classifications |
| `homepage` | singleton | hero headline, hero subhead, hero CTA text, trust stat 1/2/3, featured service references, featured testimonial references |
| `service` | collection | title, slug, summary, hero image, detailed description (block content), pricing notes, FAQs (array of Q+A), related services (refs), schema-overrides (for per-service schema customization) |
| `serviceArea` | collection | city name, slug, zip codes (array), unique intro copy (block content), neighborhood mentions, embedded map config, related services emphasis |
| `teamMember` | collection | name, role, photo, bio, license info |
| `testimonial` | collection | quote, author first name, author city, date, optional Google review link, rating (1-5), service performed |
| `post` | collection | title, slug, author ref, body (block content), excerpt, hero image, categories, SEO fields (meta title, meta description, OG image) |
| `category` | collection | name, slug, description |
| `seoConfig` | object | meta title, meta description, OG image, canonical override |

Object schemas (reusable):

| Schema | Fields |
|---|---|
| `imageWithAlt` | image, alt text, caption |
| `faq` | question, answer |
| `cta` | text, href, variant (primary/secondary/tertiary) |
| `blockContent` | rich text with embedded images, links, callouts |

---

## HubSpot Setup (Free tier)

**Contact properties (custom):**
- `zip_code` (single-line text)
- `service_interest` (dropdown: General Plumbing, Clogged Drain, Toilet, Emergency, Gas Line, Sewer Lateral, Water Heater, Repipe, Hydrojetting, Other)
- `preferred_callback_time` (single-line text, e.g., "ASAP" or "Tomorrow morning")
- `source_page` (single-line text, captured from window.location)
- `service_address` (single-line text, optional)

**Deal pipeline:**
1. New Lead (auto-create when form submits)
2. Contacted (manual move by Jay/Seif)
3. Quoted (manual)
4. Won (manual, triggers customer thank-you email)
5. Lost (manual, with reason dropdown)

**Forms:**
- Single HubSpot Form embedded via API. Fields: name, email, phone, zip, service_interest, preferred_callback_time, brief_description, source_page.
- Form ID stored in `.env.local` as `HUBSPOT_FORM_ID`.

**Email notifications:**
- New deal: email to both Jay and Seif with lead details
- Customer-side: confirmation email via Resend (HubSpot Free does not include customer-facing email automation without Marketing Hub)

---

## ServiceTitan Integration Plan

Two paths, decided at implementation based on Jay's plan tier confirmation:

**Path A (The Works plan, API available):**
- OAuth 2.0 client credentials flow
- Endpoint: POST `/jpm/v2/tenant/{tenantId}/jobs` to create a job from a new HubSpot deal
- Endpoint: GET `/dispatch/v2/tenant/{tenantId}/capacity` to surface available time slots in the booking widget
- Webhook listener: receive ServiceTitan job-status-updated events, update the HubSpot deal stage accordingly

**Path B (Starter/Essentials plan, no API):**
- HubSpot deal-created webhook → Next.js API route `/api/webhooks/hubspot` → formatted email to Jay/Seif via Resend
- Email contains: lead name, phone, zip, service interest, preferred callback time, brief description, link to HubSpot deal
- Manual workflow: Jay/Seif call the customer, then manually enter the job into ServiceTitan
- Document the workflow in `servicetitan-integration-spec-2026-05-11.md` so any team member can follow it

---

## Connections & Dependencies

### Files That Reference This Area

- `clients/Z & Z Plumbing/index.html` (client hub, needs to surface the new PRD)
- `clients/Z & Z Plumbing/00_Project Brain/integrated-roadmap-v2-2026-05-11.md` (lists this PRD as a child of the Website-Build workstream)
- `clients/Z & Z Plumbing/00_Project Brain/diagnostic-for-jay-2026-05-11.md` (mentions the new site launch)
- `clients/Z & Z Plumbing/00_Project Brain/strategy-overview-tile.html` (visual tile referencing the rebuild)
- `clients/Z & Z Plumbing/00_Project Brain/address-transition-strategy-2026-05-11.md` (GBP/Yelp move runs in parallel; new site canonical address must match the GBP destination)
- `outputs/zandz-plumbing/gsc-baseline-2026-05-11/next-config-redirects.js` (97-line redirect spec, paste into next.config.ts)
- `outputs/zandz-plumbing/gsc-baseline-2026-05-11/url-migration-map-v4-FINAL.csv` (full 83-URL map)

### Updates Needed for Consistency

- Update `CLAUDE.md` "Client Projects" table to point to this PRD as the canonical Website-Build spec
- Update `clients/Z & Z Plumbing/00_Project Brain/integrated-roadmap-v2-2026-05-11.md` to reference Brand Package v2 and the new PRD location
- Update the client hub `index.html` to add a new tile pointing to this PRD as a top-of-stack engagement anchor

### Impact on Existing Workflows

- The address transition strategy continues as-is. NAP on the new site matches the canonical 3057 Teagarden San Leandro per `business-truth.md`.
- The page drafts already in `03_Content Strategy/` (Plumber Oakland, Sewer Lateral Oakland) are inherited under the new brand. Hero copy, CTAs, and color usage update to match the new system. Content body and schema stay intact.
- The Drive sync work (Asala canonical structure under `Clients/Z-and-Z-Plumbing/`) continues. Brand Package v2 files land in `Brand-Package/specs/` once written.
- The GBP Phase 1 optimization package (in flight per task #23) needs its description candidates updated to match the new "The Pros Other Plumbers Call" tagline. The license-framing remains.

---

## Validation Checklist

- [ ] Brand Package v2 published in `06_Brand Package-v2/` with all 8 docs and a complete color/typography/logo system
- [ ] Existing brand package archived to `_archive/2026-05-11_pre-redesign-brand/` with `SUPERSEDED.md`
- [ ] Existing PRD archived to `_archive/2026-05-11_pre-redesign-prd/` with `SUPERSEDED.md`
- [ ] Refined logomark delivered in SVG with primary, secondary, and icon-only lockups, all 4 color variants
- [ ] Next.js + Sanity + Tailwind + shadcn/ui scaffolding live in `Z&Zplumbing-v2/`
- [ ] All 8 Sanity schemas implemented with appropriate fields
- [ ] Booking widget end-to-end submit to HubSpot Free works
- [ ] Zip-code search resolves correctly for all 10 service cities + handles out-of-area gracefully
- [ ] Sticky mobile CTA shows `tel:5107084237` only (zero instances of `tel:9255863212`)
- [ ] All 83 redirects from `url-migration-map-v4-FINAL.csv` are live in `next.config.ts`
- [ ] Schema validates: LocalBusiness, Plumber, Service, FAQPage, BreadcrumbList passing Rich Results Test
- [ ] Lighthouse Mobile: Performance ≥ 75, Accessibility ≥ 95, Best Practices ≥ 95, SEO 100
- [ ] HubSpot account live, properties + pipeline configured, form ID committed to env
- [ ] ServiceTitan integration path decided (A or B) and implemented
- [ ] Top 10 priority pages built and content populated in Sanity: homepage, /about/, /services/, /service-areas/, /plumber-san-leandro-ca/, /plumber-oakland-ca/, /sewer-lateral-oakland/, /emergency-plumber-oakland/, /water-heater-oakland/, /drain-cleaning-oakland/
- [ ] Sitemap.xml live and submitted to GSC
- [ ] Robots.txt live with the correct blocking rules
- [ ] Canonical tags resolve to `https://zandzplumbing.com` on every page (no www, https only)
- [ ] Client hub `index.html` surfaces this PRD as a top tile
- [ ] CLAUDE.md updated to reflect Brand Package v2 + new PRD

---

## Success Criteria

The implementation is complete when:

1. zandzplumbing.com resolves to the new Next.js site on Vercel, all 83 legacy URLs redirect correctly, and Google Search Console shows the new sitemap submitted
2. Jay can log into Sanity Studio at zandzplumbing.com/studio and update services, testimonials, blog posts, and site settings without developer assistance
3. A test booking submitted through the new booking widget creates a HubSpot contact + deal, and either a ServiceTitan job (if API) or an actionable email to Jay/Seif (if manual workflow)
4. The brand on the live site is unmistakably in the Home Depot lineage (orange + black + white, dominant contractor authority voice) and zero references to Prussian Blue, Warm Gold, Old House Specialists, or "Since 1985" exist anywhere on the site
5. Mobile Lighthouse score ≥ 75 Performance and 100 SEO, and the sticky mobile CTA dials only the canonical (510) number
6. The first month of GSC data shows measurable progress vs the 2026-05-11 baseline: indexed page count climbing toward 90%, monthly organic clicks at 60+, and at least 4 striking-distance keywords moved to page 1

---

## Notes

- **Brand pivot is a real change, surface it for client discussion.** The existing `06_Brand Package/` represents real work and Jay or Seif may have opinions. Recommend a single 30-minute call to walk through the new direction with Jordan first, then a client-facing version once Jordan is aligned.
- **Logo refinement requires the original logo file in higher resolution than the WordPress upload.** Drop the cleanest available version into `context/import/` and reference it from the brand package.
- **HubSpot Free has a hard ceiling.** If volume hits 1M contacts (won't for a long time) or workflow automation becomes essential, upgrade to Starter ($20/mo).
- **ServiceTitan Path A vs Path B is a binary depending on plan tier.** Document both in the implementation spec so we can switch paths without rewriting the PRD.
- **The address transition (GBP + Yelp) runs in parallel.** Coordinate so the new GBP listing at 3057 Teagarden, the Yelp address-of-record update, and the new site go-live happen in the same week. The Sterling Sky 3-step playbook in `address-transition-strategy-2026-05-11.md` is the authority on sequencing.
- **Content drafts beat blank pages.** The Plumber Oakland and Sewer Lateral Oakland drafts already in `03_Content Strategy/` save days of writing. Inherit them, update the hero copy to match the new tagline, and ship.
- **Photography is the biggest risk to brand quality.** Without real photos of Jay's actual crew, trucks, and Oakland jobs, the site will look like every other plumber template. Budget photography into the launch plan (Open Question #3).
- **This PRD does not include rebrand mascot work.** Deferred to phase 2 per Jordan's brief.

---

## Open Questions Summary (all 7 RESOLVED 2026-05-11)

See "Decisions Locked 2026-05-11" at the top. PRD is implementation-ready.

One non-blocking confirmation before Phase 2: Jay (or ServiceTitan account manager) confirms Essentials plan includes Marketing Pro module.

---

## Path to /implement

PRD is locked. Run: `/implement plans/2026-05-11-zandz-website-brand-redesign-prd.md`

The implementation will execute Steps 1 through 12 in order. Total estimated effort: 6 to 8 weeks for a solo dev with the existing Next.js scaffold as a starting point. Sanity Studio integration is a Phase 2 scope item, not part of the v1 build.
