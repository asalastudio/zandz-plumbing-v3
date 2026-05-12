# 07 · Image Direction

**Status:** Locked 2026-05-11. v1 uses existing Z and Z assets. Phase 2 includes a planned photo shoot.

## Photography style

Direct, well-lit, documentary. The look is closer to Home Depot's professional contractor catalogs and Roto-Rooter's marketing assets than to lifestyle blog photography.

### What we want

- Real Z and Z trucks (not stock plumber vans)
- Real Z and Z crew members (not models)
- Real Oakland and East Bay job sites (not generic plumbing locations)
- Daylight or bright neutral light. Avoid moody low-light
- Confident postures. Crew looking at the camera or at the job, never staged smiling
- Tools and equipment visible. Hands-on action
- Geotagged where possible. Helps GBP SEO

### What we do not want

- Stock photography of unrelated plumbers
- Overly stylized "lifestyle" photography (the family hugging while a plumber works in the background)
- Black-and-white treatment
- Heavy filters or Instagram-style color grading
- Cartoon illustrations (the lateral diagram is the one exception)
- Cluttered backgrounds

## Subject inventory needed

Phase 2 photo shoot (or sourced from existing Z and Z library if available):

| Subject | Use |
|---|---|
| Z and Z truck exterior, hero shot | Homepage hero alternate, Service Areas page hero |
| Z and Z truck exterior with crew, posed | About page hero |
| Crew at an Oakland street-side lateral job (right-of-way work in progress) | Sewer Lateral Oakland page hero. This is THE shot. Proves the A-license differentiator visually. |
| Crew inside a customer's home, working on a repipe or water heater | Various service page heroes |
| Close-up of copper repipe work | Repipe service page |
| Commercial-grade hydrojetter on a job site | Hydrojetting service page |
| Trenchless equipment in action | Sewer Lateral hero alternate |
| Jay portrait (working, not corporate headshot) | About page, GBP profile, testimonial card author |
| Seif portrait | Same |
| Crew portraits (3 to 5 people) | About page team grid |
| Shop exterior at 3057 Teagarden | About page, Service Areas hero alternate |
| Before/after of completed sewer lateral repair | Sewer Lateral service page (anonymize address) |
| Tools and equipment laid out (hydrojetter, camera rig, trenchless gear) | About page, blog post heroes |

If the v1 launch happens before a shoot, use the best existing Z and Z assets Jay can provide. Better to launch with real-but-imperfect photography than wait for perfect.

## Illustration usage

Minimal and functional only. Two approved categories:

### 1. The sewer lateral diagram

A clean cross-section showing:
- House structure on the left
- Yard / property line in the middle
- Sidewalk + parkway strip
- Street with the city main below
- Color-coded zones: blue (C-36 territory, property side) and hero-orange (A General Engineering territory, public right-of-way)

This diagram lives on `/sewer-lateral-oakland/`, `/services/sewer-lateral/`, and possibly the homepage's "Why two licenses matters" section. It is the single most important visual proof of the brand differentiator.

### 2. Service category icons

Lucide-react icons in hero-orange:
- Faucet for general plumbing
- Droplet for leak detection
- Wrench for repairs
- Flame for water heater + gas line
- Drain (or custom) for drain cleaning
- Pipe for sewer / pipe repair

That is it. No custom mascot illustrations, no decorative spot illustrations, no cute animated SVGs.

## Image specifications

### File formats

- WebP for production photography (with PNG fallback for old browsers, handled by Next.js Image automatically)
- SVG for icons and the lateral diagram
- JPG for OG images (1200x630) and email-embedded images

### Image sizes

| Use | Aspect ratio | Source min size |
|---|---|---|
| Homepage hero | 16:9 | 2400x1350 |
| Service page hero | 16:9 | 2400x1350 |
| OG image | 1.91:1 | 1200x630 |
| Service card thumbnail | 16:9 | 1280x720 |
| About page team grid | 4:5 | 1200x1500 per portrait |
| Truck portrait | 4:5 or 1:1 | 1500x1500+ |
| Job site action | 3:2 | 1800x1200 |
| Before/after side-by-side | 1:1 each | 1200x1200 per image |

### Compression

Next.js Image handles this automatically. Target Lighthouse mobile performance score 75 or higher, which means total page image weight under 1.5MB on most pages.

## Image metadata

Every production image needs:

- Alt text (descriptive, not generic). "Z and Z crew member excavating sewer lateral on Telegraph Avenue in Oakland" not "Plumber working."
- Filename in kebab-case with location and subject. `oakland-rockridge-lateral-excavation.jpg` not `IMG_4892.jpg`
- EXIF data preserved where possible (geo-tagging helps local SEO)
- Optimized file size before commit (use ImageOptim, Squoosh, or similar)

## Sourcing fallbacks for v1

If existing Z and Z library is thin, allowed v1 fallbacks in priority order:

1. **Stills from any Z and Z marketing material that already exists** (Yelp ads, GBP photos, previous business cards)
2. **Generic real plumber-tool photography on a clean white or light-gray background** (e.g., the lateral diagram, a wrench, a hydrojetter close-up where the brand-identifying logo is cropped out)
3. **Stock photography only as an absolute last resort** and only on the homepage hero or About page hero, never on a service page. Source: Unsplash plus a careful pick. Avoid the cliched "smiling plumber holding wrench" stock photo.

Stock is the worst option because it reads as fake and undermines every other authority signal we have built. Avoid where possible.

## Phase 2 photo shoot brief (for the planned shoot)

When the shoot happens:

- Half-day minimum, full day preferred
- East Bay-based photographer who shoots contractors (recommended: search Bay Area contractor photographers, not lifestyle photographers)
- Budget range: $1,500 to $3,000 for a half-day plus light retouching
- Shot list driven by the Subject Inventory above
- Plan one job-site shoot during a real Oakland sewer lateral repair if possible. The right-of-way work in progress is the differentiator-in-action shot we cannot fake.
- Crew portraits in work clothes, not posed corporate headshots
- Truck shots in Bay Area locations (Lake Merritt, Rockridge BART, the Teagarden shop)

Deliverable to Jay: full library of raw + retouched files, organized by subject + location.

## Image library structure

Save production images in the codebase under:

```
Z&Zplumbing-v3/public/images/
├── hero/             (homepage hero variants)
├── trucks/           (truck shots for various uses)
├── crew/             (portraits and team photos)
├── jobsites/         (oakland-*, san-leandro-*, etc.)
├── services/         (service-category photography)
├── equipment/        (hydrojetter, trenchless, camera rig)
├── diagrams/         (the lateral diagram + future diagrams)
├── og/               (OG images per page)
└── icons/            (favicon variants)
```

Pre-production library lives in `06_Brand Package-v2/assets/photography/` with raw files Jay or the photographer hands over.
