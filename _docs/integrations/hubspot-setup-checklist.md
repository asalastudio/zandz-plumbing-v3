# HubSpot Starter Setup Checklist

**Date:** 2026-05-11
**Owner:** Jordan (account creation), then handed to Jay/Seif post-launch
**Time required:** ~45 minutes for account + form + workflows
**Cost:** $20/mo Starter tier (locked per PRD decision 4)

This checklist gets HubSpot Starter ready to receive lead submissions from the new site's BookingWidget and contact form. Step-by-step. Every step ends with a verification check.

---

## Step 1 · Create the HubSpot Starter account (10 min)

1. Go to https://www.hubspot.com/products/get-started
2. Sign up with `jordan@asala.ai` (transferable to Jay later). Use the business name "Z and Z Plumbing".
3. Pick the **Marketing Hub Starter + Sales Hub Starter** bundle if offered. Otherwise Marketing Hub Starter alone is enough for v1.
4. Confirm email. Complete the onboarding wizard (industry: "Construction" or "Home Services"; size: 1-5 employees; goal: "Capture leads from website").
5. Set your portal name to "Z and Z Plumbing" under Settings → Account Defaults.

**Verify:** logged in at app.hubspot.com showing the Z and Z Plumbing portal. Note your Portal ID (Settings → Account Defaults → top right, format `12345678`).

---

## Step 2 · Create contact custom properties (10 min)

Settings → Properties → Contact Properties → Create property. Create each of these:

| Property name | Internal name | Type | Field type | Options |
|---|---|---|---|---|
| Zip code | `zip` | Single-line text | Text | n/a |
| Service interest | `service_interest` | Dropdown | Dropdown | sewer-lateral, emergency-plumber, water-heater, drain-cleaning, repipe, hydrojetting, gas-line, leak-detection, water-line, faucet, toilet, garbage-disposal, other |
| Preferred callback time | `preferred_callback_time` | Single-line text | Text | n/a |
| Preferred service date | `preferred_date` | Date picker | Date | n/a |
| Source page | `source_page` | Single-line text | Text | n/a |
| Service address | `service_address` | Single-line text | Text | n/a |
| Is emergency | `is_emergency` | Single checkbox | Checkbox | n/a |
| Message | `message` | Multi-line text | Text area | n/a |

**Verify:** All 8 properties show in the Contact Properties list with the exact internal names. The internal names are case-sensitive and must match what `lib/hubspot.ts` sends.

---

## Step 3 · Create the lead form (10 min)

Marketing → Forms → Create form → "Embedded form".

Form name: **Website Lead - Z and Z Plumbing**

Add fields in this order. All required unless noted:

1. First name (`firstname`, default property)
2. Last name (`lastname`, default property)
3. Email (`email`, default property)
4. Phone (`phone`, default property)
5. Zip code (`zip`, custom property)
6. Service interest (`service_interest`, custom property)
7. Service address (`service_address`, custom property, **not required**)
8. Preferred callback time (`preferred_callback_time`, custom property, **not required**)
9. Preferred service date (`preferred_date`, custom property, **not required**)
10. Message (`message`, custom property, **not required**)
11. Is emergency (`is_emergency`, custom property, **not required**, hidden)
12. Source page (`source_page`, custom property, **not required**, hidden)

Form options:
- Send notification email on submission: yes, to jay@zandzplumbing.com AND seif@zandzplumbing.com (until branded email is set up, use `jordan@asala.ai`).
- Redirect after submission: leave blank (the Next.js app handles the confirmation screen).
- Enable reCAPTCHA: yes.

Save and publish.

**Verify:** open the form's embed code panel. Note the Form ID (format `12345678-abcd-1234-abcd-123456789abc`).

---

## Step 4 · Wire up Next.js with the IDs (2 min)

In your Vercel project (or local `.env.local`):

```
HUBSPOT_PORTAL_ID=<paste the portal ID from Step 1>
HUBSPOT_FORM_ID=<paste the form ID from Step 3>
```

Redeploy.

**Verify:** submit a test lead through the site's contact page. Within 30 seconds the test should appear in HubSpot Contacts.

---

## Step 5 · Create the deal pipeline (5 min)

Sales → Deals → Pipeline settings.

Pipeline name: **Z and Z Plumbing Leads**

Stages, in order:
1. New Lead (deal probability 20%)
2. Contacted (40%)
3. Quoted (60%)
4. Won (100%)
5. Lost (0%)

Add a "Lost reason" required dropdown property to the Lost stage with options: Price, Timing, Went with competitor, Out of service area, No response, Other.

**Verify:** create a test deal and walk it through all 5 stages.

---

## Step 6 · Create Workflow 1: Lead notification (5 min)

Automation → Workflows → Create workflow → "Contact-based" → Start from scratch.

Workflow name: **Notify Jay + Seif on new lead**

Enrollment trigger: contact created where `source_page` is known.

Action 1: Send internal email
- Recipients: jay@zandzplumbing.com, seif@zandzplumbing.com (or jordan@asala.ai until Workspace lands)
- Subject: `New lead: {{firstname}} {{lastname}} - {{service_interest}}`
- Body: include all contact properties, link to the deal, link to the contact record.

Action 2: Create deal
- Pipeline: Z and Z Plumbing Leads
- Stage: New Lead
- Deal name: `{{firstname}} {{lastname}} - {{service_interest}}`

Save and turn on.

**Verify:** submit a real test lead through the site. Check both inboxes received the notification email within 60 seconds. Check the deal was created in New Lead.

---

## Step 7 · Create Workflow 2: Customer confirmation (5 min)

Automation → Workflows → Create workflow → "Contact-based".

Workflow name: **Customer confirmation email**

Enrollment trigger: contact created where `email` is known AND `source_page` is known.

Action 1: Send marketing email (you will need to create the email first under Marketing → Email).

Email subject: `Thanks for reaching out to Z and Z Plumbing`

Email body (suggested):

```
Hi {{firstname}},

Thanks for reaching out. We received your request for {{service_interest}}.

A licensed plumber will call you back within 30 minutes during business hours,
or by 9 AM tomorrow morning if you reached out after hours.

If you can't wait, call us directly at (510) 708-4237. We answer 24/7.

In the meantime, here is what to expect:
1. We will call to discuss your situation and confirm timing.
2. For most jobs we can schedule a same-day or next-day visit.
3. You will get a written quote before any work starts.

Z and Z Plumbing
CSLB #896116 - C-36 + A General Engineering
3057 Teagarden Street, San Leandro, CA 94577
(510) 708-4237
```

Save and turn on.

**Verify:** submit another test lead. Within 2 minutes the test email arrives at the email address you submitted.

---

## Step 8 · (Optional, Phase 2) Workflow 3: Post-job review request

Trigger: deal stage changes to Won.

Action: Send SMS (if HubSpot Starter does not include SMS, this lives in ServiceTitan Marketing Pro instead per the ServiceTitan Path B spec).

Email fallback subject: `Quick favor - leave us a Google review?`

This step is deferred to Phase 2 once Marketing Pro (in ServiceTitan) is confirmed.

---

## Step 9 · Test the full flow end to end

1. Open the production site
2. Click "Schedule" or go to /contact/
3. Fill the BookingWidget with real but throwaway data (use a Gmail alias like `jordan+znztest@asala.ai`)
4. Submit
5. Verify:
   - Confirmation screen shows on the site
   - HubSpot Contact created with all custom property values populated
   - Deal created in New Lead stage
   - Notification email arrives at Jay/Seif's inbox (or Jordan's)
   - Customer confirmation email arrives at the test email
6. Move the test deal through the pipeline stages to verify Workflow logic
7. Delete the test contact and deal once done

---

## Status as of 2026-05-11

- [ ] Step 1: HubSpot Starter account created (PENDING JORDAN)
- [ ] Step 2: 8 custom properties created
- [ ] Step 3: Form created, ID captured
- [ ] Step 4: Env vars wired to Vercel
- [ ] Step 5: Deal pipeline created
- [ ] Step 6: Workflow 1 (notification) created and turned on
- [ ] Step 7: Workflow 2 (confirmation) created and turned on
- [ ] Step 8: Workflow 3 deferred to Phase 2
- [ ] Step 9: End-to-end test passes

---

## Troubleshooting

**Form submissions return 502.** Check `HUBSPOT_PORTAL_ID` and `HUBSPOT_FORM_ID` env vars in Vercel match the values in HubSpot. The Forms API URL is `https://api.hsforms.com/submissions/v3/integration/submit/{portalId}/{formId}`. A 404 means a wrong ID.

**Form submissions succeed but no contact appears.** Check the field internal names exactly match what `lib/hubspot.ts` sends. The internal names are case-sensitive. `service_interest` (correct) vs `Service_Interest` (wrong).

**Notification emails do not arrive.** Workflows can take up to 60 seconds. Confirm the workflow is turned on. Check the workflow run history for errors. If using Jordan's email as a fallback, check spam folders.

**reCAPTCHA blocks legitimate submissions.** Disable reCAPTCHA temporarily to confirm the form is working, then re-enable.
