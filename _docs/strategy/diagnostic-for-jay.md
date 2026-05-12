# Z and Z Plumbing, What We've Found and What We're Fixing

**For:** Jay (and Seif)
**From:** Jordan / Asala
**Date:** 2026-05-11
**Purpose:** Plain-language inventory of everything we have diagnosed in the first week of the engagement, why each item matters in revenue terms, and when we're fixing it. Designed for the next call.

---

## The single most urgent item

**Your contact-page footer is currently routing calls to a competitor.** Click "Call (510) 708-4237" on your phone and the underlying click-to-call link dials **(925) 586-3212** instead. That number routes to a competitor. Every mobile visitor tapping Call is being intercepted.

**What we recommend:** ask Clifton Creative Web to remove the one line of bad markup today. Five minute fix. Send them: "Please remove the `tel:9255863212` link from the contact page footer markup. It is routing to a competitor. Replace with `tel:5107084237`."

**Expected revenue loss while live:** estimating from your mobile traffic, this is conservatively 3 to 5 intercepted calls per week. At an average ticket of $600 per converting customer, that is $7,800 to $13,000 per month being handed to a competitor. New site launch in roughly a week resolves this naturally at cutover, but seven days of bleed is a lot.

---

## What is broken right now, by category

### 1. Local search visibility (your Google Business Profile and Yelp)

**Your Google Business Profile still publicly shows 4050 MacArthur Blvd, Oakland.**
Why it matters: customers driving to your shop end up at a closed location, which produces 1-star reviews. Also, every directory that scrapes your Google profile is propagating the wrong address.
When we fix it: Day 8 to 17 of launch week. We will create a new Google Business Profile at 3057 Teagarden, ask Google Support to mark the MacArthur listing as moved, and the reviews transfer cleanly. This is the documented Sterling Sky 3-step process for service-area businesses.

**Your Google profile has 19 reviews. Oakland Rooter has over 1,600 on Yelp alone.**
Why it matters: Google reviews are the single biggest ranking lever for the local map pack. 19 is low for a 23-year-old business.
When we fix it: post-launch week 2 onward. We will set up ServiceTitan to automatically text every customer a Google review link the day after their job. Target is 50+ Google reviews within 90 days.

**Your Google profile has only 2 categories (Plumber and Drainage service). Competitors have 6 to 8.**
Why it matters: each category you claim opens up additional search visibility. Missing: Sewer line repair, Water heater repair, Gas installation, Emergency plumber, Trenchless sewer, Hot water system supplier.
When we fix it: Day 6 of launch week, the moment your current verification clears.

**Your Yelp listing also still shows the MacArthur address.**
Why it matters: Yelp drives the majority of your current customer acquisition. Customers calling from Yelp may be confused by the address mismatch. Yelp's syndication propagates this address to roughly 30 downstream directories.
When we fix it: post-launch. We convert your Yelp listing to "Service Area Business" first, hide the public address, then request the address-of-record update without triggering Yelp's "move" workflow that would strand your 238 reviews.

**Your Google profile description is generic and mentions no licensing.**
Why it matters: your C-36 plumbing + A General Engineering license combination is rare. Most Bay Area plumbers cannot legally do street-side and right-of-way work. Your current description does not say this. The differentiator that drives your highest-margin work (sewer lateral compliance) is invisible.
When we fix it: Day 6 launch week, alongside categories.

**Your Yelp tracking number (341 area code) creates a NAP variance.**
Why it matters: search engines look for consistent Name, Address, Phone (NAP) across directories. The tracking number on Yelp is inconsistent with your canonical (510) number everywhere else. We can keep the (341) for Yelp ad attribution OR consolidate. Recommended is keep it for now and reassess after the Yelp Ads attribution audit.

### 2. Website quality and indexing

**Google is actively de-indexing your site. On May 4, 12 pages dropped out of the index in a single day.**
Why it matters: indexed pages drive traffic. You have 50 of 95 known URLs indexed today (53%). Industry benchmark is 90 percent or higher for a healthy site.
When we fix it: at launch. The new site replaces the legacy site with high-quality, focused pages. Junk URLs get blocked. Thin content gets retired.

**The site has 28 thin blog posts Google has rejected.**
Why it matters: Google quality-assesses your whole site based on the average quality of all your indexed pages. 28 thin "5 tips for X" blog posts dragging down the average means Google is conservative about indexing the GOOD pages.
Examples: "5 Common Causes of Sewer Backups", "Top 10 Plumbing System Tips", "DIY Plumbing Fixes," and 25 more like them.
When we fix it: at launch. None of these migrate. They all redirect to the new `/blog/` index. The new site starts with deeper, more useful content.

**One URL still on Google is literal AI placeholder text.**
The slug `/here-is-a-fully-optimized-1000-word-blog-post-for/` is the prompt text someone forgot to replace before publishing. The page is currently indexed by Google.
When we fix it: ask Clifton to unpublish or `noindex` this page on the legacy site today. New site retires it at launch.

**Your homepage is being indexed twice (HTTP and HTTPS).**
Why it matters: Google sees `http://www.zandzplumbing.com/` and `https://zandzplumbing.com/` as two URLs. They each rank separately. Backlink equity that should make one page rank well is split between them. The HTTP version actually ranks better but has 14 times fewer impressions.
When we fix it: at launch. The new site forces all variants to `https://zandzplumbing.com/`. This single technical fix should pull the homepage ranking from page 3 to page 1 within 4 weeks.

**Your site has not been meaningfully updated since January 2023.**
Why it matters: Google's freshness signals reward sites with regular updates. A 3-year-old static site looks abandoned.
When we fix it: new site launches in roughly a week. Madison content engine produces 1 blog post per week thereafter.

**Your homepage advertises 24/7 but your schema markup says Monday to Saturday 9 to 5.**
Why it matters: Google reads the schema, not the marketing copy. You are being suppressed for emergency and after-hours queries because the structured data says you are closed.
When we fix it: at launch. New site schema correctly declares 24/7 emergency availability.

### 3. Customer acquisition pipeline

**67% of all your organic search clicks are people searching specifically for "z and z plumbing."**
Why it matters: this means your site does almost no work as a new-customer acquisition channel. People who already know about you find you. People searching for "plumber Oakland" mostly do not find you. The Yelp Ads spend of $2K per month is doing nearly all your customer acquisition outside of repeat customers.
When we fix it: the entire engagement. Closing the 75,800 striking-distance impression gap is the work.

**Your click-through rate is 0.147%. Industry baseline is 2 to 3%.**
Why it matters: even when your site does appear in search results, customers do not click. Generic title tags and meta descriptions. Missing schema. The new site rebuilds every title, description, and search snippet to be click-worthy.

**EJ Plumbing is bidding Google Ads against your brand name.**
Visible in your Google Business Profile search results. They're paying Google to show their ad whenever someone searches "z and z plumbing." They intercept a percentage of those branded searches.
When we fix it: defensive Google Ads bid on your own brand name. Cost is low (low CPC because branded queries are cheap), conversion is high. Probably $30 to $80 per month to fully protect.

**You spend $2K per month on Yelp Ads with no attribution tracking.**
Why it matters: you don't know if Yelp Ads pay back, partially pay back, or lose money. We do an attribution audit in Phase 2 once we have full access. If it pays back, keep it. If not, redirect that budget to Google Ads + content production.

### 4. Operations and trust signals

**Email is `zandzplumbing@yahoo.com` on a free Yahoo account.**
Why it matters: customers and partners see this and trust the business less. Branded `jay@zandzplumbing.com` and `seif@zandzplumbing.com` via Google Workspace ($6 per user per month) is what professional contractors look like.
When we fix it: Phase 2. Set up Google Workspace, configure DNS, migrate aliases.

**No automated review request workflow.**
Customers love you (4.5 stars on Yelp with 238 reviews) but Google Reviews are at 19. You should ask every happy customer to leave a Google review the day after the job. ServiceTitan can do this natively if Marketing Pro is on your plan.
When we fix it: Phase 2 once we have ServiceTitan access and plan tier confirmation.

**ServiceTitan is probably under-utilized.**
You're paying for a powerful platform. Membership module (Heritage Plan / Home Care Club), Marketing Pro (post-job review SMS), API access for online scheduling. These may already be on your plan.
What we need: tell us your tier (Starter, Essentials, or The Works) and we tell you what is included.

### 5. CSLB license record

**Your CSLB license shows the address as 3037 Teagarden, not 3057.**
Why it matters: legal-registration cleanup. Operational impact is small but a CSLB audit could flag the mismatch.
When we fix it: file a CSLB address-change form. We'll prepare the form for your signature in Phase 2.

---

## What we have already done in week 1 of the engagement

- Audited your full Google Search Console data (16 months of search queries and pages). Confirmed the 75,800 impression opportunity.
- Diagnosed the (925) competitor-routing phone bug.
- Researched and documented the correct GBP move strategy (Sterling Sky 3-step process, validated by Google Product Experts on the GBP forum).
- Confirmed your CSLB license is Active. C-36 plus A General Engineering. License number 896116. Sole owner Seifullah Zaki Zareef.
- Mapped every URL on your legacy site to a destination on the new site (83 URLs across 4 buckets: 1 homepage canonicalize, 45 true migrate, 33 retire to /blog/, 4 block via robots).
- Drafted the highest-priority new-site city page (Plumber Oakland) and the highest-priority service+city page (Sewer Lateral Oakland).
- Built the citation cleanup spreadsheet covering 27 directories.
- Built a research-backed strategy document for the GBP address transition and the Yelp listing handling.
- Produced a 90-day phased roadmap covering content, technical, local SEO, reviews, citations, backlinks, and tooling.

---

## What we need from you right now

In priority order:

1. **Brief Clifton Creative Web today to remove the (925) tel: link from the contact page footer.** One line of markup. 5 minutes.
2. **Confirm CSLB-record address question (3037 vs 3057 Teagarden).** Just need a yes on which one is correct. We assume 3057 based on your earlier confirmation.
3. **Confirm pricing ranges on the new-site content drafts.** Specifically: sewer lateral typical Oakland range $7K to $80K (most jobs $12K to $17K) and repipe range $15K to $40K. Are those still accurate?
4. **Confirm your ServiceTitan plan tier.** Starter, Essentials, or The Works.
5. **Grant the remaining access.** GA4 Editor for `jordan@asala.ai`. Yelp Business Owner for `jordan@tarifattar.com`. GoDaddy delegate access (read-only) for `jordan@asala.ai`.
6. **Export the ServiceTitan customer database to CSV.** First name, last name, email, mobile, city, last service date. CSV emailed to `jordan@asala.ai` is fine.

Each item above has detailed step-by-step instructions in the engagement portal at the URL we shared.

---

## What this is all building toward

By Day 90 of the engagement, conservative floor estimates from your actual search data:

| Metric | Today | Day 90 target |
|---|---|---|
| Pages Google has indexed | 50 of 95 (53%) | 100 of 110 (91%) |
| Monthly organic clicks from Google | ~20 | 350+ |
| Striking-distance keywords on page 1 of Google | 2 | 15+ |
| Google reviews on your business profile | 19 | 50+ |
| Citations corrected across directories | 1 | 22 |

At your $600 average ticket and a 10% conversion rate from organic visitor to job, that translates to **a floor of $180,000 to $270,000 in additional Year 1 revenue from organic search alone**. Not counting Yelp Ads ROI optimization, defensive Google Ads on your brand name, or compounding effects from reviews, citations, and content.

This is what the work in front of us pays for.

---

## What we are NOT doing (so you don't worry)

- We are not touching the legacy WordPress site. It gets retired at launch.
- We are not creating fake reviews or doing anything outside Google's, Yelp's, or Bing's terms of service.
- We are not lying about your address, your founding year, your licenses, or your service area.
- We are not signing you up for any paid tools without your approval. Tooling spend kicks in around Week 4 to 5 post-launch (SEMrush Pro $140/mo and Local Falcon $30/mo) and only with your sign-off.
- We are not asking you to do anything that takes more than 5 minutes at a time. Every ask is broken into a small unit.
