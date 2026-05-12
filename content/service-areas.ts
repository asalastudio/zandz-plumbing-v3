import type { ServiceArea } from "@/types/content";

export const serviceAreas: ServiceArea[] = [
  {
    slug: "plumber-san-leandro-ca",
    city: "San Leandro",
    state: "CA",
    zips: ["94577", "94578", "94579"],
    intro:
      "Z and Z Plumbing is headquartered in San Leandro. We know the neighborhoods, the housing stock, and the older cast-iron and galvanized systems that need attention.",
    neighborhoods: ["Bay-O-Vista", "Estudillo Estates", "Washington Manor", "Davis", "Broadmoor"],
    isHQ: true,
  },
  {
    slug: "plumber-oakland-ca",
    city: "Oakland",
    state: "CA",
    zips: ["94601", "94602", "94603", "94605", "94606", "94607", "94608", "94609", "94610", "94611", "94612", "94619"],
    intro:
      "Oakland is our largest service market. We run calls across all Oakland neighborhoods daily. Residential, commercial, and street-side lateral work.",
    neighborhoods: ["Fruitvale", "Temescal", "Rockridge", "Montclair", "Grand Lake", "West Oakland", "East Oakland"],
    isHQ: false,
  },
  {
    slug: "plumber-berkeley-ca",
    city: "Berkeley",
    state: "CA",
    zips: ["94702", "94703", "94704", "94705", "94708", "94709", "94710"],
    intro:
      "Berkeley's older housing stock, bungalows from the 1920s and 1940s, often needs the kind of repipe and sewer lateral work we specialize in.",
    neighborhoods: ["Elmwood", "Claremont", "North Berkeley", "West Berkeley", "Southside"],
    isHQ: false,
  },
  {
    slug: "plumber-alameda-ca",
    city: "Alameda",
    state: "CA",
    zips: ["94501", "94502"],
    intro:
      "Alameda Island homes date back to the early 1900s. We serve the whole island for drain cleaning, sewer lateral, water heater, and repipe.",
    neighborhoods: ["Gold Coast", "West End", "Fernside", "Bay Farm Island"],
    isHQ: false,
  },
  {
    slug: "plumber-hayward-ca",
    city: "Hayward",
    state: "CA",
    zips: ["94541", "94542", "94544", "94545"],
    intro:
      "We serve Hayward residential and light commercial. Fast response from our San Leandro base, typically 30 to 60 minutes.",
    neighborhoods: ["Downtown Hayward", "Fairway Park", "Mission Hills", "Southgate"],
    isHQ: false,
  },
  {
    slug: "plumber-castro-valley-ca",
    city: "Castro Valley",
    state: "CA",
    zips: ["94546"],
    intro:
      "Castro Valley hillside homes see a lot of root intrusion in their sewer lines. We run camera inspections and clear laterals across the 94546.",
    neighborhoods: ["Five Canyons", "Proctor", "Lake Chabot"],
    isHQ: false,
  },
  {
    slug: "plumber-richmond-ca",
    city: "Richmond",
    state: "CA",
    zips: ["94801", "94803", "94804", "94805"],
    intro:
      "Z and Z serves Richmond for drain cleaning, sewer lateral, gas line, and water heater work. We cover the whole city.",
    neighborhoods: ["Point Richmond", "Iron Triangle", "Hilltop", "Annex"],
    isHQ: false,
  },
  {
    slug: "plumber-emeryville-ca",
    city: "Emeryville",
    state: "CA",
    zips: ["94608"],
    intro:
      "Emeryville commercial and residential clients call us for fast, licensed plumbing service. We're usually on-site within the hour.",
    neighborhoods: ["Bay Street", "Watergate", "Christie Park"],
    isHQ: false,
  },
  {
    slug: "plumber-pinole-ca",
    city: "Pinole",
    state: "CA",
    zips: ["94564"],
    intro:
      "We service Pinole for residential plumbing. Drain cleaning, water heaters, repipe, and sewer work.",
    neighborhoods: ["Old Town Pinole", "Giant Road", "Hercules border"],
    isHQ: false,
  },
  {
    slug: "plumber-lafayette-ca",
    city: "Lafayette",
    state: "CA",
    zips: ["94549"],
    intro:
      "Lafayette homeowners call us for sewer lateral inspections and repipe work. We handle larger residential projects across Contra Costa.",
    neighborhoods: ["Burton Valley", "Happy Valley", "Reliez Valley"],
    isHQ: false,
  },
];
