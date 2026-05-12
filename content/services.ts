import type { Service } from "@/types/content";

export const services: Service[] = [
  {
    slug: "sewer-lateral",
    title: "Sewer Lateral Services",
    shortTitle: "Sewer & Drain",
    icon: "GitMerge",
    summary: "Clogs, root intrusion, line cleaning, camera inspections, and more.",
    description:
      "Z and Z holds a General Engineering license — the license that lets us work in the street, past the property line, and on the lateral itself. Most plumbers can't touch it. We can.",
    featured: true,
  },
  {
    slug: "drain-cleaning",
    title: "Drain Cleaning",
    shortTitle: "Drain Cleaning",
    icon: "Pipette",
    summary: "Same-day drain clearing. Kitchen, bath, floor, and main line.",
    description:
      "We clear clogged drains fast. Kitchen lines, bathroom drains, floor drains, and main sewer lines. Camera inspection available to confirm the root cause.",
    featured: false,
  },
  {
    slug: "water-heater",
    title: "Water Heater Services",
    shortTitle: "Water & Gas Lines",
    icon: "Thermometer",
    summary: "Replacements, repipes, emergency line work, and more.",
    description:
      "Tank and tankless water heater repair and replacement. We stock common units and can often install same day.",
    featured: true,
  },
  {
    slug: "emergency",
    title: "24/7 Emergency Plumbing",
    shortTitle: "Emergency",
    icon: "AlertTriangle",
    summary: "Burst pipes, active leaks, sewer backups. We answer every call.",
    description:
      "Plumbing emergencies don't wait for business hours. We're available 24/7 across the East Bay. Call and a plumber picks up.",
    featured: false,
  },
  {
    slug: "repipe",
    title: "Whole House Repipe",
    shortTitle: "Repipe",
    icon: "Wrench",
    summary: "Galvanized to copper or PEX. Full house or targeted sections.",
    description:
      "Pre-1970s East Bay homes run on aging galvanized pipe. We repipe in copper or PEX — full house or problem sections — with minimal wall damage.",
    featured: false,
  },
  {
    slug: "hydrojetting",
    title: "Hydrojetting",
    shortTitle: "Hydrojetting",
    icon: "Droplet",
    summary: "High-pressure drain cleaning. Grease, scale, and root intrusion.",
    description:
      "High-pressure water jetting cuts through grease buildup, mineral scale, and light root intrusion. The right tool for recurring clogs and restaurant lines.",
    featured: false,
  },
  {
    slug: "gas-line",
    title: "Gas Line Services",
    shortTitle: "Street & Infrastructure",
    icon: "Flame",
    summary: "Trench work, laterals, street repairs, utility connections, and more.",
    description:
      "Gas line repair, replacement, and new installation. We handle both interior gas piping and street-side service line work under our General Engineering license.",
    featured: true,
  },
  {
    slug: "leak-detection",
    title: "Leak Detection",
    shortTitle: "Leak Detection",
    icon: "Droplet",
    summary: "Find hidden leaks without tearing up your floors or walls.",
    description:
      "Electronic leak detection locates slab leaks, pinhole leaks, and underground breaks without exploratory demo. Know exactly what you're fixing before we open a wall.",
    featured: false,
  },
  {
    slug: "water-line",
    title: "Water Line Repair",
    shortTitle: "Water Line",
    icon: "Pipette",
    summary: "Service line repair and replacement. Street to meter to house.",
    description:
      "Water main breaks and service line failures are stressful. We repair and replace from the street connection all the way to your meter and into the house.",
    featured: false,
  },
  {
    slug: "faucet",
    title: "Faucet & Fixture",
    shortTitle: "Faucet",
    icon: "ShowerHead",
    summary: "Repair or replace any faucet, showerhead, or fixture.",
    description:
      "Dripping faucets and failing fixtures waste water and money. We repair or replace any faucet, showerhead, or fixture — kitchen, bath, or outdoor.",
    featured: false,
  },
  {
    slug: "toilet",
    title: "Toilet Repair & Replacement",
    shortTitle: "Toilet",
    icon: "Toilet",
    summary: "Running toilets, clogs, wax rings, and full replacements.",
    description:
      "Running toilets can waste 200 gallons a day. We fix the problem — whether it's the flapper, fill valve, wax ring, or the whole unit.",
    featured: false,
  },
  {
    slug: "garbage-disposal",
    title: "Garbage Disposal",
    shortTitle: "Garbage Disposal",
    icon: "Trash2",
    summary: "Installation, repair, and replacement of all major brands.",
    description:
      "Jammed or leaking disposals are a quick fix. Worn-out units get replaced. We install all major brands and wire to your existing circuit.",
    featured: false,
  },
];

export const featuredServices = services.filter((s) => s.featured);
