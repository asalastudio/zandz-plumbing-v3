# Z and Z OS · Wiring Guide

Everything in this codebase is built. This doc is the step-by-step for setting
up the third-party accounts and pasting credentials so it all comes alive.

**Time to complete: ~90 minutes of focused setup, then 1-2 weeks of waiting
on Twilio's A2P 10DLC carrier review.**

Anything not in this guide is already done in code. The order below matters
because some steps produce keys that the next step needs.

---

## Quick reference — every env var

Set every one of these in:

1. `.env.local` for local dev (copy from `.env.example`)
2. Vercel project → Settings → Environment Variables (for production)

| Var | Step | Source |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | done | Hardcoded `https://zandzplumbing.com` |
| `ADMIN_PASSWORD_HASH` | Step 1 | bcrypt hash, generate locally |
| `SESSION_SECRET` | Step 1 | `openssl rand -base64 48` |
| `SUPABASE_URL` | Step 2 | Supabase project → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Step 2 | Same screen, the `service_role` key |
| `HUBSPOT_PORTAL_ID` | Step 3 | HubSpot → Settings → Account |
| `HUBSPOT_FORM_ID` | Step 3 | HubSpot → Marketing → Forms (after creating) |
| `HUBSPOT_PRIVATE_APP_TOKEN` | Step 3 | HubSpot → Integrations → Private Apps |
| `HUBSPOT_WEBHOOK_SECRET` | Step 4 | Generated when creating the Workflow action |
| `TWILIO_ACCOUNT_SID` | Step 5 | console.twilio.com home page |
| `TWILIO_AUTH_TOKEN` | Step 5 | Same page |
| `TWILIO_MESSAGING_SERVICE_SID` | Step 6 | Twilio → Messaging → Services |
| `TWILIO_PHONE_NUMBER` | Step 5 | The number you bought, E.164 |
| `GOOGLE_REVIEW_URL` | Step 7 | GBP → Reviews → Share review form |
| `CRON_SECRET` | Step 8 | `openssl rand -base64 32` |

---

## Step 1 — Admin password (5 min)

This is the password Jay types to log into Z and Z OS.

```bash
# In any terminal, generate the bcrypt hash:
node -e "console.log(require('bcryptjs').hashSync('REPLACE_WITH_REAL_PASSWORD', 10))"
```

Copy the output (starts with `$2b$10$...`) and set:

- `ADMIN_PASSWORD_HASH=<the hash>`

Also generate a session signing secret:

```bash
openssl rand -base64 48
```

Set:

- `SESSION_SECRET=<the random string>`

Both vars need to go in `.env.local` AND Vercel env. Add to all three Vercel
environments (Production, Preview, Development).

---

## Step 2 — Supabase project (15 min)

The database. Free tier covers Z and Z's volume.

1. Go to https://supabase.com → New Project
2. Name: `zandz-os` (or anything)
3. Database password: generate, save in 1Password
4. Region: `us-west-1` (closest to East Bay)
5. Plan: Free
6. Wait ~2 min for provisioning

**Get the keys:**

7. Project → Settings → API
8. Copy **Project URL** → `SUPABASE_URL`
9. Copy **service_role** key (NOT anon key) → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ The service_role key bypasses Row Level Security. NEVER expose it to the
browser. The code only uses it server-side.

**Run the migrations:**

10. Open project → SQL Editor → New Query
11. Paste the contents of `supabase/migrations/001_sms_review_automation.sql`
12. Run
13. New Query, paste `supabase/migrations/002_fsm_core.sql`, run
14. Verify in Table Editor: you should see `sms_consent`, `review_requests`,
    `sms_log`, `sms_opt_outs`, plus the Phase 2 tables (`crew`, `customers`,
    `jobs`, `invoices`, etc.)

---

## Step 3 — HubSpot Starter (20 min)

CRM + lead form + workflow trigger.

1. Sign up for HubSpot Starter at https://www.hubspot.com (~$20/mo Marketing+CRM)
2. Use `jordan@asala.ai` (transfer ownership to Jay later via HubSpot User
   Management)

### Create the booking form

3. Marketing → Forms → Create form → Regular form
4. Form name: "Z and Z · Web Booking"
5. Fields (drag from sidebar):
   - First name (required)
   - Last name (required)
   - Email (required)
   - Phone (required)
   - ZIP code → custom property `zip_code` (text)
   - Service interest → custom property `service_interest` (dropdown):
     General Plumbing, Clogged Drain, Toilet, Emergency, Gas Line, Sewer
     Lateral, Water Heater, Repipe, Hydrojetting, Other
   - Preferred callback time → custom property (single-line text)
   - Brief description → custom property (multi-line text)
   - Source page → custom property (single-line text, hidden)
   - **SMS consent** → custom property `sms_consent` (single checkbox):
     label "OK to text me about my service · Reply STOP to opt out"
6. Settings → Submit text: "Get a Quote"
7. Publish. Get the form ID from the URL (`/forms/<portalId>/<formId>`)

Set:
- `HUBSPOT_PORTAL_ID=<from your URL>`
- `HUBSPOT_FORM_ID=<from your URL>`

### Create the Private App token

8. Settings → Integrations → Private Apps → Create private app
9. Name: "Z and Z OS"
10. Scopes (Standard tab):
    - `crm.objects.contacts.read`
    - `crm.objects.deals.read`
    - `crm.schemas.deals.read`
11. Create app → Show token

Set:
- `HUBSPOT_PRIVATE_APP_TOKEN=<the token>`

### Create the custom contact property `sms_consent`

12. Settings → Properties → Contact properties → Create property
13. Label: "SMS consent" · Internal name: `sms_consent` · Field type: Single
    checkbox

This is the boolean we check before scheduling a review SMS. Form submissions
will write to this. Manual contacts default to false (no consent).

### Create the deal stage "Won" (if not present)

14. Settings → Objects → Deals → Pipelines
15. Default pipeline → ensure there is a stage with label "Closed won"
    (HubSpot Starter ships with this). The internal name is `closedwon`.

### Build the booking-form pipeline (optional Sprint 2)

For Sprint 1 launch we use click-to-call. The booking form ships in Sprint 2.
When it ships, every form submission should create a contact + deal in the
"New Lead" stage.

---

## Step 4 — HubSpot Workflow → review-request webhook (10 min)

This is the trigger that fires the SMS engine when Jay marks a deal Won.

1. Marketing → Workflows → Create workflow → Start from scratch → Deal-based
2. Name: "Z and Z OS · Review request trigger"
3. Trigger: Deal property change → Deal stage → is `Closed won`
4. Add action: Send a webhook (under "External communications" or the
   integrations panel)
5. Method: POST
6. URL: `https://zandzplumbing.com/api/webhooks/hubspot` (or your Vercel
   preview URL during testing — use the prod URL once you flip DNS)
7. Authentication: Generate a signing secret (HubSpot will offer this).
   Copy the secret.
8. Save the workflow

Set:
- `HUBSPOT_WEBHOOK_SECRET=<the signing secret>`

9. Turn the workflow ON. Test by manually moving a test deal to Closed Won.
   Check the Z and Z OS admin → Reviews page. You should see a new row in
   the "Pending" section.

---

## Step 5 — Twilio account + phone number (15 min)

1. Sign up at https://www.twilio.com — use Z and Z's business name and EIN
   (Jay needs to provide). Verify the account.
2. Buy a phone number:
   - Phone Numbers → Manage → Buy a number
   - Country: US, Number type: Local, Area code: 510 (East Bay) preferred
   - Capabilities: SMS + MMS + Voice
   - Cost: ~$1.15/month
3. Get the credentials:
   - Account home page → Account SID + Auth Token

Set:
- `TWILIO_ACCOUNT_SID=<the SID>`
- `TWILIO_AUTH_TOKEN=<the token>`
- `TWILIO_PHONE_NUMBER=<the number in E.164, e.g. +15105551234>`

---

## Step 6 — A2P 10DLC registration + Messaging Service (carrier review: 1-2 weeks)

US carriers require business SMS to be registered. Required for every
production SMS. **Skipping this means messages get blocked.**

1. Twilio Console → Messaging → Regulatory Compliance → A2P 10DLC
2. Register a Brand:
   - Business legal name: as on Z and Z's business registration
   - EIN: Jay provides
   - Business address: 3057 Teagarden St, San Leandro, CA 94577
   - Industry: Home Services
   - Submit. ~$4 one-time + ~$2/month
3. Wait for Brand approval (1-3 business days typically)
4. Create a Campaign:
   - Use case: "Mixed" (transactional + marketing)
   - Description: "Post-job customer-service messages. Review-request texts
     sent to customers who completed a service and opted in to SMS."
   - Sample messages (paste the actual body from `lib/twilio.ts`):
     ```
     Hi Maria, this is Seif at Z and Z Plumbing. Thanks for having us out
     for sewer lateral. If we did right by you, would you leave us a quick
     Google review? It really helps the crew.
     
     https://zandzplumbing.com/r/abc123
     
     Reply STOP to opt out.
     ```
   - Opt-in flow: "Customer opts in via web form checkbox when booking
     service. Specific consent language is shown next to the checkbox."
   - Submit. ~$10 one-time + ~$2-10/month
5. Wait for Campaign approval (5-10 business days typically)
6. Create a Messaging Service:
   - Messaging → Services → Create new
   - Friendly name: "Z and Z Review Engine"
   - Use case: Marketing
   - Add the phone number from Step 5
   - Attach the Campaign you just created
7. Copy the Messaging Service SID (starts with `MG...`)

Set:
- `TWILIO_MESSAGING_SERVICE_SID=<the MG... SID>`

### Wire the inbound webhook

8. Phone Numbers → Manage → Active Numbers → click your number
9. Messaging configuration → "A message comes in" →
   Webhook: `https://zandzplumbing.com/api/webhooks/twilio/inbound`
   HTTP POST
10. Save

This is what handles STOP replies and conversation logging.

---

## Step 7 — Google review short link (3 min)

1. Sign in to Google Business Profile (Jay does this).
2. Reviews → "Share review form"
3. Copy the short URL (looks like `https://g.page/r/Cxxxxxxxxxxxxxxx/review`)

Set:
- `GOOGLE_REVIEW_URL=<the URL>`

This is where the review-request SMS link sends customers.

---

## Step 8 — Vercel: env vars + cron + deploy (10 min)

1. Open the Vercel project (`zandz-plumbing-v3`).
2. Settings → Environment Variables. Add EVERY var from `.env.local` to all
   three environments (Production, Preview, Development).
3. Generate a cron secret:
   ```bash
   openssl rand -base64 32
   ```
   Add as `CRON_SECRET` (Production only).
4. Settings → Cron Jobs. You should see one job:
   `/api/cron/send-review-requests` — every hour (`0 * * * *`).
   This was auto-detected from `vercel.json`.
5. Trigger a redeploy: Deployments → ⋯ → Redeploy. Or push to git.
6. Once deployed, hit `https://zandzplumbing.com/admin/login` and sign in
   with the password you set in Step 1.

---

## Step 9 — Test end-to-end (15 min)

You now have everything wired. Test:

1. **Manually create a test deal in HubSpot:**
   - Deal name: "TEST · do not bill"
   - Associate with a contact that has YOUR phone number and `sms_consent = true`
   - Move the deal to "Closed Won"
2. **Within ~10 seconds:**
   - Vercel function logs (Logs tab) should show the HubSpot webhook hit
     `/api/webhooks/hubspot` with 200
   - Z and Z OS → Admin → Reviews → "Pending" should show the new row
3. **Force send (don't wait 48 hours for the test):**
   - Open the Pending row in Supabase Table Editor
   - Edit `scheduled_send_at` to a time in the past (e.g., yesterday)
4. **Trigger the cron manually:**
   ```bash
   curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
        https://zandzplumbing.com/api/cron/send-review-requests
   ```
   Or wait up to 1 hour for it to fire on its own.
5. **You should receive the SMS on your phone.**
6. **Click the link** — you should land on the Google review form, and the
   admin → Reviews → "Sent" row should show "1× clicked".
7. **Reply STOP** to the SMS — confirm:
   - You should not receive any further messages
   - Admin → Reviews → "Opted out" should show the row
   - `sms_opt_outs` table in Supabase has your number

If any step fails, check:
- Vercel function logs for the relevant route
- Twilio console → Messaging → Logs for delivery status
- HubSpot Workflow → "View history" for webhook delivery

---

## Step 10 — Train Jay + Seif (5 min, after Step 9 passes)

1. Walk them through `https://zandzplumbing.com/admin` on Jay's phone.
2. Save it to home screen (Safari → Share → Add to Home Screen).
3. Explain the workflow:
   - When a job is complete, they move the HubSpot deal to "Closed won".
   - The review SMS auto-sends 48 hours later, between 11am and 6pm PT.
   - They never have to remember to ask for a review again.
4. Show them where to check progress: Admin → Reviews.

---

## What I (Asala) own vs what Jay owns

| Thing | Owner |
|---|---|
| Supabase project, Vercel project, codebase | Asala |
| HubSpot account, billing | Z and Z (Jay) |
| Twilio account, billing | Z and Z (Jay), with Asala as admin |
| GoDaddy domain | Z and Z (Jay) |
| Google Business Profile | Z and Z (Jay) |
| Customer + job data in Supabase | Z and Z owns the data, Asala hosts it |

This separation matters: if Z and Z ever decides to switch agencies, all of
their customer data exports cleanly because we own the database we built.

---

## Sprint 3 — what unlocks once Phase 1 is producing reviews

The same `crew`, `customers`, `jobs`, `invoices` tables are already created
in Supabase (migration 002). When you're ready to ship the dispatch board +
jobs + invoicing, the schema is waiting.

Specific work that will happen in Sprint 3:
- `/admin/dispatch` — drag-and-drop today's jobs onto crew + timeslots
- `/admin/jobs` and `/admin/jobs/[id]` — full job CRUD with HubSpot sync
- `/admin/customers` — customer list with HubSpot cross-reference
- Tech PWA — mobile dispatch view with photo upload + status updates
- Stripe Payment Links for invoicing
- Customer status tracking page at `/track/[token]`

Then ServiceTitan goes away.

---

## Troubleshooting

**HubSpot webhook returns 401**
Signature mismatch. Verify `HUBSPOT_WEBHOOK_SECRET` matches exactly what
HubSpot generated when you saved the workflow action.

**Cron doesn't fire**
- Vercel free tier: only 2 cron runs per day. Z and Z's project is on Pro,
  so hourly works. Confirm under Settings → Plan.
- Cron auth fails: check Vercel logs for "Unauthorized". The `CRON_SECRET`
  env var must match.

**SMS goes to "queued" forever in Twilio logs**
- A2P 10DLC Campaign not yet approved (most common — wait it out).
- Phone number not attached to the Messaging Service.
- Check Twilio → Messaging → Services → your service → Sender Pool.

**Customer doesn't receive SMS**
- Carrier rejected. Check Twilio → Messaging → Logs → error code.
- Most common cause: A2P registration not complete. Wait for approval.

**Admin login redirects in a loop**
- `SESSION_SECRET` not set or too short (<32 chars). Check env.

**Google review link goes to weird Google search results**
- `GOOGLE_REVIEW_URL` not set. Falls back to a generic search. Set the real
  short URL from GBP.
