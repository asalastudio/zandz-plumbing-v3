# ServiceTitan Integration Spec — Path B (Manual Workflow)

**Date:** 2026-05-11
**Locked decision:** Z and Z is on ServiceTitan **Essentials** (per Jordan, 2026-05-11). Essentials does NOT include API access (API is The Works tier only). Path B is the manual workflow.
**Owner:** Jay + Seif execute the manual workflow. Jordan / Asala builds the supporting tooling.

---

## How the lead flows in Path B

1. **Customer submits the booking widget** on zandzplumbing.com (the Next.js site)
2. **Next.js API route `/api/lead`** posts to HubSpot Starter via the Forms API
3. **HubSpot creates a Contact + Deal** in the "New Lead" stage
4. **HubSpot Workflow 1 fires** and sends a notification email to Jay and Seif with all lead details and links to the deal
5. **Jay or Seif** reads the email, calls the customer back, then **manually enters the job** into ServiceTitan
6. **Jay or Seif** moves the HubSpot deal stage from "New Lead" to "Contacted" once they have called
7. When the job completes, **ServiceTitan Marketing Pro** fires the post-job review-request SMS (assuming Marketing Pro is included in the Essentials subscription, see "To confirm" below)
8. Jay or Seif moves the HubSpot deal to "Quoted" when the quote is sent, then to "Won" or "Lost" at job completion

---

## To confirm with Jay or ServiceTitan account manager (BEFORE launch)

**Is Marketing Pro included in the current Essentials subscription?**

Marketing Pro is normally bundled with Essentials tier but tier compositions occasionally shift. Confirmation matters because Marketing Pro is what powers the post-job SMS review-request automation.

How to check:
1. Log into ServiceTitan
2. Settings → Subscription (or Account → Plan)
3. Look for "Marketing Pro" in the included modules list

If yes: the review-request SMS flow is ready to configure in Phase 2.

If no: HubSpot Starter Workflow 3 sends a review-request email as the fallback (less effective than SMS but functional). Or upgrade ServiceTitan plan if review velocity becomes the priority lever.

---

## Manual workflow runbook (for Jay and Seif)

### When a new lead notification email arrives

The email contains:
- Customer name, phone, email
- Zip code and (optional) service address
- Service interest
- Preferred callback time and date
- Brief description
- Is-emergency flag
- Link to the HubSpot deal

### Step 1: Call the customer back

- **If emergency:** within 30 minutes max, ideally inside 10 minutes.
- **If "Today" or "ASAP":** within 30 minutes during business hours, by 9 AM next morning otherwise.
- **If "Tomorrow morning":** call back by end of today.
- **If "This week" or "Flexible":** call back within 4 business hours.

### Step 2: Move the HubSpot deal to "Contacted"

Open the deal from the email link. Click the stage dropdown. Move to "Contacted". HubSpot auto-logs the timestamp.

### Step 3: Enter the job in ServiceTitan

ServiceTitan → Customers → New Customer (or Find Customer if returning).

Required fields:
- First name, last name (from email)
- Phone (from email)
- Email (from email)
- Service address (from email, or capture during callback)
- City and zip (from email)

Then: Create a Job for the new or existing customer.

Job fields:
- Job type: pick the closest match to the service interest (sewer lateral, drain cleaning, water heater, etc.)
- Priority: Emergency (red), Same-day, or Scheduled
- Time slot: based on the callback conversation
- Notes: paste the brief description from the lead notification email
- Source: "Website lead" (create this campaign source in ServiceTitan if it does not exist)

### Step 4: Move the HubSpot deal to "Quoted" after the quote is sent

Same dropdown, move to "Quoted". The HubSpot Quoted stage represents that a written quote has been delivered to the customer.

### Step 5: Move the HubSpot deal to "Won" or "Lost" at job conclusion

- **Won:** deal probability 100%. Triggers any post-deal-won workflows.
- **Lost:** select the lost reason (Price, Timing, Went with competitor, Out of service area, No response, Other).

---

## What we lose vs Path A (full API)

| Capability | Path A (API) | Path B (manual) |
|---|---|---|
| Automatic ServiceTitan job creation | Yes (instant) | No (manual entry, 2 to 3 min per lead) |
| Real-time availability in booking widget | Yes (pulled from ServiceTitan Dispatch) | No (booking widget shows date input only, real time confirmed by Jay/Seif on the callback) |
| Two-way sync of deal stage with job status | Yes (webhook-driven) | No (Jay/Seif manually moves both) |
| Post-job review SMS automation | Yes (via ServiceTitan Marketing Pro, if on plan) | Same (depends on Marketing Pro, not on API) |
| Customer-facing online scheduling | Limited (real availability shown) | No (date is a preference, not a booking) |

Path B is acceptable for v1 because:
- Z and Z is doing ~20 to 60 leads per month early on. Manual entry is sustainable at that volume.
- The HubSpot Starter pipeline handles all the funnel tracking we need.
- Marketing Pro (if confirmed on plan) handles the review-request SMS regardless of API status.

Path A becomes worth the ServiceTitan upgrade cost when:
- Lead volume exceeds 200+/month and manual entry becomes a bottleneck
- The booking widget needs to show real availability windows
- Multi-touch attribution requires deal-status feedback into HubSpot

---

## Path A migration plan (Phase 2 or later)

When Z and Z upgrades to ServiceTitan The Works:

1. Generate API credentials in ServiceTitan Settings → Integrations → API
2. Set env vars in Vercel: `SERVICETITAN_TENANT_ID`, `SERVICETITAN_APP_KEY`, `SERVICETITAN_CLIENT_ID`, `SERVICETITAN_CLIENT_SECRET`
3. Implement OAuth 2.0 client-credentials flow in `lib/servicetitan.ts`
4. Add `createJob(leadData)` endpoint and wire to HubSpot deal-created webhook
5. Add `getAvailability(date, serviceType)` for booking widget
6. Add ServiceTitan webhook listener `app/api/webhooks/servicetitan/route.ts` to push job-status updates back into the HubSpot deal

The Next.js codebase already includes a stub at `lib/servicetitan.ts` placeholder that documents the Phase A signatures.

---

## Status as of 2026-05-11

- [x] Plan tier confirmed as Essentials (Jordan, 2026-05-11)
- [x] Path B chosen and locked in PRD
- [ ] **Marketing Pro inclusion confirmed (PENDING JAY)**
- [ ] HubSpot Workflow 1 (notification) built and tested → see `hubspot-setup-checklist-2026-05-11.md`
- [ ] Jay and Seif trained on the manual workflow runbook above
- [ ] First end-to-end test lead processed manually
- [ ] Path A migration triggered when ServiceTitan upgrades (Phase 2 decision)
