import type { MetadataRoute } from "next";

/**
 * Web app manifest. Makes /field installable as a standalone PWA on a crew
 * member's phone (Add to Home Screen), opening straight into field mode.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Z and Z OS Field",
    short_name: "Z&Z Field",
    description: "Field mode for Z and Z Plumbing crews: today's jobs, status, and photos.",
    start_url: "/field",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
