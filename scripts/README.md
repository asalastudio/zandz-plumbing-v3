# Scripts

One-shot operational scripts. Run from the worktree root.

## Setup (one-time)

Create `.env.local` at the worktree root with:

```
SUPABASE_URL=https://mwxyobjgyxxnlxynfnjg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<the long eyJhbGci... service_role key>
```

Install dependencies from the lockfile:

```
npm install
```

## import-servicetitan-invoices.mjs

Loads a ServiceTitan invoice export into Supabase. Dedupes customers by
normalized name + address, inserts new customer rows, then upserts every
invoice into `invoice_history` linked by customer_id.

**Idempotent** — safe to re-run. Customers are matched by name; invoices
are upserted on `servicetitan_invoice_id`.

```
node scripts/import-servicetitan-invoices.mjs /path/to/invoices.xlsx
```

Prerequisites:
- Migrations `001`, `002`, `003`, `004` applied in Supabase
- `.env.local` populated as above
