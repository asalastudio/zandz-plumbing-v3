export interface SiteSettings {
  name: string;
  legalName: string;
  tagline: string;
  supportingLine: string;
  phone: string;
  phoneTel: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    full: string;
  };
  geo: { lat: number; lng: number };
  cslb: string;
  licenses: string[];
  foundedYear: number;
  owner: string;
  hours: string;
  social: {
    facebook?: string;
    instagram?: string;
    yelp?: string;
    google?: string;
    bbb?: string;
    nextdoor?: string;
    homeAdvisor?: string;
    chamberOfCommerce?: string;
  };
  features: {
    coupons: boolean;
  };
  siteUrl: string;
}

export interface Service {
  slug: string;
  title: string;
  shortTitle: string;
  icon: string;
  summary: string;
  description: string;
  featured: boolean;
}

export interface ServiceArea {
  slug: string;
  city: string;
  state: string;
  zips: string[];
  intro: string;
  neighborhoods: string[];
  isHQ: boolean;
}

export interface Testimonial {
  id: string;
  quote: string;
  authorFirstName: string;
  authorCity: string;
  platform: "google" | "yelp" | "buildzoom" | "other";
  rating: number;
  servicePerformed?: string;
  date?: string;
}

export interface TeamMember {
  slug: string;
  name: string;
  role: string;
  bio: string;
  photo?: string;
  licenseInfo?: string;
}
