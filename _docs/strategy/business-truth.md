# Z and Z Plumbing — Business Ground Truth

**Status:** Canonical · supersedes any conflicting field in audit reports, brand assets, master plan, or execution plan
**Last verified by Jordan:** 2026-05-07

> Read this file first, before trusting any other document in the engagement. Discovery audits and third-party listings have hallucinated facts before. This file is the corrected canonical.

---

## Name (current pre-rebrand)

- **Z and Z Plumbing** — written with "and" spelled out
- Not "Z & Z" with an ampersand (despite the AIOS folder being named that way for legacy reasons; the folder name does not change the brand spelling)
- A future rebrand may change this. Until then, every customer-facing surface uses **Z and Z Plumbing**.

## Real headquarters

- **3057 Teagarden Street, San Leandro, CA 94577**
- This is the real, correct, current address. *(Re-confirmed by Jay 2026-05-11.)*
- **The 3037 Teagarden digit on the CSLB license record is a stale legal-registration entry** — needs to be updated via CSLB address-change filing. Non-urgent; doesn't affect operations or SEO. Track separately.
- **4050 MacArthur Blvd, Oakland CA 94619** was a **real prior operating location** *(confirmed by Jay 2026-05-11)*. Z and Z physically moved out years ago. Earlier audit reports that cited it as the verified CURRENT address were wrong — but the address itself isn't a hallucination. Strategy: mark MacArthur as a "closed prior location" on directories that support historical entries (BBB); on platforms that don't (Yelp, GBP, most aggregators), update to the canonical Teagarden address.

## Primary market

- **~80% of revenue comes from Oakland service calls** *(confirmed by Jay 2026-05-11)* — even though HQ is now in San Leandro.
- This is why the address transition (Oakland → San Leandro on GBP + Yelp) is a careful play: we need to preserve Oakland map-pack ranking. See [`address-transition-strategy-2026-05-11.md`](address-transition-strategy-2026-05-11.md) for the full playbook.

## (925) 586-3212 phone number — URGENT KILL ORDER

- The legacy site's contact-page footer contains a click-to-call link `<a href="tel:9255863212">(510) 708-4237</a>` — displays the canonical number but DIALS (925) 586-3212.
- **(925) 586-3212 routes to a competitor** *(confirmed by Jay 2026-05-11)*. Every mobile customer tapping "Call" on the contact page is being intercepted.
- **P0 today action:** request Clifton Creative Web to nuke the markup line (5-min fix). Audit every other surface for any other instance of (925) 586-3212.
- New website spec: zero orphan tel: links; every "Call" button dials (510) 708-4237 only; tested in QA before launch.

## Google Business Profile

- **GBP listing ID:** `396819026713937378` *(confirmed by Jordan 2026-05-10)*
- **Access status:** Asala (Jordan) added as manager — login at business.google.com using **`jordan@tarifattar.com`** (the Google account Jay approved for the GBP — confirmed by Jordan 2026-05-10). No separate GBP password — auth runs through that Google account.
- **Address on the listing:** needs verification + correction — old MacArthur address may still be live; updating to 3057 Teagarden Street, San Leandro CA 94577 is the highest-leverage Day-1 GBP action
- **Maps URL reference:** https://www.google.com/search?q=Z+and+Z+Plumbing&mat=CeKFZmfNyIEF (Google search/maps deep link with the listing's `mat` param — confirms the GBP is live and indexed)

## Positioning · East Bay, not Oakland-only

- Z and Z is an **East Bay plumbing company**, headquartered in San Leandro.
- Service area (confirmed by founder) still includes Oakland prominently, alongside Alameda, Berkeley, Richmond, Lafayette, Hayward, Castro Valley, Pinole, Emeryville. Selective SF for big commercial.
- The previous Oakland-first framing (in the master plan, audit report, and SEO playbook) was incorrect. Reframe as East Bay-wide with San Leandro as HQ and Oakland as the largest service-area city.
- The Heritage / Old House Specialists positioning still applies — pre-1970s housing stock is plentiful in both San Leandro AND Oakland.

## What this changes downstream

| Asset | What needs to change |
|---|---|
| LocalBusiness schema (JSON-LD) | Use Teagarden / San Leandro address + correct geo coords |
| Site footer NAP | 3057 Teagarden St, San Leandro CA 94577 |
| GBP listing | HQ city = San Leandro (verify ownership claim) |
| Yelp / BBB / Chamber of Commerce / Cozywise | NAP cleanup task (currently may show Oakland — wrong) |
| Site copy hero / homepage | Reframe "Oakland's plumber" → "East Bay plumbing · headquartered in San Leandro" |
| `/plumbers-san-leandro-ca/` page | Currently a doorway. Make this the HQ-city flagship — full Heritage positioning, real photos, neighborhoods, ZIPs (94577, 94578, 94579), Lake Chabot landmark, EBMUD. |
| `/plumbers-oakland-ca/` page | Becomes a service-area landing page (still important — Oakland is the largest market in the service area), but no longer the HQ-city flagship. |
| Other city pages | Berkeley, Hayward, Alameda, Emeryville, Richmond, Castro Valley, Pinole, Lafayette — all service-area pages |
| Master plan content | "Oakland" → "East Bay" or "San Leandro" depending on context |
| SEO target keywords | Add "plumber san leandro" alongside "plumber oakland" + service-keyword variants |
| Brand package address references | Update all 11 brand docs |
| Citation submissions | All point to Teagarden / San Leandro |

## What stays the same

- Founded **2003** (~23 years operating)
- C-36 licensed **2007**, A General Engineering licensed **2012**, CSLB **#896116**
- Phone **(510) 708-4237**
- 4.5★ × 238 Yelp reviews (still strong; just need NAP cleanup)
- 24/7 emergency operation claim
- Heritage / Old House Specialists positioning
- Three revenue motions (residential transactional · Home Care Club · commercial)
- All commercial outreach targets (realtors, restaurants, HOAs, small landlords — never large PM firms)
- ~$2K/mo Yelp Ads spend (still needs attribution decision)
- ServiceTitan stack
- The 90-day execution plan structure (just reframed for East Bay HQ in San Leandro)

## Cascade — what to update across the AIOS

These files contain the wrong address or Oakland-first framing and need correction (in priority order):

1. **`01_Discovery/seo-local-report.html`** — visual SEO audit shown to client
2. **`00_Project Brain/master-plan.html`** — interactive master plan (high-traffic surface)
3. **`01_Discovery/seo-fix-checklist.html`** — Phase 0 critical-bug items now describe the wrong fix path
4. **`01_Discovery/seo-local-analysis-2026-05-06.md`** — markdown source of audit
5. **`00_Project Brain/master-plan.md`** — markdown source of master plan
6. **`00_Project Brain/seo-execution-plan.md`** — references Oakland address + framing
7. **`00_Project Brain/post-call-synthesis.md`** — discovery synthesis (likely references address)
8. **`00_Project Brain/website-prd.md`** — PRD references
9. **`02_Competitor Research/audit-gap-closing-plan.md`** — references the Oakland address
10. **`06_Brand Package/`** — all 11 brand docs
11. **`04_Spreadsheets/`** — 7 XLSX trackers (Citation Audit especially)
12. **`Z&Zplumbing-v1/`** — Next.js v1 site code (any address strings)
13. **`index.html`** (Z and Z client hub) — hero stats, descriptions
14. **AIOS dashboard cells** — any Z and Z-related copy
15. **AIOS memory** — already updated 2026-05-07

## Acceptance test for the cascade

The correction is complete when:
1. Searching the AIOS workspace for "4050 MacArthur" returns zero matches in canonical files (only acceptable in audit-history references that explicitly note "this was the previous incorrect claim")
2. Searching for "Oakland's plumber" or "Oakland-first" returns zero matches
3. Every primary-action card on the Z and Z hub references San Leandro / East Bay
4. The master plan hero + first section both clearly state San Leandro HQ + East Bay positioning
5. The audit report's NAP table is rewritten with Teagarden as the canonical address

## Process going forward

Whenever a new asset is created for Z and Z (a page, a doc, a deck, a brand artifact, a citation entry, a schema block), reference THIS file first, not the audit report or any other document. This file is the source of truth.

If a future audit run produces a finding that contradicts this file, **trust this file**. Append a note to the audit's limitations section explaining the override.
