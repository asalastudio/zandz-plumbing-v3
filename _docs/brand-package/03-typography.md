# 03 · Typography

**Version:** v3 identity update
**Date:** 2026-05-11
**Status:** CANONICAL. Supersedes the temporary Inter-only v3 pass.
**Source:** `MASTER-PROMPT.md`

---

## Decision

The identity uses two primary type families:

- **Barlow Condensed** for display, logo, headlines, truck wraps, signage, social tiles, uniform backs, and large CTAs.
- **Inter** for body copy, UI, forms, captions, trust strips, cards, phone numbers, license text, metadata, and business card details.

Optional technical / data text may use a clean mono style for permit numbers, invoice references, utility labels, and technical diagrams. Mono is not a primary brand feature.

## Why this changed

The comprehensive identity system locked by Jordan on 2026-05-11 makes Barlow Condensed part of the Z and Z recognition system. The earlier Inter-only mockup remains useful for spacing and component behavior, but it no longer owns the brand typography. For typography conflicts:

1. `MASTER-PROMPT.md` wins.
2. `brand-snapshot.html` shows the applied visual direction.
3. This doc translates the direction into website implementation.

## Font loading

```ts
// app/layout.tsx
import { Barlow_Condensed, Inter } from "next/font/google";

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-barlow-condensed",
  weight: ["700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${barlow.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
```

## Tailwind v4 theme tokens

Add these in `app/globals.css`:

```css
@theme {
  --font-display: var(--font-barlow-condensed), "Barlow Condensed", system-ui, sans-serif;
  --font-sans: var(--font-inter), Inter, system-ui, sans-serif;
}
```

Do not create `tailwind.config.ts`.

## Roles

| Role | Family | Weight | Case | Notes |
|---|---|---|---|---|
| Logo wordmark | Barlow Condensed | 900 or 800 | Uppercase | Reads exactly `Z AND Z PLUMBING` |
| Hero H1 | Barlow Condensed | 900 or 800 | Uppercase | Large, tight, distance-readable |
| Service page H1 | Barlow Condensed | 800 or 900 | Uppercase | Contractor-signage feel |
| Section H2 | Barlow Condensed | 800 or 900 | Usually uppercase | Keep tight but readable |
| Uniform back print | Barlow Condensed | 900 | Uppercase | `THE PROS OTHER PLUMBERS CALL` |
| Truck wrap typography | Barlow Condensed | 800 or 900 | Uppercase | Avoid over-compression |
| Body copy | Inter | 400 | Sentence case | Clear, practical, readable |
| UI labels / buttons | Inter | 600 or 700 | Uppercase where useful | CTA legibility first |
| Trust strip | Inter | 500 or 600 | Uppercase or small caps | Subtle tracking around `0.02em` |
| Captions / metadata | Inter | 400 or 500 | Sentence case | Use `#666666` or `#333333` |

## Recommended Tailwind classes

| Role | Class pattern |
|---|---|
| Hero H1 | `font-display text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-none tracking-tight` |
| Section H2 | `font-display text-4xl md:text-5xl font-black uppercase leading-tight tracking-tight` |
| Card H3 | `font-display text-2xl md:text-3xl font-extrabold uppercase leading-tight` |
| Eyebrow | `font-sans text-xs uppercase tracking-widest font-semibold` |
| Body large | `font-sans text-lg md:text-xl leading-relaxed` |
| Body | `font-sans text-base leading-relaxed` |
| Body small | `font-sans text-sm leading-snug` |
| Button label | `font-sans text-sm md:text-base font-bold uppercase` |
| Trust strip | `font-sans text-xs md:text-sm font-semibold uppercase tracking-[0.02em]` |

## Wordmark Casing

The visual wordmark reads exactly:

```text
Z AND Z PLUMBING
```

Do not use `Z & Z`, `Z + Z`, `ZANDZ`, or lowercase styling in the logo, fleet, signage, apparel, social tiles, or display lockups.

Body copy, schema, citations, and metadata use:

```text
Z and Z Plumbing
```

This is a casing convention, not a naming conflict.

## Numerals

Use Inter for phone numbers, license text, pricing ranges, and form details. Add `tabular-nums` when numbers align in tables or comparison blocks.

```tsx
<span className="font-sans tabular-nums">(510) 708-4237</span>
```

## Do Not

- Do not use Barlow Condensed for paragraphs.
- Do not use Inter for the final logo wordmark.
- Do not use script, hand-drawn, decorative, or rounded cartoon fonts.
- Do not over-compress Barlow Condensed on trucks, signs, or mobile headers.
- Do not use the rescinded ampersand wordmark.
- Do not introduce a third primary family.

## Implementation Checklist

- [ ] `app/layout.tsx` imports `Barlow_Condensed` and `Inter` from `next/font/google`.
- [ ] `app/globals.css` defines `--font-display` and `--font-sans` in `@theme`.
- [ ] Logo and display surfaces use `font-display`.
- [ ] Body, UI, trust strips, buttons, forms, and captions use Inter via `font-sans`.
- [ ] The visual wordmark is always `Z AND Z PLUMBING`.
- [ ] Grep for `Z & Z`, `Z+Z`, and `ZANDZ` in visual copy before launch.
