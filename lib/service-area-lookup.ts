import { serviceAreas } from "@/content/service-areas";

export type ServiceAreaMatch = {
  city: string;
  slug: string;
} | null;

export function lookupServiceAreaByZip(zip?: string | null): ServiceAreaMatch {
  const cleanZip = zip?.trim();
  if (!cleanZip || !/^\d{5}$/.test(cleanZip)) return null;

  const area = serviceAreas.find((serviceArea) => serviceArea.zips.includes(cleanZip));
  return area ? { city: area.city, slug: area.slug } : null;
}

export function lookupServiceAreaBySlug(slug?: string | null): ServiceAreaMatch {
  const cleanSlug = slug?.trim();
  if (!cleanSlug) return null;

  const area = serviceAreas.find((serviceArea) => serviceArea.slug === cleanSlug);
  return area ? { city: area.city, slug: area.slug } : null;
}
