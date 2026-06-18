import type { ServiceArea } from "@/types/content";
import { alamedaCountyZips, contraCostaCountyZips } from "@/content/east-bay-zips";

export const serviceAreas: ServiceArea[] = [
  {
    slug: "plumber-san-leandro-ca",
    city: "San Leandro",
    state: "CA",
    zips: ["94577", "94578", "94579"],
    intro:
      "Z and Z Plumbing is headquartered in San Leandro. We know the neighborhoods, the housing stock, and the older cast-iron and galvanized systems that need attention.",
    localContext:
      "San Leandro is home base — our shop sits at 3057 Teagarden Street, so this is the fastest-response city in our whole map. Much of the housing here went up in the post-war boom: the Washington Manor and Broadmoor tracts from the 1940s and 50s, plus the older homes around Estudillo Estates and Bay-O-Vista. That era means a lot of galvanized supply lines reaching the end of their life and cast-iron drains that have been corroding for decades. The city is inside EBMUD's service area, so sewer laterals fall under the same private-lateral rules as Oakland and Berkeley.",
    commonIssues: [
      "Galvanized supply lines (1940s-50s tracts) corroding and dropping water pressure",
      "Cast-iron drain and waste line corrosion in older homes",
      "Sewer lateral root intrusion under mature street trees",
      "Water heater replacement in slab-foundation tract homes",
    ],
    neighborhoods: ["Bay-O-Vista", "Estudillo Estates", "Washington Manor", "Davis", "Broadmoor"],
    isHQ: true,
  },
  {
    slug: "plumber-oakland-ca",
    city: "Oakland",
    state: "CA",
    zips: [
      "94601",
      "94602",
      "94603",
      "94604",
      "94605",
      "94606",
      "94607",
      "94608",
      "94609",
      "94610",
      "94611",
      "94612",
      "94613",
      "94614",
      "94615",
      "94617",
      "94618",
      "94619",
      "94621",
      "94622",
      "94623",
      "94624",
      "94649",
      "94659",
      "94660",
      "94661",
      "94666",
    ],
    intro:
      "Oakland is our largest service market. We run calls across all Oakland neighborhoods daily. Residential, commercial, and street-side lateral work.",
    localContext:
      "Oakland is our biggest market and some of the oldest housing stock we touch: West Oakland and Temescal Victorians, Rockridge and Dimond Craftsman bungalows, and the hillside homes up in Montclair. A huge share of these predate 1960, which means galvanized supply lines and clay sewer laterals that mature street trees have been working their roots into for years. Oakland also enforces EBMUD's Private Sewer Lateral (PSL) ordinance — when a property sells or undergoes major work, the lateral often has to be tested and certified, and that's exactly the street-side work our A General Engineering license lets us handle.",
    commonIssues: [
      "EBMUD Private Sewer Lateral (PSL) compliance at sale or remodel",
      "Galvanized-to-copper or PEX repipes in pre-1960 homes",
      "Root-intruded clay sewer lines (hydrojetting + camera inspection)",
      "Hillside drainage and access challenges in Montclair / the hills",
    ],
    neighborhoods: ["Fruitvale", "Temescal", "Rockridge", "Montclair", "Grand Lake", "West Oakland", "East Oakland"],
    isHQ: false,
  },
  {
    slug: "plumber-berkeley-ca",
    city: "Berkeley",
    state: "CA",
    zips: [
      "94701",
      "94702",
      "94703",
      "94704",
      "94705",
      "94707",
      "94708",
      "94709",
      "94710",
      "94712",
      "94720",
    ],
    intro:
      "Berkeley's older housing stock, bungalows from the 1920s and 1940s, often needs the kind of repipe and sewer lateral work we specialize in.",
    localContext:
      "Berkeley is a city of pre-war bungalows and the steep hill homes above Claremont and North Berkeley. The flatland homes around the Elmwood and Southside run on aging galvanized pipe; the hill properties add a real wrinkle for sewer lateral work, where the line drops down a slope and access is tight. Berkeley falls under EBMUD's PSL ordinance too, so lateral testing and certification come up regularly at sale. Our A General Engineering license covers the public right-of-way portion of those laterals that most C-36-only plumbers can't legally touch.",
    commonIssues: [
      "Hill-home sewer laterals with steep grade and difficult access",
      "Galvanized supply-line repipes in 1920s-40s bungalows",
      "EBMUD PSL testing and certification at sale",
      "Root intrusion in old clay lines under established trees",
    ],
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
    localContext:
      "Alameda is an island of early-1900s Victorians and Edwardians, concentrated on the Gold Coast and through the West End, with newer construction out on Bay Farm. The age of the housing stock means cast-iron drains and galvanized supply lines are common, and the island's low elevation and high water table can make drain and sewer work more involved than on higher ground. We cover the whole island, from the century homes near the estuary to Bay Farm.",
    commonIssues: [
      "Cast-iron drain corrosion in century-old Victorians and Edwardians",
      "Galvanized supply lines in early-1900s homes",
      "Sewer lateral work complicated by the island's high water table",
      "Water heater repair and replacement across older and Bay Farm homes",
    ],
    neighborhoods: ["Gold Coast", "West End", "Fernside", "Bay Farm Island"],
    isHQ: false,
  },
  {
    slug: "plumber-hayward-ca",
    city: "Hayward",
    state: "CA",
    zips: ["94540", "94541", "94542", "94543", "94544", "94545", "94557"],
    intro:
      "We serve Hayward residential and light commercial. Fast response from our San Leandro base, typically 30 to 60 minutes.",
    localContext:
      "Hayward sits right next door to our San Leandro base, so it's one of our quickest-response cities. The housing is a mix: post-war tract homes across the flats around Fairway Park and Southgate, older homes near Downtown, and the foothill properties up in the Hayward Hills. The flatland tracts bring the usual aging-supply-line and slab-leak work, while the hill homes add grade and access considerations for sewer and drain jobs. We handle both residential and light commercial here.",
    commonIssues: [
      "Slab leaks in post-war tract homes",
      "Aging galvanized supply lines and water heater replacement",
      "Sewer line root intrusion and main-line clearing",
      "Light-commercial plumbing service and repairs",
    ],
    neighborhoods: ["Downtown Hayward", "Fairway Park", "Mission Hills", "Southgate"],
    isHQ: false,
  },
  {
    slug: "plumber-union-city-ca",
    city: "Union City",
    state: "CA",
    zips: ["94587"],
    intro:
      "Union City sits directly in our south East Bay service corridor. We run plumbing calls for homes and light commercial properties near Decoto, Alvarado, Union Landing, and the I-880 corridor.",
    localContext:
      "Union City sits squarely in our south East Bay corridor along I-880. Most of the housing went up between the 1960s and 80s in the Alvarado and Seven Hills subdivisions, with the older Decoto neighborhood predating that. Homes from that era are now hitting the age where original water heaters, supply lines, and sewer lines start needing attention, and the commercial strip around Union Landing keeps us busy with light-commercial calls.",
    commonIssues: [
      "Aging supply lines and water heaters in 1960s-80s subdivisions",
      "Sewer line camera inspections and root clearing",
      "Drain cleaning for homes and Union Landing-area businesses",
      "Repipe work in the older Decoto neighborhood",
    ],
    neighborhoods: ["Decoto", "Alvarado", "Union Landing", "Seven Hills"],
    isHQ: false,
  },
  {
    slug: "plumber-fremont-ca",
    city: "Fremont",
    state: "CA",
    zips: ["94536", "94537", "94538", "94539", "94555"],
    intro:
      "We serve Fremont for sewer lateral, drain cleaning, water heater, repipe, and emergency plumbing calls from Centerville and Niles to Irvington, Mission San Jose, and Warm Springs.",
    localContext:
      "Fremont is large and varied, which means the plumbing work changes neighborhood to neighborhood. The historic districts — Niles and Centerville especially — have older homes that run on galvanized pipe and clay sewer lines, while Mission San Jose and Warm Springs trend newer and lean toward tankless installs and fixture work. We cover all five of Fremont's old townships, so we size the job to the housing era in front of us.",
    commonIssues: [
      "Galvanized repipes and clay-line work in older Niles / Centerville homes",
      "Tankless and tank water heater installs in newer Warm Springs / Mission tracts",
      "Sewer lateral inspection and replacement",
      "Drain cleaning and emergency response across the city",
    ],
    neighborhoods: ["Centerville", "Niles", "Irvington", "Mission San Jose", "Warm Springs"],
    isHQ: false,
  },
  {
    slug: "plumber-newark-ca",
    city: "Newark",
    state: "CA",
    zips: ["94560"],
    intro:
      "Newark homes and businesses are inside our south East Bay response area. We cover drain cleaning, sewer work, repipes, water heaters, and emergency service across the city.",
    localContext:
      "Newark is a flat, largely residential city built out mostly between the 1950s and 70s, with the older core around Old Town and newer development near NewPark. Homes from that build-out era are now at the point where original galvanized supply lines, water heaters, and sewer lines start failing, and the flat terrain means sewer lines rely on consistent grade — when roots or bellies interrupt that, backups follow.",
    commonIssues: [
      "Aging galvanized supply lines in 1950s-70s homes",
      "Sewer line root intrusion and low-grade backups",
      "Water heater repair and replacement",
      "Slab leaks and drain cleaning",
    ],
    neighborhoods: ["Old Town Newark", "Dumbarton", "NewPark", "Lakeshore"],
    isHQ: false,
  },
  {
    slug: "plumber-castro-valley-ca",
    city: "Castro Valley",
    state: "CA",
    zips: ["94546", "94552"],
    intro:
      "Castro Valley hillside homes see a lot of root intrusion in their sewer lines. We run camera inspections, hydrojetting, and lateral work across the full Castro Valley ZIP area.",
    localContext:
      "Castro Valley is largely unincorporated hill country, and the combination of sloped lots and heavy mature-tree cover makes it one of the worst areas we serve for sewer-line root intrusion. Homes up in Five Canyons, Palomares Hills, and around Lake Chabot sit on grades that complicate both drainage and lateral access. This is camera-inspection and hydrojetting territory — we spend a lot of time clearing root masses and scoping lines here before they back up.",
    commonIssues: [
      "Heavy root intrusion in hillside sewer laterals",
      "Hydrojetting and camera inspection for recurring backups",
      "Hill-lot drainage and access challenges",
      "Repipe and water heater work in older hill homes",
    ],
    neighborhoods: ["Five Canyons", "Proctor", "Lake Chabot", "Palomares Hills"],
    isHQ: false,
  },
  {
    slug: "plumber-dublin-ca",
    city: "Dublin",
    state: "CA",
    zips: ["94568"],
    intro:
      "Dublin is part of the I-580 to I-680 corridor we cover between Castro Valley and Walnut Creek. We handle same-day plumbing calls, water heaters, drains, sewer lines, and repipes.",
    localContext:
      "Dublin splits cleanly between old and new. The Dublin Ranch and eastern subdivisions are largely 1990s-2000s construction, so the work skews toward water heater replacement, fixture repair, and drain service rather than full repipes. West Dublin and the downtown core hold the older housing where galvanized lines and aging sewer connections still come up. We cover the whole city along the I-580/I-680 junction.",
    commonIssues: [
      "Water heater replacement (tank and tankless) in newer Dublin Ranch homes",
      "Fixture, faucet, and drain repair in modern subdivisions",
      "Repipe and sewer work in older West Dublin homes",
      "Same-day drain cleaning and emergency calls",
    ],
    neighborhoods: ["West Dublin", "Dublin Ranch", "Downtown Dublin", "Tassajara"],
    isHQ: false,
  },
  {
    slug: "plumber-pleasanton-ca",
    city: "Pleasanton",
    state: "CA",
    zips: ["94566", "94588"],
    intro:
      "Pleasanton is inside our expanded East Bay service corridor. We serve homes and light commercial properties for sewer, drain, water heater, repipe, and emergency plumbing work.",
    localContext:
      "Pleasanton pairs a historic downtown — older Victorians and early-1900s homes along Main Street — with large newer subdivisions out toward Stoneridge and Birdland. That split drives the work: the downtown-area homes bring repipe, sewer lateral, and galvanized-line jobs, while the newer tracts lean toward water heater service and fixture work. We cover both sides for residential and light commercial.",
    commonIssues: [
      "Repipes and sewer work in older downtown Pleasanton homes",
      "Water heater service in newer Stoneridge / Birdland subdivisions",
      "Sewer lateral inspection and drain cleaning",
      "Light-commercial plumbing along the business corridors",
    ],
    neighborhoods: ["Downtown Pleasanton", "Stoneridge", "Val Vista", "Birdland"],
    isHQ: false,
  },
  {
    slug: "plumber-richmond-ca",
    city: "Richmond",
    state: "CA",
    zips: ["94801", "94802", "94804", "94805", "94807", "94808", "94850"],
    intro:
      "Z and Z serves Richmond for drain cleaning, sewer lateral, gas line, and water heater work. We cover the whole city.",
    localContext:
      "Richmond runs from the Victorians of Point Richmond and the older Iron Triangle out to the mid-century homes up on Hilltop. The older neighborhoods carry the familiar pre-war problems — galvanized supply lines and corroding cast-iron drains — while the mid-century stock is now old enough that original sewer lines and water heaters are failing. We cover the whole city for drain, sewer, gas line, and water heater work.",
    commonIssues: [
      "Galvanized repipes and cast-iron drain corrosion in older neighborhoods",
      "Aging sewer laterals and root intrusion",
      "Gas line repair and replacement",
      "Water heater repair and replacement",
    ],
    neighborhoods: ["Point Richmond", "Iron Triangle", "Hilltop", "Annex"],
    isHQ: false,
  },
  {
    slug: "plumber-emeryville-ca",
    city: "Emeryville",
    state: "CA",
    zips: ["94608", "94662"],
    intro:
      "Emeryville commercial and residential clients call us for fast, licensed plumbing service. We're usually on-site within the hour.",
    localContext:
      "Emeryville is small and dense, with a high mix of live/work lofts, mid-rise condos, and light commercial around Bay Street and the Watergate. The work here skews more commercial and multi-unit than most of our map — shared stacks, condo and loft repairs, and businesses that need fast turnaround. It's close to our base, so we're usually on-site within the hour.",
    commonIssues: [
      "Commercial and multi-unit plumbing service",
      "Condo and live/work loft repairs (shared stacks and lines)",
      "Water heater service in mid-rise buildings",
      "Fast-response drain and leak calls for businesses",
    ],
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
    localContext:
      "Pinole is a small, mostly residential city with an older core around Old Town and post-war neighborhoods spreading toward the Hercules border. The housing age means original galvanized supply lines and sewer lines are reaching the end of their service life, so repipe, water heater, and sewer work make up most of what we do here.",
    commonIssues: [
      "Repipes for aging galvanized supply lines",
      "Sewer line root intrusion and clearing",
      "Water heater repair and replacement",
      "Drain cleaning for older homes",
    ],
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
    localContext:
      "Lafayette is larger-lot Contra Costa country — mid-century and custom homes tucked into Burton Valley, Happy Valley, and Reliez Valley, many on slopes and wooded parcels. The terrain and tree cover make sewer laterals a recurring project, and the higher-end housing tends toward larger repipe and whole-system jobs. This is exactly the kind of bigger residential work our two-license crew is built for.",
    commonIssues: [
      "Sewer lateral inspection and replacement on wooded, sloped lots",
      "Whole-house repipes in mid-century and custom homes",
      "Root intrusion in long laterals under mature trees",
      "Water heater and larger residential system projects",
    ],
    neighborhoods: ["Burton Valley", "Happy Valley", "Reliez Valley"],
    isHQ: false,
  },
  {
    slug: "plumber-walnut-creek-ca",
    city: "Walnut Creek",
    state: "CA",
    zips: ["94595", "94596", "94597", "94598"],
    intro:
      "Walnut Creek is now part of our regular East Bay service corridor. We handle sewer, drain, water heater, repipe, and emergency plumbing work from Rossmoor to Northgate.",
    localContext:
      "Walnut Creek spans the large 1960s-70s Rossmoor senior community, an active downtown, and established neighborhoods around Northgate and Saranap. Rossmoor's age means a steady stream of unit-level repairs and water heater replacements, while the older single-family areas bring repipe and sewer work. We cover the city end to end as part of our Contra Costa corridor.",
    commonIssues: [
      "Aging-unit repairs and water heaters in Rossmoor",
      "Repipes in established single-family neighborhoods",
      "Sewer lateral and drain service",
      "Emergency plumbing across the city",
    ],
    neighborhoods: ["Downtown Walnut Creek", "Rossmoor", "Saranap", "Northgate", "Larkey Park"],
    isHQ: false,
  },
  {
    slug: "plumber-alameda-county-ca",
    city: "Alameda County",
    state: "CA",
    zips: [...alamedaCountyZips],
    intro:
      "Z and Z covers Alameda County from the inner East Bay through the Tri-Valley corridor. If your ZIP is in Alameda County and not listed under a specific city page, the request still routes as in-area.",
    localContext:
      "Alameda County is our home county, and our coverage runs from the dense, older inner East Bay — Oakland, Berkeley, Alameda, San Leandro — out through the Tri-Valley. That's an enormous range of housing eras, from pre-1900 Victorians to brand-new subdivisions, and we carry the licenses and equipment for all of it. If your ZIP is in the county but doesn't have its own city page, the request still routes to us as in-area.",
    commonIssues: [
      "Full residential plumbing menu across every housing era",
      "EBMUD sewer lateral compliance in the inner East Bay",
      "Repipes, water heaters, and drain/sewer service",
      "Light-commercial plumbing countywide",
    ],
    neighborhoods: ["Oakland", "Berkeley", "Fremont", "Livermore", "Albany", "San Lorenzo"],
    isHQ: false,
  },
  {
    slug: "plumber-contra-costa-county-ca",
    city: "Contra Costa County",
    state: "CA",
    zips: [...contraCostaCountyZips],
    intro:
      "For larger projects and qualified calls, Z and Z covers Contra Costa County, including the I-680 corridor from San Ramon and Danville up through Alamo and Walnut Creek.",
    localContext:
      "On the Contra Costa side we focus on the I-680 corridor — San Ramon, Danville, Alamo, the Lamorinda communities, and Walnut Creek. The housing here skews toward larger lots and higher-end homes, often on slopes and wooded parcels, which is why this side of the map tends to bring bigger sewer lateral and repipe projects rather than quick service calls. We take qualified calls and larger projects throughout the county.",
    commonIssues: [
      "Sewer lateral inspection and replacement on large, sloped lots",
      "Whole-house repipes in higher-end homes",
      "Larger residential plumbing projects",
      "Water heater and drain/sewer service along the I-680 corridor",
    ],
    neighborhoods: ["Walnut Creek", "Alamo", "Danville", "San Ramon", "Lamorinda"],
    isHQ: false,
  },
];
