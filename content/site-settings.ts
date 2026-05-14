import type { SiteSettings } from "@/types/content";

export const siteSettings: SiteSettings = {
  name: "Z and Z Plumbing",
  legalName: "Z and Z Plumbing",
  tagline: "The Pros Other Plumbers Call",
  supportingLine: "Two licenses. One crew. Same-day service.",
  phone: "(510) 708-4237",
  phoneTel: "+15107084237",
  email: "info@zandzplumbing.com",
  address: {
    street: "3057 Teagarden Street",
    city: "San Leandro",
    state: "CA",
    zip: "94577",
    full: "3057 Teagarden Street, San Leandro, CA 94577",
  },
  geo: { lat: 37.7284, lng: -122.1574 },
  cslb: "CSLB #896116",
  licenses: ["C-36 Plumbing (2007)", "A General Engineering (2012)"],
  foundedYear: 2003,
  owner: "Seifullah Zaki Zareef",
  hours: "24/7 Emergency Service",
  social: {
    facebook: "https://www.facebook.com/zandzplumbing",
    instagram: "https://www.instagram.com/z_and_z_plumming_bat_area",
    // Canonical Yelp listing carries the 238 reviews; the slug is "-oakland-3"
    // even after the HQ moves to San Leandro because Yelp keeps the slug stable.
    // See address-transition-strategy-2026-05-11.md for the SAB-first conversion plan.
    yelp: "https://www.yelp.com/biz/z-and-z-plumbing-oakland-3",
    google: "https://www.google.com/search?q=Z+and+Z+Plumbing",
    bbb: "https://www.bbb.org/us/ca/oakland/profile/plumber/z-z-plumbing-1116-486229",
    nextdoor: "https://nextdoor.com/pages/z-and-z-plumbing-oakland-ca/",
    homeAdvisor: "https://www.homeadvisor.com/sp/z-and-z-plumbing",
    chamberOfCommerce:
      "https://www.chamberofcommerce.com/business-directory/california/oakland/plumber/32393621-z-and-z-plumbing",
  },
  siteUrl: "https://zandzplumbing.com",
};
