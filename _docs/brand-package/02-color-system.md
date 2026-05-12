# 02 · Color System

**Status:** Locked 2026-05-11
**Source:** `MASTER-PROMPT.md`
**Lineage:** Home Depot, Husky tools, DeWalt, contractor fleet graphics, jobsite signage.

---

## The Strict Palette

| Token | Hex | RGB | Role |
|---|---|---|---|
| `--hero-orange` | `#F96302` | 249, 99, 2 | Main recognition and action color: faucet icon, CTAs, fleet stripes, section markers, badges, signage accents, emergency indicators, utility-marking elements, trust-strip separators |
| `--black` | `#000000` | 0, 0, 0 | Authority: wordmarks, headers, trust strips, uniforms, strong section backgrounds, business cards, fleet contrast blocks |
| `--white` | `#FFFFFF` | 255, 255, 255 | Clean backgrounds, van base color, reversed type, spacing, service-page readability |
| `--dark-gray` | `#333333` | 51, 51, 51 | Body copy, dividers, subtle UI sections |
| `--medium-gray` | `#666666` | 102, 102, 102 | Secondary text, captions, helper text |
| `--light-gray` | `#F2F2F2` | 242, 242, 242 | Form fields, cards, subtle backgrounds |

`#F5F5F5` is allowed only as a light-gray equivalent when matching the locked homepage mockup or Tailwind defaults.

## Hard Color Bans

No additional brand colors. No blue water graphics. No navy. No cream. No beige. No gold. No Prussian blue. No green. No gradients.

The old `#5C5C5C` warm gray may appear in previous docs or mockups. For new identity work, use `#333333` for body text and `#666666` for secondary text.

## Semantic Mapping

```css
--color-bg: var(--white);
--color-bg-alt: var(--light-gray);
--color-bg-inverted: var(--black);
--color-text: var(--black);
--color-text-body: var(--dark-gray);
--color-text-secondary: var(--medium-gray);
--color-text-inverted: var(--white);
--color-primary: var(--hero-orange);
--color-primary-text: var(--white);
--color-border: var(--light-gray);
--color-trust-strip: var(--black);
```

## Tailwind v4 Theme Tokens

Add these to `app/globals.css`:

```css
@theme {
  --color-hero-orange: #F96302;
  --color-brand-black: #000000;
  --color-brand-white: #FFFFFF;
  --color-dark-gray: #333333;
  --color-medium-gray: #666666;
  --color-light-gray: #F2F2F2;
}
```

Do not create `tailwind.config.ts`.

## Usage Rules

### Hero Orange is recognition plus action

Use Hero Orange for:

- Primary CTA fills.
- Faucet mark.
- Fleet stripes.
- Jobsite signage accents.
- Trust-strip separators.
- Emergency indicators.
- Utility-marking details.

Do not use Hero Orange as general body text. It becomes noisy and can fail contrast at small sizes.

### Black carries authority

Use Black for:

- Display headlines.
- Wordmarks.
- Trust strip backgrounds.
- Uniforms.
- Business card fronts.
- Footer and strong proof bands.
- Fleet contrast blocks.

### White is the work surface

Use White for:

- Website backgrounds.
- Van base color.
- Logo lockup backgrounds.
- Reversed type on black or orange.
- Negative space around identity assets.

### Dark Gray and Medium Gray keep the UI readable

Use Dark Gray for body copy and dividers. Use Medium Gray for captions, helper text, secondary metadata, and quiet UI labels.

### Light Gray separates surfaces

Use Light Gray for cards, form fields, neutral backgrounds, and subtle section breaks. Keep it functional, not decorative.

## Accessibility

| Combination | Contrast ratio | WCAG AA |
|---|---:|---|
| Black on White | 21:1 | Pass |
| White on Black | 21:1 | Pass |
| Black on Light Gray | 18.8:1 | Pass |
| Dark Gray on White | 12.6:1 | Pass |
| Medium Gray on White | 5.7:1 | Pass |
| White on Hero Orange | 4.6:1 | Pass |
| Black on Hero Orange | 4.6:1 | Pass |

Use orange with white or black for buttons and large display. Avoid orange body text on white or light-gray backgrounds.

## Do Not

- Do not use blue droplets or blue water graphics.
- Do not add green, amber, or red as brand colors.
- Do not use gradients, glows, bevels, metallic chrome, or shadows on the logo.
- Do not reintroduce Prussian Blue, Warm Gold, Bone, cream, beige, ivory, or heritage tones.
- Do not use navy bands or dark-blue footer treatments.
