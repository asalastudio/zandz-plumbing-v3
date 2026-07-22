# Z and Z Plumbing v3

**This folder is self-contained.** Everything an IDE agent needs to ship the new zandzplumbing.com lives here.

**Date locked:** 2026-05-11
**Stack:** Next.js 16 (App Router) + React 19 + Tailwind v4 + TypeScript + Vercel
**Status:** Design language locked (Path C). Implementation in progress.

---

## What this folder is

`Z&Zplumbing-v3/` is the canonical working directory for the v3 build. v2 (at `../Z&Zplumbing-v2/`) was the first React implementation that proved out the architecture; v3 is the locked-design version that will ship to production.

**Key v3 lock-ins** (do not re-litigate):
- Design reference: `_docs/design-reference/locked-homepage-mockup.html`
- Typography: **Inter only** (Barlow Condensed and JetBrains Mono dropped)
- Icons: **lucide-react** (npm package, replaces in-house SVG components)
- Buttons: `rounded-none` (sharp corners), hover lift `-translate-y-0.5 + shadow-lg`
- Cards: `rounded-2xl`, hover lift `-translate-y-1 + orange border swap`
- Hero: light gray `#F5F5F5` background (not black), H1 in `font-semibold` (not bold)
- Logo: orange `w-10 h-10` box with white Droplet lucide icon until refined SVG ships

---

## Where to start

**Read `_docs/00-START-HERE.md` first.** It's the doc index and orientation map. Everything else flows from there.

The IDE kickoff prompt is at `_docs/kickoff-prompt.md`. Paste that into a fresh Claude Code session at this folder root.

---

## Folder tour

```
Z&Zplumbing-v3/
├── README.md                    # You are here
├── generated-page.html          # The locked v3 homepage mockup (also at _docs/design-reference/)
├── _docs/                       # All build docs (self-contained, doesn't depend on ../00_Project Brain/)
│   ├── 00-START-HERE.md         # READ FIRST. Doc index and orientation.
│   ├── kickoff-prompt.md        # IDE kickoff prompt
│   ├── prd/                     # Locked PRD with 12 implementation steps
│   ├── brand-package/           # 9 brand docs (colors, type, voice, design system, design reference)
│   ├── seo/                     # GSC baseline, keyword priority, URL migration map, redirects, citation audit
│   ├── content-drafts/          # Page copy drafts (Plumber Oakland, Sewer Lateral Oakland, etc.)
│   ├── integrations/            # ServiceTitan Path B spec (HubSpot checklist superseded)
│   ├── os-buildout/             # OS build plan + speed-to-lead / comms plan
│   ├── strategy/                # Business truth, roadmap, credentials, transition plan
│   └── design-reference/        # The locked homepage mockup (visual source of truth)
└── (Next.js app folders ship here as the IDE agent builds them)
```

When the IDE agent starts the build, it will create `app/`, `components/`, `content/`, `lib/`, `public/`, `package.json`, `tsconfig.json`, `next.config.ts`, `.env.example`, and the usual Next.js scaffolding alongside the existing `_docs/` folder.

---

## Quick links

- **Locked mockup:** `_docs/design-reference/locked-homepage-mockup.html`
- **PRD:** `_docs/prd/prd.md`
- **Business truth (canonical facts):** `_docs/strategy/business-truth.md`
- **Brand README:** `_docs/brand-package/00-README.md`
- **Typography spec (v3):** `_docs/brand-package/03-typography.md`
- **Design system (v3):** `_docs/brand-package/06-design-system.md`
- **Design reference (v3):** `_docs/brand-package/09-design-reference-v3.md`
- **GSC baseline:** `_docs/seo/gsc-baseline-summary.md`
- **URL migration map:** `_docs/seo/url-migration-map-v4-FINAL.csv`
- **Redirects (drop into `next.config.ts`):** `_docs/seo/next-config-redirects.js`
- **Wiring guide (credentials, Twilio, crons):** `WIRING.md`
- **Speed-to-lead + comms plan:** `_docs/os-buildout/speed-to-lead-plan.md`
- **OS build plan:** `_docs/os-buildout/build-plan.md`
- **ServiceTitan Path B spec:** `_docs/integrations/servicetitan-integration-spec.md` (historical)
- ~~`_docs/integrations/hubspot-setup-checklist.md`~~ — superseded, HubSpot was dropped

---

## Locked decisions (one-line summary)

| Decision | Locked value |
|---|---|
| Brand direction | Home Depot-inspired. Hero Orange #F96302. |
| Tagline | "The Pros Other Plumbers Call" |
| Supporting line | "Two licenses. One crew. Same-day service." |
| HQ | 3057 Teagarden Street, San Leandro, CA 94577 |
| Phone | (510) 708-4237 only |
| Banned phone | tel:9255863212 (routes to competitor; never use) |
| License | CSLB #896116, C-36 (2007) plus A General Engineering (2012) |
| Founded | 2003 |
| Sole owner | Seifullah Zaki Zareef |
| CMS | TypeScript constants in `/content/` plus MDX for blog. Sanity DEFERRED to Phase 2. |
| CRM | None. Z and Z OS (Supabase) is the system of record. HubSpot dropped 2026-06-17. |
| FSM | ServiceTitan Essentials runs in parallel while the OS grows to parity on invoicing + dispatch. |
| Comms | Resend for email (live). Twilio for SMS (built, pending A2P 10DLC). See `WIRING.md`. |
| Payments | Deferred. Invoices send by email/text; pay by call, check, or cash. |
| Hours | Mon-Fri 7:00am-5:00pm Pacific, 24/7 emergency. |
| Font | Inter (only) |
| Icons | lucide-react |
| DNS | Vercel |

---

## Voice rules (one-line)

- No em-dashes.
- No "look no further", "in today's fast-paced world", "we pride ourselves on", "state-of-the-art", "top-notch", "unparalleled". No self-applied "premier" or "best".
- Direct, confident, expert without jargon. Short sentences. Real numbers. Real neighborhoods.

---

## What ships at v1 launch

- 4 priority service-plus-city pages: sewer-lateral-oakland (already drafted), emergency-plumber-oakland, water-heater-oakland, drain-cleaning-oakland, repipe-oakland
- 12 service pages from the services template
- 10 city pages from the service-area template
- Homepage matching the locked mockup
- About, Contact, Reviews, Financing, Privacy, Terms
- Blog index plus one starter MDX post (EBMUD compliance)
- 79 redirects from `_docs/seo/url-migration-map-v4-FINAL.csv`
- Lead capture straight into Supabase, with email and SMS notification (each channel degrades gracefully if its env vars are missing)
- LocalBusiness + FAQPage + Service JSON-LD schema
- Sitemap, robots, OG image
- Lighthouse Mobile Performance >= 75, Accessibility >= 95, Best Practices >= 95, SEO 100

See `_docs/prd/prd.md` Step 11 for the full acceptance criteria.

---

## Run locally (after IDE agent scaffolds)

```bash
cd "Z&Zplumbing-v3"
npm install
cp .env.example .env.local
# Fill in SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY at minimum. See WIRING.md.
npm run dev
```

Open http://localhost:3000.
