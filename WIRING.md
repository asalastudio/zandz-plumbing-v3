# Z and Z OS · Wiring Guide

**Updated: 2026-07-22.** Everything in this codebase is built. This doc is the
step-by-step for setting up the third-party accounts and pasting credentials so
it all comes alive.

**Time to complete: ~60 minutes of focused setup, then 1-2 weeks of waiting on
Twilio's A2P 10DLC carrier review.**

Start the A2P registration first. It is the only thing here with a multi-week
lead time and it gates every customer-facing text.

---

## Architecture, so nothing gets re-litigated

- **No CRM.** HubSpot was dropped. The OS (Supabase, with the Leads → Scheduled
  → Active pipeline) is the single source of truth for leads and customer data.
  There is no HubSpot code left in the repo.
- **ServiceTitan runs in parallel.** The OS is being built to replicate
  ServiceTitan's invoicing and dispatch and take over over time. ServiceTitan is
  not being switched off on any particular date, and nothing here depends on it.
- **Stripe is deferred, not dropped.** Invoices send by email and text with
  pay-by-call, check, or cash. `lib/stripe-checkout.ts` exists and can be
  switched on later without rework.
- **Email is live.** Resend, sending from the verified subdomain
  `notifications.zandzplumbing.com`. DNS is at GoDaddy.
- **SMS is the gap.** Every Twilio path is written and dormant.

---

## What is already set in production

The Vercel project `asala/zandz-plumbing-v3` currently has these 11 vars:

```
ADMIN_PASSWORD_HASH   SESSION_SECRET        SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY                   RESEND_API_KEY
DISPATCH_EMAIL        LEAD_FROM_EMAIL       INVOICE_FROM_EMAIL
NEXT_PUBLIC_SITE_URL  NEXT_PUBLIC_GA_ID     ASSISTANT_MODEL
```

So today: a web lead writes to Supabase, emails the dispatch inbox, and emails
the customer a confirmation. Nothing texts. The review engine has never fired.

Everything below is what is still missing.

---

## Quick reference — what is still needed

| Var | Step | Source |
|---|---|---|
| `TWILIO_ACCOUNT_SID` | Step 1 | console.twilio.com home page |
| `TWILIO_AUTH_TOKEN` | Step 1 | Same page |
| `TWILIO_PHONE_NUMBER` | Step 1 | The number you buy, E.164 |
| `TWILIO_MESSAGING_SERVICE_SID` | Step 2 | Twilio → Messaging → Services |
| `DISPATCH_PHONE` | Step 3 | Whichever mobiles should get lead alerts |
| `GOOGLE_REVIEW_URL` | Step 4 | GBP → Reviews → Share review form |
| `CRON_SECRET` | Step 5 | `openssl rand -base64 32` |
| `LEAD_ESCALATION_MINUTES` | Step 5 | Optional. Defaults to `5,15,30` |

---

## Step 1 — Twilio account + phone number (15 min)

Needs Z and Z's legal business name and **EIN** — Jay has to provide these.

1. Sign up at https://www.twilio.com and verify the account. Add Jordan as admin.
2. Buy a phone number:
   - Phone Numbers → Manage → Buy a number
   - Country US, type Local, area code 510 preferred
   - Capabilities: SMS + MMS + Voice
   - ~$1.15/month
3. Account home page → Account SID + Auth Token

Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`.

> **Do not port (510) 708-4237.** The main business line stays exactly where it
> is. Porting risks downtime and NAP consistency across GBP and every citation,
> for no near-term benefit. When voice work lands we use conditional forwarding
> (forward on no-answer or busy) into the Twilio number instead, which is
> reversible in one setting.

---

## Step 2 — A2P 10DLC registration + Messaging Service

**Carrier review: 1-2 weeks. Do this first, then carry on with everything else
while it sits in the queue.** US carriers require business SMS to be registered.
Skipping it means messages get silently blocked.

1. Twilio Console → Messaging → Regulatory Compliance → A2P 10DLC
2. **Register a Brand** (~$4 one-time + ~$2/month). Approval usually 1-3
   business days.
   - Business legal name exactly as registered, EIN
   - Address: 3057 Teagarden St, San Leandro, CA 94577
   - Industry: Home Services
3. **Create a Campaign** (~$10 one-time + ~$2-10/month). Approval usually 5-10
   business days.
   - Use case: **Mixed** (transactional + marketing)
   - Description: "Post-job customer-service messages. Lead confirmations,
     appointment updates, invoices, and review-request texts sent to customers
     who requested service and opted in to SMS."
   - **Sample messages must match what the code actually sends.** Copy the real
     bodies out of `lib/lead-sms.ts` and `buildReviewRequestBody` in
     `lib/twilio.ts` rather than writing new ones — a mismatch is a common
     rejection reason.
   - Opt-in flow: "Customer opts in via a checkbox on the web booking form.
     Specific consent language is shown next to the checkbox." Consent is
     recorded per phone number in our own `sms_consent` table.
4. **Create a Messaging Service**
   - Messaging → Services → Create new, name "Z and Z Dispatch"
   - Add the phone number from Step 1 to the Sender Pool
   - Attach the Campaign

Set `TWILIO_MESSAGING_SERVICE_SID` (starts with `MG...`).

5. **Wire the inbound webhook.** Phone Numbers → Manage → Active Numbers → your
   number → Messaging → "A message comes in":
   `https://www.zandzplumbing.com/api/webhooks/twilio/inbound` (HTTP POST)

   This handles STOP replies and logs every inbound message.

---

## Step 3 — Dispatch recipients (2 min)

`DISPATCH_PHONE` accepts a **comma-separated list**, same as `DISPATCH_EMAIL`,
so Jay and Seif can both be alerted:

```
DISPATCH_PHONE=5107084237,5105551234
```

US 10-digit is fine; the app normalizes to E.164 and reports any entry it can't
parse rather than silently dropping it.

---

## Step 4 — Google review short link (3 min)

Jay does this from Google Business Profile → Reviews → "Share review form".
Copy the short URL (shape: `https://g.page/r/Cxxxxxxxxxxxxxxx/review`).

Set `GOOGLE_REVIEW_URL`. Without it the review SMS links to a generic search.

---

## Step 5 — Cron secrets + deploy (10 min)

1. Generate: `openssl rand -base64 32` → set `CRON_SECRET` (Production).

   Both crons **fail closed** without it — they return 401 rather than running
   unauthenticated. This is why the review engine has never fired.

2. Settings → Cron Jobs. Two jobs are auto-detected from `vercel.json`:
   - `/api/cron/send-review-requests` — hourly
   - `/api/cron/lead-escalation` — every 5 minutes

3. Optional: `LEAD_ESCALATION_MINUTES` (default `5,15,30`) and
   `LEAD_ESCALATION_ENABLED=off` to disable escalation without touching the cron.

4. Redeploy.

---

## Step 6 — Apply the migrations

Run in the Supabase SQL editor, in order, any that haven't been applied:

- `009_service_catalog.sql` + `supabase/seeds/service_catalog.sql`
- `010_materials.sql` + `supabase/seeds/materials.sql`
- `011_knowledge_docs.sql` + `supabase/seeds/knowledge_docs.sql`
- `012_speed_to_lead.sql`

**009-011 gate the pricebook** — invoice line auto-fill and the assistant's
pricing answers are inert until they're loaded.

**012 gates speed-to-lead.** It adds response-time columns to `jobs`, makes
`review_requests` first-party (it was keyed on a NOT NULL HubSpot deal id, so
with HubSpot gone nothing could create a row), and makes `sms_consent`
first-party.

---

## Step 7 — Test end-to-end (15 min)

Once Twilio is approved and live:

1. **Lead path.** Submit the booking form with the SMS box ticked. Confirm:
   dispatch email arrives, customer confirmation email arrives, dispatch SMS
   reaches every number in `DISPATCH_PHONE`, customer receipt SMS arrives, and a
   `sms_consent` row exists with `consented = true`.
2. **Escalation.** Leave a test lead untouched. Within ~5 minutes the first
   escalation text should arrive. Confirm a second cron run does not re-send the
   same rung.
3. **Response time.** Move the lead out of New. `/admin` should now show a
   median callback figure.
4. **Review engine.** Mark a job complete. Confirm a `review_requests` row with
   `scheduled_send_at` inside the 11am-6pm Pacific window. To test without
   waiting 48 hours, edit `scheduled_send_at` into the past in the Supabase
   table editor, then:
   ```bash
   curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://www.zandzplumbing.com/api/cron/send-review-requests
   ```
5. **Click + opt-out.** Click the link in the review text (check `click_count`
   increments), then reply STOP and confirm the `sms_opt_outs` row appears and
   any pending requests for that number are cancelled.

If something fails, check Vercel function logs for the route, then Twilio →
Messaging → Logs for delivery status and error codes.

---

## Business hours

**Mon-Fri 7:00am-5:00pm Pacific, with 24/7 emergency service.** Confirmed
2026-07-22. Encoded in `lib/time.ts` as `isBusinessHours()`.

This matters operationally: the escalation ladder only chases routine leads
during staffed hours (and starts their clock at 7am if they arrived overnight),
while emergency-flagged leads escalate around the clock.

---

## Who owns what

| Thing | Owner |
|---|---|
| Supabase project, Vercel project, codebase | Asala |
| Resend account | Asala |
| Twilio account + billing | Z and Z (Jay), Asala as admin |
| GoDaddy domain + DNS | Z and Z (Jay) |
| Google Business Profile | Z and Z (Jay) |
| ServiceTitan | Z and Z (Jay) |
| Customer + job data in Supabase | Z and Z owns the data, Asala hosts it |

If Z and Z ever switches agencies, all customer data exports cleanly, because
the database is ours to export rather than a vendor's to withhold.

---

## Troubleshooting

**Cron returns 401**
`CRON_SECRET` is unset or mismatched. Both crons deliberately fail closed in
production rather than run unauthenticated.

**SMS stuck in "queued" forever in Twilio logs**
A2P Campaign not yet approved (by far the most common cause — wait it out), or
the phone number is not in the Messaging Service Sender Pool.

**Customer never receives an SMS**
Check Twilio → Messaging → Logs for the carrier error code. Also confirm the
number isn't in `sms_opt_outs` and that `sms_consent.consented` is true.

**Review texts never send**
Check in order: `CRON_SECRET` set, migration 012 applied, the job actually
reached `complete`/`invoiced`/`paid`, the customer has consent on record, and
the 90-day per-number throttle hasn't already fired.

**Email says "domain not verified"**
`LEAD_FROM_EMAIL` / `INVOICE_FROM_EMAIL` must be on a verified Resend *sending*
domain. Both the root `zandzplumbing.com` and `notifications.zandzplumbing.com`
are verified; the latter is the active config.

**Admin login redirects in a loop**
`SESSION_SECRET` unset or under 32 characters.

**Revenue reads $0**
Expected. Migration 007 intentionally wiped `invoice_history`, so revenue builds
up from jobs invoiced through the OS from that point on.
