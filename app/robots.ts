import type { MetadataRoute } from "next";
import { siteSettings } from "@/content/site-settings";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/wp-admin/",
          "/wp-content/",
          "/wp-includes/",
          "/wp-json/",
          "/feed/",
          "/*?ref=*",
          "/*?utm_*",
        ],
      },
    ],
    sitemap: `${siteSettings.siteUrl}/sitemap.xml`,
  };
}
