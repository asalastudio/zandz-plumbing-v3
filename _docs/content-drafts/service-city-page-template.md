# Z & Z Plumbing — Service × City Page Template

**Purpose:** A repeatable on-page template for every service-city page on the site. Use this template for every page in the `ZNZ-Service-City-Page-Map.xlsx` build queue.

**Rule:** Each page must be unique. No duplicated paragraphs. The local detail in each section must change per city — that's the difference between this and the doorway-page anti-pattern that gets penalized.

---

## Page brief — fill in for each new page

| Field | Value |
|---|---|
| Service | (e.g., "Sewer lateral compliance") |
| City | (e.g., "Berkeley") |
| Target keyword (primary) | (e.g., "sewer lateral berkeley") |
| Secondary keywords | (e.g., "EBMUD sewer compliance," "PSL Berkeley") |
| URL slug | `/sewer-lateral-berkeley/` (lowercase, hyphenated, descriptive) |
| Target word count | 700–1,200 |
| Internal links in (other pages that link to this) | (list 3) |
| Internal links out (this page links to) | (list 3) |

---

## Required on-page elements (don't ship without these)

### 1. Title tag (≤60 chars)
**Pattern:** `[Service] [City] | Z & Z Plumbing — Two Licenses, One Crew`
**Example:** `Sewer Lateral Compliance Berkeley | Z & Z Plumbing`

### 2. Meta description (≤155 chars)
**Pattern:** `Need [service] in [city]? Z & Z Plumbing handles [specific outcome] · C-36 + A-Gen Engineering · Call (510) 708-4237.`

### 3. H1 (one only, contains primary keyword + city)
**Pattern:** `[Service] in [City], CA — [Trust Hook]`
**Example:** `Sewer Lateral Compliance in Berkeley, CA — EBMUD-Compliant Repairs by a Licensed General Engineering Contractor`

### 4. Opening paragraph (~100 words)

Must include:
- Primary keyword in the first sentence
- The specific pain point of someone in this city searching for this service right now
- The double-license trust hook (C-36 + A General Engineering #896116)
- Phone number with `tel:` link

**Template:**
> If you're searching for [service] in [City], it's almost always because [specific local situation — a real-estate transaction, a sewer backup, a code violation, a failed inspection, an aging system]. Z & Z Plumbing has been handling exactly this kind of work in the East Bay for over 20 years. We're one of the only Oakland plumbing companies licensed for both C-36 plumbing and A General Engineering (CSLB #896116) — which means we can legally work in the public right-of-way most plumbers can't touch. Call us at [(510) 708-4237](tel:5107084237) for same-day service in [City].

### 5. "Why [City] homeowners choose Z & Z" — H2 (~150 words)

Must include:
- A real city-specific detail (housing era, neighborhood, regulatory context, geography)
- One concrete example or job type seen often in this city
- A trust signal (years, licenses, equipment owned in-house)

**Examples of city-specific details to use:**
- **Oakland:** pre-1960s housing stock, galvanized supply lines, neighborhood names (Rockridge, Montclair, Temescal, Fruitvale, Dimond, West Oakland)
- **Berkeley:** hill-perch housing, narrow streets, decades-old sewer laterals, EBMUD compliance triggers
- **San Leandro:** post-war ranch homes, mid-century plumbing, foundation settling
- **Hayward:** mix of post-war and newer builds, large-lot single-family
- **Alameda:** Victorian-era homes on the Island, original cast iron drains
- **Richmond:** older industrial-adjacent housing, mixed mid-century stock
- **Lafayette:** larger custom homes, hill geography, irrigation/landscape plumbing
- **Castro Valley:** post-war ranch homes, larger lots, well-water transitions
- **Pinole:** suburban single-family, often-original water heaters
- **Emeryville:** condo and live/work conversions, multi-unit plumbing systems

### 6. "What's included in [Service]" — H2 (~200 words)

Must include:
- What the service covers, plainly
- What the process looks like step by step
- What the customer gets at the end (deliverable / outcome)
- The differentiator if relevant (e.g., for sewer lateral pages: "we have an A General Engineering license, so we can complete street-side work other plumbers must subcontract")

### 7. Pricing transparency block (optional but recommended)

**Pattern:** *"Most [service] jobs in [city] fall in the [range] range. Pricing varies based on [factors]. We'll quote you up front before any work begins — no surprise pricing."*

**Examples by service:**
- Repipe: "$15K–$40K depending on number of bathrooms, stories, and access"
- Sewer lateral: "$7K–$80K with most jobs $12K–$17K"
- Water heater install: "$1,200–$3,500 standard tank; $3,500–$6,500 tankless"
- Drain cleaning: "$200–$600 typical"

### 8. "Frequently asked questions" — H2 with at least 3 city-specific Q&A

Must use FAQ schema (Rank Math handles this).

**Example FAQs by service:**

**Sewer lateral / EBMUD:**
- Q: "Do I need an EBMUD compliance certificate to sell my home in [City]?"
- Q: "How long does a sewer lateral inspection take?"
- Q: "What happens if my lateral fails the inspection?"

**Repipe:**
- Q: "How long does a whole-home repipe take in a [city] [housing-era] home?"
- Q: "Will you have to open every wall?"
- Q: "How do I know if I have galvanized pipes?"

**Emergency plumber:**
- Q: "Do you really answer the phone at 2 AM in [City]?"
- Q: "What counts as an emergency vs. something that can wait?"
- Q: "Do you charge extra for after-hours calls?"

### 9. Social proof block

Pull two or three city-specific quotes from the voice-of-customer doc. Cite as "★★★★★ — [First name], [Neighborhood], [Year]" without full names or addresses. If no city-specific quote exists yet, leave a placeholder marked `[CITY-SPECIFIC QUOTE NEEDED]` and circle back when the review-mining produces one.

### 10. CTA block (above the fold, mid-page, and at the bottom)

**Pattern:**
> **Need a plumber in [City] right now?**
> Call (510) 708-4237 — we answer 24/7 for emergencies.
> Or [request service online](/contact/).

Use `tel:` links on every phone-number CTA.

### 11. Service area schema and footer links

Each page should:
- Include a `Service` JSON-LD with `areaServed` set to the city
- Link to the city's hub page (e.g., `/plumber-berkeley/`) and the service hub page (e.g., `/sewer-lateral-compliance/`)
- Link to two adjacent city pages for related searches

### 12. License and trust footer (consistent across all pages)

> Z & Z Plumbing · CSLB #896116 (C-36 + A General Engineering) · Licensed, bonded, and insured · Serving Oakland and the East Bay since 2003

---

## Banned phrases on every page

These come straight from the brand voice rules in `claude.md`:

- "Look no further"
- "In today's fast-paced world"
- "We pride ourselves on"
- "State-of-the-art"
- "Top-notch"
- "Unparalleled"
- Em-dashes used as a stylistic AI tell
- Empty intros that restate the H1
- Three-word bullet lists where every bullet is the same length

---

## Page review checklist (before publish)

- [ ] Primary keyword in title tag (≤60 chars), meta description (≤155 chars), H1, first sentence, and one H2
- [ ] City name in title, H1, opening paragraph, and at least 2 H2s
- [ ] One real city-specific detail in the body (not generic)
- [ ] License framing visible: "C-36 + A General Engineering · CSLB #896116"
- [ ] Phone number with `tel:` link, above the fold
- [ ] FAQ schema implemented (at least 3 Q&A)
- [ ] Service schema with areaServed set
- [ ] At least 3 internal links: 1 city hub, 1 service hub, 1 related page
- [ ] Mobile reads cleanly (no paragraph >4 lines on phone width)
- [ ] No banned phrases present
- [ ] Voice-of-customer language used in social proof
- [ ] Page passes Rich Results Test (https://search.google.com/test/rich-results)
- [ ] PageSpeed Insights mobile score >75

---

## Page-build cadence (target)

- Week 4: 3 pages (Oakland hub + Berkeley + San Leandro rebuild)
- Week 5: 3 pages (Repipe, EBMUD, General Engineering hubs)
- Week 6: 4 pages (Alameda, Hayward, Sewer Lateral Berkeley, Tankless Oakland)
- Week 8: 1 page (Richmond)
- Week 10: 2 pages (Lafayette, Castro Valley)
- Week 11: 2 pages (Pinole, Emeryville)

**12-week total:** ~15 high-quality pages, each unique, each city-specific, each linking into the rest of the site.
