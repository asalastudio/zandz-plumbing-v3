# Z and Z Plumbing, Integrated 90-Day Roadmap (v2)

**Date:** 2026-05-11 (evening)
**Owner:** Jordan / Asala
**Supersedes:** `integrated-roadmap-2026-05-11.md` (v1, mid-afternoon)
**What changed in v2:** GSC indexing data fully unpacked across all 6 coverage buckets. URL migration map now FINAL at v4 with redirect spec ready to paste. Sewer-lateral-oakland page drafted. AI placeholder URL discovered on legacy site. Brand voice em-dash discipline locked.

---

## The diagnostic in 10 confirmed numbers

| Metric | Value | Source |
|---|---|---|
| Total organic clicks, 16 months | **325** | GSC Performance |
| Total organic impressions, 16 months | **221,300** | GSC Performance |
| Overall CTR | **0.147%** vs 2–3% industry baseline | GSC Performance |
| Brand-search share of clicks | **67%** | GSC analysis |
| Non-brand striking-distance impressions, page 2 fixable | **75,800** across 93 queries | GSC analysis |
| Pages indexed today | **50 of 95 known** (53%) | GSC Indexing > Pages |
| Pages de-indexed in single day on May 4 | **12** | GSC indexing chart |
| Thin blog posts Google has rejected | **28 of the 95 known** | GSC drilldowns |
| Google reviews on the GBP | **19 at 4.6★** | GBP screenshot |
| Oakland share of non-brand demand | **51%** of impressions | GSC city tagging |

The site is severely under-monetizing search demand AND is actively degrading. The new site catches this fall and reverses it.

---

## What we have shipped today (this session)

1. **Citation audit master spreadsheet** at `outputs/zandz-plumbing/citation-audit-2026-05-11/citation-audit-master.xlsx` (27 directories scored by priority)
2. **Credentials request package** at `00_Project Brain/credentials-request-2026-05-11.md`
3. **Jay-call access tile** at `00_Project Brain/jay-call-tile.html` (visual)
4. **Address transition strategy** at `00_Project Brain/address-transition-strategy-2026-05-11.md` and its visual tile (Sterling Sky 3-step on GBP, SAB-first on Yelp)
5. **Curated `/share` Vercel deploy** at `share/` (sanitized, ready to `npx vercel --prod`)
6. **GSC 16-month baseline analysis** at `outputs/zandz-plumbing/gsc-baseline-2026-05-11/gsc-baseline-summary.md`
7. **Keyword priority matrix** at `outputs/zandz-plumbing/gsc-baseline-2026-05-11/keyword-priority-matrix.csv` (75 striking-distance opportunities, scored)
8. **URL migration map v4 FINAL** at `outputs/zandz-plumbing/gsc-baseline-2026-05-11/url-migration-map-v4-FINAL.csv` (83 URLs across 4 launch buckets, ALL 6 GSC coverage buckets cross-referenced)
9. **Quick-wins launch list** at `outputs/zandz-plumbing/gsc-baseline-2026-05-11/quick-wins-list.md`
10. **Content migration decisions** at `outputs/zandz-plumbing/gsc-baseline-2026-05-11/content-migration-decisions.md`
11. **Next.js redirects spec** at `outputs/zandz-plumbing/gsc-baseline-2026-05-11/next-config-redirects.js` (97 lines, paste-ready)
12. **Plumber Oakland city hub page draft** at `03_Content Strategy/page-plumber-oakland-2026-05-11.md`
13. **Sewer Lateral Oakland service+city page draft** at `03_Content Strategy/page-sewer-lateral-oakland-2026-05-11.md`
14. **Business truth doc updated** with Jay's confirmations (Teagarden 3057 canonical, MacArthur real prior, 925 routes to competitor)

---

## URL migration breakdown, finalized

Cross-referenced against all 6 GSC indexing buckets:

| Bucket | URLs | Clicks | Impressions | What happens at launch |
|---|---|---|---|---|
| **A1 · Homepage canonicalize** | 1 | 579 | 190,016 | All http, www, and trailing-slash variants resolve to `https://zandzplumbing.com/`. Vercel handles platform-level. |
| **A2 · True 301 migrate** | 45 | 104 | 182,645 | Real content URLs that map to a new-site equivalent. Each has a one-to-one 301 in `next-config-redirects.js`. |
| **B · Retire to `/blog/`** | 33 | 9 | 13,215 | Thin blog posts Google rejected (28 confirmed) + the AI placeholder URL + paginated archives. One-pot 301 to `/blog/`. |
| **C · Block (robots / canonical)** | 4 | 0 | 6 | WordPress system files + `?ref=` query-param URLs. Block in `robots.txt`. |

### One specific finding worth flagging to Jay

Discovered indexed on the legacy site: `/here-is-a-fully-optimized-1000-word-blog-post-for/`. The slug contains AI-prompt placeholder text that was never replaced before publish. The page has been live and indexed on Google. Recommended action: ask Clifton to unpublish or `noindex` the page on the legacy site today. The new site retires it via 301 to `/blog/`.

---

## The five phases (unchanged from v1, refined for what we now know)

### Phase 0 · This week (5/11 → 5/18), GBP verification wait and launch prep

Goal: capture all run-now value while the GBP listing is in verification. No structural GBP changes. Heavy content production. Set up the new site for clean launch.

**Done today:**
- GSC 16-month baseline analysis complete
- URL migration map v4 FINAL (83 URLs across 4 buckets)
- `next-config-redirects.js` ready to paste into `Z&Zplumbing-v2/next.config.ts`
- Plumber Oakland page drafted (primary)
- Sewer Lateral Oakland page drafted (secondary)
- Business-truth doc locked with Jay's confirmations

**Remaining this week:**
- Build GBP Phase 1 optimization package: 3 description candidates, 8 service descriptions, 10 Q&A entries, 12 review-response templates. Ready to paste day 6.
- Ship 2 more page drafts: services hub (`/services/`) and emergency-plumber-oakland.
- Confirm canonical/redirect rules with the Vercel Next.js project.
- Jay actions: GA4 access, Yelp Business Owner access, GoDaddy delegate, ServiceTitan plan tier + customer DB export, kill the (925) tel: link.

### Phase 1 · Launch week (5/18 → 5/25)

Goal: cut over to new site cleanly, deploy GBP optimization the day verification clears, capture before/after baselines.

| Action | Trigger |
|---|---|
| DNS cutover via GoDaddy from SiteGround to Vercel | Launch day |
| Verify all 301s firing correctly using the v4 migration map | Day 1 |
| Submit XML sitemap to GSC | Day 1 |
| URL inspection in GSC for top 20 new pages, request indexing | Days 1–3 |
| Confirm canonical tags point to `https://zandzplumbing.com` (no www) | Day 1 |
| Verify Plumber + Service + FAQPage + LocalBusiness schema with Rich Results Test | Day 1 |
| Deploy GBP Phase 1 (categories, description, services, Q&A, photos, first post) | When GBP verification banner clears (around Day 6) |
| Audit and respond to all unanswered Google reviews | Day 6 |
| Set up ServiceTitan post-job SMS review request flow | Mid-week, depends on ServiceTitan access |
| Daily monitoring of GSC Coverage, Core Web Vitals, indexing | Daily |

### Phase 2 · First 30 days post-launch (5/25 → 6/22)

Goal: begin closing the 75,800-impression gap. Execute the Sterling Sky 3-step to move the GBP. Build the next priority service+city pages.

| Workstream | Action |
|---|---|
| GBP move (Sterling Sky 3-step) | Days 8–10: create NEW GBP at Teagarden using `jordan@asala.ai` as Primary Owner. Days 11–14: verify (video call preferred). Days 15–17: contact Google Support to mark MacArthur as moved. Day 18: add Jay as Owner. |
| Yelp | Open Yelp Business owner ticket. Convert to SAB. Set 6-city service area. Request address-of-record update WITHOUT public-facing edit. Document responses. |
| Content | Ship `/emergency-plumber-oakland/` (20k imps), `/water-heater-oakland/` (17k imps), `/drain-cleaning-oakland/` (14k imps), and `/services/` hub. |
| Citations | Tier-1 cleanup: BBB verify, Apple Business Connect claim, Bing Places claim, Facebook sync. |
| Reviews | Active Yelp → Google migration outreach via ServiceTitan customer matches. Target: +15 Google reviews in 30 days. |
| Reporting | 30-day report: GSC clicks/impressions delta, indexing coverage, GBP insights, review velocity. |

### Phase 3 · 30–90 days (6/22 → 8/11), depth content, SEMrush turns on

Goal: move from "ship the obvious" (GSC-driven) to "find the non-obvious" (competitor-driven). Tools spend kicks in.

| Workstream | Action |
|---|---|
| Tools | SEMrush Pro ($140/mo) subscribes. Run keyword gap against Oakland Rooter, Albert Nahman, Mr. Rooter, Pipe Spy. Output 100+ new target keywords. |
| Tools | Local Falcon ($30/mo). Set up 10×10 grid tracking for 5 top keywords across Oakland. |
| Tools | Install GMB Everywhere Chrome extension (free). |
| Content | Ship 8 more city pages: Berkeley, Alameda, Hayward, Castro Valley, Richmond, Emeryville, Pinole, Lafayette. |
| Content | Ship 3 more Oakland service hubs: Repipe, Hydrojetting, Tankless. |
| Content | Weekly blog cadence (1 per week) on SEMrush-surfaced high-volume non-brand queries. |
| Backlinks | Citation cleanup Tier-2: ZoomInfo, Manta, Yellow Pages category fix, Yahoo Local, Nextdoor business claim. |
| Backlinks | Local press outreach: Oaklandside, Berkeleyside, East Bay Times. Trade associations: PHCC, ASA Bay Area. |
| Reviews | Continue post-job SMS engine. Cumulative target: +30 Google reviews by Day 90 (from 19 to 49+). |
| GBP | Weekly posts locked. 4+ photos per month. Q&A monitoring weekly. |
| Reporting | Monthly performance reports. |

### Phase 4 · Day 90+ ongoing retainer cadence

| Cadence | Action |
|---|---|
| Daily | Monitor GSC for crawl errors, indexing changes. |
| Weekly | 1 blog post. 1 GBP Post. Review velocity check. Map-pack ranking check. |
| Monthly | Performance report covering clicks, impressions, ranking changes, review velocity, map-pack delta, GA4 conversion data. |
| Quarterly | Re-run SEMrush keyword gap. Re-prioritize content stack. Citation audit refresh. Yelp Ads ROI review. |
| Annually | Content refresh on top 10 pages by traffic. |

---

## Tools and budget

| Tool | When | Cost | Why |
|---|---|---|---|
| GSC, GA4, GBP | Now (GSC live, GA4 pending Jay) | Free | Foundation |
| GMB Everywhere Chrome extension | Phase 0 | Free | Competitor GBP intel |
| SEMrush Pro | Phase 3 (Week 4–5 post-launch) | $140 / mo | Keyword gap, backlink data, content gap, rank tracking |
| Local Falcon | Phase 3 (Week 4–5 post-launch) | $30 / mo | Grid-based map-pack tracking |
| Yelp Business Owner | Phase 1 (pending Jay) | Free with listing | Yelp ad attribution + address transition |

**Total tooling spend:** $170 / mo starting Week 4–5 post-launch.

**Why not SEMrush immediately:** the launch-critical content is paid for by GSC data we already have. SEMrush's value is in keyword GAPS (what we are not ranking for that we should), which we cannot act on until launch infrastructure is shipped.

---

## 12-week forecast (conservative floor)

| Metric | Today | Day 30 | Day 60 | Day 90 |
|---|---|---|---|---|
| Pages indexed | 50 / 95 (53%) | 75 / 110 (68%) | 90 / 110 (82%) | 100 / 110 (91%) |
| Monthly organic clicks | ~20 | 60 | 180 | 350+ |
| Striking-distance keywords on page 1 | 2 | 4 | 8 | 15 |
| Google reviews on GBP | 19 | 25 | 38 | 50+ |
| Yelp reviews | 238 | 238 (or transitioned) | 238+ | 245+ |
| Citations corrected | 1 (BBB partial) | 8 | 16 | 22 |
| Oakland map-pack avg position (top 5 keywords) | unknown baseline | post-move dip | recovering | parity or better |

Annualized revenue impact at $600 avg ticket and 10% organic-to-job conversion: floor estimate **$180K–$270K of net-new revenue Year 1** from organic alone, not counting compounding effects from reviews, citations, GBP, and YouTube.

---

## Critical risks (no change from v1, monitoring continues)

| Risk | Likelihood | Mitigation |
|---|---|---|
| GBP verification extends past 5 days | Medium | Use the wait to over-prepare content. Sterling Sky video-verification playbook bookmarked. |
| Sterling Sky 3-step fails to transfer Google reviews | Low–Medium | Backup is Google Support's "permanently close + transfer" path. 19 reviews recoverable via SMS engine. |
| Yelp address change strands 238 reviews | Medium | SAB-first conversion mitigates. Plan B is keep-MacArthur. Plan C uses Yelp Ads sales-rep relationship. |
| Indexing continues to degrade pre-launch | Medium | Already accounted for. Many low-quality pages do not need to migrate. |
| Launch slips past target date | Medium | The canonicalization redirect could ship as a legacy hotpatch if needed. |
| Jay disengages or is hard to reach | Medium | All requests documented. Async messaging if calls don't land. |
| EJ Plumbing competitor ad spend escalates on brand name | Medium | Defensive Google Ads bid live in Phase 1. Trademark complaint as fallback. |
| Oakland map-pack drops more than expected | High (planned) | The whole reason for Phase 3 depth content + reviews engine + Local Falcon. Recovery in 60–90 days. |

---

## Brand voice discipline (locked 2026-05-11)

Per project rules in `claude.md`, no em-dashes appear in customer-facing content. Use periods, commas, colons, semicolons, or "and" instead. The em-dash sweep on the two existing customer-facing drafts (Plumber Oakland and Sewer Lateral Oakland) and the `share/` folder is complete. Going forward, no em-dashes in any new content.

Also banned per the template: "look no further," "in today's fast-paced world," "we pride ourselves on," "state-of-the-art," "top-notch," "unparalleled," empty intros that restate the H1, and three-word bullet lists where every bullet is the same length.

---

## What we do TODAY (the very next steps)

1. **You:** Forward the access asks to Jay (GA4, Yelp Business Owner, GoDaddy delegate, ServiceTitan plan tier and customer DB export). The (925) tel: link kill is the urgent one. Use the share tile or paste from `credentials-request-2026-05-11.md`.
2. **You:** When ready, push the visual strategy tile (the new top tile on the client hub) to Jay for context on what the engagement is doing.
3. **Me:** Ship the GBP Phase 1 optimization package next (3 descriptions, 8 service descriptions, 10 Q&A, 12 review-response templates). Ready to paste day 6 when verification clears.
4. **Me:** Ship `/services/` hub page draft (rebuild of the legacy `/plumbing-services/` page that has 42k impressions but ranks at position 55).
5. **Me:** Ship `/emergency-plumber-oakland/` page draft (20k impressions in striking distance).
6. **Both:** Lock the new GBP Primary Owner email decision (default recommendation: `jordan@asala.ai`).

---

## Sources and detail docs

- [GSC baseline analysis](../../outputs/zandz-plumbing/gsc-baseline-2026-05-11/gsc-baseline-summary.md)
- [Keyword priority matrix](../../outputs/zandz-plumbing/gsc-baseline-2026-05-11/keyword-priority-matrix.csv)
- [URL migration map v4 FINAL](../../outputs/zandz-plumbing/gsc-baseline-2026-05-11/url-migration-map-v4-FINAL.csv)
- [Indexed URLs final destinations](../../outputs/zandz-plumbing/gsc-baseline-2026-05-11/indexed-urls-final-destinations.csv)
- [Next.js redirects spec, paste-ready](../../outputs/zandz-plumbing/gsc-baseline-2026-05-11/next-config-redirects.js)
- [Content migration decisions](../../outputs/zandz-plumbing/gsc-baseline-2026-05-11/content-migration-decisions.md)
- [Quick wins list](../../outputs/zandz-plumbing/gsc-baseline-2026-05-11/quick-wins-list.md)
- [Address transition strategy](address-transition-strategy-2026-05-11.md)
- [Plumber Oakland page draft](../03_Content%20Strategy/page-plumber-oakland-2026-05-11.md)
- [Sewer Lateral Oakland page draft](../03_Content%20Strategy/page-sewer-lateral-oakland-2026-05-11.md)
- [Citation audit master](../../outputs/zandz-plumbing/citation-audit-2026-05-11/citation-audit-master.xlsx)
- [Credentials request](credentials-request-2026-05-11.md)
- [Business truth](business-truth.md)
- [Visual strategy tile](strategy-overview-tile.html)
