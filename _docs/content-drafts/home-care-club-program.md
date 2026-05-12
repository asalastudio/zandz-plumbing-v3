# Z & Z Plumbing — Home Care Club Program

**Status:** Greenlit in concept (founder agreed during May 5 discovery call). Validation pending.

> Recurring revenue program design + marketing toolkit. Covers structure, pricing, included services, operations, marketing copy, sales scripts, and KPIs. Built to launch within 30 days using the existing customer base before any paid acquisition.

---

## Program strategy at a glance

**Goal:** Convert Z & Z's transactional residential customer base into recurring members. Target: $5K–$15K/month baseline recurring revenue within 6 months. Defensive moat against Oakland Rooter's volume play and Albert Nahman's tankless cross-sell.

**Why it works for Z & Z specifically:**
- 238 Yelp reviewers = pre-qualified pool of customers who already trust the brand
- 23 years in business + double license = trust signal that justifies a recurring relationship
- Oakland's pre-1970s housing stock = legitimate technical reason these homes need maintenance more than newer builds
- Founder explicitly OK with recurring revenue model

**Targets**
- Conservative 12-month: 250 members at blended $25/month ARPU = $75K ARR baseline + 30–40% upsell rate on flagged repairs
- Aggressive 12-month: 400 members + commercial rollout = $150K ARR baseline + repair revenue

---

## Brand positioning — two options

### Option A: Standard "Home Care Club" (safe, fast to launch)
Generic positioning. Easier internal sell. Lower differentiation. Use this if speed-to-launch is the priority.

### Option B: "Heritage Home Plumbing Plan" (recommended)
Same program structure repositioned around Oakland's pre-1970s housing stock.

**The pitch:** *"Your home is older than most plumbers in this town. We've been fixing East Bay homes like yours since 2003 — and our two licenses (plumbing + general engineering) mean we can work on the parts of your plumbing that extend into the street. Our Heritage Plan is built for the realities of older Oakland houses: galvanized supply lines, cast iron drains, lead solder joints, settling foundations, and original sewer laterals."*

**Why Option B is stronger:**
- No direct competitor offers this
- Justifies premium pricing (older homes do legitimately need more attention)
- Ties directly into the "Old House Specialists" brand spine
- Self-selects for higher-value customers (older Oakland homes = higher home values)
- Creates natural content angles for SEO

**Recommended approach:** Run the program as "Z & Z Home Care Club" with the Heritage Home Plan as the premium tier — both brand stories are present, customers self-select.

---

## Pricing tiers

### Tier 1 — Essential
**Price:** $14/month annual ($168/yr) · $19/month monthly billing
**Positioning:** Smart-homeowner basic protection. The "no-brainer" tier.

**Included annually:**
- 1× whole-home plumbing inspection (30-point checklist)
- 1× water heater flush and inspection
- Priority scheduling (next-day vs. typical 3–5 day wait)
- 10% discount on all repairs and installations
- No after-hours service fees (~$150 value per emergency call)
- Membership transferable to another member-eligible address

**Cost to deliver per year:** ~$95 (one technician visit ~1.5 hours all-in)
**Gross margin per member:** ~$73/year before any repair upsell
**Target customer:** Existing residential customers, broad appeal, low decision friction

### Tier 2 — Heritage (premium)
**Price:** $29/month annual ($348/yr) · $39/month monthly billing
**Positioning:** For homes built before 1970 — pre-WWII Victorians, mid-century ranches, Oakland Hills builds.

**Included annually:**
- Everything in Essential, plus:
- 1× sewer lateral camera inspection (every 2 years, alternating with EBMUD compliance check)
- 1× drain cleaning service (any one drain)
- Galvanized pipe corrosion check with documented photo report
- Annual water pressure and shutoff valve test
- 15% discount on all repairs and installations
- Free dispatch fee on emergencies (saves $89 per call)
- "Old house file" — a maintained record of the home's plumbing history that transfers if sold

**Cost to deliver per year:** ~$240 (3 technician visits + camera inspection)
**Gross margin per member:** ~$108/year before upsell
**Target customer:** Pre-1970s homeowners (most of central Oakland, Berkeley, San Leandro). Higher-income; views this as appropriate stewardship.

### Tier 3 — Estate (small portfolio)
**Price:** $79/month per property annual ($948/yr) — minimum 2 properties
**Positioning:** For landlords with 2–10 East Bay properties.

**Note from the discovery call:** founder rejected large property management firms ("very cheap, run up a tab and don't pay"). This tier is for *individual landlords* who behave like premium homeowners — NOT large PM companies.

**Included annually per property:**
- Everything in Heritage, plus:
- Tenant-direct emergency line (Z & Z handles tenant calls so the owner doesn't)
- Quarterly property check-ins
- Annual report per property suitable for owner records and tax documentation
- 20% discount on all repairs
- Capital project consulting (advance notice on aging systems before they fail)
- Same-day response window during business hours

**Target customer:** Small landlords (2–10 doors) who aren't big enough for true commercial contracts but are too valuable to treat as residential.

---

## The 30-point inspection checklist

This is the actual product customers are paying for. Don't shortchange this — a thin inspection means low repair upsell and high member churn.

### Water supply system
1. Main water shutoff valve operation
2. Water pressure reading at multiple fixtures
3. Pressure regulator function (if present)
4. Visible supply line condition (galvanized/copper/PEX/PVC noted with photos)
5. Hose bib operation and freeze protection
6. Outdoor irrigation valve check

### Water heater
7. Tank flush and sediment removal
8. Anode rod inspection
9. T&P valve test
10. Thermostat calibration check
11. Visible corrosion on tank and connections
12. Expansion tank function (if present)
13. Combustion air verification (gas units)

### Drains and waste
14. Sink drain flow test (kitchen + all bathrooms)
15. Tub/shower drain flow test
16. Toilet flush mechanism + flapper condition (each toilet)
17. Toilet base seal inspection
18. P-trap condition under each accessible sink
19. Garbage disposal operation
20. Washing machine drain hose condition

### Visible plumbing
21. Visible pipe corrosion / pinhole leaks (basement, crawlspace, under sinks)
22. Pipe support and strapping condition
23. Insulation on hot water lines (energy efficiency)
24. Earthquake strap on water heater (Bay Area required)
25. Caulking around fixtures

### Safety / code
26. Backflow preventer condition (if present)
27. Gas line visible inspection (no leaks, proper support)
28. Sewer cleanout location confirmed and accessible
29. Sump pump operation (if present)
30. Documented photo report delivered to customer within 48 hours

The customer gets a written report listing every item, condition rated green/yellow/red, with photos of any yellow or red items and recommended timeline for any repairs.

**This is the actual differentiator.** Most maintenance plans deliver a verbal "everything looks fine." Z & Z delivers a documented PDF report the homeowner can keep. That report is what justifies the price and what generates the repair upsell conversations.

---

## Operational requirements

This is where most maintenance plans fail. Get the operations right or don't launch.

### Required systems
1. **Member CRM / database** — every member needs a record showing tier, sign-up date, renewal date, address, property age, last inspection date, repair history, photo report archive. Likely lives in ServiceTitan (per the call). Confirm this in the validation follow-up.
2. **Recurring billing** — Stripe, Square, or whatever processor. Must handle subscriptions cleanly. Do NOT do manual annual invoicing — autopay reduces churn 30%+. Default to annual prepay; monthly is the fallback option.
3. **Scheduling rules** — members get priority routing in dispatch. CSR/dispatcher needs a clear visual indicator on incoming calls showing member status before answering.
4. **Inspection report template** — the 30-point PDF report is a brand asset. Design once, properly, with photos and the Z & Z logo. Tech fills it in on a tablet during the inspection and delivers within 48 hours.
5. **Renewal process** — 30-day pre-renewal email/text reminder, auto-charge on renewal date, friction-free cancellation. Industry rule: if cancellation is hard, customers chargeback, which destroys merchant account standing.
6. **Tech training** — every tech delivering an inspection needs to know: how to do the 30 points; how to flag yellow/red items without scaring the customer; how to discuss recommended repairs without pressure-selling; how to upload photos to the report.

### Staffing
- First 100 members: existing techs handle inspections in slow periods
- 100–250 members: dedicated half-day per week for inspection routes
- 250+ members: one technician transitions to part-time "Member Services Tech" role

### Margin protection
- Track inspection completion time religiously — if average climbs above 90 minutes, the program is bleeding margin
- Track repair upsell rate per inspection — target 30%+ of inspections result in recommended repair work, of which 50%+ convert
- Track member churn quarterly — anything above 12% annual churn means the value isn't being delivered

---

## Marketing copy

### Website hero (member program landing page)

> **Plumbing problems shouldn't be a surprise.**
>
> Z & Z has been keeping East Bay homes running since 2003. Now we're offering Oakland-area homeowners a smarter way to take care of their plumbing — before something breaks at 2 AM.
>
> Join the Z & Z Home Care Club. Annual inspections, priority scheduling, no after-hours fees, members-only pricing on repairs.
>
> **From $14/month. Cancel anytime.**
>
> [Join the Club] [See What's Included]

### Heritage tier callout

> **Live in an older Oakland home?**
>
> If your house was built before 1970, your plumbing is fundamentally different from a new build — and so is the maintenance it needs. Galvanized supply lines, original cast iron drains, settling foundations, decades-old sewer laterals.
>
> Our Heritage Home Plan is built for the realities of older Oakland houses. We've been working on homes like yours for two decades. We know what to look for, what to leave alone, and what's quietly about to fail.
>
> [Learn About the Heritage Plan]

### SMS to existing customer base (launch campaign)

> Hi [First Name], it's [Owner Name] from Z & Z Plumbing. We just launched the Z & Z Home Care Club for past customers — annual inspections, priority service, no after-hours fees, from $14/month. As one of our customers, you get the founding member rate (15% off the first year). Want details? Reply YES and I'll send the link.

### Email to existing customer base (launch campaign)

**Subject:** A small thank-you for our Oakland customers

> Hi [First Name],
>
> [Owner Name] here at Z & Z Plumbing. We've been serving Oakland and the East Bay for over 20 years, and the only reason we're still here is customers like you.
>
> I wanted to let you know about something we just launched: the Z & Z Home Care Club.
>
> Most of the calls we get are emergencies — and most of those emergencies could have been caught months earlier with a simple inspection. So we're offering East Bay homeowners a way to stay ahead of plumbing problems instead of reacting to them.
>
> What you get:
>
> - Annual whole-home plumbing inspection with a written photo report
> - Water heater flush and inspection
> - Priority scheduling — members go to the front of the line
> - No after-hours service fees (typically $150 per emergency call)
> - 10–15% off any repairs
>
> Three tiers: Essential ($14/month) for newer homes; Heritage ($29/month) for homes built before 1970 (most of Oakland); Estate ($79/month per property) for landlords with multiple properties.
>
> As a past customer, you get 15% off your first year if you sign up before [date].
>
> [Join the Club]
>
> If you have any questions, just reply to this email — it comes straight to me.
>
> Thanks for trusting us all these years,
> [Owner Name]
> Z & Z Plumbing
> Two Licenses, One Crew · Serving the East Bay Since 2003
> [Phone] | C-36 #896116 + A-Gen Engineering

### Door hanger / leave-behind

**Front:**
Z & Z PLUMBING
Two licenses. One crew.
Serving the East Bay since 2003.
Thank you for choosing us today.

**Back:**
Want to never see us in an emergency again?
Join the Z & Z Home Care Club.
Annual inspection. Priority service. No after-hours fees.
**From $14/month.**
[QR code] | zandzplumbing.com/club

### Truck wrap / yard sign

Z & Z HOME CARE CLUB
Annual plumbing inspection.
Priority service.
**From $14/month.**
zandzplumbing.com/club

### Social media launch post

> Twenty-plus years in Oakland has taught us something: most plumbing emergencies are preventable.
>
> So we're doing something about it. Today we're launching the Z & Z Home Care Club.
>
> Annual inspection. Priority scheduling. No after-hours fees. Members-only repair pricing.
>
> $14/month for newer homes. $29/month for older Oakland homes (we have a special program for pre-1970s houses, because they need it).
>
> Past customers: check your inbox — there's a thank-you discount in there for you.
>
> [link]

---

## Sales scripts

### Inbound call (existing customer calling for service)

**CSR:** *"Hi [Name], thanks for calling Z & Z. Before I get you scheduled — quick question. We just launched a Home Care Club for our regular customers. Members get priority scheduling, no after-hours fees, and 10–15% off the visit you're calling about today. It's $14/month. If you sign up now, today's call is at the member rate. Want me to send you the details?"*

**The hook:** the discount on today's call typically pays for the first 4–6 months of membership.
**Conversion target:** 20%+ of inbound calls.

### Tech in-home pitch (during or after a job)

**Tech:** *"By the way — Z & Z just launched a maintenance club. The reason I'm mentioning it: with a house this age, you'll see [specific issue noted during job] again in maybe 3–5 years. The membership is $14 a month for newer homes or $29 for homes like yours, and it includes an annual inspection where we'd catch that kind of thing before it floods. There's a brochure I can leave with you, no pressure."*

**Tech-driven sales convert at 8–15% in the trades.** The key is no pressure and concrete reason — tying the recommendation to something the tech actually saw in the customer's home.

### Past-customer reactivation call (owner-led)

**Owner:** *"Hi [Name], this is [Owner] from Z & Z Plumbing — I'm not sure if you remember, we worked on your [job] back in [year]. I'm calling because we just launched a Home Care Club for past customers, and as one of our long-time customers you get a founding-member rate. Wanted to give you a quick heads up before we open it up publicly. Got 60 seconds?"*

**Calls from the owner personally convert at 25–40%.** Doesn't scale forever, but for the first 100 members it's the highest-ROI sales motion available.

---

## Launch plan (90 days)

### Days 1–14: Foundation
- [ ] Finalize program structure and pricing (this document)
- [ ] Set up Stripe / Square subscription products for all three tiers
- [ ] Build the 30-point inspection report template (PDF, branded)
- [ ] Build the membership landing page on zandzplumbing.com/club
- [ ] Train every tech and CSR on the program details and scripts
- [ ] Create welcome email sequence (sign-up confirmation, what to expect, scheduling first inspection)

### Days 15–30: Soft launch to existing customers
- [ ] Email blast to entire customer database (founding member rate offer)
- [ ] SMS blast to recent customers (last 24 months)
- [ ] Owner makes 30 personal calls to highest-value past customers
- [ ] Tech mention on every job (with leave-behind card)
- [ ] **Goal: 30 signups in first 30 days**

### Days 31–60: Refinement
- [ ] First inspections begin — measure delivery time, refine the route
- [ ] Collect feedback from first 30 members on the report, the experience, the perceived value
- [ ] Adjust pricing or inclusions if conversion data suggests it
- [ ] Begin posting to social media weekly with member content
- [ ] **Goal: 75 cumulative members**

### Days 61–90: Public launch
- [ ] Update website to lead with the membership program
- [ ] Begin Google Local Service Ads with member offer as primary CTA
- [ ] Launch referral program (members get $25 credit per referral)
- [ ] First member newsletter (seasonal plumbing tips, member-only content)
- [ ] **Goal: 150 cumulative members ≈ $45K ARR baseline**

---

## KPIs to track weekly

1. **New member signups** (target: 5–10/week steady-state by month 3)
2. **Conversion rate by source** (existing customer email vs. inbound call vs. tech mention vs. paid)
3. **Member tier mix** (target: 40% Essential / 50% Heritage / 10% Estate)
4. **Annual vs. monthly billing split** (target: 60%+ on annual prepay)
5. **Inspection-to-repair upsell rate** (target: 30%+ of inspections result in booked repair)
6. **Annual churn rate** (target: <12%)
7. **Member NPS** (target: 50+)
8. **Member ARPU** (target: $300+ blended including upsells)

---

## Common objections + responses

**"I don't have plumbing problems."**
"That's exactly why now is the right time. The members who join when nothing's wrong are the ones who never have an emergency at 2 AM. Members who join after an emergency are paying to prevent the next one."

**"$14 a month feels like a lot for what I get."**
"The annual inspection alone is $129 for non-members. The water heater flush is $89. So you're paying $168 a year and getting $218 in services, plus 10% off any repairs and no after-hours fees. The first emergency call we don't charge you for, the membership pays for itself for two years."

**"Can I cancel anytime?"**
"Yes. We bill annually but you can cancel and get a prorated refund anytime. We don't lock anyone in."

**"I already have a plumber I trust."**
"Great — most of our members had a plumber they trusted before they joined. The Club isn't about replacing anyone, it's about having a plan for the things that will eventually go wrong in any home. If your current plumber doesn't offer something like this, that's the only gap we'd fill."

**"What if I sell the house?"**
"Membership transfers to the new owner if they want it, or we'll prorate refund the rest. Members tell us the inspection report is something realtors actually love because it shows the home has been cared for."

---

## Risks and failure modes to avoid

1. **Selling a plan you can't deliver.** If you sign 200 members and can't deliver 200 quality inspections in the first year, the program collapses. Cap signups during ramp-up if needed.
2. **Skimping on the inspection.** A 20-minute "drive-by" inspection destroys the program. The 30-point checklist must actually be done, every time, with photos.
3. **Pressure-selling repairs.** Members will quit fast if every inspection ends with a $3K recommendation. Calibrate techs: green/yellow/red only, no scare tactics, repairs are recommended, not pushed.
4. **Bad billing experiences.** A failed credit card auto-renewal that becomes a confused phone call destroys trust. Use proper subscription billing with grace periods and automatic retry.
5. **Underpricing.** $9.99/month "loss leader" memberships look attractive but produce churn customers and low-margin work. $14 is already the floor — don't go below.
6. **Treating it as a side program.** This is a strategic shift toward recurring revenue, not a marketing campaign. The owner needs to be personally invested for at least the first 6 months.

---

## Recommended first step — 20-customer validation test

Before any of the above launches, run this:

1. Pick 20 existing past customers who would be receptive
2. Owner calls each one personally, describes the program, asks if they'd join at a founder rate
3. **If 8+ out of 20 say yes,** the program is validated — proceed to full launch
4. **If fewer than 5 say yes,** the pricing or positioning needs revision before launch

This costs 4 hours of the owner's time and prevents launching a program nobody wants.

---

## Open questions before launch (carry forward to validation call)

These are the gating items from the May 5 discovery call that didn't get answered:

1. **How many past customers are in ServiceTitan with phone or email contacts?** — drives launch math
2. **Is ServiceTitan their actual job-management system?** — confirmed in passing during the call but never explicitly
3. **Does ServiceTitan handle recurring billing, or do we add Stripe/Square?**
4. **Tech buy-in** — would techs comfortably mention the program at end of a job?
5. **Pricing reaction** — does $14 / $29 / $79 land for the East Bay market?
6. **Heritage tier reaction** — does the pre-1970s positioning resonate?
7. **Estate tier reaction** — match the actual landlord clients they have?
8. **Owner commitment** — can he commit ~4 hours of personal calls in the first 30 days?
9. **Launch timing** — 30 days, 60 days, or tied to seasonality?
