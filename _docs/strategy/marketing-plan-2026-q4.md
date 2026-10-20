# Z and Z Plumbing Growth Plan: Keep More, Win More

**Owner:** Jordan / Asala, with Jay and Seif
**Written:** 2026-10-20
**Covers:** November 2026 through April 2027
**Supersedes:** the marketing sections of `integrated-roadmap-v2.md` and the May 2026 `marketing-action-plan.html` (which was drafted but never committed). Its core ideas carry forward here: the "two licenses, one crew" wedge, Local Services Ads, brand defense, realtor partners, and cutting Yelp Ads dependence. The Home Care Club design in `content-drafts/home-care-club-program.md` still stands; this plan says when and how to launch it.

---

## The plan on one page

**Three rules the whole business runs on**

1. Call every lead back fast. Within 15 minutes during business hours.
2. Ask every happy customer for a Google review. Every job, no exceptions.
3. Stay in touch with every past customer. Four times a year, useful every time.

**Three engines, in this order**

| Engine | What it does | Starts |
|---|---|---|
| 1. Front door | Stop losing the leads we already get | This week |
| 2. Keep | Turn one-time customers into repeat customers and members | November |
| 3. Grow | Win new customers through Google, partners, and the website | November, ramps in January |

**Six-month targets (by April 30, 2027)**

| Number | Today | April 2027 |
|---|---|---|
| Median callback time on web leads | Not measured (50 leads never logged) | Under 15 minutes |
| New Google reviews per month | Not tracked; engine never fired | 10 a month |
| Real web and Google leads per month | About 10 (15 a month minus spam) | 30 a month |
| Jobs from past customers (reactivation) | No program | 60 total |
| Home Care Club members | 0 (not launched) | 50 founding members |
| Every lead tagged with where it came from | No | Yes |

**The weekly routine (one hour, every Monday)**

1. Lead inbox: every lead from last week is called, scheduled, or closed with a reason. Zero left in New.
2. Reviews: count new Google reviews, reply to every one (good and bad).
3. One Google Business Profile post and at least two real job photos.
4. Check the scorecard numbers below and write one line on what changed.

---

## Where we are today (October 2026)

What is working:

- **The website is producing more leads.** Web leads went from about 5 a month (May to July) to 14 to 18 a month (August to October). Roughly a third are out-of-area spam or vendor pitches, so call it 10 real leads a month.
- **The customer list is real and valuable.** 911 customers paid us between 2021 and 2023, for $708K in total. Median job $425, average $885. 79% are in Oakland. 560 have an email address, 890 have a phone number.
- **The reputation is strong.** 23 years in business, two licenses, on EBMUD's sewer lateral contractor list, and a 4.5-star Yelp history.
- **The tools are built.** Lead capture, confirmation emails, invoices, estimates, review requests, speed-to-lead alerts, coupons. Most of it is waiting on Twilio and a few settings.

What is broken:

- **Leads are not being worked in the OS.** All 50 leads since July 24 are still sitting in New. About 35 of them look like real East Bay jobs (sewer laterals in San Leandro, water heaters and leaks in Oakland). We cannot tell if anyone called them back.
- **Only 16% of customers ever come back.** 142 of 911 booked a second job. There is no follow-up, no reminder, and no membership.
- **The review engine has never sent a single request.** It needs Twilio, a cron secret, and the Google review link. It also only fires when a job is marked complete in the OS, and jobs are still completed in ServiceTitan.
- **We don't know which marketing works.** Leads are not tagged by source, Yelp Ads (~$2K a month) has no attribution, and the after-hours answering service (~$1,000 to $1,200 a month) is not measured.

**The decision this plan needs from you:** where jobs get marked complete. Every retention tool here (review requests, check-ins, reminders) keys off a completed job. Either:

- **Option A (recommended): Jay runs the job lifecycle in the OS.** Leads, scheduling, completion, and invoices all happen there. ServiceTitan becomes optional. Automations fire on their own.
- **Option B: ServiceTitan stays the system of record.** We import a completed-jobs export from ServiceTitan once a week, and the OS fires review requests and follow-ups from that import. Works, but always a week behind.

---

## Engine 1: Fix the front door (weeks 1 and 2)

The cheapest new customer is the lead we already paid for. Do this before spending a dollar on anything else.

1. **Clear the backlog this week.** Call the ~35 real leads from August to October. "We saw your request and want to make sure you got taken care of" is a fair call to make, and some of those homeowners still have the problem. Close the spam leads as cancelled so the dashboard reflects reality.
2. **Work the lead inbox daily.** Every new lead is called within 15 minutes during business hours (Mon to Fri, 7am to 5pm). Move it out of New the moment you talk to them; that stamps the response time automatically.
3. **Start Twilio registration now.** It takes 1 to 2 weeks of carrier review and gates every text. Jay needs to provide the legal business name and EIN. Once live: instant text alerts to Jay and Seif on every lead, a text receipt to the customer, and escalation texts if a lead sits untouched.
4. **Replace the answering service with an AI receptionist.** Decided in May, never started. Missed and after-hours calls forward to a Twilio number with an AI agent that books the job and texts the summary to dispatch. Est. $45 to $95 a month against $1,000 to $1,200 today. The main number (510) 708-4237 never changes.
5. **Tag every lead with its source.** The website captures the page and any ad click ID automatically. For phone calls, Jay asks "How did you hear about us?" and picks from a short list (Google search, Google Maps, Yelp, referral, repeat customer, truck or sign, other).
6. **Don't publish response-time claims we can't back up.** Some copy promises "30 to 60 minutes." Once we have four weeks of measured callback times, we publish the real number.

---

## Engine 2: Keep customers (retention)

A past customer already trusts us. They cost almost nothing to reach and they book bigger jobs. Right now we let 84% of them drift away.

### The "four touches a year" system

Every customer hears from Z and Z four times a year, and every message is useful on its own.

| When | Message | Channel |
|---|---|---|
| 1 to 2 days after the job | Thank you, plus a one-tap Google review link | Text (after Twilio) or email (now) |
| 30 days after the job | "How is everything holding up?" plus refer-a-neighbor offer | Email |
| Late October (before the rains) | Winter check: sewer lateral roots, water heater, outdoor shutoffs | Email |
| Spring (March) | Spring check: water heater flush, hose bibs, irrigation, low water pressure | Email |
| Job anniversary | Type-specific reminder ("Your water heater is due for its annual flush") | Email |

East Bay timing matters. Rains start in November and roots in old clay laterals cause backups all winter. The winter message is the money message.

### One-time reactivation campaign (November to December)

Split the 911 past customers into three groups and work them in order:

| Group | Who | How many | What we do |
|---|---|---|---|
| A. Best customers | Spent $1,000 or more | 194 | Seif calls personally, then a follow-up email. Owner calls convert at 25 to 40%. |
| B. Repeat customers | Booked 2 or more jobs | 142 (overlaps A) | Email, then a call from Jay |
| C. Everyone else | All other past customers with email | ~400 | A three-email series over three weeks |

**The offer:** a fixed-price **Winter Plumbing Check-up** (camera look at the sewer lateral cleanout, water heater inspection, main shutoff test, written photo report). It is a real service, it fills slow winter days, and it surfaces the bigger repairs. It also doubles as the first visit for Home Care Club members.

**Before we start:** get a fresh customer and invoice export from ServiceTitan covering 2024 to today. The OS only has job history through 2023, so our most recent customers (the warmest ones) are missing.

### Home Care Club (launch in January)

The full design is in `content-drafts/home-care-club-program.md`. Launch the simple version first:

- **Two tiers only:** Essential ($14 a month, $168 a year) and Heritage for pre-1970 homes ($29 a month, $348 a year). Add the landlord tier later.
- **Annual prepay by invoice** to start. No card subscription system needed for the first 50 members. Add Stripe when renewals get busy.
- **The product is the 30-point inspection with a written photo report.** That report is what customers are paying for.
- **Founding member offer:** first-year discount for past customers who join before March 1.
- **Where members come from:** the reactivation calls, the winter check-up visits, and a tech mention on every job with a leave-behind card.
- **What we build:** a `/club/` page on the website, a member flag on the customer record so Jay sees it on every call, and a renewal reminder 30 days before the anniversary.

### Referrals

"Refer a neighbor and you both get $50 off your next service." Mention it in the 30-day email, on the invoice, and on the leave-behind card. Track it with the lead source tag.

### Rules we follow

- **Email** is fine for past customers as long as every marketing email has an unsubscribe link and our address. Send marketing email from a separate sending address from invoices, so a spam complaint can never block an invoice.
- **Texts** for marketing only go to people who actively opted in. Today that is effectively nobody: the 17 "yes" answers on file came from a consent box that was pre-ticked, which doesn't count as opt-in. The box is now unticked by default. Customers imported from ServiceTitan never opted in to texts either, so they get email and personal calls, not marketing texts. Review requests and appointment texts go to customers who tick the box (or agree on the phone and Jay records it).
- **Personal calls** to past customers are fine. For anyone whose last job was more than 18 months ago, check the number against the national Do Not Call list first.

---

## Engine 3: Win new customers

In order of return on effort. Don't start a lower item until the one above it is running.

### 1. Google Business Profile (the biggest lever)

Most "plumber near me" calls come from the Google map listing, not the website.

- **10 new Google reviews a month**, from the review engine plus a personal ask at the end of every job.
- **Reply to every review** within two days.
- **One post a week** (a recent job, a seasonal tip, the winter check-up offer).
- **Four or more real job photos a month.** Before and after. Trucks, crew, East Bay houses.
- **Services and Q&A filled out completely,** including sewer lateral, EBMUD compliance, water heaters, repipes, hydro-jetting.
- **Finish the address move** to 3057 Teagarden Street, San Leandro, following the plan in `address-transition-strategy.md`.

**Brand defense.** A competitor has bid on "Z and Z Plumbing" in Google Ads. A small exact-match campaign on our own name ($150 to $250 a month) keeps our listing on top when someone searches for us by name.

**Real photos beat polished ones here.** The video and imagery plans keep faces and trucks out of produced content, which is fine for social clips. For the Google profile, upload real photos of real jobs, crew, and trucks. Google and customers both trust them more.

### 2. Google Local Services Ads ("Google Guaranteed")

The ads that show above everything else for "plumber Oakland." You pay per lead, not per click, and you can dispute junk leads.

- **Start only after callback time is under 15 minutes.** Google ranks these ads partly on how fast you answer.
- **Test at $500 to $1,000 a month for 60 days.** Compare cost per booked job against Yelp Ads.

### 3. Yelp: measure, then decide

Keep the free listing and keep replying to reviews. For the ~$2K a month in Yelp Ads, run a 60-day test with every lead tagged by source. If Yelp's cost per booked job is worse than Local Services Ads, move the money.

### 4. Realtors and escrow officers (sewer lateral compliance)

When a home sells in Oakland, Alameda, Albany, Emeryville, Piedmont, El Cerrito, Kensington, or the Richmond Annex, EBMUD requires a sewer lateral compliance certificate before escrow can close (Berkeley runs a similar program of its own). Remodels over $100,000 trigger it too. Z and Z is on EBMUD's approved contractor list and holds the A General Engineering license needed for street-side work. That is a real edge, and every sale is a deadline someone needs met.

- Build a list of 30 East Bay listing agents and escrow officers in those cities.
- A one-page sheet: "Sewer lateral compliance, start to certificate," with our turnaround time and direct line.
- Fast inspection scheduling for realtor referrals. Escrow deadlines are the whole game.
- Goal: 5 active realtor partners by April, each sending a few jobs a quarter.

### 5. Small landlords, restaurants, and HOAs

Individual landlords with 2 to 10 units, neighborhood restaurants, and small HOAs. **Not** large property management firms (the owner has ruled them out: slow to pay). These become the landlord tier of the Home Care Club later.

### 6. Website and SEO

See `../seo/seo-plan-2026-q4.md`. The short version: fix what Google sees today, publish the four blog posts already written, build the missing service pages, and post one helpful article a month.

### 7. Neighborhood presence

- **Nextdoor:** claim the business page and ask happy customers to recommend Z and Z there.
- **Short videos from the field:** one a week from the existing 50-tip video plan, posted to the Google profile, YouTube Shorts, and Instagram.
- **Trucks and yard signs:** a "Z and Z working here" yard sign on every multi-day job.

### What we are not doing (yet)

- **Government RFPs:** slow, paperwork-heavy, lowest-bidder work. Revisit in 2027 if commercial capacity grows. See `../os-buildout/rfp-aggregation-feasibility.md`.
- **Large property management firms:** owner decision.
- **Broad paid social ads:** low intent for emergency plumbing. Not worth it until the basics are running.
- **Paid SEO tools:** add Semrush and Local Falcon only once we are publishing content every month.
- **Discount coupons:** the May plan ruled out coupon discounting, and that still holds. The site's coupon feature is used for one real offer at a time (the Winter Check-up, then the Club founding rate), not a rotating discount. An expired coupon was still showing on the site; that is fixed.

---

## 90-day calendar

| Weeks | Dates | Focus | Done when |
|---|---|---|---|
| 1 to 2 | Oct 27 to Nov 9 | Front door | Backlog cleared, daily inbox habit, Twilio registration submitted, lead source tags live |
| 3 to 6 | Nov 10 to Dec 7 | Reactivation and reviews | Group A calls done, winter email sent, review requests firing, first 15 new Google reviews |
| 7 to 10 | Dec 8 to Jan 4 | Partners and Google ads | Realtor sheet done, 15 realtors contacted, Local Services Ads test live, AI receptionist live |
| 11 to 13 | Jan 5 to Jan 25 | Home Care Club launch | `/club/` page live, founding offer sent, first 15 members |

---

## Budget (monthly, steady state)

| Item | Cost | Note |
|---|---|---|
| Twilio texting | $25 to $60 | Registration fees plus usage |
| AI receptionist | $45 to $95 | Replaces a $1,000 to $1,200 answering service |
| Google Local Services Ads test | $500 to $1,000 | 60-day test, then keep or cut |
| Yelp Ads | ~$2,000 today | Under review after the 60-day test |
| Marketing email | $0 to $20 | Separate sending address from invoices |
| Print (leave-behind cards, yard signs) | ~$150 once | |

If the AI receptionist replaces the answering service and the Yelp test goes the way it usually does, this plan costs **less per month than today**.

---

## Monthly scorecard

| # | Number | Where it comes from |
|---|---|---|
| 1 | Real leads (web, phone, Google), by source | OS lead inbox with source tags |
| 2 | Median callback time | OS dashboard (stamped automatically) |
| 3 | Booked jobs, and booked jobs from marketing | OS jobs |
| 4 | New Google reviews | Google Business Profile |
| 5 | Jobs from past customers | OS jobs tagged repeat or reactivation |
| 6 | Home Care Club members | OS customer member flag |
| 7 | Cost per booked job by source | Ad spend divided by booked jobs per source |

---

## Who does what

| Person | Owns |
|---|---|
| **Jay** | Works the lead inbox daily, tags every lead's source, asks for the review at the end of every call, approves pricebook descriptions, provides EIN for Twilio |
| **Seif** | Personal calls to the top 50 past customers, mentions the Club on every job, takes job photos, hands out leave-behind cards |
| **Asala** | Builds and runs the email campaigns, Google profile posts, website and SEO, the `/club/` page, the AI receptionist, monthly scorecard |
