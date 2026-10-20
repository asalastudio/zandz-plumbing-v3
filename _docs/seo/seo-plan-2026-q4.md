# Z and Z Plumbing SEO Plan, Q4 2026 Update

**Owner:** Jordan / Asala
**Written:** 2026-10-20
**Supersedes:** the SEO sections of `../strategy/integrated-roadmap-v2.md` (May 2026). The keyword research in `keyword-priority-matrix.csv`, `gsc-baseline-summary.md`, and `quick-wins-list.md` still stands; this plan says what is done, what is broken, and what to do next.

---

## Where SEO stands today

**The good news: the foundation shipped and is clean.**

- The new site is live on `https://www.zandzplumbing.com/`. All 48 sitemap URLs return 200 with self-referencing canonicals, trailing slashes are enforced, apex and http redirect to www, and there are zero broken internal links.
- 75 legacy redirects are in place, covering every old URL that had traffic.
- 12 service pages, 18 city and county pages (the plan called for 10), 4 Oakland priority pages, plus an EBMUD compliance page that wasn't in the original plan.
- Every page carries Plumber and LocalBusiness schema with the Teagarden address, hours, both licenses, and the founder. The self-serving rating markup was removed and has stayed out.
- **Web leads roughly tripled** after the summer, from about 5 a month (May to July) to 14 to 18 a month (August to October).

**The problems found in the live crawl (2026-10-20):**

| Problem | Effect |
|---|---|
| Brand name doubled in 45 page titles ("... \| Z and Z Plumbing \| (510) 708-4237 \| Z and Z Plumbing"), titles 62 to 89 characters | Every title truncated in Google; keyword pushed out of view |
| All meta descriptions 178 to 284 characters | Truncated snippets, weaker click-through |
| The four Oakland priority pages and the EBMUD page are linked only from `/blog/`, which is noindex | Google sees them as unimportant; they are the pages we most want to rank |
| `/blog/` is noindex but listed in the sitemap, and ~53 legacy URLs redirect into it | Mixed signals; 12K impressions of old blog equity pointed at a page that asks not to be indexed |
| Homepage H1 is only the tagline, no service or city words | The strongest page on the site says nothing about plumbing in Oakland or San Leandro |
| Schema lists a HomeAdvisor profile that now redirects to a different business | Google can attach the wrong entity to Z and Z |
| `/plumber-oakland-ca/` is the generic city template (798 words); the 3,965-word Oakland draft was never built | Leaves ~30K impressions of "plumber oakland" style searches on page 2 |
| Service pages (540 to 566 words) and city pages share the same template FAQs | Near-duplicate content; FAQ markup no longer earns rich results for plumbers anyway |
| No blog posts at all; four finished drafts sit outside the repo | No informational content, no reason for Google to index `/blog/` |
| Clarity not installed (env var missing); lead forms not marked as GA4 key events | We can't tell which pages or channels produce leads |

**Off the site:**

- Aggregator listings (Lantern, serviceagent.ai) still show **4050 MacArthur Blvd, Oakland** and about **20 Google reviews at 4.6 stars**. If that is current, the review count barely moved since May against a target of 49+, and the address correction hasn't propagated.
- BuildZoom shows "3037 Teagarden" (the stale CSLB digit).
- Nothing in the repo records whether the Google Business Profile move to Teagarden (the Sterling Sky 3-step) ever happened. **This needs a direct check in GBP.**
- No Search Console or GA4 data since the May 2026 export. Every keyword number in this plan is from that baseline.

---

## Fixed in this pass (code, 2026-10-20)

Live once the audit branch is deployed.

- **Titles:** the layout template adds "| Z and Z Plumbing" exactly once; pages set only the keyword part. Phone number removed from titles. All 48 titles now 33 to 60 characters. Homepage: "East Bay Plumber in Oakland & San Leandro | Z and Z Plumbing".
- **Descriptions:** every one rewritten; the city and service templates now land at 141 to 155 characters.
- **Homepage H1** now carries the keyword ("East Bay Plumbers, Headquartered in San Leandro."), with the tagline kept as display text. Same look.
- **Internal links to the priority pages:** a shared Oakland services list feeds a footer column, a desktop Services dropdown, a block on `/plumber-oakland-ca/`, callouts on the matching `/services/` pages, and a line on the homepage.
- **Sitemap:** `/blog/` removed (it is noindex until posts ship); `/videos/` listed only when it has published videos; regenerated hourly.
- **`/videos/`** is noindex while empty. `/coupons/` is noindex when no coupon is live, and expired coupons no longer show anywhere.
- **Schema:** one `@graph` with the Plumber/LocalBusiness node and a new WebSite node; `logo` and `image` added; HomeAdvisor (now another business) and the Google search URL removed from `sameAs`; every Service `provider` points at the organization by `@id`.
- **`/privacy-policy/` and `/terms/`** have an H1. 13 em-dashes removed from customer-facing copy.

Still open from the crawl: only the homepage has an `og:image` (other pages override Open Graph without one), `/book/` renders two H1s (one is screen-reader only), and the service and city pages still share template FAQs (content work, item 13 below).

---

## The next 90 days

Ordered by impact. Each item names an owner.

### Weeks 1 to 2: measure and claim

| # | Action | Owner | Impact |
|---|---|---|---|
| 1 | **Confirm the GBP state.** Which address is live, how many Google reviews, which categories. Then finish the Teagarden move per `../strategy/address-transition-strategy.md`. | Jay with Jordan | High |
| 2 | **Reconnect Search Console and GA4** for Asala, and pull a fresh 3-month baseline so we can see what the new site has done since May. | Jay grants access, Jordan pulls | High |
| 3 | **Mark lead form submits as GA4 key events** and set `NEXT_PUBLIC_CLARITY_ID`. Tag every lead with its source in the OS. | Dev | High |
| 4 | **Turn on review velocity:** `GOOGLE_REVIEW_URL`, Twilio, and a personal ask at the end of every job. Target 10 new Google reviews a month. | Dev + Jay | High |
| 5 | **GBP buildout:** categories from 2 to 8, every service listed, website field set to `https://www.zandzplumbing.com/`, weekly posts, 4+ real job photos a month, 10 Q&A entries. | Jay at GBP, Jordan drafts | High |

### Weeks 3 to 6: the pages that are closest to page one

| # | Action | Owner | Impact |
|---|---|---|---|
| 6 | **Rebuild `/plumber-oakland-ca/`** from the 3,965-word draft in `../content-drafts/page-plumber-oakland.md`: Oakland neighborhoods, an Oakland job example, Oakland-specific FAQs, links to all five Oakland service pages. Targets "plumber oakland" (7.2K impressions at position 24), "plumbing oakland" (4.3K at 14), "plumbing company oakland" (4.1K at 19). | Content + dev | High |
| 7 | **Build `/toilet-repair-san-leandro/`.** Already on page one (5,458 impressions at position 8) with zero clicks and no dedicated page. The single highest-scoring opportunity in the keyword matrix. | Content + dev | High |
| 8 | **Deepen `/plumber-san-leandro-ca/`** as the HQ-city flagship (the legacy page had 41K impressions at position 17): Teagarden, the 94577/94578/94579 neighborhoods, Lake Chabot, EBMUD. | Content + dev | High |
| 9 | **Add the blog:** a `/blog/[slug]/` route, publish the four finished drafts (EBMUD sewer lateral compliance, signs your sewer lateral is failing, hydro-jetting vs snaking, low water pressure in old East Bay homes) with Article schema, then switch `/blog/` to index and put it back in the sitemap. | Dev + content | High |

### Weeks 7 to 13: depth and authority

| # | Action | Owner | Impact |
|---|---|---|---|
| 10 | **A sewer services hub** (sewer category: 22.6K impressions at an average position of 42) that ties together sewer lateral, EBMUD compliance, camera inspection, hydro-jetting, and trenchless. | Content + dev | Med-high |
| 11 | **San Leandro service pages:** emergency, water heater, drain cleaning (3.6K impressions at positions 12 to 15). | Content + dev | Medium |
| 12 | **Missing Oakland pages:** `/repipe-oakland/`, `/gas-line-oakland/`, `/leak-detection-oakland/` (currently 404; listed in the original launch plan). | Content + dev | Medium |
| 13 | **Unique bodies for the top 6 service pages** (800 to 1,200 words each, real job examples, page-specific FAQs). | Content | Medium |
| 14 | **Citation and NAP cleanup, tier 1:** BBB, Apple Business Connect, Bing Places, Facebook, Yelp (service-area conversion first), Nextdoor, BuildZoom (fix 3037), and the data aggregators. All to Teagarden and the www address. | Jay + Jordan | Medium |
| 15 | **Realtor and partner links:** the realtor sewer-lateral one-pager (see the marketing plan) doubles as a link-earning asset. Ask partner agents and the local chamber to link to `/ebmud-compliance/`. | Jordan | Medium |

### Every month after that

- One blog post a month, aimed at a question East Bay homeowners actually search (seasonal: winter sewer backups, spring water heater flush, EBMUD rules when selling).
- One GBP post a week, four job photos a month, reply to every review.
- Monthly check of Search Console: pages indexed, top queries, anything that dropped.
- Quarterly: refresh the keyword matrix. Add Semrush and Local Falcon once we are publishing monthly.

---

## How we'll know it's working

| Metric | Baseline | Day 90 target | Source |
|---|---|---|---|
| Google reviews | ~20 (aggregator data, unconfirmed) | 50+ | GBP |
| Real organic and Maps leads a month | ~10 (web form only, spam removed) | 25+ | OS lead source tags + GA4 key events |
| Non-brand clicks a month | Unknown since May | Set after GSC baseline | Search Console |
| Oakland keywords on page one | 2 (May) | 8 | Search Console |
| Pages indexed | 50 of 95 (May, old site) | 45+ of 48 sitemap URLs | Search Console |

The first job of the next two weeks is replacing "unknown" in that table with real numbers.
