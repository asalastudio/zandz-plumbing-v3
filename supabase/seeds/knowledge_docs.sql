-- Z and Z OS · seed the assistant's first knowledge doc with the operator SOP.
-- Apply 011_knowledge_docs.sql first. Idempotent (skips if the title exists).
set search_path = public;

insert into knowledge_docs (title, category, body, active)
select 'Operator Playbook (SOP)', 'SOP', '# Z and Z OS — Operator Playbook (SOP)

**The big idea:** every customer moves in ONE direction —

> **New lead → Scheduled → Work done → Invoiced → Paid**

Your job is to keep each one moving down that line, and never let one get stuck.

Sign in at **zandzplumbing.com/admin**.

---

## Your daily routine (5 minutes, every morning)

1. Open the **Dashboard** — it''s the first screen.
2. **Lead Inbox** (orange box at the top) = new customers who just reached out. **Call them first** — tap the orange **Call** button right on the card. Speed wins jobs.
3. **"Ready to invoice"** tile = finished jobs that need a bill. Send them.
4. **"Open balance"** tile = money customers still owe. Follow up.
5. **Dispatch** = today''s scheduled jobs. Make sure crews know where they''re going.

The dashboard tiles are **clickable** — tap one to jump straight to that list.

---

## The 6 steps: from lead to getting paid

**1. A lead comes in.**
New website requests land in the **Lead Inbox** (Dashboard) and under **Leads**. Each one is automatically created as a job marked **New**.

**2. Call the customer — fast.**
Tap **Call** on the lead card. The phone number is right there. (Faster you call, more jobs you win.)

**3. Schedule it.**
Open the job → use the **Schedule** block → pick a date and time → the job becomes **Scheduled**. Assign a crew member if you know who''s going.

**4. The work gets done.**
The technician updates status from the **Field** app on their phone: **En route → On site → Complete**. (You can also do this from the job page on the desktop.)

**5. Send the invoice.**
⚠️ **The job must be marked _Complete_ first.** The system won''t let you invoice before that — on purpose, so we never bill for unfinished work.
- Open the job → **Create invoice**.
- In each line, **search the pricebook** and pick the service (type "water heater" → pick **H6110**). The description and price **fill in automatically** — never type them by hand.
- Make sure the **right customer** is attached — search and pick the existing one.
- Keep **Email the invoice** checked → click **Create invoice**. It''s sent.

**6. Get paid.**
When the customer pays, open the invoice → **Mark paid** → choose the method (cash / check / card / Zelle). The job becomes **Paid**. Done. 🎉

---

## Creating an invoice — the screen that matters most

1. From a **Complete** job, click **Create invoice** (or use **New invoice** on the dashboard for a one-off bill).
2. **Customer:** search and pick the existing customer. If a match pops up, **use it** — don''t create a second "John Smith."
3. **Line items:** search the **pricebook** → pick the code → description + price auto-fill → set the quantity → **Add line** for more work.
4. **Send:** keep "Email the invoice" checked → **Create invoice**.
5. **Made a mistake?** Delete the invoice from the Invoices list or the job card. (Only for test/wrong invoices — never real ones.)

---

## Golden rules (this is how we avoid mistakes)

1. **Call new leads immediately.** The orange inbox is money waiting.
2. **A job must be COMPLETE before you can invoice it.** Can''t find the invoice form? The job isn''t marked complete yet.
3. **Always pick the customer from search.** One person = one record. Never create a duplicate.
4. **Use the pricebook — don''t type descriptions.** Pick the code; the scope of work and price are already written for you.
5. **Mark paid the moment money comes in**, and record how they paid. That''s how the books stay right.
6. **Only delete test or wrong invoices.** Real ones stay forever.

---

## Where everything lives (your map)

| Menu | What it''s for |
|------|----------------|
| **Dashboard** | Start here. Leads, quick actions, and the numbers that need attention. |
| **Leads** | The pipeline — new, scheduled, and active work. |
| **Dispatch** | Today''s schedule, by crew. |
| **Field** | The phone app for techs out on the job. |
| **Jobs** | Every job. Filter by status (New, Complete, Paid, etc.). |
| **Invoices** | Every invoice — create, send, mark paid, delete. |
| **Customers** | The customer directory and each one''s history. |

---

*If a job ever feels "stuck," check its status — it''s always sitting at one of these stages: New → Scheduled → En route → On site → Complete → Invoiced → Paid. Move it to the next one.*', true
where not exists (select 1 from knowledge_docs where title = 'Operator Playbook (SOP)');
