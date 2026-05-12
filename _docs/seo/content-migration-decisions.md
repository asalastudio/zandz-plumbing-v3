# Z and Z Plumbing — Content Migration Decisions

**Date:** 2026-05-11
**Source data:** GSC Indexing > Pages drilldown exports (3 buckets pulled: Page-with-redirect, Crawled-not-indexed, Discovered-not-indexed)
**Status of remaining buckets:** Still need to pull the "Indexed" list (50 URLs) — biggest one — and the 3 smaller buckets (Not found 404, Blocked 4xx, Blocked robots.txt). These are nice-to-have not blocking.

> The migration map at [`url-migration-map-v3.csv`](url-migration-map-v3.csv) is the canonical implementation file — paste it into Vercel's `next.config.ts` redirects array. This doc explains the reasoning.

---

## The four buckets at launch

Every URL Google knows about on the legacy site falls into one of four buckets:

| Bucket | URLs | Total clicks | Total impressions | What happens at launch |
|---|---|---|---|---|
| **A1 · Homepage canonicalize** | 1 | 579 | 190,016 | All variants (`http://`, `http://www`, `https://www`) 301 to `https://zandzplumbing.com/`. Critical fix. |
| **A2 · Migrate (true 301)** | 46 | 104 | 183,375 | Real content URLs that map to a new-site equivalent. Each gets a one-to-one 301. |
| **B · Retire to `/blog/`** | 32 | 9 | 12,485 | Low-quality blog posts Google has rejected or never crawled. One-pot 301 to `/blog/` so we don't lose link equity but tell Google these specific URLs are gone. |
| **C · Block via robots/canonical** | 4 | 0 | 6 | WordPress system files + query-param garbage. Block at robots.txt + canonical-tag level, no 301 needed. |

**Total accounted for:** 83 URLs (the 78 from Performance + 5 from Discovered-not-indexed that have 0 historical traffic).

---

## The content-quality story this data tells

Google has been actively de-indexing thin content. Of the 28 blog posts in buckets we've inspected:

**14 were crawled and rejected** (Crawled-not-indexed):
- `/5-common-causes-of-sewer-backups/`
- `/5-signs-its-time-to-replace-your-water-heater/`
- `/the-importance-of-regular-plumbing-maintenance-for-your-home/`
- `/the-top-10-plumbing-system-tips-for-homeowners/`
- `/5-simple-ways-to-detect-water-leaks-in-your-home/`
- `/the-importance-of-sewer-line-repair/`
- `/replace-your-toilet/`
- `/common-plumbing-repairs-every-homeowner-should-know-about/`
- `/5-signs-its-time-for-a-toilet-replacement/`
- `/5-common-plumbing-problems-and-how-to-fix-them-before-they-get-worse/`
- `/diy-plumbing-fixes-for-common-household-problems/`
- `/how-to-reduce-water-use-in-the-home/`
- `/5-reasons-you-should-hire-a-plumber-for-water-heater-replacements/`
- `/natural-gas-repairs-in-oakland-ca-what-every-homeowner-should-know-about-safety/`

**14 more were discovered but never even crawled** (Discovered-not-indexed):
- `/10-common-causes-of-clogged-drains-you-need-to-know/`
- `/3-simple-ways-to-clean-your-garbage-disposal/`
- `/5-critical-plumbing-problems-and-how-to-fix-them/`
- `/5-plumbing-problems-that-require-a-professional-plumber/`
- `/5-problems-that-are-a-plumbing-emergency-and-how-to-avoid-them/`
- `/5-reasons-your-sewer-line-gets-clogged/`
- `/a-comprehensive-guide-to-understanding-your-homes-plumbing/`
- `/clear-clogged-drains-in-your-home/`
- `/emergency-plumbing-services-what-to-do-when-you-need-a-plumber-asap/`
- `/is-your-water-heater-on-the-fritz-top-reasons-to-call-for-a-repair/`
- `/replacing-your-pipes/`
- `/the-ultimate-guide-to-drain-cleaning-tips-and-tricks-for-a-clog-free-home/`
- `/unclog-drains/`
- `/z-and-z-plumbing-red/` *(test/draft URL)*

**The pattern is unmistakable:** generic "5 tips for X / 3 simple ways / ultimate guide" listicle content. Almost certainly bulk-generated for SEO purposes at some point and quietly accumulated as content debt. This is the kind of pattern that drove the May 4 indexing decline.

### One worth a second look · `/natural-gas-repairs-in-oakland-ca-what-every-homeowner-should-know-about-safety/`

This is the only blog post in the set that has BOTH geo intent (Oakland) AND service intent (gas line). It's been getting 2 clicks + 663 impressions per the Performance data, even though it's currently in the "Crawled — not indexed" bucket. Decision: **route its 301 to `/gas-line-oakland/`** (the planned new-site service+city page). Preserves whatever historical authority it still has and consolidates topic relevance to the right new-site page. Don't migrate the blog content itself — write a fresh, deeper page on the new site.

---

## The `/plumbing/...` URL pattern duplication

The legacy site accidentally created two parallel URL hierarchies:

| Canonical (kept) | Duplicate (retire) |
|---|---|
| `/plumbing-services/` | `/plumbing/` |
| `/plumbing-services/request-plumbing-services/` | `/plumbing/request-plumbing-services/` |
| `/plumbing-services/sewer-plumbing-services/` | `/plumbing/sewer-plumbing-services/` |
| `/plumbers-oakland-ca-plumbing-repair-service/` *(flat URL)* | covered by canonical city slug |

Google saw these as duplicates and indexed neither pattern's URLs in this set. **On the new site:** the entire `/plumbing/...` and `/plumbing-services/...` hierarchy collapses into clean `/services/...` URLs. Every legacy URL across both hierarchies gets a 301 to the right new-site path per [`url-migration-map-v3.csv`](url-migration-map-v3.csv).

---

## Robots.txt + canonical strategy for the new site

The "Block" bucket (4 URLs) plus a sensible default `robots.txt` for the new Next.js site:

```
# /public/robots.txt
User-agent: *
Allow: /

# Block query-parameter URLs from being indexed
Disallow: /*?ref=
Disallow: /*?utm_

# Block any legacy WordPress paths if anything slips through
Disallow: /wp-admin/
Disallow: /wp-includes/
Disallow: /wp-content/
Disallow: /wp-json/

# Don't crawl RSS feeds (Next.js doesn't generate them by default but defensive)
Disallow: /feed/
Disallow: /*/feed/

Sitemap: https://zandzplumbing.com/sitemap.xml
```

Combined with:

- Every page has `<link rel="canonical" href="https://zandzplumbing.com/{path}/">` set to the no-www HTTPS version
- 301s at the Vercel edge for all www and HTTP variants → canonical
- Category pagination on the new site uses `<meta name="robots" content="noindex,follow">` so Google crawls the links but doesn't index the paginated archives

---

## What "Retire to /blog/" actually means in Next.js / Vercel

Each thin blog URL gets one redirect entry in `next.config.ts`:

```typescript
async redirects() {
  return [
    // ... regular content 301s ...
    
    // Thin blog posts retired (Google rejected — see migration map v3)
    { source: '/5-common-causes-of-sewer-backups', destination: '/blog', permanent: true },
    { source: '/5-signs-its-time-to-replace-your-water-heater', destination: '/blog', permanent: true },
    { source: '/the-importance-of-regular-plumbing-maintenance-for-your-home', destination: '/blog', permanent: true },
    // ... 25 more ...
  ];
}
```

`permanent: true` returns HTTP 308 (which Google treats as 301 for SEO purposes). Trailing slashes resolved by Vercel's default behavior.

**Why redirect to `/blog/` instead of returning 410 Gone:** Several reasons. (1) Some of these URLs may still have a few residual backlinks from random citation aggregators we haven't found yet. A 301 preserves any small bit of link equity. (2) Returning 410 is a clearer "this is gone forever" signal to Google but feels hostile to any human who clicks an old link. (3) Migrating to `/blog/` index gives the human visitor something useful (the new blog index) instead of a 410 dead-end. The slight content-quality dilution of `/blog/` is acceptable because we're starting fresh content there with Madison.

---

## What I still need from you to finalize

Three of the six exports I asked for are in (Pages-redirect, Crawled-not-indexed, Discovered-not-indexed). The remaining three:

| Export | Bucket | Click sequence | Why it matters |
|---|---|---|---|
| **`gsc-indexed-pages.csv`** | INDEXED (50 URLs) | GSC → Indexing → Pages → scroll up → click green "Indexed" count → top-right Export | Confirms every indexed URL has a 301 destination on the new site. Highest-value remaining export. |
| `gsc-404.csv` | Not found (2 URLs) | Click "Not found (404)" → Export | Just confirms these are already-dead pages we don't need to handle |
| `gsc-blocked-robots.csv` | Blocked by robots.txt (1 URL) | Click "Blocked by robots.txt" → Export | Verify intent — could be legitimately blocked or accidentally blocked |

Of these, the **Indexed list is the only one that matters for launch**. The other two are 3 URLs total — diminishing returns. The Indexed list (50 URLs) is the final cross-check we need to confirm zero legacy-equity URLs are dropped on the floor at launch.

Once that's in, the migration map is locked. Until then, the v3 map is implementation-ready for everything we currently know.
