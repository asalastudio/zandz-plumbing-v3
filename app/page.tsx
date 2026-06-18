import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Phone,
  MapPin,
  Navigation,
  Route,
  Clock,
  Thermometer,
  Pipette,
  Star,
  ChevronRight,
} from "lucide-react";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import HeroZipForm from "@/components/HeroZipForm";
import { siteSettings } from "@/content/site-settings";
import { serviceAreas } from "@/content/service-areas";

export const metadata: Metadata = {
  title: "Z and Z Plumbing | East Bay Plumber | San Leandro, CA",
  description:
    "Licensed East Bay plumber headquartered in San Leandro. C-36 + A General Engineering. Same-day plumbing service. Call (510) 708-4237.",
  alternates: { canonical: "https://www.zandzplumbing.com/" },
  openGraph: {
    title: "Z and Z Plumbing | East Bay Plumber",
    description:
      "Two licenses. One crew. Same-day service across Oakland, Berkeley, Alameda, and the East Bay.",
    url: "https://www.zandzplumbing.com/",
    type: "website",
  },
};

const reviewPlatforms = [
  {
    name: "Google",
    rating: "4.6",
    count: "19 reviews",
    color: "#4285F4",
    quote:
      "Z and Z showed up same day and fixed a sewer issue first try. Professional, clean, and the job was done right.",
    reviewer: "Jason R.",
  },
  {
    name: "Yelp",
    rating: "4.5",
    count: "238 reviews",
    color: "#D32323",
    quote:
      "These guys know what they're doing. Licensed for the whole job. Professional, and the work was done right the first time.",
    reviewer: "Melissa T.",
  },
  {
    name: "Buildzoom",
    rating: "5.0",
    count: "Verified contractor",
    color: "#F96302",
    quote:
      "We use Z and Z for all our commercial property work. They handle the tough jobs other plumbers won't touch.",
    reviewer: "Project Manager",
  },
];

const heroStats = [
  { value: "23", label: "Years in Business", detail: "Since 2003" },
  { value: "Five-Star", label: "Reviews", detail: "Yelp & Google", star: true },
  { value: "2", label: "Licenses Held", detail: `${siteSettings.cslb} · C-36 + A-Gen` },
  { value: "24/7", label: "Emergency Response", detail: "East Bay Area" },
];

const primaryServiceCards = [
  {
    slug: "sewer-lateral",
    title: "Sewer Lateral",
    summary:
      "Replacement, repair, camera inspection, and street-side lateral work backed by an A General Engineering license.",
    image: "/images/service-sewer-lateral.jpg",
    imageAlt: "Cutaway view of an orange sewer lateral pipe beneath a residential street",
  },
  {
    slug: "repipe",
    title: "Whole Home Repipe",
    summary:
      "Upgrade aging galvanized or polybutylene lines to copper or PEX with clean planning and minimal wall damage.",
    image: "/images/service-whole-home-repipe.jpg",
    imageAlt: "Open wall whole home repipe with copper, black, and orange pipe runs",
  },
  {
    slug: "hydrojetting",
    title: "Hydrojetting",
    summary:
      "High-pressure water scouring for stubborn blockages, grease, scale, and recurring root intrusion.",
    image: "/images/service-hydrojetting-nozzle.jpg",
    imageAlt: "Hydrojetting nozzle and orange hose cleaning the inside of a pipe",
  },
];

const secondaryServiceCards = [
  {
    slug: "sewer-lateral",
    title: "Trenchless Sewer",
    summary: "Underground line replacement options that limit driveway and landscape disruption.",
    icon: Route,
  },
  {
    slug: "water-heater",
    title: "Water Heaters",
    summary: "Repair and replacement for tank and tankless systems, including gas and venting needs.",
    icon: Thermometer,
  },
  {
    slug: "drain-cleaning",
    title: "Drain Cleaning",
    summary: "Fast clearing for sinks, tubs, toilets, floor drains, and main sewer lines.",
    icon: Pipette,
  },
];

const coverageStats = [
  { value: "120+", label: "East Bay ZIPs" },
  { value: "30-60", label: "min nearby response" },
  { value: "2003", label: "serving the East Bay" },
];

const serviceAreaMapPositions: Record<
  string,
  {
    x: number;
    y: number;
    labelX: number;
    labelY: number;
    mobileLabelX?: number;
    mobileLabelY?: number;
    tone: "hq" | "primary" | "standard";
  }
> = {
  "plumber-pinole-ca": { x: 31, y: 17, labelX: -76, labelY: 24, tone: "standard" },
  "plumber-richmond-ca": { x: 38, y: 24, labelX: -96, labelY: 6, mobileLabelX: -88, tone: "standard" },
  "plumber-berkeley-ca": { x: 45, y: 32, labelX: -96, labelY: -12, mobileLabelX: -86, tone: "standard" },
  "plumber-emeryville-ca": { x: 48, y: 39, labelX: -118, labelY: 12, mobileLabelX: -100, tone: "standard" },
  "plumber-oakland-ca": { x: 51, y: 47, labelX: 18, labelY: -42, tone: "primary" },
  "plumber-alameda-ca": { x: 43, y: 55, labelX: -104, labelY: 8, mobileLabelX: -96, tone: "standard" },
  "plumber-san-leandro-ca": { x: 57, y: 62, labelX: 18, labelY: 14, mobileLabelX: -78, mobileLabelY: 18, tone: "hq" },
  "plumber-castro-valley-ca": { x: 70, y: 62, labelX: 18, labelY: -22, mobileLabelX: -120, tone: "standard" },
  "plumber-hayward-ca": { x: 64, y: 76, labelX: 18, labelY: 14, mobileLabelX: -78, tone: "standard" },
  "plumber-union-city-ca": { x: 62, y: 86, labelX: -116, labelY: 8, mobileLabelX: -108, tone: "standard" },
  "plumber-fremont-ca": { x: 71, y: 92, labelX: 18, labelY: -22, mobileLabelX: -86, tone: "standard" },
  "plumber-newark-ca": { x: 56, y: 93, labelX: -90, labelY: -24, mobileLabelX: -82, tone: "standard" },
  "plumber-dublin-ca": { x: 83, y: 69, labelX: 18, labelY: 12, mobileLabelX: -76, tone: "standard" },
  "plumber-pleasanton-ca": { x: 83, y: 80, labelX: 18, labelY: 12, mobileLabelX: -100, tone: "standard" },
  "plumber-lafayette-ca": { x: 78, y: 32, labelX: 18, labelY: -18, mobileLabelX: -108, tone: "standard" },
  "plumber-walnut-creek-ca": { x: 82, y: 18, labelX: 18, labelY: -12, mobileLabelX: -118, tone: "standard" },
};

export default function HomePage() {
  const mappedServiceAreas = serviceAreas
    .map((area) => ({ ...area, mapPosition: serviceAreaMapPositions[area.slug] }))
    .filter((area) => area.mapPosition);

  return (
    <>
      {/* ========== HERO ========== */}
      <section className="flex min-h-[calc(100svh-162px)] flex-col bg-[#F5F5F5] md:min-h-[calc(100svh-104px)]">
        <div className="relative flex flex-1 overflow-hidden">
          <picture className="absolute inset-0 overflow-hidden">
            <source media="(max-width: 767px)" srcSet="/images/zandz-hero-pipe-system-mobile.jpg" />
            <img
              src="/images/zandz-hero-pipe-system.jpg"
              alt=""
              aria-hidden="true"
              fetchPriority="high"
              className="h-full w-full object-cover object-left md:object-center animate-ken-burns will-change-transform"
            />
          </picture>
          <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-[#F5F5F5]/80 via-[#F5F5F5]/40 to-transparent md:hidden" aria-hidden="true" />
          <div className="relative z-10 mx-auto flex w-full max-w-[1800px] flex-1 items-start px-6 pb-7 pt-7 md:items-center md:px-8 md:py-14 lg:px-12">
            <div className="max-w-[310px] sm:max-w-xl lg:max-w-2xl">
              <p className="mb-3 font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-[#F96302] animate-fade-up md:mb-4 md:text-xs">
                Same-Day East Bay Plumbing.
              </p>
              <h1
                className="mb-4 font-display text-[3.35rem] font-black uppercase leading-[0.96] tracking-tight text-black animate-fade-up md:mb-6 md:text-7xl lg:text-[6.5rem]"
                style={{ animationDelay: "0.12s" }}
              >
                <span className="md:hidden">The Pros Plumbers Call.</span>
                <span className="hidden md:inline">The Pros Other Plumbers Call.</span>
              </h1>
              <p
                className="mb-4 max-w-[290px] font-sans text-[15px] leading-snug text-[#333333] animate-fade-up sm:max-w-lg sm:text-lg md:mb-6 md:leading-relaxed"
                style={{ animationDelay: "0.28s" }}
              >
                <span className="md:hidden">Licensed for house lines, street-side work, and same-day East Bay plumbing.</span>
                <span className="hidden md:inline">Licensed for the whole job. From house lines to street-side work, we handle it all on time and built to last.</span>
              </p>

              <div
                className="mb-5 animate-fade-up md:mb-6"
                style={{ animationDelay: "0.36s" }}
              >
                <p className="mb-2 max-w-[300px] text-[10px] font-bold uppercase leading-snug tracking-[0.12em] text-[#666] md:text-[11px]">
                  Enter your ZIP — we&apos;ll route you to the nearest crew
                </p>
                <HeroZipForm variant="light" />
              </div>

              <div
                className="hidden gap-4 md:flex md:flex-row animate-fade-up"
                style={{ animationDelay: "0.44s" }}
              >
                <Button
                  variant="primary"
                  size="xl"
                  href={`tel:${siteSettings.phoneTel}`}
                  icon={<Phone className="h-5 w-5" />}
                  iconPosition="left"
                  external
                >
                  Call {siteSettings.phone}
                </Button>
                <Button variant="ghost" size="xl" href="/book/">
                  Schedule online
                </Button>
              </div>
            </div>
          </div>

        </div>

        <div className="border-y border-white/10 bg-black">
          <div className="mx-auto grid max-w-[1800px] grid-cols-2 md:grid-cols-4">
            {heroStats.map((stat, i) => (
              <div
                key={stat.label}
                className={[
                  "border-r border-white/10 px-6 py-6 text-center last:border-r-0 md:flex md:items-center md:justify-center md:gap-5 md:border-b-0 md:px-10 md:py-8 lg:gap-6 lg:px-12 xl:px-16 animate-fade-in",
                  i > 1 ? "hidden md:flex" : "",
                ].join(" ")}
                style={{ animationDelay: `${0.6 + i * 0.1}s` }}
              >
                <div className="flex items-center justify-center gap-2">
                  <p
                    className={[
                      "font-display font-black uppercase leading-none text-white whitespace-nowrap",
                      stat.star ? "text-4xl md:text-5xl" : "text-5xl md:text-6xl",
                    ].join(" ")}
                  >
                    {stat.value}
                  </p>
                  {stat.star && (
                    <Star className="h-5 w-5 text-[#F96302] md:h-7 md:w-7" fill="#F96302" aria-hidden="true" />
                  )}
                </div>
                <div className="md:text-left">
                  <p className="mt-2 text-sm font-semibold leading-snug text-white/75 md:mt-0 md:text-base md:whitespace-nowrap">
                    {stat.label}
                  </p>
                  <p className="text-sm leading-snug text-white/50 md:whitespace-nowrap">
                    {stat.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* ========== SERVICES (black section) ========== */}
      <section className="bg-black pt-12 pb-20 md:pt-16 md:pb-28">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 scroll-reveal">
            <div>
              <p className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#F96302] mb-3">
                Built for More than Houses.
              </p>
              <h2 className="font-display text-5xl md:text-6xl font-black uppercase leading-tight text-white">
                We Handle the Jobs Others Can&apos;t.
              </h2>
            </div>
            <Link
              href="/services/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-[#F96302] transition-colors duration-150 uppercase tracking-wide flex-shrink-0"
            >
              View All Services
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 scroll-reveal">
            {primaryServiceCards.map((service) => (
                <Link key={service.title} href={`/services/${service.slug}/`} className="group block">
                  <article className="h-full rounded-2xl border border-white/10 bg-white p-5 text-black transition-all duration-200 hover:-translate-y-1 hover:border-[#F96302] hover:shadow-2xl md:p-6">
                    <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-2xl border border-[#E5E5E5] bg-[#F5F5F5]">
                      <Image
                        src={service.image}
                        alt={service.imageAlt}
                        fill
                        sizes="(min-width: 1024px) 28vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 ring-1 ring-inset ring-black/5" />
                    </div>
                    <h3 className="font-display text-3xl font-black uppercase leading-tight text-black md:text-4xl">
                      {service.title}
                    </h3>
                    <p className="mt-3 text-xl leading-relaxed text-[#333333]">
                      {service.summary}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#F96302] group-hover:underline">
                      Learn more
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </article>
                </Link>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3 scroll-reveal">
            {secondaryServiceCards.map((service) => {
              const Icon = service.icon;

              return (
                <Link key={service.title} href={`/services/${service.slug}/`} className="group block">
                  <article className="flex h-full items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#F96302] hover:bg-white/10">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center bg-white/10">
                      <Icon className="h-5 w-5 text-[#F96302]" strokeWidth={1.5} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-display text-2xl font-black uppercase leading-none text-white">
                        {service.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/60">
                        {service.summary}
                      </p>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ========== SERVICE AREAS ========== */}
      <section className="overflow-hidden bg-[#F5F5F5] py-20 md:py-28">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-stretch">
            <div className="flex flex-col justify-between scroll-reveal">
              <div>
                <p className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#F96302] mb-3">
                  East Bay Coverage.
                </p>
                <h2 className="font-display text-5xl md:text-6xl font-black uppercase leading-tight text-black">
                  We Serve the East Bay Corridor.
                </h2>
                <p className="mt-5 max-w-xl font-sans text-xl leading-relaxed text-[#333333]">
                  Headquartered in San Leandro and built for East Bay housing stock, sewer laterals, and street-side work. The map shows our core service corridor from Pinole and Richmond down through Oakland, Alameda, San Leandro, Castro Valley, Union City, Fremont, Newark, Dublin, Pleasanton, and up to Walnut Creek.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-3 border border-[#E5E5E5] bg-white">
                {coverageStats.map((stat) => (
                  <div key={stat.label} className="border-r border-[#E5E5E5] p-4 last:border-r-0 md:p-5">
                    <p className="font-display text-4xl font-black uppercase leading-none text-black">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#666666]">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 border-l-4 border-[#F96302] bg-white p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center bg-black text-white">
                    <Navigation className="h-5 w-5 text-[#F96302]" strokeWidth={1.5} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#666666]">
                      Dispatch base
                    </p>
                    <p className="mt-1 font-display text-3xl font-black uppercase leading-none text-black">
                      San Leandro HQ
                    </p>
                    <p className="mt-3 text-lg leading-relaxed text-[#333333]">
                      Fast access to I-880, Oakland, Alameda, Berkeley, and the Contra Costa side of the service map.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/service-areas/"
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-black/70 transition-colors duration-150 hover:text-[#F96302]"
              >
                See All Areas
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="relative min-h-[620px] overflow-hidden rounded-2xl border border-[#D8D8D8] bg-white shadow-2xl scroll-reveal-fade">
              <div className="absolute left-0 top-0 z-10 flex w-full items-center justify-between border-b border-[#E5E5E5] bg-white/90 px-5 py-4 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center bg-[#F96302] text-white">
                    <MapPin className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-[#666666]">
                      Coverage map
                    </p>
                    <p className="font-display text-2xl font-black uppercase leading-none text-black">
                      East Bay service area
                    </p>
                  </div>
                </div>
                <div className="hidden items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#666666] sm:flex">
                  <Clock className="h-4 w-4 text-[#F96302]" strokeWidth={1.5} aria-hidden="true" />
                  Same-day calls
                </div>
              </div>

              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 900 620"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <rect width="900" height="620" fill="#F6F6F6" />
                <path
                  d="M0 0H205C175 56 152 116 165 181C181 258 258 287 249 364C238 454 126 489 111 620H0V0Z"
                  fill="#E8E8E8"
                />
                <path
                  d="M256 0C239 73 240 136 276 201C316 272 361 304 356 373C350 448 305 507 329 620H900V0H256Z"
                  fill="#FFFFFF"
                />
                <path
                  d="M258 0C235 86 251 156 293 219C341 290 366 321 364 382C361 455 324 520 352 620"
                  fill="none"
                  stroke="#DADADA"
                  strokeWidth="3"
                />
                <path
                  d="M372 84C432 154 473 218 496 303C516 378 513 474 569 620"
                  fill="none"
                  stroke="#D7D7D7"
                  strokeWidth="2"
                  strokeDasharray="10 12"
                />
                <path
                  d="M602 34C547 115 521 186 528 251C537 336 583 393 568 487C559 546 531 581 508 620"
                  fill="none"
                  stroke="#D7D7D7"
                  strokeWidth="2"
                  strokeDasharray="8 12"
                />
                <path
                  d="M514 384C462 326 409 257 336 150"
                  fill="none"
                  stroke="#F96302"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="1 12"
                  className="march-ants"
                />
                <path
                  d="M514 384C568 330 614 276 706 194"
                  fill="none"
                  stroke="#F96302"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="1 12"
                  className="march-ants"
                />
                <path
                  d="M514 384C549 445 566 501 574 573"
                  fill="none"
                  stroke="#F96302"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="1 12"
                  className="march-ants"
                />
                <path
                  d="M84 92H844M75 182H861M84 272H844M75 362H861M84 452H844M75 542H861M176 34V600M296 34V600M416 34V600M536 34V600M656 34V600M776 34V600"
                  fill="none"
                  stroke="#000000"
                  strokeOpacity="0.035"
                  strokeWidth="1"
                />
              </svg>

              <div className="absolute right-5 top-24 z-10 hidden border border-[#E5E5E5] bg-white px-4 py-3 shadow-lg sm:block">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#666666]">
                  <Route className="h-4 w-4 text-[#F96302]" strokeWidth={1.5} aria-hidden="true" />
                  Route-ready crew
                </div>
              </div>

              {mappedServiceAreas.map((area) => {
                const position = area.mapPosition;
                const isHQ = position.tone === "hq";
                const isPrimary = position.tone === "primary";
                const labelColorClasses = isHQ
                  ? "border-[#F96302] bg-black text-white"
                  : isPrimary
                    ? "border-black bg-black text-white"
                    : "border-[#E5E5E5] bg-white text-black";
                const labelContent = (
                  <>
                    {area.city}
                    {area.isHQ && <span className="ml-2 text-[#F96302]">HQ</span>}
                  </>
                );

                return (
                  <Link
                    key={area.slug}
                    href={`/${area.slug}/`}
                    className="group absolute z-20"
                    style={{ left: `${position.x}%`, top: `${position.y}%` }}
                    aria-label={`View ${area.city} service area`}
                  >
                    <span
                      className={[
                        "absolute block -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-transform duration-200 group-hover:scale-110",
                        isHQ
                          ? "h-6 w-6 border-[#F96302] bg-[#F96302] shadow-[0_0_0_8px_rgba(249,99,2,0.16)]"
                          : isPrimary
                            ? "h-5 w-5 border-black bg-black shadow-[0_0_0_7px_rgba(0,0,0,0.10)]"
                            : "h-4 w-4 border-white bg-[#F96302] shadow-[0_0_0_5px_rgba(249,99,2,0.12)]",
                      ].join(" ")}
                    />
                    <span
                      className={[
                        "absolute hidden whitespace-nowrap border px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] shadow-lg transition-colors duration-150 group-hover:border-[#F96302] sm:block",
                        labelColorClasses,
                      ].join(" ")}
                      style={{ transform: `translate(${position.labelX}px, ${position.labelY}px)` }}
                    >
                      {labelContent}
                    </span>
                    <span
                      className={[
                        "absolute block whitespace-nowrap border px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] shadow-lg transition-colors duration-150 group-hover:border-[#F96302] sm:hidden",
                        labelColorClasses,
                      ].join(" ")}
                      style={{
                        transform: `translate(${position.mobileLabelX ?? position.labelX}px, ${
                          position.mobileLabelY ?? position.labelY
                        }px)`,
                      }}
                    >
                      {labelContent}
                    </span>
                  </Link>
                );
              })}

              <div className="absolute bottom-0 left-0 right-0 z-10 grid grid-cols-3 border-t border-[#E5E5E5] bg-white/95 backdrop-blur">
                <div className="border-r border-[#E5E5E5] p-3 sm:p-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#666666] sm:text-[11px]">Primary market</p>
                  <p className="mt-1 font-display text-lg font-black uppercase leading-none text-black sm:text-2xl">Oakland</p>
                </div>
                <div className="border-r border-[#E5E5E5] p-3 sm:p-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#666666] sm:text-[11px]">Home base</p>
                  <p className="mt-1 font-display text-lg font-black uppercase leading-none text-black sm:text-2xl">San Leandro</p>
                </div>
                <div className="p-3 sm:p-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#666666] sm:text-[11px]">Coverage</p>
                  <p className="mt-1 font-display text-lg font-black uppercase leading-none text-black sm:text-2xl">Alameda + Contra Costa</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ========== REVIEWS (dark section) ========== */}
      <section className="bg-[#111111] py-20 md:py-32">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left: heading + aggregate */}
            <div className="lg:col-span-1 scroll-reveal">
              <p className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#F96302] mb-4">
                Trusted by Contractors.
              </p>
              <h2 className="font-display text-5xl md:text-6xl font-black uppercase leading-tight text-white mb-6">
                Proven by Results.
              </h2>
              <div className="flex items-center gap-3 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-[#F96302]" fill="#F96302" aria-hidden="true" />
                ))}
              </div>
              <p className="text-sm font-semibold text-white/60 uppercase tracking-wide">
                4.6 Google. 4.5 Yelp. 257+ combined reviews.
              </p>
            </div>

            {/* Right: platform review cards */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 scroll-reveal">
              {reviewPlatforms.map((platform) => (
                <div
                  key={platform.name}
                  className="bg-white/5 rounded-2xl border border-white/10 p-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-sans font-bold text-white text-sm">
                      {platform.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-[#F96302]" fill="#F96302" aria-hidden="true" />
                      <span className="text-sm font-bold text-white">{platform.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-white/50 mb-4">{platform.count}</p>
                  <blockquote className="text-sm text-white/70 leading-relaxed mb-4 italic">
                    &ldquo;{platform.quote}&rdquo;
                  </blockquote>
                  <p className="text-xs font-semibold text-white/50">{platform.reviewer}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ========== FINAL CTA BAND ========== */}
      <section className="bg-[#F96302] py-16 md:py-20">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 scroll-reveal">
            <div>
              <h2 className="font-display text-5xl md:text-6xl font-black uppercase leading-tight text-white">
                Need Help Now?
              </h2>
              <p className="font-sans text-base text-white/80 mt-2">
                Call us or schedule online. We respond within 30 minutes during business hours.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
              <Button
                variant="inverse"
                size="lg"
                href={`tel:${siteSettings.phoneTel}`}
                icon={<Phone className="h-5 w-5" />}
                iconPosition="left"
                external
              >
                {siteSettings.phone}
              </Button>
              <Button variant="secondary" size="lg" href="/book/">
                Schedule online
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Bottom padding for mobile sticky CTA */}
      <div className="h-16 md:hidden" aria-hidden="true" />
    </>
  );
}
