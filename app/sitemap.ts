import type { MetadataRoute } from "next";
import { siteSettings } from "@/content/site-settings";
import { services } from "@/content/services";
import { serviceAreas } from "@/content/service-areas";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteSettings.siteUrl;
  // Stable last-modified date. Using a fixed date avoids the false "modified
  // today" freshness signal that `new Date()` produced on every build/request.
  // Bump this when content is meaningfully updated site-wide.
  const now = new Date("2026-06-17T00:00:00-08:00");

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/about/`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/services/`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/service-areas/`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/contact/`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/careers/`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/reviews/`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/financing/`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/blog/`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/videos/`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/coupons/`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/sewer-lateral-oakland/`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/ebmud-compliance/`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/emergency-plumber-oakland/`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/water-heater-oakland/`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/drain-cleaning-oakland/`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/privacy-policy/`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms/`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${base}/services/${s.slug}/`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const areaRoutes: MetadataRoute.Sitemap = serviceAreas.map((a) => ({
    url: `${base}/${a.slug}/`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...serviceRoutes, ...areaRoutes];
}
