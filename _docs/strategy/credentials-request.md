# Z and Z Plumbing — Credentials & Access Request Package

**Date:** 2026-05-11
**Owner:** Jordan Richter / Asala
**Recipient:** Jay (primary decision-maker) — cc Seif if helpful
**Purpose:** Single clean ask covering every access we need to execute the SEO + GBP + citation cleanup + website rebuild engagement. Click-by-click instructions per platform so Jay doesn't have to figure anything out.

> **How to use this doc:** copy the "Suggested message to Jay" section verbatim into email or text. Attach the relevant click-by-click sections as a follow-up if Jay asks "how do I do this." Anything Jay can knock out in one sitting is sequenced first; the rest is broken into smaller asks.

---

## Suggested message to Jay (copy-paste)

> Hey Jay — kicking off the SEO + website work this week. I've put together a single list of the access I need to make it all run. Most of these take 2–3 minutes apiece; the whole pack should be under 30 minutes if you knock it out in one sitting.
>
> Also — three quick **factual questions** I need answered before we can clean up the directory listings without making the problem worse:
>
> 1. **What's the real Teagarden address — 3037 or 3057?** The official site contact page says 3057 but your CSLB license record shows 3037. Directories are split. We need to know the correct one before we update 16+ listings.
> 2. **Was 4050 MacArthur Blvd, Oakland ever a real Z and Z location?** (Former office, satellite shop, family rental?) Determines whether we list it as a closed/historical location on Yelp/BBB or wipe it entirely.
> 3. **The footer phone link on your contact page calls (925) 586-3212**, not (510) 708-4237. Is that a real number you still use, or a stale legacy wire-up that should be removed?
>
> Access list below, in priority order:
>
> **P0 — Need this week:**
> 1. **Google Business Profile** — already done, confirmed manager access on `jordan@tarifattar.com`. Thank you.
> 2. **Google Search Console** — add `jordan@asala.ai` as Owner on `zandzplumbing.com` property. (Steps below.)
> 3. **GA4** — add `jordan@asala.ai` as Editor on the property tied to tag `G-CFS818988W`. (Steps below.)
> 4. **Yelp Business Owner** — add `jordan@tarifattar.com` as Business Owner on the Z and Z Yelp page so we can fix the wrong address and audit the $2K/mo Yelp Ads. (Steps below.)
>
> **P1 — Need within 2 weeks:**
> 5. **SiteGround hosting** — login or contact info for whoever has admin access. (Likely Clifton Web Design; they built the site.) Needed for the DNS cutover prep when we launch the new site.
> 6. **GoDaddy registrar** — login or read-only access for DNS audit and cutover prep.
> 7. **WordPress admin** — Editor-level user on the legacy site. Lower priority since we're retiring it, but needed if we patch anything before cutover.
>
> **P2 — Operational data we need:**
> 8. **ServiceTitan plan tier** — which tier are we on (Starter / Essentials / The Works)? Need this to know what's included for the post-job review automation + Membership module work.
> 9. **ServiceTitan customer database export** — full customer list with last-service-date per customer. CSV format. Powers the Yelp-to-Google review migration outreach (238 Yelp reviewers cross-referenced against your customer DB → personalized re-review requests on Google).
>
> Let me know what you need from me to make any of these easier.

---

## P0 Access — Click-by-click

### 1. Google Business Profile — ✅ Already done

Confirmed manager access via `jordan@tarifattar.com`. No action needed.

---

### 2. Google Search Console — Add Asala as Owner

**Why we need it:** GSC shows which search queries are actually driving traffic to the site, which pages rank for what, and where Google is reporting errors. Without it, we're flying blind on the on-page SEO work.

**Steps for Jay:**

1. Go to https://search.google.com/search-console
2. Sign in with the Google account that currently owns the property (probably the same one that owns the GBP — `jordan@tarifattar.com` or a Z and Z account)
3. Top-left dropdown → select `zandzplumbing.com` property
4. Left nav → **Settings** (gear icon at bottom)
5. **Users and permissions**
6. **Add user**
7. Email: `jordan@asala.ai`
8. Permission: **Owner**
9. Save

If the property isn't claimed at all yet, no problem — let me know and I'll claim it from the Asala side using DNS verification (we'll do this together once I have GoDaddy access).

---

### 3. GA4 — Add Asala as Editor on property `G-CFS818988W`

**Why we need it:** Traffic baseline, conversion attribution, retention metrics. Required input for the monthly performance report.

**Steps for Jay:**

1. Go to https://analytics.google.com
2. Sign in with the Google account that owns the GA4 property
3. Bottom-left **Admin** (gear icon)
4. Property column → **Property access management**
5. **Plus** button (top-right) → **Add users**
6. Email: `jordan@asala.ai`
7. Standard roles: check **Editor**
8. Save

If you can't find the GA4 property, tell me — the tracking tag is `G-CFS818988W` and Clifton Creative Web may own the account. We'll work backwards from there.

---

### 4. Yelp Business Owner — Add Asala as Business Owner

**Why we need it:** Fix the wrong MacArthur address on the Yelp listing (which propagates to ~30 other directories that scrape Yelp), audit the $2K/mo Yelp Ads spend, and get owner-level reply access on the 238 reviews.

**Steps for Jay:**

1. Go to https://biz.yelp.com and sign in
2. Top-right → **Account** → **Account Settings**
3. Left nav → **Users**
4. **Add a New User**
5. Email: `jordan@tarifattar.com`
6. Role: **Business Owner** (full admin)
7. Save — Yelp will send an invite to that inbox

---

## P1 Access — Click-by-click

### 5. SiteGround hosting

**Why we need it:** DNS cutover prep when we launch the new Next.js site. Also needed if we have to make any emergency patch to the legacy WordPress site before retirement (we won't touch it unless absolutely necessary).

**What I need from Jay:** one of three options
- Option A: SiteGround login credentials (cPanel + Site Tools access)
- Option B: A "Collaborator" invite — log into SiteGround → **Account** → **Collaborators** → **Add Collaborator** → `jordan@asala.ai`
- Option C: Tell me who has it. Most likely Clifton Creative Web (the agency that built the site — they're credited in the footer). If Clifton has it, I'll reach out to them directly with your authorization.

---

### 6. GoDaddy registrar

**Why we need it:** DNS audit (what records exist today), pre-stage Vercel A/CNAME records for the new site, and execute the cutover on launch day.

**What I need from Jay:** read-only "Delegate Access" works fine; full access not needed.

**Steps for Jay:**

1. Go to https://godaddy.com and sign in
2. Top-right profile menu → **Account Settings**
3. Left nav → **Delegate Access**
4. **Invite to Access**
5. Email: `jordan@asala.ai`
6. Permission: **Products, Domains & Purchases** with **Read-only** access (we don't need to buy anything or change billing)
7. Send invitation

---

### 7. WordPress admin

**Why we need it:** Optional. Only matters if we discover the legacy site is doing something so bad to your search rankings that we need to patch it before the new site launches (e.g., the broken `/contact/` template, the schema hours bug).

**Steps for Jay** (or Clifton):

1. Log into `zandzplumbing.com/wp-admin`
2. Left nav → **Users** → **Add New**
3. Username: `asala-jordan`
4. Email: `jordan@asala.ai`
5. Role: **Editor** (or Administrator if you trust us — Editor is enough for almost everything)
6. Send

---

## P2 — ServiceTitan questions

### 8. Which ServiceTitan plan tier?

The three tiers are:
- **Starter** (lowest) — basic dispatching, no API
- **Essentials** (middle) — adds Marketing Pro, more reporting
- **The Works** (top) — adds Membership module, full API access

The answer determines:
- Whether the **Membership module** is included (drives the Heritage Plan / Home Care Club soft launch in Phase 3)
- Whether **Marketing Pro** is included (drives the post-job SMS review automation)
- Whether the **API** is included (drives the future online-scheduling integration on the new site)

Just tell me the plan name. If you're not sure, your ServiceTitan account manager can confirm in 2 minutes.

---

### 9. Customer database export

**What I need:** CSV with one row per customer, containing at minimum:
- First name + last name
- Email (if on file)
- Mobile phone (if on file)
- Service address (city level is fine; full address not needed)
- Last service date
- Total revenue lifetime (if easy to include — useful for prioritizing the review outreach)

**Why:** We cross-reference the 238 Yelp reviewers against your customer DB. The matches are people who **already love you** (5★ on Yelp) and are **already customers** (in ST). Those are the highest-conversion targets for a re-review request on Google. Target: 50–80 new Google reviews from the migration outreach over 60 days, which moves the GBP review count from current ~? (unknown until I have GBP analytics access) to a strong competitive position vs. Oakland Rooter (1,617 Yelp reviews) and Albert Nahman (775).

**Export path in ServiceTitan:**
1. Reports → Customer List
2. Filter: All active customers
3. Export → CSV
4. Email to `jordan@asala.ai` (or drop in Dropbox/Drive and share the link)

---

## Three factual Jay-questions (the unblockers)

These are gating items — without answers, we cannot ship NAP corrections to directories without making the citation problem worse.

### Q1 — Real Teagarden address: 3037 or 3057?

| Source | Address shown |
|---|---|
| Your website's main contact block | **3057** Teagarden Street, San Leandro 94577 |
| Your CSLB license record (master legal source) | **3037** Teagarden Street, San Leandro 94577 |
| BuildZoom (mirrors CSLB) | 3037 Teagarden Street |
| Yellow Pages | San Leandro 94577 (number not shown in summary) |

If 3037 is correct, we update the website + brain file. If 3057 is correct, we file a CSLB address-change form (which is also a P0 cleanup item — the CSLB legal address should match operational reality).

### Q2 — Was 4050 MacArthur Blvd, Oakland ever a real Z and Z location?

Possibilities:
- (a) Former office or shop you moved out of N years ago — we list it as a "closed location" on directories that support that, then wipe.
- (b) A family-owned rental space that was never operational — we wipe it everywhere.
- (c) An audit/scraper hallucination that never existed — we wipe it everywhere.
- (d) Still operational as a satellite — we treat it as a legitimate secondary location (different cleanup playbook).

### Q3 — The (925) 586-3212 phone number in the contact page footer

Your contact page displays "Call (510) 708-4237" but the underlying click-to-call link goes to **(925) 586-3212**. That's a third phone number in the NAP variance.

Is (925) 586-3212:
- A personal cell of yours or Seif's that should call-route?
- An old company number that should be removed?
- An intentional second tracking number like the Yelp one?

---

## What I'll do once each access lands

| Access | Unlocks |
|---|---|
| GSC Owner | Page-by-page query data (Prompt 12), monthly performance report (Prompt 20), money-page audit (Prompt 10) |
| GA4 Editor | Traffic baseline, conversion attribution, conversion-by-source breakdown for the $2K/mo Yelp Ads ROI audit |
| Yelp Business Owner | Address fix on Yelp (cascades to ~30 directories), Yelp Ads attribution audit, owner replies on 238 reviews |
| SiteGround | DNS cutover prep + emergency-patch capability on legacy site |
| GoDaddy | DNS audit doc + Vercel pre-stage for launch day |
| WordPress admin | Optional emergency patches (e.g., schema fix) before cutover |
| ServiceTitan plan tier | Confirms Membership module + Marketing Pro + API availability for downstream automation work |
| ServiceTitan customer DB | Yelp-to-Google review migration outreach — target 50–80 new Google reviews over 60 days |

---

## Tracking

This doc supersedes the "Three short asks to Jay" section of `move-forward-2026-05-10.md`. Once Jay responds, mark items here as ✅ and update `business-truth.md` if the address question resolves.

### Status as of 2026-05-11

- [ ] Q1 — Teagarden 3037 vs 3057 — **PENDING JAY**
- [ ] Q2 — MacArthur address history — **PENDING JAY**
- [ ] Q3 — (925) 586-3212 phone — **PENDING JAY**
- [ ] #2 GSC Owner — **PENDING JAY**
- [ ] #3 GA4 Editor — **PENDING JAY**
- [ ] #4 Yelp Business Owner — **PENDING JAY**
- [ ] #5 SiteGround — **PENDING JAY**
- [ ] #6 GoDaddy — **PENDING JAY**
- [ ] #7 WordPress admin — **PENDING JAY**
- [ ] #8 ServiceTitan plan tier — **PENDING JAY**
- [ ] #9 ServiceTitan customer DB export — **PENDING JAY**

## What we already have

- [x] GBP manager access via `jordan@tarifattar.com` (confirmed 2026-05-10)
- [x] CSLB #896116 status verified Active, classification Plumbing + General Engineering, Sole Owner Seifullah Zaki Zareef (verified 2026-05-11 via BuildZoom mirror of CSLB record)
- [x] Live site stack inventoried (WordPress + Astra + Beaver Builder + Rank Math + SiteGround host + GoDaddy registrar + GA4 tag `G-CFS818988W` + Meta Pixel `508246958099969`)
- [x] Yelp public profile data (4.5★ × 238 reviews · 46 photos · advertises at MacArthur address)
- [x] Public competitor data (Oakland Rooter, Albert Nahman, Mr. Rooter)
