# Design System (v3 LOCKED)

**Version:** v3 (Path C locked)
**Date:** 2026-05-11
**Status:** CANONICAL. Supersedes v2 design system (preserved at `06-design-system-OLD-v2.md.bak`).

**Identity source of truth:** `MASTER-PROMPT.md`.
**Visual reference:** `_docs/design-reference/locked-homepage-mockup.html` still informs spacing, section order, and component behavior. If typography or identity treatment conflicts with the mockup, `MASTER-PROMPT.md` wins.

---

## Foundations

### Palette (refer to `02-color-system.md` for full token table)

| Token | Hex | Usage |
|---|---|---|
| Hero Orange | `#F96302` | Primary CTA, accent, logo placeholder box, brand voice highlights |
| Black | `#000000` | "Two licenses. One call." section background, footer, primary text on light |
| White | `#FFFFFF` | Light-mode surface, button label on orange |
| Dark Gray | `#333333` | Body copy on light, subtle UI sections |
| Medium Gray | `#666666` | Secondary text, captions, helper text |
| Light Gray | `#F2F2F2` or `#F5F5F5` | Hero background, neutral surface, sticky CTA secondary panel |
| Border Gray | `#E5E5E5` | Card borders, divider lines, input borders |

No additional hues. No heritage tones. No dark teals, no copper, no ivory.

### Typography

See `03-typography.md`. Barlow Condensed is the display, logo, headline, fleet, signage, and apparel type family. Inter is the body, UI, trust strip, forms, captions, and metadata family.

Display headings use `font-display`, uppercase, and Black/ExtraBold weights. Body and UI use `font-sans`.

### Spacing

Use Tailwind's default spacing scale. The mockup heavily uses:
- Section vertical padding: `py-20` to `py-32` (80 to 128 px)
- Container horizontal padding: `px-6 md:px-8 lg:px-12`
- Card padding: `p-6` to `p-8`
- Element gaps: `gap-4` for tight rows, `gap-6` to `gap-8` for grids, `gap-12` to `gap-16` between major blocks

### Container

```tsx
// components/Container.tsx
export function Container({ children, className = "" }: ...) {
  return (
    <div className={`mx-auto max-w-7xl px-6 md:px-8 lg:px-12 ${className}`}>
      {children}
    </div>
  );
}
```

Hero may use `max-w-6xl` for tighter measure. Service grid uses `max-w-7xl`. Footer uses `max-w-7xl`.

---

## Corners and radius

**v3 rule: buttons and cards use different radius treatments. This is the single biggest visual change from v2.**

| Element | Radius | Tailwind class | Rationale |
|---|---|---|---|
| Buttons | 0 (sharp) | `rounded-none` | Locked from mockup. Hard, confident, industrial. Plumber-shop honesty. |
| Cards (service, testimonial, FAQ) | 16 px | `rounded-2xl` | Softer container around content. The contrast is the point. |
| Inputs (forms) | 6 px | `rounded-md` | Standard form ergonomics. |
| Pills and badges (trust strip, eyebrow tags) | full pill | `rounded-full` | Reserved for small chrome elements. |
| Image masks | 16 px | `rounded-2xl` | Match card radius. |
| Logo box (placeholder) | 0 | `rounded-none` | Matches the mockup's orange droplet square. |

The hero CTA button and every secondary button are `rounded-none`. Do not change this without re-approving the mockup.

---

## Buttons

### Component contract

```tsx
// components/Button.tsx
<Button
  variant="primary | secondary | ghost | inverse"
  size="sm | md | lg | xl"
  href="/sewer-lateral-oakland/"     // either href OR onClick
  icon={<Phone className="h-4 w-4" />}   // optional lucide icon
  iconPosition="left | right"
>
  Schedule service
</Button>
```

### Variants

| Variant | Background | Text | Border | Use |
|---|---|---|---|---|
| `primary` | `bg-[#F96302]` | `text-white` | none | Hero CTA, every "Schedule" or "Call now" |
| `secondary` | `bg-black` | `text-white` | none | Inverse of primary on light surfaces; less common |
| `ghost` | `bg-transparent` | `text-black` | `border border-black` | Tertiary actions ("Learn more", footer nav) |
| `inverse` | `bg-white` | `text-black` | none | Used on black "Two licenses" section and orange final CTA |

### Sizes

| Size | Padding | Text |
|---|---|---|
| `sm` | `px-4 py-2` | `text-sm` |
| `md` (default) | `px-6 py-3` | `text-sm md:text-base` |
| `lg` | `px-8 py-4` | `text-base` |
| `xl` (hero) | `px-10 py-5` | `text-base md:text-lg` |

### Base button classes (locked from mockup)

```
inline-flex items-center justify-center gap-2
font-semibold
rounded-none
transition-all duration-200 ease-out
hover:-translate-y-0.5 hover:shadow-lg
focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F96302]
disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
```

The hover signature `hover:-translate-y-0.5 hover:shadow-lg` is **the v3 button feel**. It applies to every variant. Do not remove it.

### Phone CTA pattern

Phone buttons use the `Phone` icon from lucide-react, `iconPosition="left"`, and link to `tel:+15107084237`. The displayed label is `(510) 708-4237` or `Call (510) 708-4237`. Never use the competitor-routing phone value documented in `_docs/strategy/business-truth.md`.

---

## Cards

### Standard service card

```tsx
<article className="
  group
  bg-white
  rounded-2xl
  border border-[#E5E5E5]
  p-6 md:p-8
  transition-all duration-200
  hover:border-[#F96302]
  hover:shadow-lg
  hover:-translate-y-1
">
  <div className="mb-4">
    <Icon className="h-8 w-8 text-[#F96302]" strokeWidth={1.5} />
  </div>
  <h3 className="font-display text-2xl md:text-3xl font-black uppercase tracking-tight mb-2">{title}</h3>
  <p className="text-base text-[#333333] leading-relaxed mb-4">{description}</p>
  <span className="text-sm font-medium text-[#F96302] group-hover:underline">
    Learn more →
  </span>
</article>
```

The whole card is the click target (wrap in a Next.js `<Link>`), but the visible "Learn more →" anchor signals affordance.

### Testimonial card

Same `rounded-2xl border border-[#E5E5E5] p-6 md:p-8`. Inside: a 5-star row at top (5x lucide `Star` filled in `text-[#F96302]`), quote in body weight, then byline in `text-sm font-medium`.

### Service-area card (city)

Same shell. Includes city name (H3), zip codes (small caption), 2 to 3 example neighborhoods, primary service link.

---

## Icons

**Library: `lucide-react`** installed via npm. v3 removes the in-house `Icon`/`Star`/`Chevron` SVG components. They're not needed.

```bash
npm install lucide-react
```

```tsx
import { Phone, Wrench, Droplet, ShowerHead, Star, ChevronRight, AlertTriangle } from "lucide-react";

<Phone className="h-5 w-5 text-[#F96302]" strokeWidth={1.5} />
```

### Mapping (services.ts to lucide)

| Service | Icon |
|---|---|
| Sewer lateral | `GitMerge` |
| Emergency plumber | `AlertTriangle` |
| Water heater | `Thermometer` |
| Drain cleaning | `Pipette` |
| Repipe | `Wrench` |
| Hydrojetting | `Droplet` |
| Gas line | `Flame` |
| Leak detection | `Droplet` |
| Water line | `Pipette` |
| Faucet | `ShowerHead` |
| Toilet | `Toilet` |
| Garbage disposal | `Trash2` |

### Icon weight

`strokeWidth={1.5}` is the default. Hero icons may use `strokeWidth={1.75}` for slightly heavier presence. Never use `strokeWidth={1}` (too thin) or `strokeWidth={2.5}` (clunky).

### Icon sizes

| Context | Size | Tailwind |
|---|---|---|
| Inline with body text | 16 px | `h-4 w-4` |
| Button icon | 16 to 20 px | `h-4 w-4` (md), `h-5 w-5` (lg) |
| Service card | 32 px | `h-8 w-8` |
| Trust strip | 24 px | `h-6 w-6` |
| Hero accent | 40 to 48 px | `h-10 w-10` to `h-12 w-12` |

---

## Hover and motion

### The v3 motion signature

Every interactive surface uses one of these three patterns:

1. **Buttons:** `transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg`
2. **Cards:** `transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-[#F96302]`
3. **Links and inline text:** `transition-colors duration-150 hover:text-[#F96302]` or `hover:underline`

No long durations. No bouncy easings. No 3D transforms. The mockup is restrained on motion; v3 matches it.

### Reduced motion

In `app/globals.css` respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Sections (layout patterns)

The mockup has 8 distinct section archetypes. Components should match.

| Section | Background | Heading style | Notes |
|---|---|---|---|
| Hero | `bg-white` or `bg-[#F5F5F5]` | `font-display text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight` | Light, NOT black. Has black trust strip below. |
| Trust strip | `bg-black text-white` | n/a | Full-width credential band, white Inter text, Hero Orange separators |
| Services grid | `bg-white` | `font-display text-4xl md:text-5xl font-black uppercase tracking-tight` | 4-col grid on desktop, 2 on tablet, 1 on mobile |
| Service-area split | `bg-[#F5F5F5]` | same H2 style | 10 cities as cards plus a contextual map/blurb |
| Process / "How we work" | `bg-white` | same H2 style | 3 to 4 numbered cards with lucide icons |
| "Two licenses" (proof bar) | `bg-black text-white` | `font-display text-4xl md:text-5xl font-black uppercase` | Inverse section. CSLB number, founding year, sole owner. |
| Testimonials | `bg-[#F5F5F5]` | same H2 style | Carousel on mobile, 3-card grid on desktop |
| FAQ | `bg-white` | same H2 style | Accordion with FAQPage JSON-LD auto-inject |
| Final CTA | `bg-[#F96302] text-white` | `font-display text-4xl md:text-5xl font-black uppercase` | Inverse buttons (white bg, black text) |
| Footer | `bg-black text-white` | n/a | NAP, license, hours, service-area links, legal |

---

## Forms

### Input shell

```tsx
<input
  type="text"
  className="
    w-full
    px-4 py-3
    bg-white
    border border-[#E5E5E5]
    rounded-md
    text-base
    placeholder:text-[#9CA3AF]
    focus:outline-none focus:ring-2 focus:ring-[#F96302] focus:border-transparent
    transition-colors
  "
/>
```

### Field stack

```tsx
<div className="space-y-2">
  <label className="block text-sm font-medium text-black">First name</label>
  <input ... />
  <p className="text-xs text-[#9CA3AF]">Helper text if needed</p>
</div>
```

Error state: replace `border-[#E5E5E5]` with `border-red-500` and add a `text-sm text-red-600 mt-1` paragraph below the input.

---

## Sticky mobile CTA

The mockup's sticky bar is split:
- Left half: light-gray panel with phone icon and number, `bg-[#F5F5F5]`
- Right half: orange panel with "Schedule", `bg-[#F96302] text-white`
- Full width, fixed bottom, hidden on `md:` and up
- Height: 64 px
- No rounding on the corners (matches button language)

```tsx
<div className="fixed bottom-0 inset-x-0 z-50 md:hidden grid grid-cols-2 border-t border-[#E5E5E5]">
  <a href="tel:+15107084237" className="bg-[#F5F5F5] py-4 flex items-center justify-center gap-2 font-semibold">
    <Phone className="h-5 w-5" /> (510) 708-4237
  </a>
  <a href="/contact/#schedule" className="bg-[#F96302] text-white py-4 flex items-center justify-center font-semibold">
    Schedule
  </a>
</div>
```

---

## Header

- Sticky top, `bg-white border-b border-[#E5E5E5]`
- Logo on the left: primary horizontal lockup when assets are available. The wordmark reads `Z AND Z PLUMBING` in Barlow Condensed Black uppercase with a Hero Orange faucet mark.
- Placeholder while final SVGs are pending: orange `w-10 h-10 rounded-none bg-[#F96302]` square with a white simplified faucet or `Droplet` lucide icon, plus `Z AND Z PLUMBING` in `font-display font-black uppercase text-xl`.
- Primary nav center on desktop, hamburger on mobile (lucide `Menu` icon)
- Right side: phone CTA button (`variant="primary" size="sm" icon=<Phone />`) on desktop, hidden on mobile (sticky CTA handles it)

Real logo SVGs will replace the placeholder square once Jordan ships them. Drop them in `public/logos/` per the kickoff prompt.

---

## Footer

- `bg-black text-white py-16`
- 4 columns on desktop: NAP / Services / Service areas / Legal
- License line at bottom: "CSLB #896116 - C-36 Plumbing and A General Engineering. Serving the East Bay since 2003."
- Phone is a `tel:+15107084237` link styled `text-[#F96302] hover:underline`

---

## Accessibility

- Color contrast: orange `#F96302` on white passes WCAG AA for large text (18 px+) but FAILS for body text. Always use orange on white for headings and CTAs, never for body paragraphs.
- Focus rings: every interactive element gets `focus:ring-2 focus:ring-offset-2 focus:ring-[#F96302]` (or a black ring on orange backgrounds).
- Buttons and links: minimum 44 x 44 px touch target. Our `md` size and up satisfies this.
- All lucide icons inside interactive elements have a `aria-hidden="true"` if they're decorative, or an `aria-label` if they're the only label.
- Form fields have explicit `<label>` elements, never placeholder-only.

---

## What changed from v2

| Item | v2 | v3 |
|---|---|---|
| Button radius | `rounded-md` | `rounded-none` |
| Button hover | `hover:bg-opacity-90` | `hover:-translate-y-0.5 hover:shadow-lg` |
| Card hover | `hover:shadow-md` | `hover:-translate-y-1 hover:shadow-lg hover:border-[#F96302]` |
| Icon library | In-house SVG components (`Icon`, `Star`, `Chevron`) | `lucide-react` npm package |
| Logo treatment | Refined faucet logomark (pending Jordan) | Primary `Z AND Z PLUMBING` lockup in Barlow Condensed with Hero Orange faucet; placeholder only until real SVGs land |
| Hero background | Black | `bg-[#F5F5F5]` (light) |
| H1 typography | Generic bold | Barlow Condensed Black/ExtraBold, uppercase |
| Custom @theme type scale | 14 steps | Removed. Tailwind defaults plus `--font-display` and `--font-sans` only. |
| Border token | implicit | Explicit `#E5E5E5` for all card and divider borders |

---

## Implementation checklist for the IDE agent

- [ ] `npm install lucide-react` in `Z&Zplumbing-v3/` (the working dir)
- [ ] Update `components/Button.tsx`: change `rounded-md` to `rounded-none`; add the `hover:-translate-y-0.5 hover:shadow-lg` pattern; ensure all 4 variants and 4 sizes match
- [ ] Update `components/ServiceCard.tsx`: confirm `rounded-2xl`, the `hover:-translate-y-1` motion, and the `hover:border-[#F96302]` swap
- [ ] Update `components/Logo.tsx`: use the refined faucet SVG assets when available; placeholder uses the orange box and a simplified white faucet or `Droplet` icon only until then
- [ ] Delete `components/Icon.tsx`, `components/Star.tsx`, `components/Chevron.tsx`. Replace every usage with the appropriate lucide import.
- [ ] Update `app/layout.tsx`: import Barlow Condensed and Inter via `next/font/google` per `03-typography.md`
- [ ] Update `app/globals.css` `@theme` block: define `--font-display` and `--font-sans`; remove the 14-step custom type scale
- [ ] Update `components/StickyMobileCTA.tsx` to the split light-gray + orange pattern
- [ ] Update `app/page.tsx` hero: use Barlow Condensed uppercase H1, light/white hero surface, and the black trust strip from `MASTER-PROMPT.md`
- [ ] Grep `rounded-md` across button usages and replace with `rounded-none`
- [ ] Grep visual wordmark usages and confirm they read exactly `Z AND Z PLUMBING`, not `Z & Z`, `Z + Z`, or `ZANDZ`
- [ ] Run the dev server and visually diff against `_docs/design-reference/locked-homepage-mockup.html` for layout and `_docs/brand-package/brand-snapshot.html` for identity.
