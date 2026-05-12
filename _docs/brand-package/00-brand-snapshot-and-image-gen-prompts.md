# Brand Snapshot and Image-Gen Prompts

**Status:** Canonical derivative.
**Source of truth:** `MASTER-PROMPT.md`.
**Snapshot:** `brand-snapshot.html`.
**Date:** 2026-05-11.

This file is the markdown companion to the visual brand snapshot. If the identity system changes, update `MASTER-PROMPT.md` first, then sync this file and `brand-snapshot.html`.

---

## Snapshot Summary

Z and Z Plumbing is the serious East Bay plumbing and infrastructure contractor that handles the jobs other plumbers pass on. The identity is built around Hero Orange, Black, White, a refined faucet mark, Barlow Condensed for display and logo surfaces, Inter for body and UI, direct contractor messaging, and the black trust strip.

Core phrases:

- The Pros Other Plumbers Call
- Licensed for the whole job
- Same-day East Bay plumbing
- Two licenses. One crew.
- C-36 Plumbing + A General Engineering
- From house line to street work
- Serious plumbing. Serious crew.

Hard logo rule:

- The visual wordmark reads exactly `Z AND Z PLUMBING`.
- Do not use `Z & Z`, `Z + Z`, or `ZANDZ` in logo or visual applications.
- Body copy and structured data may use `Z and Z Plumbing`.

---

## Image-Gen Prompt Pack

Drop the legacy Z and Z logo into the image generator as the reference where relevant, then copy one of the prompts below.

### 1. Faucet Direction A: No Drip

```text
Redesign this plumbing company's faucet icon into a clean industrial contractor mark in the lineage of Home Depot, Husky tools, and DeWalt. Preserve the faucet silhouette from the reference. Geometric, simplified, single-fill in hero orange #F96302. Strong stroke weights. No cartoon outlines, no multi-color shading, no decorative cues, no drip, no water droplet. Industrial fixture only. Flat vector aesthetic. Pure white background. Output four variants side by side: full orange on white, all black on white, all white on black, all orange on black.
```

### 2. Faucet Direction B: Minimal Drip

```text
Same refined industrial faucet icon as above, but add one small geometric drip falling from the spout. Drip is hero orange #F96302, matching the faucet, simple, geometric, small, not blue, not shiny, not cute, not oversized, not cartoonish. Flat vector. Pure white background. Output the four color variants side by side: full orange on white, all black on white, all white on black, all orange on black.
```

### 3. Faucet Direction C: Badge

```text
Refined industrial faucet icon placed inside a simple industrial badge shape. Preferred badge shapes: hexagon, squared contractor plate, simple shield-lite. Black badge fill with hero orange #F96302 faucet inside, OR orange badge outline with orange faucet on white. The badge should feel workwear / tool-company / contractor-grade, strong on a truck door, strong on a sleeve patch, strong as a jobsite sticker. The badge must NOT look like a sports team logo, a police badge, a medieval shield, a luxury crest, a biker patch, or a cartoon emblem. Flat vector, no gradients, no bevels.
```

### 4. Primary Horizontal Lockup

```text
Primary horizontal logo lockup. Refined faucet icon on the left in hero orange #F96302. Wordmark on the right: "Z AND Z PLUMBING", spelled out, all caps, never use an ampersand or "Z & Z". Set in Barlow Condensed Black, uppercase, tight locked kerning, in solid black #000000. Icon height roughly 1.2 to 1.4x wordmark cap height. Spacing icon-to-wordmark roughly 0.4 to 0.5x icon height. Pure white #FFFFFF background. Flat vector, no shadows, no gradients, no bevels, no 3D effects. Output four color variants side by side: (1) full color, orange faucet + black wordmark, (2) all black, (3) all white on black, (4) all orange on white.
```

### 5. Stacked Secondary Lockup

```text
Stacked secondary lockup. Faucet icon centered on top in hero orange #F96302. Below the icon: "Z AND Z" centered on a second line, spelled out, never an ampersand. Below that: "PLUMBING" centered on a third line. Both lines in Barlow Condensed Black, uppercase, locked kerning, in solid black #000000. Square 1:1 canvas, pure white background. Suitable for Google Business Profile avatar, social avatar, sleeve patch, sticker.
```

### 6. Icon-Only Mark Set

```text
Standalone faucet icon at favicon and app-icon scale. No wordmark. Single-fill hero orange #F96302 on white. Output all four color variants in a 2x2 grid: orange on white, black on white, white on black, orange on black. Square 1:1. Must be legible at 24px favicon size. Test mentally at favicon scale: silhouette must hold up.
```

### 7. Badge Lockup: Patch / Sticker

```text
Industrial badge lockup. Hexagonal black badge with hero orange #F96302 outline, 3 to 4 px stroke. Refined faucet icon centered inside in hero orange. Optional small "Z AND Z" wordmark below the faucet in white Barlow Condensed Black uppercase, spelled out, never an ampersand. Designed for sleeve patches, hats, hard hats, stickers, jobsite decals. Embroidery-friendly: minimal detail, strong silhouette. Flat vector. No gradients, no bevels.
```

### 8. Fleet Direction 1: Bold and Clean

```text
Photorealistic mockup of a 2024 white Ford Transit or Mercedes Sprinter work van, clean side-panel view, parked on a residential East Bay street with bungalow-era homes in the background. Daytime, neutral overcast Bay Area daylight. No golden hour, no cinematic drama.

The van wrap, Direction 1, Bold and Clean:
- White van base.
- Large hero orange #F96302 horizontal stripe running the length of the lower third of the van.
- Above the stripe, the primary horizontal logo: orange faucet icon plus the wordmark "Z AND Z PLUMBING" in Barlow Condensed Black uppercase, solid black #000000, spelled out, never an ampersand or "Z & Z". Sized large and readable from across the street.
- White phone number on the orange stripe in Inter Bold uppercase: "(510) 708-4237".
- Small white trust strip on the rear door area in Inter Medium uppercase with 0.02em tracking: "CSLB #896116 · C-36 + A GENERAL ENGINEERING · SINCE 2003".

Style: clean, professional, documentary contractor photography. Home Depot catalog adjacent. Not lifestyle. No swooshes, no fake chrome, no flames, no gradients, no drop shadows, no blue water graphics, no cartoon pipes, no cluttered service lists.
```

### 9. Fleet Direction 2: More Aggressive Contractor

```text
Photorealistic mockup of the same 2024 white work van, same East Bay residential street, same daytime overcast lighting.

The van wrap, Direction 2, More Aggressive Contractor:
- White van base.
- Hero orange #F96302 lower stripe running along the bottom third.
- Bold black rear-quarter block occupying the rear 25% of the van side panel, with a diagonal or angled orange transition where the stripe meets the black block.
- Primary horizontal logo large on the main side panel: orange faucet plus wordmark "Z AND Z PLUMBING" in Barlow Condensed Black uppercase, solid black #000000, spelled out, never an ampersand.
- Phone number very large in white Inter Bold uppercase on the orange stripe: "(510) 708-4237".
- License and trust text stacked on the rear black panel in white Inter and small hero orange separators: "CSLB #896116" / "C-36 + A GENERAL ENGINEERING" / "SINCE 2003" / "TWO LICENSES · ONE CREW".

Feel: stronger, more ownable, more fleet-branded, slightly more aggressive, still clean and professional. No swooshes, no fake chrome, no flames, no gradients, no shadows.
```

### 10. Crew Shirt: Front and Back

```text
Photorealistic flat-lay mockup of a black short-sleeve work shirt, Dickies or Carhartt cut, on a neutral light gray surface, plus a second flat-lay of the same shirt flipped to show the back.

Front: embroidered chest patch on the left, refined Z and Z Plumbing primary lockup at small scale. Orange faucet #F96302 plus wordmark "Z AND Z PLUMBING" in Barlow Condensed Black uppercase, embroidered in white on the black garment, spelled out, never an ampersand or "Z & Z".

Back: large text across the back yoke in white Barlow Condensed Black: "THE PROS OTHER PLUMBERS CALL". Small orange faucet icon centered below the text.

No heat-transfer cheapness. Looks like proper embroidery. No additional taglines, phone numbers, or graphics. No distressed vintage texture.
```

### 11. Sleeve Patch

```text
Photorealistic close-up mockup of an embroidered sleeve patch on a black work shirt or hoodie sleeve. Patch shape: hexagonal. Black patch fill with hero orange #F96302 outline. Refined faucet icon centered inside, in hero orange. Optional small "Z AND Z" wordmark below the faucet in white Barlow Condensed Black uppercase, spelled out, never an ampersand. Embroidery-friendly thread textures. No oversized novelty graphics. No cartoon plumber imagery. No distressed vintage.
```

### 12. Yard Sign

```text
Photorealistic mockup of a rectangular contractor yard sign staked into the grass in front of an East Bay residential property where Z and Z just finished a sewer lateral repair. Sign structure top to bottom:

- White upper area: primary Z and Z Plumbing horizontal lockup centered. Orange faucet plus wordmark "Z AND Z PLUMBING" in Barlow Condensed Black uppercase, solid black, spelled out, never an ampersand.
- Hero orange #F96302 horizontal separator stripe.
- Black lower area with white text:
  - Optional headline: "THE PROS OTHER PLUMBERS CALL" in Barlow Condensed Black uppercase.
  - Large phone number: "(510) 708-4237" in hero orange Barlow Condensed Black.
  - Trust strip: "CSLB #896116 · C-36 + A GENERAL ENGINEERING · SINCE 2003" in Inter Medium uppercase white.

Contractor-grade. Readable from the street. No clutter. No stock icons. No cartoon water drops. Daylight, neutral overcast light, real residential context.
```

### 13. Business Card: Front and Back

```text
Flat-lay mockup of a black matte business card, 3.5 x 2 inches, plus its white back, laid side by side on a neutral light gray #F2F2F2 backdrop.

Front face, black matte: primary Z and Z Plumbing lockup centered. Orange faucet #F96302 plus wordmark "Z AND Z PLUMBING" in Barlow Condensed Black uppercase, embroidered or printed in white, spelled out, never an ampersand or "Z & Z".

Back face, white: thin hero orange #F96302 horizontal stripe near the top edge, then left-aligned details in black Inter:
Line 1, Inter Bold, 18px equivalent: Jay Zareef
Line 2, Inter Medium, 12px uppercase tracked: OWNER
Line 3: (510) 708-4237
Line 4: jay@zandzplumbing.com
Line 5: zandzplumbing.com
Line 6, Inter Medium 11px uppercase: CSLB #896116
Line 7, Inter Medium 11px uppercase: C-36 + A GENERAL ENGINEERING

No drop shadows on the type. Clean, professional, contractor-grade. Not luxury, not boutique.
```

### 14. Homepage Hero with Black Trust Strip

```text
Desktop website homepage hero mockup, 1440 x 900 viewport. Layout top to bottom:

1. Sticky white header strip across the top, about 80px tall. Left side: refined Z and Z Plumbing primary horizontal lockup, orange faucet + black "Z AND Z PLUMBING" Barlow Condensed wordmark, spelled out, never an ampersand. Right side: main nav in Inter SemiBold black + a hero orange CTA button "CALL (510) 708-4237" in white Inter Bold.

2. Hero block, about 520px tall, white background. Inside the container, max-width 1280px:
- Hero orange #F96302 eyebrow label in Inter SemiBold uppercase: "SAME-DAY EAST BAY PLUMBING".
- Large H1 in Barlow Condensed Black uppercase, solid black: "THE PROS OTHER PLUMBERS CALL.".
- Subhead in Inter Regular medium gray #666666, max-width 540px: "Z and Z Plumbing provides same-day plumbing service across the East Bay, backed by C-36 Plumbing and A General Engineering licenses for sewer, street, and infrastructure-level work."
- Two CTAs side by side: primary hero orange #F96302 button in white Inter Bold uppercase "CALL (510) 708-4237"; secondary white button with black border in black Inter Bold uppercase "SCHEDULE ONLINE".

3. Full-width black trust strip directly under the hero, 64px tall, white Inter SemiBold uppercase with hero orange separators:
"TWO LICENSES. ONE CREW. · CSLB #896116 · C-36 + A GENERAL ENGINEERING · SINCE 2003"

No stock photography in the hero. No gradients. No drop shadows. No blue water graphics. Clean industrial contractor aesthetic. Home Depot lineage.
```

### 15. Social Tile / OG Image

```text
1200 x 630 social share / OG image. Solid black #000000 background. Upper-left: refined Z and Z Plumbing primary lockup in white-and-orange variant, orange faucet #F96302 plus wordmark "Z AND Z PLUMBING" in Barlow Condensed Black uppercase, white type on the black background, spelled out, never an ampersand.

Center: large display headline in Barlow Condensed ExtraBold white: "THE PROS OTHER PLUMBERS CALL." Below in Inter Regular medium gray #666666: "Two licenses. One crew. Same-day service across the East Bay."

Lower-right: hero orange button "CALL (510) 708-4237" in white Inter Bold uppercase.

Lower-left small trust line in Inter Medium uppercase white at 60% opacity, with hero orange separators: "CSLB #896116 · C-36 + A GENERAL ENGINEERING · SINCE 2003".

No textures, no patterns, no photography, no gradients.
```

### 16. Google Business Profile Avatar

```text
Square 1024 x 1024 Google Business Profile avatar. Use the stacked secondary lockup centered on a pure white #FFFFFF background. Refined faucet icon in hero orange #F96302 centered on top. Below it, "Z AND Z" centered on a second line and "PLUMBING" centered on a third line, Barlow Condensed Black uppercase, solid black, spelled out, never an ampersand. Generous whitespace around the lockup so it reads cleanly at small profile thumbnail sizes. No background texture, no decorative border, no shadow.
```

### 17. Mobile Sticky Call Button + Trust Strip

```text
Mobile homepage mockup, 390 x 844 viewport, iPhone 15 size. Top: sticky white header, 64px, with refined Z and Z Plumbing primary lockup on the left, faucet + "Z AND Z PLUMBING" spelled out, and a hero orange phone-icon CTA on the right.

Below the hero block: full-width black trust strip stacked to two lines at this viewport. Line 1 white Inter SemiBold uppercase with hero orange separators: "CSLB #896116 · C-36 + A GENERAL ENGINEERING". Line 2: "TWO LICENSES. ONE CREW. · SINCE 2003".

Pinned to the bottom of the viewport: 72px sticky bottom bar, black background. Two buttons side by side filling the bar. Left button: hero orange #F96302 with white Inter Bold uppercase "CALL (510) 708-4237" and a phone icon. Right button: white background, black text, "SCHEDULE" and a calendar icon. Subtle shadow above the bar.

No drop shadows on type. Clean. Industrial. Contractor-grade.
```

### 18. Photography Brief: Job-Site Scene

```text
Documentary contractor photography, Home Depot catalog adjacent. A Z and Z Plumbing crew in black work shirts, orange faucet chest patch visible, working a sewer lateral excavation trench in front of an Oakland Rockridge bungalow. Trenchless equipment visible in the shot: hydrojetter, camera rig, or compact excavator. Crew member at the trench edge in confident posture, looking at the job, not posed for the camera.

Branded white work van parked at the curb in the background, orange lower stripe visible, primary horizontal lockup readable on the side panel: "Z AND Z PLUMBING" wordmark spelled out in solid black with orange faucet icon. Optional: utility paint markings on the asphalt indicating gas, water, sewer lines.

Daytime, neutral Bay Area overcast light. No moody low light. No black and white. No Instagram filters. No lifestyle staging, no smiling family hugging in the background. Real job, real crew, real Oakland street.
```

---

## Approval Checklist

1. Is the faucet single-fill orange, black, or white? No multi-color, no cartoon shading.
2. Does the wordmark read exactly `Z AND Z PLUMBING`, spelled out, all caps, no ampersand, no plus sign, no `ZANDZ`?
3. Is the wordmark set in Barlow Condensed Black or ExtraBold, uppercase, with locked kerning?
4. Is the wordmark solid black on light backgrounds and solid white on dark backgrounds?
5. Is the background plain white or plain black? No cream, no dashed border, no navy band.
6. Are there any heritage tones, including Prussian Blue, Warm Gold, or Bone? None allowed.
7. Any drop shadows, glows, gradients, bevels, or 3D effects on the logo? None allowed.
8. Does it look like Home Depot / Husky / DeWalt / contractor fleet lineage, or like a 1990s plumber van? Must be the former.
9. If a trust strip is included, does the copy match one of the approved versions from `MASTER-PROMPT.md`?
10. For uniforms, vehicles, or signage: does it look production-ready, embroidery-friendly, wrap-friendly, and sign-shop-friendly?
