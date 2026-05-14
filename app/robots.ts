import type { MetadataRoute } from "next";
import { siteSettings } from "@/content/site-settings";

// AI crawler user-agents we explicitly welcome. Default-allow covers them
// already via the catch-all rule below, but an explicit allow is a stronger
// positive signal and lets us be specific later if any need narrower scopes.
const aiCrawlers = [
  "GPTBot",            // OpenAI training crawler
  "OAI-SearchBot",     // OpenAI ChatGPT search
  "ChatGPT-User",      // OpenAI on-demand fetches initiated by ChatGPT users
  "ClaudeBot",         // Anthropic training crawler
  "anthropic-ai",      // Anthropic alternate UA
  "Claude-Web",        // Anthropic Claude in-product browsing
  "PerplexityBot",     // Perplexity index crawler
  "Perplexity-User",   // Perplexity on-demand fetches
  "Google-Extended",   // Google AI training opt-in (Gemini, Vertex)
  "Applebot-Extended", // Apple AI training opt-in
  "meta-externalagent",// Meta AI training crawler
  "CCBot",             // Common Crawl (feeds many open models)
  "Amazonbot",         // Amazon AI / Alexa
  "Bytespider",        // ByteDance / TikTok AI
  "DuckAssistBot",     // DuckDuckGo AI
];

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
          "/*/feed/",
          "/*?ref=",
          "/*?utm_",
          "/admin/",
          "/api/",
          "/track/",
        ],
      },
      // Explicit allow rules per AI crawler. Same disallow list as the
      // catch-all so we don't accidentally leak admin or job-tracking URLs.
      ...aiCrawlers.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: [
          "/wp-admin/",
          "/wp-content/",
          "/wp-includes/",
          "/wp-json/",
          "/feed/",
          "/*/feed/",
          "/*?ref=",
          "/*?utm_",
          "/admin/",
          "/api/",
          "/track/",
        ],
      })),
    ],
    sitemap: `${siteSettings.siteUrl}/sitemap.xml`,
    host: siteSettings.siteUrl,
  };
}
