# Z and Z Plumbing — GSC 16-Month Baseline Analysis

**Date:** 2026-05-11
**Source:** Google Search Console export for `zandzplumbing.com`, web search, last 16 months (~Jan 2025 → May 2026)
**Sample:** 1,003 queries · 78 pages · 286,182 total impressions across all devices
**Owner:** Jordan / Asala

> This document is the foundational SEO baseline for the entire engagement. Every keyword target, content priority, and migration decision references back to this data. Re-run quarterly to measure progress.

---

## Headline · the situation in five numbers

| Metric | Value | What it means |
|---|---|---|
| **Total clicks, 16 months** | **325** | Roughly 20/month. For a plumber doing $2K/mo on Yelp Ads, this is severe organic under-monetization. |
| **Total impressions, 16 months** | **221,300** | Z and Z's site shows up in a search result page 221k times but converts only 325 to clicks. The exposure exists — the conversion doesn't. |
| **Overall CTR** | **0.147%** | Industry baseline for plumbers is 2–3%. We're at ~5% of industry standard. The site appears, customers don't click. |
| **Brand traffic share** | **67%** of clicks · **0.5%** of impressions | Two-thirds of all SEO clicks are people searching specifically for "z and z plumbing." Non-brand commercial search drives 99.5% of the impression base but only 33% of the clicks. The site is invisible for commercial intent. |
| **Striking-distance opportunity** | **75,800 impressions** in queries ranking positions 11–20 | 93 unique non-brand queries are on page 2 right now. Moving them to page 1 with conservative 3% CTR projects to **~2,274 clicks** vs the current 59 across those same queries. **A 38× lift.** |

---

## The four findings that change the strategy

### 1 · HTTP/HTTPS canonicalization bug is splitting the homepage's authority

The site is being indexed by Google as two separate homepages:

| URL | Clicks | Impressions | CTR | Position |
|---|---|---|---|---|
| `https://zandzplumbing.com/` | 328 | 177,265 | 0.19% | **24.18** |
| `http://www.zandzplumbing.com/` | 251 | 12,751 | **1.97%** | **9.74** |

The HTTPS no-www version gets 14× the impressions but ranks 14 positions WORSE than the HTTP www version. Backlink equity is almost certainly split between them. The HTTP version still ranks on page 1 (position 9.74) because older Yelp/BBB/directory citations point to it.

**Fix at launch:** 301 every variant (`http://`, `http://www`, `https://www`) to a single canonical `https://zandzplumbing.com/`. Add a `<link rel="canonical">` to every page. Update GBP website field (currently `http://www.zandzplumbing.com/`) to the new canonical after launch. This single technical fix should consolidate ~10 positions of homepage ranking power.

### 2 · Oakland is 51% of all non-brand impression demand. San Leandro is 10%.

| City | Queries | Impressions | Clicks | Weighted avg position |
|---|---|---|---|---|
| **Oakland** | 326 | **111,838** | 51 | 25.2 |
| San Leandro | 64 | 22,920 | 4 | 15.3 |
| Berkeley | 13 | 1,720 | 0 | 80.8 |
| Hayward | 3 | 1,436 | 0 | 66.6 |
| East Bay (generic) | 11 | 1,370 | 0 | 39.5 |
| Castro Valley | 6 | 477 | 0 | 109.9 |
| Lafayette | 2 | 222 | 0 | 37.9 |
| Alameda | 2 | 143 | 0 | 78.6 |
| Emeryville | 2 | 65 | 0 | 92.6 |
| Richmond | 1 | 15 | 0 | 74.5 |

**Oakland dominates demand by 5× over the next city.** Validates Oakland-first content. San Leandro is already in striking distance (position 15). Berkeley, Hayward, Alameda, Castro Valley, Emeryville, Richmond are barely on the map (positions 60–110) — they need fresh dedicated content from scratch. None of those will rank without it.

### 3 · Sewer + Emergency + Water Heater = 60% of non-brand impression demand

| Service category | Queries | Impressions | Clicks | Weighted avg position |
|---|---|---|---|---|
| **Sewer (incl. lateral)** | 121 | **22,643** | 1 | 42 |
| **Emergency / 24-hour** | 54 | **20,625** | 3 | 21 |
| **Water heater** | 50 | **17,470** | 5 | 35 |
| Drain | 82 | 14,546 | 0 | 36 |
| Toilet | 25 | 7,966 | 0 | 24 |
| Faucet | 64 | 5,290 | 0 | 53 |
| Residential | 29 | 3,945 | 0 | 23 |
| Pipe repair | 33 | 3,655 | 0 | 34 |
| Leak | 32 | 3,462 | 0 | 29 |
| Garbage disposal | 83 | 3,397 | 1 | 49 |
| Commercial | 25 | 2,392 | 0 | 36 |
| Gas line | 15 | 1,471 | 0 | 16 |
| Tankless | 6 | 1,239 | 0 | 71 |
| Repipe | 1 | 15 | 0 | 55 |

The brand has built its identity around sewer-lateral specialty work — and the data validates that's where the demand sits. The page priority order from highest impression to lowest:

1. **Sewer-lateral + sewer hub pages** (Oakland-focused) — 22k impressions waiting
2. **Emergency plumber pages** (24/7 framing, every city) — 20k impressions
3. **Water heater pages** (Oakland + San Leandro) — 17k impressions
4. **Drain cleaning** — 14k impressions, currently ZERO clicks despite the volume
5. **Toilet / faucet / leak / pipe repair** — secondary service pages

**Note on repipe:** Only 15 impressions across 16 months. The repipe content positioning is REAL value-add (high-ticket, $15K–$40K work) but the demand is much smaller than sewer lateral. Build the repipe-oakland page anyway because it serves real customers, but don't expect it to be a top-3 traffic driver.

### 4 · 67% of all clicks are people searching for the brand directly

This is the most important strategic signal in the dataset.

- "z and z plumbing" → 203 clicks · position 1.52 · 19.96% CTR
- "z&z plumbing" → 14 clicks · position 1.08
- All brand variants combined: **218 clicks (67% of all clicks)**, only **1,097 impressions (0.5%)**

The site is currently a destination only for people who already know about Z and Z. It does almost no work as an acquisition channel. Two implications:

**A) The Yelp Ads $2K/mo spend is doing the customer-acquisition heavy lifting.** Without Yelp, traffic would be 70% lower. This explains why Jay describes it as essential despite the lack of attribution data. The new site + SEO needs to gradually replace this dependency by capturing non-brand commercial intent.

**B) EJ Plumbing bidding on "z and z plumbing" Google Ads (confirmed in GBP screenshot) is doing real damage** — they're skimming the most valuable traffic. Defensive Google Ads bid on own brand name is now a P0, not a P2. Cost will be low (low CPC, low competition because branded), conversion will be high. Brief math: 1,097 brand impressions × even 5% intercepted by EJ = 55 lost branded sessions / 16 months = ~3.5/month. Each Z and Z customer is worth $600+ average ticket. Worth defending.

---

## Page-by-page: the legacy site's traffic pattern

**Top 10 pages by clicks (16 months):**

| Page | Clicks | Impressions | Position | Notes |
|---|---|---|---|---|
| `/` (https) | 328 | 177,265 | 24.18 | Homepage HTTPS — gets most impressions but ranks ~p3 |
| `/` (http www) | 251 | 12,751 | 9.74 | Homepage HTTP — duplicate, ranks p1, CTR 10× the HTTPS |
| `/plumbers-san-leandro-ca/` | 42 | 41,119 | 16.91 | Only city page that exists. P2. Striking distance. |
| `/contact/` | 18 | 11,791 | 32.48 | Suggests brand search traffic landing here. Re-route to homepage. |
| `/plumbing-services/` | 11 | 42,563 | **55.46** | Services hub page · 42k impressions but ranks position 55 (page 6). Massive opportunity if rebuilt. |
| `/category/plumber-blog/` | 9 | 11,991 | 11.52 | Blog index. Page 2 already. |
| `/about/` | 6 | 12,035 | 10.38 | About page. Page 1. Surprisingly competitive — keep good. |
| `/blog/plumbing-diy-tips...` | 3 | 2,390 | 43.07 | DIY blog post · page 5 · low priority migration |
| `/sewer-lateral-services/` | 3 | 1,317 | 24.75 | Existing sewer lateral service page · top-3 priority for new-site rewrite |
| `/whole-house-repiping...` | 3 | 578 | 22.02 | Existing repipe blog post · keep + redirect to new repipe-oakland page |

**The full URL migration map** with proposed 301 destinations for all 77 legacy URLs is in [`url-migration-map.csv`](url-migration-map.csv).

---

## The top 10 striking-distance keyword opportunities (page 2, big volume)

These are the queries we should rank for, are CLOSE to ranking for, and aren't yet capturing. Full matrix of 75 ranked opportunities in [`keyword-priority-matrix.csv`](keyword-priority-matrix.csv).

| Query | Impressions (16mo) | Current position | Target page (new site) |
|---|---|---|---|
| plumber oakland | 7,208 | 23.91 | `/plumber-oakland-ca/` *(draft already shipped)* |
| toilet flushing service san leandro | 5,458 | 7.99 | `/toilet-repair-san-leandro/` *(already on page 1 — fix snippet)* |
| plumber | 4,554 | 11.03 | `/` (homepage) |
| water heater repair oakland | 4,339 | 25.49 | `/water-heater-oakland/` |
| plumbing oakland | 4,266 | 14.32 | `/plumber-oakland-ca/` |
| plumbing company oakland | 4,073 | 18.92 | `/plumber-oakland-ca/` |
| local plumbers | 3,846 | 17.12 | `/` (homepage) |
| plumber near me | 3,529 | 15.77 | `/` (homepage) |
| sewer services | 3,488 | 42.55 | `/sewer-services/` |
| plumbers oakland | 3,408 | 12.74 | `/plumber-oakland-ca/` |

Three pages handle the majority of this demand: a strong `/plumber-oakland-ca/` (already drafted), a properly built homepage, and a sewer-services hub. Build those three well and you capture 30k+ impressions in striking distance.

---

## What this baseline justifies

### Immediate priorities (this week and launch week)

1. **HTTP/HTTPS canonicalization at launch** — single biggest technical fix. Forces all backlink equity into one URL.
2. **The Oakland city hub page** — already drafted at `03_Content Strategy/page-plumber-oakland-2026-05-11.md`. THIS is the page that captures the 30k+ impressions in striking distance.
3. **A rebuilt services hub** — currently ranking position 55 with 42k impressions. Becomes the spine for all individual service pages on the new site.
4. **EJ Plumbing defensive Google Ads bid** — protects 67% of all clicks. Cheap. Critical.

### 30-day priorities (post-launch)

5. **Sewer-lateral-oakland page** — service+city for the #1 service category × #1 city. 22k impression base.
6. **Emergency-plumber-oakland page** — 20k impression base for emergency queries.
7. **Water-heater-oakland page** — 17k impression base. Includes tankless content.
8. **San Leandro city hub rebuild** — existing page at position 17 with 41k impressions. Re-rank it with full content treatment.

### 60–90 day priorities (Oakland recovery, post-address-move)

9. **Berkeley + Hayward + Alameda + Castro Valley city pages** — these don't rank at all (positions 60–110). New pages from scratch.
10. **Drain cleaning hub** — 14k impressions, 0 clicks. Massive untapped demand for a single service page.

---

## How to use this baseline

- Every new content page should reference this file before being scoped. Check: is this page targeting a query that has impression demand? At what position is the current site ranking for it?
- Every URL on the new site that REPLACES a legacy URL should be in the URL migration map (`url-migration-map.csv`) with a confirmed 301 destination. No legacy URL with 5+ clicks ships without a 301.
- Re-run this analysis quarterly (every 90 days) to measure progress. Track: total clicks, non-brand clicks, striking-distance count, CTR.
- After launch, GSC will show the impact of every change. Watch the "compare last X days vs previous X days" view for any page being rebuilt.

---

## Source files

- [`raw/Queries.csv`](raw/Queries.csv) — 1,003 unique queries from GSC export
- [`raw/Pages.csv`](raw/Pages.csv) — 78 pages from GSC export
- [`raw/Devices.csv`](raw/Devices.csv) — device split (Desktop 421 clicks, Mobile 260, Tablet 3)
- [`raw/Countries.csv`](raw/Countries.csv) — geographic distribution
- [`raw/Chart.csv`](raw/Chart.csv) — daily click/impression history
- [`keyword-priority-matrix.csv`](keyword-priority-matrix.csv) — 75 scored opportunities with target URLs
- [`url-migration-map.csv`](url-migration-map.csv) — 77 legacy URLs with proposed 301 destinations
