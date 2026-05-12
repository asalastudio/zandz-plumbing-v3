# 04 · Logo System

**Status:** Direction locked 2026-05-11. Artwork in progress, owned by Jordan.

## Direction

Refine the existing faucet logomark from the legacy site into a confident, simplified, professional tool mark. Not cartoonish. Not playful. The faucet should read as an industrial fixture, the kind a contractor specifies, not a cartoon dripping faucet from a 1990s kids' cereal box.

**Reference:** existing logo at `zandzplumbing.com/wp-content/uploads/2020/09/logo-1.png` (also saved to `context/import/` once Jordan re-uploads the file)

**Aesthetic target:** in the lineage of Home Depot's wordmark plus Husky tools plus DeWalt. Strong stroke weights. Confident geometry. No cute touches.

## What changes from the legacy mark

| Element | Before | After |
|---|---|---|
| Faucet illustration | Hand-lettered, slightly cartoonish, multi-color | Geometric, simplified, single fill (red or hero-orange) |
| Water droplet | Cartoony blue droplet under the faucet spout | Either remove entirely, OR replace with a single clean drip stroke |
| Wordmark "Z AND Z PLUMBING" | Hand-drawn display lettering with inconsistent kerning | Set in Barlow Condensed Black (or ExtraBold) with locked kerning |
| Border | Dotted dashed rectangle | Removed |
| Background bar | Dark navy band at bottom | Removed |
| Color usage | Red faucet + blue droplet + black text + cream background | Single-color marks (orange OR black OR white) with optional faucet accent |

## Lockups (deliverables Jordan produces)

### Primary lockup (horizontal)

Faucet icon on the left, wordmark on the right. Used in the site header, business cards, invoices, email signatures.

```
[ FAUCET ICON ]  Z AND Z PLUMBING
```

Faucet icon height equals approximately 1.4x the cap height of the wordmark. Spacing between icon and wordmark equals approximately 0.5x the icon height.

### Secondary lockup (stacked)

Faucet icon on top, wordmark below. Used in square-format applications: GBP profile photo, social avatars (where the icon-only is too small to identify), business card backs.

```
[ FAUCET ICON ]
   Z AND Z
  PLUMBING
```

### Icon-only

Faucet alone. Used in favicons, app icons, sticky mobile CTA buttons, social media avatars at small sizes, GBP cover image foreground.

### Wordmark-only

"Z AND Z PLUMBING" set in Barlow Condensed Black, no icon. Used in the site footer, contracts, anywhere the icon is redundant or too small to read.

## Color variants

Every lockup needs four color variants:

| Variant | When |
|---|---|
| Full color (orange faucet + black wordmark) | Default on white backgrounds |
| Single-color black | Black-on-white surfaces, printed materials, faxes, low-res reproductions |
| Single-color white | Header on black band, dark backgrounds, photo overlays |
| Single-color orange | Special applications, rare. Mostly avoid because orange-on-white loses the wordmark's authority. |

## Clear space

Minimum clear space around every lockup equals the height of the wordmark cap height. Nothing else inside that boundary.

## Minimum sizes

- Primary lockup: 120px wide minimum (web), 1.5 inches wide minimum (print)
- Icon-only: 24px minimum (web), 0.5 inches minimum (print)
- Wordmark-only: 80px wide minimum (web)

Below these sizes the mark becomes unreadable and should be replaced with a simpler element (e.g., text "Z and Z" in Barlow Condensed Black).

## File deliverables

Jordan produces these and saves to `06_Brand Package-v2/assets/logos/`:

| Filename | Format | Variants |
|---|---|---|
| `zandz-primary-horizontal.svg` | SVG | Full-color, black, white, orange |
| `zandz-secondary-stacked.svg` | SVG | Full-color, black, white, orange |
| `zandz-icon-only.svg` | SVG | Full-color, black, white, orange |
| `zandz-wordmark-only.svg` | SVG | Black, white |
| `zandz-favicon.svg` | SVG | Icon-only, optimized for tiny sizes |
| `zandz-favicon.ico` | ICO | 16x16, 32x32, 48x48 |
| `zandz-app-icon-1024.png` | PNG | 1024x1024 master for app icon exports |
| `zandz-og-default.png` | PNG | 1200x630 default OG image with primary lockup |

Production-ready exports for the website land in `Z&Zplumbing-v3/public/logos/` with these naming patterns:
- `logo.svg` (primary horizontal, full color)
- `logo-white.svg` (primary horizontal, white)
- `logo-black.svg` (primary horizontal, black)
- `icon.svg` (icon-only, full color)
- `icon-white.svg` (icon-only, white)
- `favicon.ico`
- `apple-touch-icon.png` (180x180)

## Usage rules

### Do

- Place the primary lockup in the site header on every page
- Use the white variant when the lockup sits on the orange or black band
- Use the icon-only as the favicon and app icon
- Keep clear space respected at all sizes
- Lock the wordmark kerning when exporting (do not let the font default re-kern at small sizes)

### Do not

- Add effects: drop shadows, glows, gradients, bevels
- Rotate the lockup or skew it
- Place the lockup on a busy photo without a solid backdrop or semi-transparent black overlay
- Use the orange variant on a hero-orange background
- Reproduce the lockup in any color outside the four variants above
- Re-letter the wordmark in a different typeface

## Brand mark history (for context)

The original faucet mark has equity in the local market. It appears on Z and Z's trucks, business cards, GBP cover, and the legacy website. The refinement preserves the faucet silhouette as the identifying element so brand recognition transfers cleanly. A full redesign would force a fleet-graphics refresh and lose 23 years of accumulated local awareness.

Phase 2 may explore a mascot character (Roto-Rooter and Benjamin Franklin both use one). Not in v1.
