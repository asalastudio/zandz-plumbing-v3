# Z & Z Plumbing — Project Brain

> **What this file is:** The persistent context for every Claude session working on Z & Z Plumbing. Read this first, every time. If something here conflicts with a one-off instruction, ask before deviating.
>
> **Canonical fact source:** [`business-truth.md`](business-truth.md) is the source of truth for NAP, founding date, license, services, and service area. If anything in this file conflicts with `business-truth.md`, trust `business-truth.md`.
>
> **Engagement scope reference:** [`engagement-scope-2026-05-10.md`](engagement-scope-2026-05-10.md) defines the build-engagement scope, deliverables, and timeline.

---

## 1. Project Overview

**Goal:** Build a brand-new website for Z & Z Plumbing that ranks them in the top 3 of the East Bay local pack for high-intent plumbing keywords, surfaces their two-license differentiator, and converts qualified leads — while preserving every drop of SEO equity from the legacy site during migration.

**Engagement type:** **Brand-new website build + local SEO foundation.** Not a remediation of the existing zandzplumbing.com — the legacy WordPress site is being retired. We do not touch the legacy site beyond what's required to preserve its SEO equity for migration to the new build.

**Time horizon:** 8-week launch sprint to a static-content launch on Next.js + Vercel, then 30/60/90 day phasing for content depth, member portal MVP, and deep ServiceTitan integration. See [`master-plan.md`](master-plan.md) for the full phased plan.

---

## 2. Client Business Profile (snapshot)

The complete profile lives in [`business-truth.md`](business-truth.md). Quick reference:

| Field | Value |
|---|---|
| Legal/brand name | Z & Z Plumbing (formal "Z & Z" with ampersand; "Z and Z Plumbing" used on legacy site) |
| Founded | 2003 (~23 years operating) |
| C-36 plumbing license | 2007 |
| A General Engineering license | 2012 |
| CSLB number | #896116 |
| HQ address | **3057 Teagarden Street, San Leandro, CA 94577** |
| Primary phone | (510) 708-4237 |
| Yelp tracking phone | (341) 699-7090 *(intentional, but creates NAP variance — cleanup decision in Phase 0)* |
| Email | zandzplumbing@yahoo.com *(migrating to branded email at launch)* |
| Legacy website (being retired) | zandzplumbing.com |
| New website (being built) | zandzplumbing.com (same domain, full rebuild on Next.js + Vercel) |
| Hours | 24/7 emergency · Mon–Sat 8–5 office |
| Decision-makers | Jay (primary) + Seif (secondary) |

**Positioning (from brand strategy):** "The East Bay's two-license plumbing house — the heritage tradesman the older homes of the East Bay are quietly built around." Two licenses (C-36 + A General Engineering) is rare and unfakeable; pre-1970s housing-stock specialty is technically real (galvanized supply lines, cast iron drains, EBMUD compliance).

---

## 3. Service Areas (East Bay-wide, San Leandro HQ)

**HQ city flagship:** San Leandro, CA (the new HQ-city landing page — full Heritage positioning, neighborhoods, ZIPs 94577/94578/94579, Lake Chabot landmark, EBMUD)

**Largest service-area city (priority equal to HQ):** Oakland, CA — biggest market, deep pre-1970s housing stock

**Service area (confirmed by founder):** San Leandro, Oakland, Alameda, Berkeley, Richmond, Lafayette, Hayward, Castro Valley, Pinole, Emeryville. Selective San Francisco for big commercial.

> **Rule for Claude:** Do not invent service areas. If a city isn't in this list, ask before publishing a page targeting it. The 11-city list is the canonical service area for schema, content, and citations.

---

## 4. Services (in order of strategic priority)

Per `01-brand-strategy.md`:

1. **Sewer lateral / EBMUD compliance** — high-ticket, the A-license differentiator, regulatory hook
2. **Repipe (galvanized → copper)** — high-ticket, perfect match for East Bay housing stock ($15K–$40K typical)
3. **Hydrojetting** (commercial-grade, in-house equipment) — under-promoted differentiator
4. **Trenchless sewer** (in-house equipment) — under-promoted differentiator
5. **Water heater repair + tankless installation** — bread and butter, broad appeal
6. **General Engineering / right-of-way work** — the A-license framing as a discrete service
7. **Drain cleaning, leak detection, gas line, water line, fixtures** — daily volume

**HVAC:** Still unconfirmed (one Yelp review references "Heating & Air Conditioning" — needs Jay sign-off before any HVAC content ships).

---

## 5. Engagement Framing — Build, Not Remediate

This is the most important rule for every decision in this engagement:

**We are building a brand-new website. We are not remediating the existing one.**

Practical implications for every task:

- **Old-site bugs are not our problem to fix.** Wrong `tel:` link on the legacy Contact page, duplicate H1s, stale 2021 footer copyright, placeholder Rank Math meta descriptions, the `/privacy-policy-copy/` orphan, the inconsistent service URL structure — none of these get touched. The new site replaces them.
- **Old-site findings become design requirements for the new site.** Every "fix" recommendation in the 2026-05-06 audit is reframed: instead of "fix this on zandzplumbing.com," it becomes "design this correctly into the new build from day 1."
- **SEO equity gets migrated, not preserved-in-place.** What we extract from the legacy site is the equity inventory (URLs that rank, blog posts worth promoting to service pages, the domain authority, the inbound backlinks, the citation footprint). Everything else gets retired with the old site.
- **External citations (Yelp, BBB, Chamber, HomeAdvisor, Nextdoor, Plumbers of America) showing the old MacArthur Oakland address are stale and need cleanup as part of the migration.** This is a top-priority workstream.
- **The "stop the bleeding" Phase 1 activities in the master plan are reframed.** Anything described as "fix the legacy site" only happens if (and only if) the new site won't be live within the same window — and even then, only if the equity preservation requires it.

If a task or recommendation reads like "fix the existing site," stop and reframe it: either it's a design requirement for the new build, or it's an equity-preservation step for migration, or it's something we no longer do.

---

## 6. Current SEO Snapshot

### What we know (verified)
- **Yelp:** 238 reviews, 4.5★, 46 photos *(strong, mature listing — citation needs address update from Oakland to San Leandro)*
- **Off-site citations (BBB, Chamber, HomeAdvisor, Yahoo Local, Nextdoor, Plumbers of America):** Listed but show the wrong address — full citation cleanup is a Phase 1 workstream
- **Legacy site SEO Health Score:** 38/100 per the 2026-05-06 audit (used as equity inventory, not remediation roadmap)
- **Yelp Ads spend:** ~$2,000/month (no measurement or attribution — Phase 0 audit decision)
- **After-hours answering service:** ~$500/mo base (often $1K–$1.2K with overage); founder says quality is poor

### What we still need to pull
*(Phase 0 audit tasks)*
- [ ] Google Business Profile current state: views, searches, calls, direction requests (last 90 days)
- [ ] GBP review count + average rating + recency of latest reviews
- [ ] Current keyword rankings for our top 5 (needs GSC access)
- [ ] Domain authority + backlink profile (needs Ahrefs/SEMrush)
- [ ] Indexed pages (`site:zandzplumbing.com`) — required for migration map
- [ ] NAP consistency audit across every directory (citation cleanup baseline)

---

## 7. Top Competitors

Confirmed top 3 (per `02_Competitor Research/competitor-analysis.md`):

1. **Oakland Rooter & Plumbing** — Yelp 1,617 reviews, founded 2011, License #965873, the volume play
2. **Albert Nahman Plumbing, Heating & Cooling** — Yelp 775 reviews, founded 1981, Berkeley + Hayward, just acquired by national chain (window of opportunity as service quality complaints rise)
3. **Mr. Rooter Oakland-Berkeley** — Yelp 263 reviews, Neighborly franchise, flat-rate positioning

Watch list: **Pipe Spy** (owns trenchless), **Val Betti** (oldest independent, tenure narrative), Mallard Plumbing, Harry Clark Plumbing & Heating, Roto-Rooter Oakland, Montclair Rooter.

---

## 8. SEO Strategy — Bake-It-In Approach (because we're building from scratch)

The advantage of building a new site is that every "Phase 1 SEO fix" from a typical engagement becomes a launch-day requirement rather than a post-launch fix. The new site ships SEO-correct on day 1.

### What ships SEO-ready on launch day
- Complete `LocalBusiness` JSON-LD with the corrected San Leandro address, geo coords, full 11-city `areaServed`, `aggregateRating`, 24/7 `openingHoursSpecification`, both license classifications
- Dedicated city landing pages built to pass the swap test — **San Leandro is the HQ-city flagship; Oakland is the largest service-area page**; Berkeley, Alameda, Hayward, Richmond, Lafayette, Castro Valley, Pinole, Emeryville follow
- Service+city intersection pages for the highest-margin combinations (sewer lateral × Oakland/Berkeley/Alameda/Emeryville; repipe × Oakland/Berkeley; trenchless × Oakland/Berkeley/Richmond)
- A real About page with founder, team, certifications, story, photos, license credentials
- FAQ sections with `FAQPage` schema for AI/voice citations
- Sitewide `tel:` links + sticky mobile call button
- Google Maps embed of the Teagarden HQ on home + about + contact
- Social/citation footer row + `sameAs` schema array
- `llms.txt` for AI-search crawlers
- Lazy-loaded media, modern Core Web Vitals targets

### What gets executed in parallel (no dependency on the new site)
- **Citation cleanup:** Yelp, BBB, Chamber, HomeAdvisor, Yahoo Local, Nextdoor, Plumbers of America, Apple Business Connect, Bing Places — all updated to the corrected San Leandro NAP
- **GBP optimization:** categories, attributes, photos, services descriptions, posts cadence, Q&A seeding
- **Yelp-to-Google review migration:** cross-reference 238 Yelp reviewers against ServiceTitan customer database, drive 50–80 new Google reviews via personalized outreach
- **Post-job review automation:** ServiceTitan native SMS workflow → branded review link → 25%+ conversion target

---

## 9. Brand Voice & Content Rules

**Voice:** Quietly. Serious. Craft. (per `06_Brand Package/01-brand-strategy.md`)

If the brand were a person, they'd be a 50-year-old master tradesperson who learned from their father, has been doing this 25 years, doesn't talk much during the estimate, leaves a worksite cleaner than they found it, and quotes the price up front.

**Banned phrases / writing patterns:**
- "Look no further"
- "In today's fast-paced world"
- "We pride ourselves on"
- "State-of-the-art"
- "Top-notch"
- "Unparalleled"
- "Top-rated" (overused in plumber marketing)
- Em-dashes used as a stylistic AI tell — use sparingly and only when grammatically warranted
- Empty intros that restate the H1
- Three-word bullet lists where every bullet is the same length and rhythm

**Required content elements per page:**
- A real specific local detail (street, neighborhood, landmark, weather pattern, building era)
- One concrete example (a job they actually did, addresses blurred)
- License framing: "C-36 + A General Engineering · CSLB #896116" in the footer/contact area
- Phone number above the fold with `tel:` link
- "Since 2003" prominently — never "1985" or "41 years"

**Don't write:**
- Generic AI plumber content. If a paragraph could appear on any plumber's site in any city, rewrite it.
- Fake testimonials or case studies. Use only what the client provides.
- Anything that contradicts `business-truth.md` without flagging it for human review.

---

## 10. Standard Operating Procedures

### Before any task
1. Re-read this file.
2. Cross-check facts against `business-truth.md`.
3. State what you're about to do in one sentence.
4. State what data you're using and where it came from.
5. If you're missing data needed to do the task well, stop and ask. Don't guess.

### Before publishing/committing anything
1. Show the user the change in plain language first.
2. Do not push to production without explicit approval.
3. Diff against existing content — flag anything you're removing.

### When working on the new site build
- All work in the `Z&Zplumbing-v2` Next.js codebase (`Z&Zplumbing-v1` is preserved as reference)
- Every visual + copy decision must trace back to a file in `06_Brand Package/`
- Brand spelling: "Z & Z" with ampersand in formal copy
- Founding year: 2003 (~23 years), never 1985

### When working on the legacy site
- Don't, unless it's specifically for SEO equity preservation during migration
- The legacy site is being retired — fixes to it are not in scope

### When writing content
1. Pull a real local detail before drafting (don't invent).
2. Write a draft.
3. Self-review against the "Banned phrases" list.
4. Self-review against the "Required content elements" list.
5. Output for human approval.

---

## 11. Definition of Done

A task is "done" only when:
- [ ] The change is live (or staged with a preview link)
- [ ] It's been measured against baseline (where measurable)
- [ ] It's logged in the project changelog with date + what changed + why
- [ ] Jordan has confirmed they've seen it

---

## 12. Things Claude Must NOT Do

- Do **not** invent service areas, services, license numbers, certifications, awards, years of experience, or testimonials.
- Do **not** publish AI-generated images of "the team" or "our trucks."
- Do **not** spin up duplicate doorway pages (e.g., 30 city pages with swapped city names).
- Do **not** stuff keywords. Modern Google penalizes this and it tanks the brand voice.
- Do **not** assume access to the website, GBP, or analytics. Ask before assuming you can act on any of these.
- Do **not** "fix" the legacy WordPress site beyond what's strictly required for SEO equity preservation during migration. The site is being retired.
- Do **not** revert to the old framing (1985 founding, 4050 MacArthur Blvd, Oakland HQ, Oakland-only positioning, "fix the existing site"). All of that is superseded.

---

## 13. Tech Stack & Access

**New site (under construction):**
- Framework: Next.js 15+ (App Router) — `Z&Zplumbing-v2/`
- Language: TypeScript
- Styling: Tailwind CSS
- Hosting: Vercel
- CMS: MDX in repo (v1) → Sanity (Phase 2 if/when needed)
- Forms: Next.js API routes + Resend + HubSpot Forms API
- Analytics: GA4 (existing tag `G-CFS818988W`) + Microsoft Clarity + Vercel Analytics

**Operational stack (per master plan):**
- ServiceTitan — operations, customer DB, jobs, dispatch, invoicing, native SMS, Membership module for Heritage Plan
- HubSpot Starter — CRM, lead capture, nurture, attribution
- Madison Studio — content production engine
- Supabase (Phase 3+) — member portal data, inspection report archive

**Access status (as of 2026-05-10):**
- GBP manager access: granted on discovery call (verify still active)
- GSC: not yet granted
- GA4: not yet granted
- ServiceTitan admin: requested, status TBD
- Yelp business owner: requested, status TBD
- Domain registrar (GoDaddy): credentials committed post-call
- WordPress admin (legacy): not requested — only needed if equity preservation requires direct edits

---

## 14. Open Questions for the Client

Bring these up at the next call:

1. HVAC — yes or no? (Determines whether a service page exists)
2. ServiceTitan plan tier? (Gates Phase 4 API integration scope)
3. Customer list size in ServiceTitan? (Gates HCC launch math)
4. Yelp Ads ($2K/mo) — keep, trim, or cut?
5. After-hours answering service replacement (Numa / Ruby / AnswerForce / keep current)?
6. Was 4050 MacArthur Blvd ever a legitimate Z & Z location, or is it stale across all directories?
7. Branded email migration timing — before launch or right at launch?
8. The Valve Betty / 4050 MacArthur backstory — investigate or leave alone?
9. How many real job photos can Jay supply for content? (Ideal: 5–10 with addresses blurred)
10. Legal counsel relationship for privacy + terms?

---

## 15. Changelog

| Date | Change | By |
|---|---|---|
| 2026-05-04 | Initial file created | Claude (drafted from public web research) |
| 2026-05-07 | `business-truth.md` created — corrected founding date (1985→2003) and address (Oakland→San Leandro) | Jordan |
| 2026-05-10 | Major rewrite — engagement reframed as brand-new website build (not legacy-site remediation), corrected address and founding year throughout, added Section 5 (Build-Not-Remediate framing), aligned with engagement-scope-2026-05-10.md | Claude (per Jordan's instruction) |

---

*End of file. If you're Claude reading this at the start of a session: confirm `business-truth.md` and `engagement-scope-2026-05-10.md` are still aligned with this file. Surface any contradictions before acting.*
