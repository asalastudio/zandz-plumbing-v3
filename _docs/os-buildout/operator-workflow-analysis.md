# Operator Workflow Analysis — Jay's journey through Z and Z OS

**Written:** 2026-07-23 · Modeled on ServiceTitan's operator/dispatch UX.

Goal: make the OS make sense for the person who lives in it all day — Jay, the
office operator for a two-crew shop. Right now the left nav has grown to 16
items and several are different views of the same data. This maps her real day,
finds the friction, and proposes a ServiceTitan-style consolidation.

## Jay's actual day

1. **Morning** — what's on today, what's unscheduled, what needs chasing.
2. **A call or web lead comes in** — capture customer + problem, schedule it or
   dispatch same-day.
3. **Assign** the job to Seif or the second tech.
4. Tech works the job on their phone, documents it, marks it complete.
5. **Send an estimate** for bigger jobs (customer approves), or **invoice** the
   completed work directly.
6. **Collect payment**, mark paid. Review request auto-fires.
7. **Occasionally**: look up a customer's history, check a price mid-call, see
   the numbers, post a coupon.

The 90% of her time is steps 1–6. Steps 7 are occasional.

## The core problem: four doors into one room

`Leads`, `Dispatch`, `Jobs`, and `Field` are **four nav items that all read the
same `jobs` table** — just filtered or styled differently:

- **Leads** = jobs with status `new` (a filtered Jobs list).
- **Dispatch** = jobs on a calendar/board (a scheduled view of Jobs).
- **Jobs** = the full list.
- **Field** = the same jobs on a tech's phone (a different device, not a
  different dataset — and not Jay's tool at all; it's Seif's).

ServiceTitan doesn't do this. A job flows through stages (New → Scheduled →
In progress → Complete → Invoiced → Paid); the **board** and the **list** are
two views of that one pipeline, and a "lead" is simply a job at the first stage.
The dispatcher lives on the board almost all day.

## The second problem: config sits in the daily nav

`Pricebook` and `Crew` are **configuration**, not daily operations. Pricebook is
a review-and-maintain tool touched occasionally; Crew is set up once. They sit
in the main nav next to Dispatch and dilute the operational items. ServiceTitan
keeps these under Settings.

## What each of the 16 items really is

| Item | What it is | Where it belongs |
|---|---|---|
| Dashboard | Today at a glance | **Daily** |
| Assistant | AI lookup | Daily (or fold into a Comms hub) |
| Messages | Customer texts | Daily |
| Leads | Jobs at stage `new` | **Merge into Jobs pipeline** |
| Dispatch | Jobs on the board | **Daily** (the heart) |
| Jobs | Job pipeline list | **Daily** |
| Field | Jobs on the tech phone | Tech-only; drop from Jay's nav |
| Estimates | Money — pre-work | **Daily** |
| Invoices | Money — post-work | **Daily** |
| Pricebook | Catalog config | **Settings** |
| Customers | People | **Daily** |
| Crew | Staff config | **Settings** |
| Analytics | Insights | Business (weekly) |
| Videos | Marketing content | Business (weekly) |
| Coupons | Marketing offers | Business (weekly) |
| Reviews | Reputation | Business (weekly) |

## Proposed structure (ServiceTitan-modeled)

Three tiers instead of one long list.

```
OPERATIONS  (Jay's daily surface)
  Dashboard        today + new-lead inbox
  Dispatch         the board — schedule + assign  ← the heart of the day
  Jobs             the pipeline (New leads is the first column)
  Customers
  Estimates
  Invoices
  Messages         texts + assistant

────────
BUSINESS  (weekly)
  Analytics
  Reviews
  Coupons
  Videos

────────  (gear, bottom)
SETTINGS
  Pricebook
  Crew
```

From 16 loose items to **7 daily + 4 weekly + 2 settings**, grouped so the
running-the-business tools aren't buried among config and marketing.

### The three real decisions

1. **Merge Leads into Jobs.** A new lead becomes the first stage of the Jobs
   pipeline, and the Dashboard keeps the fast "new leads" inbox for speed. One
   fewer nav item, and it matches how the data actually works. (Low risk — both
   already read `jobs`; it's a UI consolidation.)

2. **Move Pricebook + Crew to a Settings group.** They stop competing with
   daily items. (Low risk — just nav grouping; routes unchanged.)

3. **Field: drop from Jay's sidebar, keep the route.** `/field` stays live for
   techs to bookmark on their phones (the installed PWA keeps working), but it
   leaves Jay's office nav since it isn't her tool. The *full* Jobs+Field data
   merge (making the job detail page double as the field view) is a larger
   refactor with PWA implications — recommend deferring that and just removing
   the nav entry now.

## Deeper workflow fixes (beyond nav)

- **Dispatch as the landing surface.** ServiceTitan dispatchers open to the
  board. Consider making Dispatch (or a board-style Dashboard) the default admin
  landing page instead of the current stat dashboard.
- **One "money" path.** On a completed job, the choice is estimate-first or
  invoice-now. The job page should present that as one clear next-step, not two
  separate destinations to remember.
- **Consolidate per-item buttons.** Several detail pages have grown a row of
  buttons (the estimate detail now has PDF / Edit / Send / Approve / Decline /
  Convert). Group them into "primary action" + an overflow so the main next
  step is obvious and the rest are tucked away.

## Recommendation

Do decisions 1–3 now (all low risk, high clarity). Treat the Dispatch-as-landing
and full Field/Jobs merge as a follow-up once Jay has used the consolidated nav
and we can see where she actually gets stuck.
