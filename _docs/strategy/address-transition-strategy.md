# Z and Z Plumbing — Address Transition Strategy

**Date:** 2026-05-11
**Owner:** Jordan Richter / Asala
**Status:** Recommendation · pending Jay sign-off before any change is executed

> Confirmed by Jay 2026-05-11:
> 1. Canonical HQ is **3057 Teagarden Street, San Leandro, CA 94577**. (The 3037 digit on the CSLB record is a stale legal-registration digit we will clean up via CSLB filing later — not urgent.)
> 2. **4050 MacArthur Blvd, Oakland CA 94619 was a real prior operating location** — Z and Z physically moved out years ago.
> 3. **~80% of Z and Z's revenue still comes from Oakland service calls** even though HQ is now in San Leandro.
> 4. **(925) 586-3212** — buried in the legacy site's contact-page footer click-to-call link — **routes to a competitor**. Every customer who taps "Call" on the contact page on mobile is being intercepted. P0 to kill.

---

## The strategic question

If we update the address from MacArthur Oakland → Teagarden San Leandro across Google Business Profile and Yelp, what happens to:

1. **The 238-review Yelp equity** (currently tied to the Oakland-slug listing `/biz/z-and-z-plumbing-oakland-3`)
2. **Whatever review equity exists on Google** (unknown until we log in — Jay's invite is set up but we haven't pulled the count yet)
3. **The "plumber Oakland" ranking signal** — Z and Z's bread-and-butter market is Oakland (~80% of revenue) but the verified physical address would now be San Leandro
4. **Yelp Terms of Service compliance** — is it allowed for a service-area business to use a service-area framing across multiple East Bay cities?

---

## TL;DR · The recommendation

| Surface | What to do | Why |
|---|---|---|
| **Google Business Profile** | **Follow the Sterling Sky 3-step SAB move process** — create new GBP at Teagarden, set local phone, ask Google Support to mark MacArthur as "moved" to Teagarden. Configure as **Service Area Business** with **address shown** (not hidden) and **Oakland as priority service area + Berkeley + Alameda + Hayward + 6 more cities**. | Reviews transfer cleanly. Avoids the documented Google bug where edit-in-place SAB address changes fail to rank in the new area. Showing the address (San Leandro) costs us some Oakland ranking but hiding it costs more (proven). Oakland map-pack rebuild is paid back via aggressive review velocity + content + service-area framing. |
| **Yelp** | **Convert to Service Area Business first** (set 6-city service area, hide the physical address). THEN open a support case asking for the address-record update. Do NOT just hit "Suggest an Edit" on the address — that triggers Yelp's "move = new page" rule and strands 238 reviews. | Yelp's official policy strands reviews on moves. Converting to SAB recharacterizes the listing as area-served rather than location-tied, which is closer to plumber reality and gives Yelp Support a cleaner code path. The Oakland URL slug `/biz/z-and-z-plumbing-oakland-3` is permanent — keeps the SEO value of "oakland" in the URL even after the listing transitions. |
| **The (925) phone** | **Kill it from every surface today** — including the legacy site footer (request Clifton Web Design to nuke the markup line as a one-line patch even though we're not remediating). Audit GBP, Yelp, social, directories for any other instance. | Customer-intercepting bleed. ~7 days until launch is too long to leave bleeding. |
| **BBB and other "moved-from" history listings** | List 4050 MacArthur Oakland as a **closed prior location** where the platform supports historical entries. | Doesn't try to lie about the past; satisfies citation aggregators that scrape historical data; helps Oakland-based customers searching for "z and z plumbing oakland" still find the current business. |
| **New website** | Set IA + schema + content from day one for **East Bay-wide service with Oakland as priority market**. Build dedicated `/plumbers-oakland-ca/` flagship city page, `/plumbers-san-leandro-ca/` HQ-city flagship, plus 9 secondary city pages. NAP is San Leandro everywhere. | We control the message at launch. Schema `areaServed` lists 10 cities. Oakland depth lives in content. |

---

## Section 1 — Google Business Profile · the Sterling Sky 3-step playbook

**Source:** [Sterling Sky · 3 Steps to Move Your SAB GBP Without Destroying Your Ranking](https://www.sterlingsky.ca/move-your-sab-without-destroying-rankings/) (Joy Hawkins, 2023, updated)

**Why this matters:** Sterling Sky is the authoritative voice on local SEO. Joy Hawkins is a Google Product Expert on the GBP forum. The 3-step process avoids a documented Google bug where editing a SAB's address in place causes the listing to not rank in the new area.

### Step 1 — Create a NEW GBP at 3057 Teagarden Street

Counter-intuitive but correct. Do NOT just hit "Edit" and change MacArthur → Teagarden on the existing listing (Listing ID `396819026713937378`).

Instead:
1. Inside the existing GBP dashboard, click **+ Add business** → **Add single business**
2. Name: **Z and Z Plumbing** (exact match to existing — names must match for the merge/move to work)
3. Address: **3057 Teagarden Street, San Leandro, CA 94577**
4. Category: **Plumber** (primary). Add same secondaries as existing listing (Drain cleaning service, Sewer line repair, Water heater repair service, Gas installation service, Emergency plumber service, Trenchless sewer repair service, Hot water system supplier).
5. Phone: **(510) 708-4237** (matches existing — local 510 area code)
6. Mark as "Yes, I provide services at customers' locations" → **Service Area Business** classification
7. Service areas: list **Oakland first**, then Alameda, Berkeley, San Leandro, Hayward, Castro Valley, Emeryville, Richmond, Pinole, Lafayette
8. Hours: 24/7 (Mon–Sun, 24 hours)
9. Verify via whatever method Google offers — usually postcard to Teagarden or video call. Video call is faster.

### Step 2 — Make sure the new profile has the same local phone number

Already covered — (510) 708-4237 is the canonical Z and Z line and matches the existing listing. Local area code is critical for Google's local-relevance signal. The (341) 699-7090 Yelp tracking number does NOT belong on GBP; the (925) 586-3212 number does NOT belong anywhere (see Section 3).

### Step 3 — Once the new profile is verified, contact Google Support to mark the old listing as "moved"

This is the technical merge. Google's backend treats this as a "move" (different address, same business) rather than a "merge" (two listings at same address), but the effect is identical — reviews transfer, the old listing disappears from Maps/Search, and the new listing inherits the equity.

Process:
1. Go to https://support.google.com/business/gethelp
2. Open a ticket. Use the **exact** language: *"We are a service area business that physically relocated. We have a new GBP at the new address. Please mark the old listing as moved to the new listing. Both listings have the same business name. The reviews should transfer to the new listing per Google's documented relocation policy."*
3. Include: old listing ID `396819026713937378`, old address `4050 MacArthur Blvd Oakland CA 94619`, new listing ID (from step 1 once created), new address `3057 Teagarden Street San Leandro CA 94577`.
4. If support comes back asking to "permanently close" the old listing instead, **push back** — explicitly say "we don't want to permanently close; we want it marked as moved so users searching for the business find the new listing, not a 'closed' message." (This exact pushback is documented in the Sterling Sky comments as the right move.)

### Optional Step 4 (Phil Rozek tip, also in the comments)

Between Step 1 and Step 3, **update the website footer and areas-served page** to reflect the new service-area framing. Google's crawler picks this up as an alignment signal during the move.

### What happens to ranking — expected impact

| Geography | Expected ranking impact | Recovery path |
|---|---|---|
| San Leandro map pack | **Significant gain** (within 2–4 weeks of verification at new address) | Locked by the move itself |
| Oakland map pack | **Significant short-term loss** (proximity-to-searcher signal weakens) | Recovery via: (a) Oakland-targeted reviews coming in monthly, (b) Oakland-specific GBP posts mentioning neighborhoods (Rockridge, Temescal, Montclair, Dimond), (c) new website with deep Oakland city-page + neighborhood pages, (d) Oakland-tagged photos uploaded to GBP weekly. Expect 60–90 days to recover and surpass current Oakland ranking. |
| Berkeley / Alameda / Hayward map packs | **Modest gain** (now closer to two of three cities than from MacArthur) | Service-area framing carries it |
| "Plumber" (no city, implicit query) | **Modest loss** if address is shown publicly | Mitigate via consistent NAP across citations + new-site schema. Hiding the address would help here but hurts everywhere else (proven). |

**Timeline:** Sterling Sky's documented case study showed a successful SAB move re-ranking in the new geography within **a few weeks** after Step 3 completes. Realistic full Oakland-market parity: 60–90 days post-move.

### Risks

| Risk | Probability | Mitigation |
|---|---|---|
| Google support refuses the move and offers only "permanently close" the old listing | Medium | Push back per the Step 3 script. If they still refuse: follow their close instruction, get reviews transferred, then use Sterling Sky's [old listing removal process](https://www.sterlingsky.ca/close-or-remove-google-business-profile/) to clean the closed listing. |
| Re-verification at new address fails / takes 4+ weeks | Low–Medium | Pick video call verification over postcard. Have someone at Teagarden during the verification window. |
| Suspension during the address change (this is why the 3-step process exists) | Low if 3-step process is followed; High if you just edit the existing listing's address | Follow the 3-step process strictly. |
| New listing fails to rank in Oakland for 2–3 months | Medium | Set expectations with Jay upfront. The Oakland ranking comes back via review velocity + content + GBP signals. |

---

## Section 2 — Yelp · the careful play

**Sources:**
- [Yelp · What are the guidelines for substantial business changes?](https://www.yelp-support.com/article/What-are-the-guidelines-for-Substantial-Business-changes?l=en_US)
- [Yelp Biz · What are Service Areas?](https://biz.yelp.com/support-center/article/What-are-Service-Areas)
- [Yelp Biz · How to set your service area](https://business.yelp.com/resources/videos/how-to-set-your-service-area-on-yelp/)

### Yelp's stated policy (the bad news)

> "When businesses move, Yelp typically creates a new business page and marks the old page as moved, because location and ambience are core parts of the consumer experience. Yelp makes a new listing when a business moves, rather than just changing the address, and previous reviews aren't carried over."

In plain English: hitting "Suggest an Edit" on the existing Yelp listing to change MacArthur → Teagarden risks Yelp interpreting this as a "move," opening a new listing at Teagarden, marking the existing Oakland page as moved, and **stranding all 238 reviews + 46 photos** on the now-defunct Oakland page.

### What Yelp DOES allow (the good news)

Yelp explicitly supports **Service Area Businesses** without requiring a public physical address:

> "Service-based businesses that are mobile and do not have a fixed location—such as plumbers, electricians, and roof cleaners—should have a service area rather than using multiple business pages in different geographic areas."
>
> "Businesses with Service Areas have the option to hide their business address from the public if it can't be visited by customers."

Plumbers are listed in Yelp's own example set. Z and Z is textbook SAB eligible.

**Service area limits:**
- Up to 6 major cities can be entered
- 50-mile radius OR 100-mile diameter cap between the two furthest points
- Any cities between specified points are auto-included

Oakland ↔ San Leandro is ~12 miles. The entire East Bay (Richmond ↔ Hayward, the two extremes) is ~30 miles. Z and Z's service area fits comfortably under the 50/100 mile limit.

### The recommended Yelp playbook

**Phase 1 — convert to SAB BEFORE touching the address.** This is the safer code path.

1. Get Yelp Business Owner access (Jay invite per credentials request)
2. In `biz.yelp.com` → Business Information → Service Area:
   - Toggle **"This business serves customers at their locations"** → On
   - Enter 6 cities: **Oakland** (priority), **Berkeley**, **Alameda**, **Hayward**, **San Leandro**, **Castro Valley**
   - Toggle **"Hide my business address"** → On
3. Update the **canonical phone** to (510) 708-4237 (remove the (341) tracking number — or keep it as a "second phone" if Yelp supports that for ad attribution — see Phase 3)
4. Update hours to **24/7 emergency**
5. Save and verify the public listing now shows:
   - Service area: Oakland, Berkeley, Alameda, Hayward, San Leandro, Castro Valley
   - No public physical address
   - URL slug unchanged: `/biz/z-and-z-plumbing-oakland-3` — Yelp URLs are permanent and the "oakland" semantic signal stays

**Phase 2 — open a support case for the address record correction.**

Yelp keeps an internal address field even for SABs with hidden addresses. Update this via support:

1. From `biz.yelp.com`, open a chat or email ticket
2. Script: *"We are a service area business — plumber — that operates throughout the East Bay. Our physical operations have moved from 4050 MacArthur Blvd, Oakland to 3057 Teagarden Street, San Leandro. We have already converted the listing to Service Area mode. We are requesting only that the address-of-record field be updated to the new address. The listing remains the same business, same ownership, same crew, same service area. Reviews and photos should remain attached. Please do not create a new business page."*
3. Document the response in writing
4. If Yelp's internal policy creates a new page anyway: follow Phase 4 escalation

**Phase 3 — decide on the (341) 699-7090 Yelp tracking number.**

Per discovery, this is intentional — routes to a phone, used for Yelp Ad attribution. Two options:

| Option | Pros | Cons |
|---|---|---|
| Keep (341) as Yelp tracking | Continued ad-source attribution | Maintains a NAP variance flag against canonical |
| Replace with canonical (510) 708-4237 + use UTM/source-tagged landing pages | Clean NAP across all surfaces | Loses simple Yelp call-attribution unless rebuilt via post-call surveys or routing logic |

**Recommendation:** keep the (341) as a Yelp-specific tracking number IF the Yelp Ads spend continues. The NAP variance on a single phone field for a single platform is acceptable when the platform offers attribution that justifies it. Reassess after the Yelp Ads attribution audit (separate workstream — requires GA4 + Yelp Ads data).

**Phase 4 — if Yelp won't cooperate and reviews end up stranded.**

The community-documented backup paths:
- Pay for Yelp Ads or escalate via a Yelp sales rep relationship. Multiple business owners have reported success negotiating review transfers as part of an ad sale conversation. Z and Z is already spending ~$2K/mo on Yelp Ads — leverage that relationship explicitly.
- Accept the loss, build a **fresh** new Yelp listing at Teagarden, and focus review-acquisition energy on Google instead (where the reviews are cleanly transferrable per Section 1).

### Yelp ToS compliance check

The user's question: **is it against Yelp ToS to update the address in San Leandro if we're still serving Oakland but want to position as serving the whole Bay Area?**

**Answer: No, it's fully compliant — and actually MORE compliant than what's there now.**

Yelp explicitly endorses the Service Area Business model for plumbers (using "plumbers" as the example in their own help docs). The 50-mile radius covers the entire East Bay. Listing your true physical address (Teagarden) while serving customers across the East Bay is exactly the configuration Yelp documents for plumbers, electricians, and other mobile trades. The current MacArthur listing is technically **inaccurate** — the business doesn't physically operate there anymore — so updating the address to reality is the ToS-compliant move, not the violation.

The risk isn't ToS — it's Yelp's mechanical handling of "moves" potentially fragmenting the listing. That's what the SAB-first conversion in Phase 1 mitigates.

---

## Section 3 — The (925) 586-3212 phone number · kill order

**Per Jay's confirmation 2026-05-11: this number routes to a competitor.**

The number is wired into the legacy site's contact-page footer click-to-call HTML element:

```html
<a href="tel:9255863212">(510) 708-4237</a>
```

The user SEES the canonical number. The phone DIALS the competitor number. Every customer who taps "Call" on a mobile phone — which is the standard mobile UX — is being intercepted.

### Immediate actions (today)

1. **Patch the legacy site footer.** Even though we're not remediating, this is a 1-line markup fix. Ask Clifton Creative Web (the agency credited in the footer) or whoever has WP admin to remove or correct this one line. Frame as a security/integrity fix, not a content remediation. Time: 5 minutes for Clifton; we don't need WP admin ourselves.
2. **Audit every other digital surface for the (925) number.** Check:
   - GBP (manager access in hand — quick check)
   - Yelp public profile (visible without access)
   - Facebook page
   - BBB profile
   - Yellow Pages
   - Nextdoor
   - Any other directory
3. **Add to the new-site spec:** zero orphan tel: links. Every "Call" button on the new site dials (510) 708-4237 and only (510) 708-4237. Tested in QA before launch.

### Secondary investigation

- How long has this been live? Look at the legacy site's footer git history (if available) or Wayback Machine snapshots for `zandzplumbing.com/contact/` at intervals.
- Estimate revenue lost: if even 10% of mobile contact-page visitors tap "Call" and 20% of those would have converted to a job at ~$600 avg ticket, that's $1,200 per 1,000 mobile contact-page visits going to a competitor. Worth a one-line markup fix.
- Was this intentional (someone inside Z and Z planted it) or sabotage (someone else)? Worth Jay knowing — could be a sign of larger internal trust issues with prior web vendor.

---

## Section 4 — The MacArthur "former location" handling

Per Jay, 4050 MacArthur Blvd Oakland WAS a real prior operating location. So we should NOT just wipe every reference to it — we should mark it as "closed prior location" on platforms that support that, and let history breadcrumb back to the current business.

### Platform-by-platform

| Platform | Recommended handling |
|---|---|
| BBB | Mark MacArthur as a closed historical location. BBB supports multiple addresses on a single profile with an "addressType" field. The current canonical address listing (already at San Leandro per their URL slug) becomes primary; MacArthur becomes secondary/closed. |
| Yelp | After Phase 1 SAB conversion + address-of-record update, the MacArthur address disappears from the public listing. No "closed location" treatment needed — Yelp doesn't support historical addresses in the public UI. |
| GBP | After Sterling Sky 3-step move, the old listing is marked "moved" — Google handles this automatically. Customers searching for the old address are redirected to the new listing. |
| Yellow Pages, Manta, ZoomInfo, RocketReach | Update the public address to Teagarden. These platforms don't show historical addresses. |
| New website footer + About page | One short historical note in the About page narrative: *"Z and Z Plumbing operated from 4050 MacArthur Blvd in Oakland from [year] to [year], before moving to our current location at 3057 Teagarden Street in San Leandro in [year]. We continue to proudly serve Oakland — still our largest market — along with the rest of the East Bay."* — turns a NAP problem into a brand-narrative asset. |

---

## Section 5 — Decision matrix · what we're choosing and why

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **A · Move both GBP + Yelp to Teagarden cleanly** (Sterling Sky 3-step + Yelp SAB-first) | Honest. Tracks reality. Reviews transfer on Google. Yelp risk-managed via SAB framing. New site launches at the right address. Citations finally consistent. | Oakland map-pack ranking dips temporarily. Yelp transition has residual risk. | **CHOSEN — this is the recommended path.** |
| **B · Keep MacArthur address on both GBP + Yelp, build new site at Teagarden** | Preserves Oakland Yelp slug + GBP ranking signal. Lowest immediate risk to review equity. | We are knowingly maintaining a falsified address on the two highest-trust platforms. Eventually Google and/or Yelp will catch up (especially as customers visiting MacArthur leave 1-star "I drove to your shop and it wasn't there" reviews — already a documented risk). Disqualifies Z and Z from Google Local Service Ads (LSA) which requires address verification. Long-term unsustainable. | Rejected — short-term wins, long-term collapse |
| **C · Move GBP, leave Yelp at MacArthur** | Preserves Yelp's 238-review Oakland equity. Gets Google cleaned up. Quick to execute. | Misalignment between GBP (San Leandro) and Yelp (Oakland) creates citation inconsistency that downstream aggregators amplify. Yelp's stale MacArthur listing eventually triggers "drove to shop and it wasn't there" reviews. | Possible Plan B if Phase 1 SAB Yelp conversion fails — see Phase 4 in Section 2. |
| **D · Open a second GBP at Oakland (virtual office)** to keep Oakland map-pack | Maintains Oakland presence without lying about HQ | Violates GBP guidelines (virtual offices are flagged for suspension). Documented suspension risk. | Rejected — high suspension risk |
| **E · Sign up for Google Local Service Ads (LSA)** as part of the recovery | LSA listings appear ABOVE the map pack and have the "Google Guaranteed" badge. The verification process actually requires a real physical address (Teagarden works) — and LSA can drive Oakland leads even from a non-Oakland listing because LSA uses service area not strict proximity. | Separate cost. Background-check requirement. | Add to Phase 2 roadmap — LSA is a separate workstream after the address transition lands. |

---

## Section 6 — Sequencing · what happens in what order

### Today (2026-05-11)

- [x] Jay confirms: Teagarden 3057 is canonical, MacArthur was real prior location, (925) routes to competitor
- [ ] Request Clifton Creative Web (via Jay) to nuke the (925) tel: link from the contact-page footer — TODAY, 5 min fix
- [x] Strategy doc published (this file)
- [ ] business-truth.md updated with locked facts
- [ ] Jay-call tile updated to mark Q1/Q2/Q3 as resolved

### Days 1–3 of the transition

- [ ] Jay grants GSC Owner + GA4 Editor + Yelp Business Owner + GoDaddy delegate per credentials request
- [ ] Yelp: convert to SAB (Section 2 Phase 1)
- [ ] GBP: create the NEW listing at 3057 Teagarden (Section 1 Step 1)
- [ ] Pull baseline metrics on both platforms (current review count, photos, posts cadence, view stats) for after-comparison

### Days 4–10

- [ ] GBP: complete verification at new address (video call preferred)
- [ ] GBP: while new listing is being verified, do NOT touch the MacArthur listing
- [ ] Yelp: open support case for address-of-record update (Section 2 Phase 2)
- [ ] New website P0 pages: city pages for Oakland (depth) + San Leandro (HQ) + 9 secondaries draft

### Days 11–17 (assumes GBP new listing now verified)

- [ ] GBP: contact Google Support to mark MacArthur listing as moved (Section 1 Step 3)
- [ ] Confirm Google support has executed the move — reviews and posts should appear on new listing
- [ ] Citations: update every directory in the citation audit master spreadsheet
- [ ] Yelp: track support ticket response; escalate via Yelp sales rep if needed (Section 2 Phase 4)
- [ ] New website launch DNS cutover (assumes website is ready)

### Days 18+

- [ ] Begin Oakland-recovery review velocity campaign (post-job SMS asks targeting Oakland jobs)
- [ ] Begin Oakland-focused GBP posts (1/week, mentioning neighborhoods)
- [ ] Begin Oakland-focused content publishing on new site (1 post/week for first 60 days)
- [ ] Watch Oakland map-pack ranking weekly; expect 60–90 days to recovery and surpass

---

## Sources

- [Sterling Sky · 3 Steps to Move Your Service Area Business GBP Without Destroying Your Ranking](https://www.sterlingsky.ca/move-your-sab-without-destroying-rankings/) — Joy Hawkins, Google Product Expert on the GBP forum
- [Google Business Profile · Move your reviews across Business Profiles](https://support.google.com/business/answer/3098204?hl=en) — official Google doc on review transfers during moves
- [Google Business Profile · Manage your service areas for service-area & hybrid businesses](https://support.google.com/business/answer/9157481?hl=en)
- [Yelp · Guidelines for substantial business changes](https://www.yelp-support.com/article/What-are-the-guidelines-for-Substantial-Business-changes?l=en_US) — official Yelp policy on moves and address changes
- [Yelp Biz · What are Service Areas?](https://biz.yelp.com/support-center/article/What-are-Service-Areas) — SAB framework + 6-city limit + 50-mile radius
- [Yelp Biz · 3 reasons to set your service area on Yelp](https://business.yelp.com/resources/articles/3-reasons-set-yelp-service-area/?domain=local-business)
- [Sterling Sky · Does the Service Area in Your GBP Impact Ranking?](https://www.sterlingsky.ca/does-the-service-area-in-google-my-business-impact-ranking/) — empirical evidence that service area is visual-only, address is the ranking signal
- [Sterling Sky · Does Hiding Your Address Impact GBP Ranking?](https://www.sterlingsky.ca/hiding-address-google-business-ranking/) — empirical evidence that hiding hurts ranking, especially for short-tail "plumber" queries
- [Local Visibility System · Will Yelp Transplant Your Reviews?](https://www.localvisibilitysystem.com/2013/12/23/will-yelp-transplant-your-reviews/) — community-documented Yelp review-transfer experiences
