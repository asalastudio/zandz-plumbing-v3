# Z and Z OS — Speed-to-Lead + Communications Plan

**Owner:** Jordan / Asala · **Written:** 2026-07-22
**Supersedes:** `WIRING.md` (HubSpot/Stripe sections), `_docs/integrations/hubspot-setup-checklist.md`

This is the plan to close the gap between "the OS is built" and "the OS is
answering the phone." It consolidates the 2026-07-22 repo audit plus the open
threads in the AI-OS client vault.

---

## Where things actually stand (2026-07-22)

**Live.** `https://www.zandzplumbing.com` returns 200, apex 308s to www, and
`/admin` is deployed. Last production deploy was 1 day ago. All 9 PRs are
merged; no unmerged work of substance.

**Built in code, dormant on credentials.** The Vercel production project has
exactly 11 env vars set:

```
ADMIN_PASSWORD_HASH   SESSION_SECRET        SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY                   RESEND_API_KEY
DISPATCH_EMAIL        LEAD_FROM_EMAIL       INVOICE_FROM_EMAIL
NEXT_PUBLIC_SITE_URL  NEXT_PUBLIC_GA_ID     ASSISTANT_MODEL
```

Everything else is missing. Concretely that means:

| Capability | Code | Live | Blocker |
|---|---|---|---|
| Lead → Supabase | yes | **yes** | — |
| Lead → dispatch email | yes | **yes** | — |
| Lead → customer confirmation email | yes | **yes** | — |
| Lead → dispatch SMS | yes | no | `TWILIO_*`, `DISPATCH_PHONE` |
| Lead → customer receipt SMS | yes | no | `TWILIO_*` |
| Review-request engine | yes | no | `TWILIO_*`, `CRON_SECRET`, `GOOGLE_REVIEW_URL` |
| Invoice send by SMS | yes | no | `TWILIO_*` |
| STOP / opt-out handling | yes | no | Twilio webhook not registered |
| Jobs, dispatch, crew, invoices, PWA | yes | **yes** | — |
| Operator AI assistant | yes | **yes** | Vercel OIDC covers the Gateway |
| Pricebook auto-fill on invoices | yes | **unverified** | migrations 009/010/011 + seeds may not be applied |

**The review cron is currently a no-op.** `authorize()` fails closed in
production when `CRON_SECRET` is unset, so the hourly job returns 401 every
run. That is correct behavior, but it means the review engine has never fired.

**Dead code worth removing.** HubSpot is dropped as a decision but
`lib/leads.ts` still calls `submitLeadToHubSpotForm` and `createHubSpotDeal`
on every lead (both no-op without env). `WIRING.md` and `README.md` still
describe HubSpot as the CRM and "then ServiceTitan goes away" — both are stale
and actively misleading to anyone picking this up.

**No SLA instrumentation exists.** `jobs` has `created_at` but no
`first_contact_at`, no `first_response_seconds`. There is no way to answer
"how fast did we call this lead back," which is the whole point of
speed-to-lead.

---

## The real problem this plan solves

From the discovery notes, the front door to this business is broken in a way
the website cannot fix:

- Every after-hours call goes to a third-party answering service costing
  **$1,000–$1,200/month** that Jay described as *"not as great"* and that
  Gemini's notes say *"stopped scheduling jobs effectively."*
- Call volume is **not measured at all** — *"sometimes the phone doesn't ring
  for a day, and sometimes it rings four or five times in a day."*
- Missed calls are not recovered. There is no text-back, no callback queue.
- Published copy already promises "30 to 60 minutes" response and one brand
  doc drafts "average callback within 12 minutes" — **currently
  unsubstantiated.** We should not ship that claim until we can measure it.

An AI answering service on ElevenLabs + Twilio was **decided on 2026-05-06**
("AI answering service — locked: pursue", est. $45–95/mo replacing
$1,000–1,200/mo) and never started. That decision is still the right one and
it is the largest single line-item saving available to this client.

---

## Sequencing principle

**Messaging first, voice second.** A2P 10DLC carrier review is 1–2 weeks of
pure waiting and gates every customer-facing text. It starts on day one and
runs in the background while everything else proceeds. Voice work does not
block on it.

**Do not port (510) 708-4237.** Porting the main business line is a
downtime-and-NAP risk for zero near-term benefit. Instead use
**conditional call forwarding** on the existing carrier (forward on
no-answer / busy / after-hours) into a Twilio number. Caller ID passes
through, the canonical number never changes, GBP and every citation stay
correct, and we can reverse it in one setting. Port later, deliberately, only
if we want full call recording on first-ring.

**Do not put a tracking number on the site.** At 0–5 calls/day, dynamic number
insertion is not worth the NAP-consistency risk. Forwarding gives us the same
call data on the canonical number.

---

## Phase 0 — Credentials (client + engineer, parallel, ~90 min of work)

Ordered so each step produces what the next one needs. Items marked **JAY**
need the client.

1. **JAY: Twilio account** using Z and Z's legal business name + **EIN**.
   Verify. Add Jordan as admin. → `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`
2. **Buy a 510 number** (SMS + MMS + Voice, ~$1.15/mo). → `TWILIO_PHONE_NUMBER`
3. **A2P 10DLC — START IMMEDIATELY, THIS IS THE LONG POLE.**
   - Brand registration (~$4 once + $2/mo): legal name, EIN, address
     3057 Teagarden St, San Leandro, CA 94577, industry Home Services.
     Approval 1–3 business days.
   - Campaign (~$10 once + $2–10/mo), use case **Mixed**. Sample messages must
     match what the code actually sends — pull the real bodies from
     `lib/lead-sms.ts` and `lib/twilio.ts`. Opt-in description: web form
     checkbox with consent language shown next to it. Approval 5–10 business
     days.
   - Messaging Service "Z and Z Dispatch", attach the number and the campaign.
     → `TWILIO_MESSAGING_SERVICE_SID`
4. **JAY: dispatch phone(s)** — which mobiles receive new-lead texts.
   → `DISPATCH_PHONE` (will accept a comma-separated list after Phase 1)
5. **JAY: Google review short link** from GBP → Reviews → Share review form.
   → `GOOGLE_REVIEW_URL`
6. **Engineer: `CRON_SECRET`** = `openssl rand -base64 32`, Production only.
   This alone revives the review engine.
7. **Register Twilio webhooks** once the number exists:
   - Messaging → incoming: `https://www.zandzplumbing.com/api/webhooks/twilio/inbound`
   - Voice → incoming: `https://www.zandzplumbing.com/api/webhooks/twilio/voice` *(Phase 3, does not exist yet)*
8. **Verify the pricebook migrations** (009, 010, 011) and seeds are applied in
   Supabase. Memory says they were never run because local Supabase keys are
   write-only. Until they are, invoice line auto-fill is inert.

**Cost at steady state:** ~$1.15 number + ~$4–12/mo A2P + usage
(≈$0.0079/SMS, ≈$0.014/min voice). Call it **$25–60/month** all-in at their
volume.

---

## Phase 1 — Make the existing speed-to-lead path actually fire (engineer, ~1 day)

All of this is small, and all of it lands the moment Twilio creds exist.

- **Multi-recipient dispatch SMS.** `DISPATCH_PHONE` currently takes one
  number (`lib/lead-sms.ts`). Make it split on commas like `DISPATCH_EMAIL`
  already does, and send to each. Jay and Seif should both get the ping.
- **SLA instrumentation.** Add `first_contact_at` and `first_response_seconds`
  to `jobs`, stamped the first time a job leaves `new`. Surface
  median-response-time on `/admin` and `/admin/analytics`. Without this we can
  never honestly publish a callback-time claim.
- **Escalation ladder.** New cron (every 5 min) that re-alerts if a `new` job
  is older than N minutes and untouched. Ladder: 5 min → re-text dispatch,
  15 min → text the second number, 30 min → email + mark the job
  `⚠️ SLA BREACH` on the dashboard. Configurable via env.
- **First-party SMS consent ledger.** With HubSpot gone, `sms_consent` needs
  to be written into our own table on every lead. Required evidence for A2P
  compliance if a carrier ever audits.
- **Remove the dead HubSpot calls** from `lib/leads.ts` and delete
  `lib/hubspot.ts` / `lib/hubspot-deals.ts`, or keep them behind a clearly
  labeled "not in use" note. Right now they run on every single lead.
- **Rewrite `WIRING.md`** to match reality (no HubSpot, no Stripe, ServiceTitan
  parallel not deprecated) and fix the same claims in `README.md`.

---

## Phase 2 — Two-way SMS inbox in the OS (engineer, ~2 days)

Inbound texts already land in `sms_log` via the webhook, but nobody can read
them. Today a customer replying to a review request or a dispatch text is
shouting into a void.

- `/admin/messages` — threaded conversation list keyed by `phone_e164`, with
  reply box. Cross-link to the customer and job records.
- Unread badge on the admin nav.
- Push the new-message alert to `DISPATCH_PHONE` so replies do not sit unseen.
- Delivery-status callbacks (`statusCallback` is already plumbed through
  `sendSms`) written back to `sms_log` so failed sends are visible.

---

## Phase 3 — Voice: missed-call text-back + call capture (engineer, ~2–3 days)

This is the highest-ROI piece in the entire plan and it does not require the
AI receptionist to land first.

**Setup:** on the existing carrier for (510) 708-4237, enable conditional
forwarding (no-answer after ~20s, busy, and unavailable) to the Twilio number.

**New route `/api/webhooks/twilio/voice`:**

- **Business hours (Mon–Sat, hours TBC — see open questions):** simultaneous
  ring to the crew numbers in the `crew` table. If nobody answers within
  ~20 seconds → voicemail + immediate text-back.
- **Missed-call text-back, always:** the instant a call is not answered, text
  the caller:
  *"Sorry we missed you — this is Z and Z Plumbing. Reply here and we'll get
  right back to you, or call (510) 708-4237. Reply STOP to opt out."*
  Nationally this recovers a large share of otherwise-dead calls, and for a
  plumber the caller is usually still shopping when the text arrives.
- **Every call becomes a row.** Create a `calls` table (from, to, direction,
  duration, recording URL, transcript, answered/missed, linked customer + job).
  Missed calls create a `new` job automatically so they enter the same
  speed-to-lead pipeline as web leads. **This is the first time this business
  will have call volume data at all.**
- **Recording + transcription** with a spoken consent notice (California is a
  two-party consent state — the greeting must state that the call is
  recorded).
- Surface calls on `/admin` alongside leads.

---

## Phase 4 — AI receptionist, after-hours (separate track, ~4–6 weeks)

The decision to pursue this was locked 2026-05-06 and never started. Stack:
**ElevenLabs Conversational AI + Twilio + the Z and Z OS API.**

- After-hours and overflow calls route to the agent instead of the answering
  service.
- Agent qualifies: name, callback number, address/ZIP, service type,
  emergency vs. scheduled — then writes straight into `jobs` through an
  authenticated tool endpoint, exactly like a web lead.
- True emergencies escalate: agent triggers a call + text to the on-call crew
  member.
- Every conversation produces a recording, transcript, and summary email to
  `DISPATCH_EMAIL`.
- Run it in **shadow mode first** — the answering service stays live while the
  agent takes a copy of the traffic — then cut over once transcripts look
  clean for two weeks.

**Economics:** replaces $1,000–$1,200/mo with roughly $45–95/mo. That is
**~$12,000/year**, and it is a legitimate paid engagement track for Asala
rather than something to absorb.

---

## Phase 5 — The rest of "solid"

Not comms, but open and dated:

- **GSC indexing alert (2026-07-03, still needs-action).** "Duplicate, Google
  chose different canonical" + `noindex` exclusions. Export affected URLs,
  enforce one canonical form including trailing slash, add an explicit
  `<link rel="canonical">` fallback in the root layout, and either publish
  blog content or drop `/blog/` from the sitemap.
- **Citation cleanup manifest (2026-07-01, ready, not executed).** HomeAdvisor
  is the worst offender (two listings, wrong `2434 Teagarden St`, false
  "serving since 1985"), Yelp still shows the old MacArthur Blvd address
  (238 reviews — protect it), Angi old address, BBB wrong street number,
  Nextdoor duplicate pages.
- **GBP freeze status is contradictory** across vault docs — resolve before
  touching anything in GBP.
- **Review engine end-to-end test** once Twilio is live: seed a request, force
  `scheduled_send_at` into the past, hit the cron with the bearer token,
  confirm receipt, click the link, reply STOP, verify the opt-out row.
- **Delete test jobs 27 and 28** from `/admin/jobs`.
- **Confirm real office hours.** Footer says Mon–Fri 7–5, schema says 24/7,
  business-truth says Mon–Sat 8–5. The voice routing in Phase 3 needs one
  correct answer.

---

## Suggested order of execution

```
Week 1   Twilio account + number + A2P submitted (waiting starts)
         CRON_SECRET, GOOGLE_REVIEW_URL, DISPATCH_PHONE set
         Phase 1 engineering (multi-recipient, SLA fields, escalation, doc cleanup)
         Verify pricebook migrations applied
Week 2   Phase 2 (SMS inbox) + Phase 3 build (voice webhook, calls table)
         GSC canonical fixes + citation cleanup executed in parallel
Week 3   A2P approves → flip messaging on, full end-to-end test
         Conditional forwarding enabled → missed-call text-back live
         Two weeks of real response-time data starts accumulating
Week 4+  Phase 4 AI receptionist prototype in shadow mode
         Publish a measured callback-time claim once the data supports it
```

---

## Open questions that block the build

1. **Answering service:** cancel it once the AI receptionist proves out, or
   keep it as backstop? (Determines whether Phase 4 is urgent or optional.)
2. **Real office hours** — one authoritative answer for voice routing.
3. **On-call:** who takes the 2 AM emergency escalation, and on which number?
4. **The Yelp tracking line (341) 699-7090** — keep, retire, or route through
   Twilio for attribution?
5. **Stripe** — still deferred, or does invoicing parity now need card
   payment? (`lib/stripe-checkout.ts` is written and waiting.)
