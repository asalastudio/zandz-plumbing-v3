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

## reset-admin-password.mjs

Sets a new password for the Z and Z OS (office and field). Prompts for it
twice with hidden input, bcrypt-hashes it, and writes only the hash to
`ADMIN_PASSWORD_HASH` on Vercel production. Use it whenever the password is
lost or someone with access leaves.

```
node scripts/reset-admin-password.mjs
```

Prerequisites:
- Vercel CLI logged in to the Asala team (`vercel whoami`)
- The new password works after the next production deploy

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
