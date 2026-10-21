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
  // Office hours are Mon-Fri 7-5 Pacific. The 24/7 is emergency dispatch, not
  // the office. Keep the two distinct anywhere this is rendered — the schema in
  // app/layout.tsx publishes the staffed hours only.
  hours: "Mon-Fri 7:00 AM - 5:00 PM · 24/7 Emergency Service",
  social: {
    facebook: "https://www.facebook.com/zandzplumbing",
    instagram: "https://www.instagram.com/z_and_z_plumbing_bay_area",
    // Canonical Yelp listing carries the 238 reviews; the slug is "-oakland-3"
    // even after the HQ moves to San Leandro because Yelp keeps the slug stable.
    // See address-transition-strategy-2026-05-11.md for the SAB-first conversion plan.
    yelp: "https://www.yelp.com/biz/z-and-z-plumbing-oakland-3",
    // Google search URL, used only as the "Read on Google" button target on
    // /reviews/. It is NOT a Business Profile URL, so app/layout.tsx keeps it
    // out of the schema sameAs list. Swap in the Maps CID URL once confirmed.
    google: "https://www.google.com/search?q=Z+and+Z+Plumbing",
    bbb: "https://www.bbb.org/us/ca/oakland/profile/plumber/z-z-plumbing-1116-486229",
    nextdoor: "https://nextdoor.com/pages/z-and-z-plumbing-oakland-ca/",
    // HomeAdvisor removed 2026-10-20: the old /sp/z-and-z-plumbing URL now
    // 301s to an unrelated business, which poisons entity reconciliation.
    chamberOfCommerce:
      "https://www.chamberofcommerce.com/business-directory/california/oakland/plumber/32393621-z-and-z-plumbing",
  },
  features: {
    coupons: true,
  },
  siteUrl: "https://www.zandzplumbing.com",
};

// CSLB license detail page for #896116 (both classifications on one record).
// Link here, not to the generic CheckLicense search form.
export const cslbLicenseUrl =
  "https://www.cslb.ca.gov/OnlineServices/CheckLicenseII/LicenseDetail.aspx?LicNum=896116";
