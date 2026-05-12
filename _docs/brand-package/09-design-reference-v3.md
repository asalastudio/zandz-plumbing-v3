# Design Reference (v3 Locked Mockup)

**Version:** v3 (Path C locked)
**Date:** 2026-05-11
**Canonical layout visual:** `_docs/design-reference/locked-homepage-mockup.html`
**Canonical identity visual:** `_docs/brand-package/brand-snapshot.html`

---

## How to use this

The mockup at `_docs/design-reference/locked-homepage-mockup.html` remains the layout and component-behavior reference for v3. The identity source of truth is now `MASTER-PROMPT.md`.

If typography, logo, color, fleet, signage, apparel, or image-generation rules conflict, `MASTER-PROMPT.md` wins. If spacing, section order, button behavior, or responsive structure conflict, use the locked mockup unless Jordan approves a new mockup.

---

## Open the file

```bash
# From repo root
open "Z&Zplumbing-v3/_docs/design-reference/locked-homepage-mockup.html"
```

It runs entirely from Tailwind CDN, Google Fonts, and lucide icons via CDN. No build step. It's a static HTML file you can crack open in any browser.

---

## What the mockup demonstrates (homepage tour)

1. **Header.** White, sticky, thin bottom border. Orange-box-with-white-droplet logo placeholder on the left, "Z and Z Plumbing" wordmark, nav center, orange phone CTA on the right. Mobile collapses to hamburger plus the sticky-bottom split CTA.
2. **Hero.** Light or white background, not black. Massive Barlow Condensed uppercase H1 ("The Pros Other Plumbers Call") with tight tracking. Supporting line: "Two licenses. One crew. Same-day service." Two CTAs: primary orange `rounded-none` call CTA plus a secondary schedule CTA. The black trust strip sits beneath the hero content.
3. **Trust strip.** Full-width black credential band, white Inter text, Hero Orange separators. Primary copy: `TWO LICENSES. ONE CREW. · CSLB #896116 · C-36 + A GENERAL ENGINEERING · SINCE 2003`.
4. **Services grid.** White background. H2 "What we fix" with `tracking-tight`. 4-column grid on desktop of `rounded-2xl` cards with lucide icons in orange, 12 services total. Hover state lifts the card and swaps the border to orange.
5. **Service area split.** Light-gray background. Left half: H2 "East Bay coverage", paragraph copy, "View all 10 cities" button. Right half: 10-city grid as smaller cards. Oakland card is featured (slightly larger or highlighted).
6. **"Two licenses. One call." section.** **Black background, white text.** This is the inverse credibility section. H2 in white. Three columns: CSLB #896116 with the C-36 plus A General Engineering breakdown; Sole owner Seifullah Zaki Zareef; Founded 2003 - 22 years in business. White outlined ghost buttons for "Verify license" and "About the family".
7. **How we work.** White background. 4 numbered cards: Call or schedule online, Same-day diagnostic, Written quote before any work, Job done right the first time.
8. **Testimonials.** Light-gray background. 3-card carousel on desktop, swipeable on mobile. 5 orange stars at top of each card.
9. **Sewer-lateral spotlight (P0 page tease).** White background. A pull-quote about EBMUD compliance plus a screenshot or callout linking to `/sewer-lateral-oakland/`.
10. **FAQ.** White background. Accordion of 8 to 10 questions. Auto-injects FAQPage JSON-LD.
11. **Final CTA.** **Orange background, white text.** H2 "Ready to schedule?" Two inverse buttons (white background, black text): "Call (510) 708-4237" and "Schedule online".
12. **Footer.** Black background, white text. 4 columns. License line at the very bottom.
13. **Sticky mobile CTA.** Fixed bottom on mobile. Split: light-gray left half for the phone, orange right half for "Schedule". 64 px tall. No rounded corners.

---

## Patterns the mockup locks

| Pattern | Lock |
|---|---|
| Buttons | `rounded-none`, `font-semibold`, `hover:-translate-y-0.5 hover:shadow-lg`, 200ms ease-out |
| Cards | `rounded-2xl`, `border border-[#E5E5E5]`, `hover:-translate-y-1 hover:shadow-lg hover:border-[#F96302]` |
| Hero H1 | `font-display text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight` |
| Section H2 | `font-display text-4xl md:text-5xl font-black uppercase tracking-tight` |
| Eyebrow | `text-xs uppercase tracking-widest font-medium` |
| Section padding | `py-20` to `py-32` |
| Container | `max-w-7xl px-6 md:px-8 lg:px-12` |
| Body color on light | `text-[#333333]` |
| Primary CTA color | `bg-[#F96302] text-white` |
| Inverse section CTAs | `bg-white text-black` |
| Phone link | `tel:+15107084237` only |

---

## What the mockup does NOT do (and v3 should not either)

- No em-dashes anywhere. Use periods, commas, colons, semicolons, or "and".
- No banned phrases ("look no further", "in today's fast-paced world", "we pride ourselves on", "state-of-the-art", "top-notch", "unparalleled", self-applied "premier" or "best").
- No gradients. No drop shadows on hero text. No background patterns.
- No carousel autoplay. Testimonials are user-controlled.
- No animated icons or icon spinners outside of loading states.
- No rescinded ampersand wordmark. Use `Z AND Z PLUMBING` on visual surfaces.
- No `rounded-md` on buttons. No `rounded-2xl` on buttons either. Buttons are sharp.
- No bold (700) hero headings. Semibold (600) only.
- No black hero background. The hero is light gray.

---

## Logo placeholder spec

```tsx
<div className="flex items-center gap-3">
  <div className="w-10 h-10 bg-[#F96302] rounded-none flex items-center justify-center">
    <Droplet className="h-6 w-6 text-white" strokeWidth={1.75} />
  </div>
  <span className="font-display font-black text-xl uppercase text-black">Z AND Z PLUMBING</span>
</div>
```

This stays in place until Jordan ships the refined logo SVGs. Drop them in `public/logos/`:

- `logo.svg` (horizontal full-color primary)
- `logo-white.svg` (horizontal white for dark backgrounds)
- `logo-black.svg` (horizontal black for very light or printed contexts)
- `icon.svg` (just the mark, color)
- `icon-white.svg` (just the mark, white)

Then update `components/Logo.tsx` to reference the real SVGs and the placeholder block goes away. No layout change should be necessary if the new logo respects the 40 x 40 mark size plus the wordmark beside it.

---

## When the mockup needs to change

The mockup is locked for v1 launch. If a need arises to change it (new section, layout change, new motion):

1. Pause implementation
2. Open the mockup, propose the change as a new HTML file in `_docs/design-reference/proposed-{date}-{description}.html`
3. Get sign-off from Jordan
4. Promote the proposed file to `locked-homepage-mockup.html`
5. Update this doc, `06-design-system.md`, and any other affected spec docs in the same commit

Do not silently modify the locked mockup or implement variants in code without going through that loop.

---

## Cross-references

- Color tokens: `02-color-system.md`
- Type and font: `03-typography.md`
- Components and patterns: `06-design-system.md`
- Website-wide brand application: `08-website-brand-spec.md`
- Voice and tone (copywriting): `05-voice-and-tone.md`
- Identity master prompt and image-gen source: `MASTER-PROMPT.md`
- Why we're doing all this: `_docs/strategy/business-truth.md`
