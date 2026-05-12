# Kickoff Prompt

Use this in a fresh Claude Code session opened at the `Z&Zplumbing-v3/` folder root.

Copy everything between `START PROMPT` and `END PROMPT`.

---

START PROMPT

You are Claude Code working on the Z and Z Plumbing v3 site build.

Working directory:
`/Users/jordanrichter/Desktop/AI-OS/clients/Z & Z Plumbing/Z&Zplumbing-v3`

Your first job is context, not code. Before writing or modifying any file, read this file in full:

`_docs/00-START-HERE.md`

Absolute reference:
`/Users/jordanrichter/Desktop/AI-OS/clients/Z & Z Plumbing/Z&Zplumbing-v3/_docs/00-START-HERE.md`

Treat `_docs/00-START-HERE.md` as the operating map for this build. Follow its reading order and precedence rules. If anything in the folder conflicts:

- Business facts: `_docs/strategy/business-truth.md` wins.
- Identity system: `_docs/brand-package/MASTER-PROMPT.md` wins for typography, logo, color, fleet, signage, apparel, and image-generation.
- Layout and component behavior: `_docs/design-reference/locked-homepage-mockup.html` wins unless the identity master explicitly overrides it.
- Implementation scope and acceptance criteria: `_docs/prd/prd.md` wins unless `_docs/00-START-HERE.md` explicitly overrides it.
- Brand rules: `_docs/brand-package/` v3 docs win.

Read these Tier 1 files before coding:

1. `_docs/00-START-HERE.md`
2. `_docs/strategy/business-truth.md`
3. `_docs/prd/prd.md`
4. `_docs/brand-package/00-README.md`
5. `_docs/brand-package/MASTER-PROMPT.md`
6. `_docs/brand-package/brand-snapshot.html`
7. `_docs/brand-package/00-brand-snapshot-and-image-gen-prompts.md`
8. `_docs/brand-package/01-brand-strategy.md`
9. `_docs/brand-package/02-color-system.md`
10. `_docs/brand-package/03-typography.md`
11. `_docs/brand-package/05-voice-and-tone.md`
12. `_docs/brand-package/06-design-system.md`
13. `_docs/brand-package/09-design-reference-v3.md`
14. `_docs/design-reference/locked-homepage-mockup.html`

Open `_docs/brand-package/brand-snapshot.html` and `_docs/design-reference/locked-homepage-mockup.html` in a browser before building the homepage. The snapshot owns identity applications. The locked homepage mockup owns layout and component behavior.

Project summary:

- Build a marketing site for Z and Z Plumbing, an East Bay plumber headquartered in San Leandro with Oakland as the primary market.
- Status: design locked, SEO baseline locked, implementation ready.
- Stack: Next.js 16 App Router, React 19, TypeScript, Tailwind v4, Vercel.
- Content model: TypeScript constants in `/content/` plus MDX for blog. No Sanity in v1.
- CRM: HubSpot Starter.
- ServiceTitan: Essentials Path B manual workflow. No ServiceTitan API code in v1.

Locked business facts:

- Customer-facing name: Z and Z Plumbing.
- HQ: 3057 Teagarden Street, San Leandro, CA 94577.
- Phone: (510) 708-4237.
- Phone links must use `tel:+15107084237` or `siteSettings.phoneTel`.
- Never use the competitor-routing phone value documented in `_docs/strategy/business-truth.md`.
- CSLB #896116.
- Licenses: C-36 Plumbing, 2007, plus A General Engineering, 2012.
- Founded 2003.
- Sole owner: Seifullah Zaki Zareef.

Locked brand and design rules:

- Palette: Hero Orange `#F96302`, Black `#000000`, White `#FFFFFF`, Dark Gray `#333333`, Medium Gray `#666666`, Light Gray `#F2F2F2` or `#F5F5F5`, Border Gray `#E5E5E5`.
- Tagline: "The Pros Other Plumbers Call".
- Supporting line: "Two licenses. One crew. Same-day service."
- Typography: Barlow Condensed for display, logo, headlines, truck wraps, signage, apparel, social tiles, and large CTAs. Inter for body, UI, forms, cards, trust strips, captions, and metadata.
- Visual wordmark: `Z AND Z PLUMBING`, spelled out, all caps, no ampersand.
- Icons: `lucide-react` only.
- No in-house SVG `Icon`, `Star`, or `Chevron` components.
- Buttons: `rounded-none`.
- Cards: `rounded-2xl`.
- Inputs: `rounded-md`.
- Button hover: `hover:-translate-y-0.5 hover:shadow-lg`.
- Card hover: `hover:-translate-y-1 hover:shadow-lg hover:border-[#F96302]`.
- Hero background: `#F5F5F5`, not black.
- Sticky mobile CTA: split panel, light gray phone side plus orange schedule side, 64 px tall.
- Placeholder logo until Jordan provides final SVGs: orange square with a white simplified faucet or `Droplet` lucide icon and Barlow Condensed uppercase `Z AND Z PLUMBING` wordmark.

Voice rules:

- No em dashes anywhere.
- Do not use: "look no further", "in today's fast-paced world", "we pride ourselves on", "state-of-the-art", "top-notch", "unparalleled".
- Do not self-apply "premier" or "best".
- Write direct, confident, contractor-grade copy. Short sentences. Real numbers. Real neighborhoods.

Architecture rules:

- Server components by default.
- Use `"use client"` only for state or effects, such as Header mobile menu, TestimonialCarousel, ZipCodeSearch, and BookingWidget.
- Tailwind v4 tokens live in `app/globals.css` inside `@theme`, including `--font-display` and `--font-sans`.
- Do not create `tailwind.config.ts`.
- Configure `@/` imports in `tsconfig.json`.
- Every route exports `metadata: Metadata` with title, description, canonical URL, and Open Graph.
- Enforce trailing slashes. URLs should look like `/about/`, not `/about`.
- Use `next.config.ts` for redirects from `_docs/seo/next-config-redirects.js`.

Implementation plan from `_docs/prd/prd.md`:

1. Repo scaffold and tooling.
2. Brand foundation.
3. Component library.
4. Content layer.
5. Page templates.
6. Dynamic routes.
7. Priority service-plus-city pages.
8. Integrations.
9. Blog.
10. SEO.
11. QA.
12. Vercel and DNS.

Expected v1 pages:

- `/`
- `/about/`
- `/services/`
- `/service-areas/`
- `/contact/`
- `/reviews/`
- `/financing/`
- `/privacy-policy/`
- `/terms/`
- `/services/[slug]/` for 12 services.
- `/[cityslug]/` for 10 cities.
- `/sewer-lateral-oakland/`
- `/emergency-plumber-oakland/`
- `/water-heater-oakland/`
- `/drain-cleaning-oakland/`
- `/repipe-oakland/`
- `/blog/`
- `/blog/[slug]/`

Expected core components:

- Container
- Section
- Button
- Logo
- Header
- Footer
- StickyMobileCTA
- TrustBadge
- TrustStrip
- ServiceCard
- TestimonialCard
- TestimonialCarousel
- FAQ with FAQPage JSON-LD
- LateralDiagram
- FormField
- FormSelect
- FormDatePicker
- ZipCodeSearch
- BookingWidget, 4-step flow

Expected content and library files:

- `content/site-settings.ts`
- `content/services.ts`
- `content/service-areas.ts`
- `content/testimonials.ts`
- `content/team.ts`
- `types/content.ts`
- `types/lead.ts`
- `lib/cn.ts`
- `lib/hubspot.ts`
- `app/api/lead/route.ts`
- `app/sitemap.ts`
- `app/robots.ts`

Before you make changes, respond with:

1. A short confirmation that you read `_docs/00-START-HERE.md`.
2. The implementation slice you recommend starting with.
3. Any blockers or assumptions.
4. One concise question to Jordan: what should ship first?

Recommended default if Jordan says "start": begin Step 1 with the repo scaffold and tooling, then proceed through the PRD in order.

If Jordan asks to start with a page instead, the best first priority page is `/emergency-plumber-oakland/`, because START HERE notes it has the highest remaining GSC impression base.

Hard QA gates before commit:

- `npm run lint` passes once linting exists.
- `npm run build` passes.
- Search application source for the competitor-routing phone value documented in `_docs/strategy/business-truth.md`; it must return zero matches outside canonical documentation.
- Search for em dashes returns zero matches in customer-facing source.
- Lighthouse Mobile target: Performance >= 75, Accessibility >= 95, Best Practices >= 95, SEO = 100.
- Spot check representative redirects from the migration map.
- Test lead submission in degraded mode when HubSpot IDs are missing, and through HubSpot once IDs are set.

Do not change locked decisions without asking Jordan first. Do not introduce new colors, fonts, icon libraries, radius treatments, CMSs, or ServiceTitan API code in v1.

END PROMPT
