# RFP / Government Bid Aggregation — Feasibility Note

**Written:** 2026-07-23 · **Status:** research spike, no build. Read before scoping any RFP feature.

The idea (from the 2026-07-22 working notes): aggregate government plumbing RFPs
into the Z and Z OS dashboard, filtered to what Z and Z would actually bid on,
so opportunities surface automatically instead of Jay hunting portals. OpenGov
was named as the example source.

Bottom line up front: **there is no single clean API for the RFPs that matter
to Z and Z.** The one genuinely clean public API (SAM.gov, federal) is the
least locally relevant. The locally relevant bids (city / county / state) live
on fragmented portals, most without a public API. This is a real integration
project or a paid subscription, not a quick "bridge to OpenGov's API."

## What each source actually offers

| Source | Scope | API? | Relevance to Z and Z |
|---|---|---|---|
| **SAM.gov** | Federal | **Yes — free public API**, filter by NAICS, state, keyword; structured data with deadlines/contacts | Low-ish. Federal facility work only (VA, bases, federal buildings). Larger, national, heavy paperwork. |
| **OpenGov Procurement** | Many CA cities/counties | **No public vendor API.** Vendors register for one login + email alerts across OpenGov agencies. `developer.opengov.com` is for *agencies* integrating their own data, not vendors pulling bids. | High relevance, but access is portal + notifications, not a feed. |
| **Cal eProcure** | California state | Public search page, **no documented public API** | Medium. State contracts (CSCR). Manual portal. |
| **County / city portals** | Alameda Co., Oakland, San Leandro, etc. | Fragmented — OpenGov, PlanetBids, Bonfire, Bidsync, each different; mostly no public API | Highest relevance, worst access. |
| **Paid aggregators** (BidNet Direct, GovSpend, Govology) | Local + state + federal in one | Some have APIs; subscription (~$1–2k/yr typical) | Best coverage, ongoing cost. |

Sources: [SAM.gov Get Opportunities Public API](https://open.gsa.gov/api/get-opportunities-public-api/) ·
[OpenGov Suppliers](https://opengov.com/products/procurement/suppliers/) ·
[Cal eProcure](https://caleprocure.ca.gov/).

The relevant NAICS codes to filter on: **238220** (plumbing, heating,
air-conditioning contractors), plus **237110** (water/sewer line construction)
for lateral/main work.

## The honest strategic caveat

Government RFP work is a **slow, competitive, paperwork-heavy** sales process —
Jay's own discovery notes said as much ("It's a slower sales process"). Public
bids go to the lowest responsible bidder after a formal process. For a two-crew
plumber, the better commercial-growth path is likely the *other* idea in the
same notes: **direct B2B outreach to property managers, apartment complexes,
GCs, and new-construction / just-sold real estate** — a relationship sale, not
a competitive bid. That doesn't need an RFP aggregator at all; it needs a
target list and follow-up, which the OS lead pipeline already handles.

Worth deciding which game Z and Z actually wants to play before building an RFP
feature.

## If we do build it — three real options

**Option A — SAM.gov API, v0 (cheap, ~1–2 days).**
Free API key, poll daily for NAICS 238220 / 237110 in California, surface in a
new `/admin/opportunities` view with the same review-queue pattern the pricebook
uses. Honest downside: federal-only, modest volume, mostly big jobs. Good as a
proof of the mechanism; low real-world yield for a local plumber.

**Option B — Manual notification aggregation (no code, this week).**
Register Z and Z as a vendor on OpenGov Procurement, Cal eProcure, Alameda
County, Oakland, and San Leandro portals for email bid alerts. Zero engineering.
Route those alerts to a shared inbox. If volume proves worth it, a later phase
could parse those emails into the dashboard. **Recommended first step** — it
validates whether relevant bids even show up before we build anything.

**Option C — Paid aggregator with an API (best coverage, ongoing cost).**
Subscribe to BidNet Direct or similar covering CA local + state + federal, and
integrate its feed. Best data, but a recurring bill and a vendor dependency.
Only worth it if Option B shows real, regular, winnable local bids.

## Recommendation

1. **Do Option B now** (free, this week): register on the local portals for
   alerts. This answers the only question that matters — *are there enough
   relevant, winnable local plumbing RFPs to justify a feature?* — with real
   data instead of a guess.
2. **Define the "perfect RFP" criteria** Jay mentioned: NAICS codes, geography
   (which counties), contract-size range, and public-vs-private-works
   preference. That becomes the filter for whichever source we pick.
3. **Revisit A or C only if B shows volume.** Don't build an aggregator on the
   assumption that the bids are there; confirm it first.
4. Keep this separate from the core OS work — it's a growth experiment, not
   part of getting the operational platform solid.
