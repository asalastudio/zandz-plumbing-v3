# Z and Z OS — Build Plan (consolidated scope)

**Owner:** Jordan / Asala · **Updated:** 2026-06-17

Single source of truth for the "make the OS fully operational + connect communications + replicate ServiceTitan functions" engagement. Consolidates requirements gathered across the 2026-06-17 working session so nothing is lost in chat.

## Locked decisions

- **HubSpot: dropped.** The OS pipeline (Leads → Scheduled → Active) is the single source of truth for sales. No HubSpot wiring.
- **ServiceTitan: replicate, don't just feed.** The OS is being built to replicate ServiceTitan's **invoicing** and **field-dispatch** functions and become the client's own FSM over time. ServiceTitan runs in parallel until parity.
- **Stripe / online card payment: deferred.** Invoices send by email/text with pay-by-call / check / cash. Online card pay-links can bolt on later (`lib/stripe-checkout.ts` already exists) without rework.
- **Email:** Resend, agency account, sending from subdomain `notifications.zandzplumbing.com`. DNS at **GoDaddy**.

## Audit verdict (2026-06-17)

Dashboard is **fundamentally working** — clean TS build, no unguarded admin mutations, no crashing queries, all 11 nav routes resolve, lead capture is resilient. ~70% of the way to "fully operational + all features." Gaps are bounded: a few real defects, comms dormant on credentials + missing flows, and a handful of unbuilt features. Note: migration 007 intentionally wiped `invoice_history`, so revenue/analytics read $0 until new jobs are invoiced through the OS (expected, not a bug — needs an empty-state note).

## Current data reality

- `customers`: name, phone_e164, **email**, **street_address**, city, zip (+ lifetime stats). `jobs`: job_address/city/zip.
- **Emails:** captured on every web lead (required) + admin customers → most records have an email.
- **Addresses:** public booking form collects ZIP only (by design, for mobile conversion); full street address is captured by the admin form / dispatcher at callback. So web-lead records have ZIP + city but blank street until filled. (Live counts pending DB read access — Supabase creds are Sensitive in Vercel.)

---

## Phases

### Phase 0 — Wiring (client + engineer, parallel, no code blockers)
- Resend: verify `notifications.zandzplumbing.com` (GoDaddy SPF/DKIM + DMARC). Set `DISPATCH_EMAIL`, `LEAD_FROM_EMAIL`, `INVOICE_FROM_EMAIL`, `NEXT_PUBLIC_SITE_URL`, `CRON_SECRET`, `GOOGLE_REVIEW_URL`. (`RESEND_API_KEY` already set.)
- Twilio: account + 510 number + **A2P 10DLC** (1–2 wk long pole, start first) → `TWILIO_*`, `DISPATCH_PHONE`. Register inbound + status webhooks.

### Phase 1 — Operational hardening (engineer, no credentials needed)
- Cron `authorize()` fail-closed in production + `CRON_SECRET` (closes open-endpoint hole).
- Timezone: anchor dashboard/dispatch day/week/month math to America/Los_Angeles.
- CSRF/Origin check on all cookie-authed admin mutation POSTs.
- Login rate-limiting/backoff.
- `learning.media_type` allowlist; invoice route gated to job state machine.
- Empty-state banner for post-007 zeroed revenue; cleanup of stale "not yet wired" copy.

### Phase 2 — Branded communications layer ("branded emails for every scenario")
- Shared branded email system `lib/email/` (header, body, CTA, footer w/ NAP + CSLB), brand tokens (#F96302 / black / white), shared escape helpers, no em-dashes.
- Refactor existing dispatch + invoice emails onto the shell.
- New scenario emails, each wired to its trigger:
  - Customer **lead confirmation** (+ out-of-area variant) — *audit gap, highest value*.
  - Appointment **scheduled/confirmed**.
  - **On the way / en route** (optional).
  - Invoice (exists) + invoice **PAID receipt**.
  - **Review request** email fallback (SMS-only today).
- Parallel centralized branded **SMS** templates for the same scenarios.

### Phase 3 — Team + dispatch notifications (Twilio)
- Multi-recipient `DISPATCH_PHONE` (comma list) for team new-lead alerts.
- Per-crew dispatch SMS on assign/schedule (to assigned tech's phone).
- Appointment confirmation SMS to customer; mint `/track` token on schedule/dispatch so customers get a status link independent of billing.
- First-party `sms_consent` ledger write for A2P compliance (now that HubSpot is gone).

### Phase 4 — Invoicing to ServiceTitan parity ("custom invoices, auto-send by email or text")
- Standalone/custom invoice builder (ad-hoc line items, not only job-derived).
- Send channel: email, **SMS (texted secure invoice link)**, or both; auto-send-on-create toggle.
- Service + billing address on invoices.
- PAID receipt (Phase 2) on manual mark-paid or (future) Stripe webhook.

### Phase 5 — Field/dispatch UX
- Drag-and-drop dispatch board.
- Field view as installable PWA; fix before/after photo bug.

---

## Address capture decision (open)
Recommendation: keep the public booking form **ZIP-only** (every required field cuts mobile conversion 5–10%), and capture full service/billing address at the **callback/scheduling** step (already supported by customer + job records). Add an optional address field to the form only if desired. Invoices require address → enforce at invoice creation.
