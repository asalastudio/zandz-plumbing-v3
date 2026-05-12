# Z & Z Plumbing — Engagement Scope

**Status:** Canonical · the single source of truth for the build engagement
**Date locked:** 2026-05-10
**Engagement owner:** Jordan Richter / Asala
**Client decision-makers:** Jay (primary) + Seif (secondary)

> Read this file before starting any work on Z & Z Plumbing. It supersedes scope language in any other document. Conflicts on facts are resolved against [`business-truth.md`](business-truth.md). Conflicts on workflow are resolved here.

---

## 1. The engagement in one sentence

**Build a brand-new website for Z & Z Plumbing on Next.js + Vercel that ships SEO-correct on day one, retire the legacy WordPress site cleanly with full equity preservation, and launch local SEO + GBP + citation cleanup workstreams in parallel.**

This is not a remediation of the existing site. It is a build.

---

## 2. What we are doing

### 2A — Brand-new website build
- **Stack:** Next.js 15+ (App Router) + TypeScript + Tailwind CSS + Vercel + MDX (blog v1) + Resend (transactional) + HubSpot Forms API + GA4 + Microsoft Clarity + Vercel Analytics
- **Codebase:** `Z&Zplumbing-v2/` (`Z&Zplumbing-v1/` preserved as reference)
- **Domain:** `zandzplumbing.com` (same domain — preserves domain authority)
- **Information architecture:** see `website-prd.md` Section 4
- **Brand source of truth:** `06_Brand Package/`
- **Launch target:** 8-week sprint (Phase 1 — static-content launch with all P0 pages)

### 2B — Legacy site decommissioning + SEO equity migration
- **The legacy WordPress site is being retired.** No remediation work happens on it beyond what's required to keep equity transferable until cutover.
- **URL migration map** (CSV deliverable): every legacy URL → new URL → 301 destination, with preserve/consolidate/kill decisions documented
- **DNS cutover** via the GoDaddy registrar
- **60-day post-launch monitoring** — legacy site kept offline-but-restorable for safety net

### 2C — Local SEO foundation (in parallel with the build)
- **Citation cleanup:** every directory listing updated to the corrected San Leandro NAP (Yelp, BBB, Chamber, HomeAdvisor, Yahoo Local, Nextdoor, Plumbers of America, Apple Business Connect, Bing Places)
- **GBP optimization:** categories, attributes, services descriptions, photos, posts cadence, Q&A seeding (per `seo-execution-plan.md`)
- **Schema:** complete `LocalBusiness` + `Plumber` + `Service` + `FAQPage` + `BreadcrumbList` markup baked into the new site templates from launch
- **Yelp-to-Google review migration:** cross-reference 238 Yelp reviewers against ServiceTitan customer database, drive 50–80 new Google reviews via personalized outreach
- **Post-job review automation:** ServiceTitan native SMS workflow → branded review link → 25%+ conversion target

### 2D — Operational stack rollout (parallel, per master plan)
- **HubSpot Starter** for CRM + lead capture + nurture
- **ServiceTitan optimization** — extract full value (native SMS, Membership module for Heritage Plan, pricebook, Marketing Pro if included)
- **Madison Studio** content production rhythm (4+ posts/month sustained)
- **Heritage Plan / Home Care Club soft launch** at Phase 3

---

## 3. What we are NOT doing

| Not doing | Why |
|---|---|
| Remediating the legacy WordPress site (`/contact/` template fix, schema fix, duplicate H1 fix, etc.) | The site is being retired — those issues vanish at cutover |
| Rebuilding the legacy site on the same WordPress stack | We're moving off WordPress to Next.js + Vercel |
| Targeting large property management firms | Founder explicitly opted out — "very cheap, run up a tab and don't pay" |
| Online payment / e-commerce in v1 | ServiceTitan handles all current billing; Stripe deferred until non-membership transactions exist |
| Customer-facing online scheduling in v1 | Deferred to Phase 4 when ServiceTitan API access is confirmed |
| Live chat in v1 | Deferred — consider in Marketing Pro phase |
| Member portal with auth in v1 | Deferred to Phase 3 — requires Supabase |
| Spanish localization in v1 | Out of scope (likely Phase 2+ addition) |
| Inventing service areas, services, license numbers, certifications, awards, or testimonials | Hard rule per `claude.md` Section 12 |

---

## 4. Confirmed business facts (snapshot — full list in `business-truth.md`)

| Field | Value |
|---|---|
| GBP listing ID | `396819026713937378` (manager access granted — login at business.google.com using **`jordan@tarifattar.com`**) |
| Brand name (formal) | Z & Z Plumbing (ampersand) |
| Brand name (legacy site spelling) | Z and Z Plumbing |
| Founded | 2003 (~23 years operating) |
| C-36 plumbing license | 2007 |
| A General Engineering license | 2012 |
| CSLB number | #896116 |
| **HQ address** | **3057 Teagarden Street, San Leandro, CA 94577** |
| Primary phone | (510) 708-4237 |
| Yelp tracking phone | (341) 699-7090 (intentional; cleanup decision pending) |
| Email (current) | zandzplumbing@yahoo.com |
| Email (target) | jay@zandzplumbing.com + seif@zandzplumbing.com |
| Website (legacy, retiring) | zandzplumbing.com (WordPress + Astra + Beaver Builder + Rank Math) |
| Website (new build) | zandzplumbing.com (Next.js + Vercel) |
| Hours | 24/7 emergency · Mon–Sat 8–5 office |
| Decision-makers | Jay (primary) + Seif (secondary) |

### Service area (11 cities, confirmed by founder)
San Leandro (HQ), Oakland (largest market), Alameda, Berkeley, Richmond, Lafayette, Hayward, Castro Valley, Pinole, Emeryville. Selective San Francisco for big commercial.

### Services in order of strategic priority
1. Sewer lateral / EBMUD compliance (A-license differentiator)
2. Repipe (galvanized → copper) — $15K–$40K typical
3. Hydrojetting (commercial-grade, in-house equipment)
4. Trenchless sewer (in-house equipment)
5. Water heater repair + tankless installation
6. General Engineering / right-of-way work (A-license framing)
7. Drain cleaning, leak detection, gas line, water line, fixtures

### HVAC: still unconfirmed
One Yelp review references "Heating & Air Conditioning" — needs Jay sign-off before any HVAC content ships.

---

## 5. Engagement deliverables

### Pre-launch (Weeks 1–8)
- [ ] URL migration map CSV (legacy URL → new URL → 301 destination)
- [ ] Inbound backlink inventory (via Ahrefs/SEMrush) — required for redirect priority
- [ ] Complete content inventory of legacy site — what to migrate, what to retire
- [ ] All P0 pages built per `website-prd.md` Section 4
- [ ] Brand package fully implemented per `06_Brand Package/`
- [ ] Lead capture pipeline live (Next.js API → HubSpot + Resend)
- [ ] GA4 + Microsoft Clarity + Vercel Analytics live
- [ ] All schema validated via Google Rich Results Test
- [ ] At minimum 2 blog posts published (1 cornerstone + 1 ready-to-hire)
- [ ] DNS cutover plan documented and scheduled
- [ ] Legacy site backed up before cutover

### Launch day
- [ ] DNS cutover executed
- [ ] Sitemap submitted to GSC
- [ ] All 301 redirects verified working
- [ ] No staging environments accidentally indexed
- [ ] GBP fully optimized + linked from new site footer
- [ ] All citations updated to corrected San Leandro NAP

### Post-launch (Weeks 9–12)
- [ ] 60-day 404 monitoring active
- [ ] First 30 Google reviews from automated post-job + Yelp migration
- [ ] All P1 service detail + service+city pages live
- [ ] Madison Studio cadence at 4+ posts/month
- [ ] Heritage Plan soft launch via ServiceTitan Membership module
- [ ] Owner dashboard live (weekly KPI reports)

### Ongoing (post-90)
- Monthly business review
- Quarterly content plan from Madison
- Quarterly competitive landscape review
- Annual strategy refresh

---

## 6. SEO equity inheritance (what we extract from the legacy site)

The 2026-05-06 audit (`pre-engagement/seo-audit/local-seo-analysis-2026-05-06.md`) is no longer a remediation playbook. It's now an SEO equity inventory. Every finding falls into one of three buckets:

### Bucket A — Ignore (existing-site fixes that no longer matter)
The wrong `tel:` link on the Contact page, the duplicate H1s, the footer © 2021, the stale `lastmod` dates, the placeholder Rank Math meta descriptions, the duplicate `/privacy-policy-copy/` page, the `/z-and-z-plumbing-red/` orphan, the inconsistent service URL structure, the HTTP logo URL, the broken Caltek-titled map iframe — none of these get touched. The site is being replaced.

### Bucket B — Inherit & repurpose (SEO equity to migrate)
- **The 47 blog posts.** Generic listicles get killed. Local-intent posts ("Trenchless Sewer Replacement in Oakland", "Whole House Repiping in Oakland", "San Leandro Slab Leak Repair", "Natural Gas Repairs in Oakland") get **promoted to service pages on the new site**.
- **The existing San Leandro page** (`/plumbers-san-leandro-ca/`) — 3+ years of indexation. URL stays via 301 to the new HQ-city flagship.
- **The Yelp profile + 238 reviews × 4.5★** — transfers automatically once the address is corrected.
- **CSLB license #896116, BBB profile, Chamber listing, HomeAdvisor, Nextdoor, Plumbers of America** — citations transfer; addresses get corrected.
- **The domain `zandzplumbing.com`** — domain age and authority preserved.
- **Inbound backlinks** — every linked URL gets a 301 destination on the new site.

### Bucket C — Net-new on the build (must be designed in from launch)
- Complete `LocalBusiness` schema with corrected San Leandro NAP, geo coords, `aggregateRating`, full 11-city `areaServed`, `openingHoursSpecification` for 24/7
- Dedicated city landing pages built to pass the swap test — **San Leandro is the HQ-city flagship**; Oakland, Berkeley, Alameda, Hayward, Richmond, Lafayette, Castro Valley, Pinole, Emeryville as service-area pages
- A real About page with founder, team, certifications, story, photos
- FAQ sections with `FAQPage` schema for AI/voice citations
- Sitewide `tel:` links + sticky mobile call button
- Google Maps embed of the Teagarden HQ on home + about + contact
- Social/citation footer row + `sameAs` schema array
- `llms.txt` for AI-search crawlers
- Lazy-loaded media, modern Core Web Vitals targets

---

## 7. Citation cleanup (top-3 priority workstream)

Every external directory currently shows the wrong address (4050 MacArthur Blvd, Oakland, CA 94619) and needs to be updated to the corrected San Leandro NAP. This is a top-priority workstream that runs in parallel with the build.

| Tier | Platform | Status | Priority |
|---|---|---|---|
| 1 | Google Business Profile | Manager access granted | Verify NAP, run full optimization |
| 1 | Yelp | Address wrong | Update to San Leandro |
| 1 | Apple Business Connect | Not yet claimed | Claim + populate with correct NAP |
| 1 | Bing Places | Not yet claimed | Claim + populate with correct NAP |
| 2 | BBB | Address wrong | Update to San Leandro |
| 2 | Chamber of Commerce | Address wrong | Update to San Leandro |
| 2 | HomeAdvisor | Address wrong | Update to San Leandro |
| 2 | Yahoo Local | Address wrong | Update to San Leandro |
| 2 | Nextdoor | Page exists | Verify NAP |
| 2 | Plumbers of America | Listed | Update to San Leandro |
| 2 | HomeSpotHQ / Cozywise / BestProsInTown | Listed | Update to San Leandro |
| 3 | Data Axle, Foursquare, Neustar/TransUnion | Not verified | Submit fresh data |

---

## 8. KPIs & measurement

### 12-month targets
- Top 3 in East Bay local pack for "plumber san leandro," "plumber oakland," and primary service queries
- #1 for niche queries: "EBMUD sewer lateral compliance Oakland," "galvanized pipe replacement Oakland," "general engineering plumbing East Bay"
- 250–400 Home Care Club members = $75K–$120K ARR baseline
- 5–10 commercial anchor accounts = $20K–$60K/month additional recurring
- Customer acquisition cost down 40%+ through organic + member referrals
- Average ticket size up 15–25% through ServiceTitan pricebook + Good/Better/Best presentation

### 90-day milestones (per `master-plan.md` Section 8)
| Metric | Day 30 | Day 60 | Day 90 |
|---|---|---|---|
| New website launched | In build | Soft launch | Full launch + cutover complete |
| New Google reviews | 15+ | 50+ | 80+ |
| Home Care Club members | 0 (validation) | 30 | 75 |
| Commercial anchor accounts | 0 (outreach) | 1–2 | 3–5 |
| Heritage content live | 2 posts | 6 posts | 10 posts |
| Site pages live | P0 set (~12) | P0+P1 (~24) | P0+P1+content depth (~35) |
| Local pack position (plumber Oakland) | baseline | +2 positions | +3–5 positions |

---

## 9. Open questions (gating items — answer to unblock the build)

1. **HVAC — yes or no?** Determines whether ~40% of keyword strategy + 1 service detail page exist
2. **MacArthur — stale or second location?** Was 4050 MacArthur Blvd ever a real Z & Z location? Determines whether we wipe it from every citation or list it as a closed/historical location
3. **ServiceTitan plan tier?** Gates Phase 4 API integration scope
4. **Customer list size in ServiceTitan?** Gates HCC launch math
5. **GSC + GA4 access?** Required to baseline rankings + traffic
6. **Yelp business owner access?** Required for $2K/mo Yelp Ads ROI audit
7. **GoDaddy domain registrar credentials?** Required for DNS cutover
8. **Yelp Ads ($2K/mo) — keep, trim, or cut?**
9. **After-hours answering service replacement?** (Numa / Ruby / AnswerForce / keep current)
10. **The Valve Betty / 4050 MacArthur backstory?** Investigate or leave alone — affects About page narrative
11. **Branded email migration timing?** Before launch or right at launch?
12. **Real photography schedule?** Founder portrait + crew + truck shots needed before launch (placeholders allowed at launch with 30-day swap deadline)
13. **Legal counsel relationship for privacy + terms?**

---

## 10. Cross-document map

| Doc | Role |
|---|---|
| `00_Project Brain/claude.md` | Per-session context loader Claude reads first |
| `00_Project Brain/business-truth.md` | Canonical fact source (NAP, founding, license, services, area) |
| `00_Project Brain/engagement-scope-2026-05-10.md` | **This file** — engagement scope source of truth |
| `00_Project Brain/master-plan.md` | Engagement-level operational plan (90-day phasing, KPIs, stack architecture) |
| `00_Project Brain/seo-execution-plan.md` | 22-prompt SEO playbook adapted to Z & Z |
| `00_Project Brain/website-prd.md` | Website Product Requirements Document (engineering source of truth) |
| `00_Project Brain/post-call-synthesis.md` | Discovery synthesis |
| `00_Project Brain/discovery-corrections-from-gemini-notes.md` | Discovery corrections |
| `00_Project Brain/discovery-updates-v2-2026-05-06.md` | Discovery updates v2 |
| `00_Project Brain/pre-engagement/seo-audit/local-seo-analysis-2026-05-06.md` | Legacy site SEO audit — **now used as SEO equity inventory, not remediation roadmap** |
| `00_Project Brain/pre-engagement/prospect-package/` | Prospect-package proposal + audit 1-pager + Loom script |
| `00_Project Brain/pre-engagement/work-plan/build-kickoff-plan.md` | Build kickoff sequence (replaces the old night-1-execution-plan.md) |
| `01_Discovery/` | Discovery call notes, playbook, companion |
| `02_Competitor Research/` | Competitor analysis |
| `03_Content Strategy/` | Content strategy templates |
| `06_Brand Package/` | Brand source of truth (must be read before any visual or copy decisions) |
| `Z&Zplumbing-v2/` | New build codebase (Next.js + Vercel) |
| `Z&Zplumbing-v1/` | Earlier scaffold preserved as reference |

---

## 11. Changelog

| Date | Change | By |
|---|---|---|
| 2026-05-10 | Initial canonical engagement scope created — locks in build-not-remediate framing, corrected San Leandro address, full deliverables list, citation cleanup workstream, KPI targets | Claude (per Jordan's instruction) |
