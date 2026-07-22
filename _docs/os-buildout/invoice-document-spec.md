# Invoice + Estimate Document Spec

**Written:** 2026-07-22 · **References:**
- Invoice #8641045 — Bridgetown Construction, $2,650.00 open-trench change order (2 pages)
- Estimate #8642965 — Marcia Hodge, $11,900.00 galvanized-to-copper repipe (3 pages)

The reference PDFs are the format target. This records what we copy, what we
change, and why.

## Invoice and Estimate are two different documents

They share a shell but differ in ways that matter. Do not build one and
parameterize a label.

| | Invoice | Estimate |
|---|---|---|
| Company block top-right | absent | **present** — name, full address, phone |
| Boxed table | INVOICE / INVOICE DATE | ESTIMATE / ESTIMATE DATE |
| Right of JOB ADDRESS | Completed Date, Payment Term | **Job: `<job number>`** |
| Table col 1 header | TASK | **SERVICE** |
| Table col 2 header | DESCRIPTION OF MATERIALS AND EQUIPMENTS | **DESCRIPTION** |
| Totals stack | SUB-TOTAL / TAX / CONTRACT PRICE / BALANCE DUE | pricing carried inside the description |
| Signature | none | **CUSTOMER AUTHORIZATION page** |
| Pages | 2 | 3 |
| Footer | `Invoice #n` | `Estimate #n` |

The company block belongs on both — its absence from the invoice looks like an
oversight in their template, not a decision.

## Estimate signature page

Final page, above the footer:

- `CUSTOMER AUTHORIZATION` — accent color, uppercase, letter-spaced
- Disclaimer paragraph, with three sentences in full caps:
  "THIS IS AN ESTIMATE, NOT A CONTRACT FOR SERVICES." … "THIS IS NOT A
  GUARANTEE OF THE FINAL PRICE OF WORK TO BE PERFORMED."
- `Sign here` label, blank signing space, then a full-width rule
- `Date` label, then a full-width rule

Open question: print-and-sign only, or capture the signature in the OS? The
`/i/[token]` public view already exists and could carry a signature pad, which
would beat asking a customer to print a PDF.

## Decisions (locked with the client 2026-07-22)

| Decision | Value |
|---|---|
| Accent color | **Hero Orange `#F96302`**, not ServiceTitan's muted red. Structure copied exactly; color brought on-brand. |
| Statutory page 2 | **Estimates and change orders only.** A plain invoice for completed work is a bill, not a home improvement contract. |
| Tax | **Always $0.** Keep the TAX row for format fidelity. No schema change. |

## Workflow: estimate first, then invoice

Confirmed by the client 2026-07-22. The customer is sent an **estimate**, signs
it, the work happens, and only then does an **invoice** follow.

The OS does not model this today — there is only an `invoices` table. Building
the estimate as a document template alone would miss the point: an estimate is a
record with its own lifecycle (draft → sent → signed → converted), and the
invoice should be derivable from the signed estimate rather than retyped.

Implication for Track C: `estimates` is a first-class object, and "convert
estimate to invoice" is the operator action that ties the two together.

## Payment schedules must respect the statutory downpayment cap

The reference estimate totals $11,900.00 with a **$1,000.00** deposit. That is
not a round number chosen for convenience — California caps the downpayment on a
home improvement contract at **$1,000 or 10% of the contract price, whichever is
less**. Ten percent of $11,900 is $1,190, so $1,000 is the binding limit, and
page 2 of the invoice reference states the rule verbatim.

Any AI-generated or operator-entered payment schedule must enforce
`deposit <= min(1000_00, round(total * 0.10))` and refuse to exceed it. A
generated 20% deposit would be a compliance defect, not a formatting one.

Observed schedule shape:

```
Total Project Cost: $11,900.00
Payment Schedule
  • Deposit (Start of Project): $1,000.00
  • At project Start           $5,000.00
  • Final Payment (Upon Completion): $5,900.00
```

## Estimate description block

Richer than the invoice's. Observed structure, with bold on every label:

```
Customer: Marcie Hodge
Property Address: 1472 66th Avenue Oakland, CA

Estimate
Remove all existing galvanized water supply piping and replace it with new
high-flow copper water lines to improve water pressure throughout the home
and all fixtures.

Scope of Work
  • Remove existing galvanized water supply piping.
  • Install new high-flow copper water lines throughout the residence.
  • Open only the minimum amount of drywall/sheetrock necessary to access
    and install the new piping.
  • Install a new upgraded shower/tub valve during the repiping process.
  • Complete all required plumbing connections, testing, and cleanup.
  • All labor and materials are included.

Project Duration: Approximately 2 working days.

Total Project Cost: $11,900.00
Payment Schedule
  • ...
```

Note the source PDF contains run-together words ("water linesthroughout",
"amount ofdrywall/sheetrock") from ServiceTitan's text handling. Do not
reproduce these — they are defects, not house style.

## Page 1 layout

Top to bottom, matching the reference:

1. **Logo**, top-left, roughly 165px wide.
2. **BILL TO** block — label in small bold caps, then customer name, street,
   `city, ST zip USA`.
3. **Boxed INVOICE / INVOICE DATE table**, right-aligned, thin border, two
   cells. Labels in accent caps; the invoice number itself in accent color.
4. **Centered document title** — "Home Improvement Contract" on estimates,
   "Invoice" on plain invoices.
5. **Two-column band** — JOB ADDRESS on the left; Completed Date and
   Payment Term on the right.
6. **Line-item table** with a hairline above and below. Columns:

   | TASK | DESCRIPTION OF MATERIALS AND EQUIPMENT | QTY | PRICE | TOTAL |
   |---|---|---|---|---|

   Headers in accent color, uppercase, letter-spaced ~0.08em. TASK is normally
   "Service". QTY/PRICE/TOTAL right-aligned.
7. **Totals stack**, right-aligned: SUB-TOTAL, TAX, CONTRACT PRICE, then
   **BALANCE DUE** in accent color and bold.
8. **Footer rule** with `Invoice #<n>` left and `Page N of M` right.

Note the reference header reads "EQUIPMENTS" — a ServiceTitan template typo.
We use "EQUIPMENT".

## The description block

This is the part worth getting right — it is what makes the document read as
professional rather than as a line on a receipt. Structure observed:

```
-Change Order Request Invoice-
The original proposal included a trenchless sewer repair/replacement method.
Due to site conditions, the work will now require **open trench excavation**
to complete the sewer line replacement and maintain proper flow from the
residence to the city sewer main.
The following work is included:
  • Perform open trench excavation as required.
  • Expose existing sewer line.
  • Remove and replace the affected sewer piping.
  • Install new piping with proper grade to ensure correct flow.
  • Backfilled and compacted trench upon completion.
  • Disposed of excavated materials and debris.
  • Restored the work area to a rough grade.
Status of work: Complete
```

So: optional dashed banner line → context paragraph with inline bold on the
key change → "The following work is included:" → bullets, each a complete
sentence ending in a period → status line.

`service_catalog.description` already holds multiline scope text and already
renders with line breaks in the invoice email, `/i/[token]`, and the job page.
The AI scope generation (C3) should produce exactly this shape.

## Data mapping

| Document field | Source |
|---|---|
| BILL TO | `customers.name / street_address / city / state / zip` |
| JOB ADDRESS | `jobs.job_address / job_city / job_zip` |
| Invoice # | `invoices.id` (see numbering below) |
| Invoice date | `invoices.created_at` |
| Completed date | `jobs` completion timestamp |
| Line items | `invoices.line_items` jsonb — `{description, qty, unit_price_cents, total_cents}` |
| Sub-total / Contract price / Balance due | `invoices.amount_cents` less payments |
| Status of work | `jobs.status` |

## Known gaps to close

- **No `state` column on `jobs`.** Job addresses render without a state. Default
  to CA or add the column.
- **No invoice numbering scheme.** `invoices.id` starts near 1, which looks
  amateur beside ServiceTitan's `8641045`. Seed the sequence at an offset
  (e.g. start at 1000) or prefix as `ZZ-1042`.
- **No approximate start / complete dates.** Page 2 of the reference requires
  both; needed before estimates can carry the statutory block.
- **Payment Term is not stored.** Reference shows "Due Upon Receipt". Hard-code
  until there are real terms.

## Statutory page 2 — do not paraphrase

Page 2 reproduces California B&P Code §7159 home-improvement-contract
disclosures: the change-order paragraph, the $1,000-or-10% downpayment cap, the
performance-and-payment-bond notice, and the CSLB consumer information block.

**This text must be sourced verbatim** from ServiceTitan or CSLB, not
transcribed from a rendered PDF. Extraction from a render silently drops and
substitutes characters, and in statutory language a lost negation changes the
legal meaning. Pending client-supplied raw text before estimates ship.
