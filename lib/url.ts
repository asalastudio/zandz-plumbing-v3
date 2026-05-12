import crypto from "node:crypto";

/**
 * URL + token helpers.
 */

export function siteOrigin(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) {
    return process.env.VERCEL_URL.startsWith("http")
      ? process.env.VERCEL_URL
      : `https://${process.env.VERCEL_URL}`;
  }
  return "https://zandzplumbing.com";
}

export function reviewClickUrl(token: string): string {
  return `${siteOrigin()}/r/${token}`;
}

/**
 * Generate a URL-safe random token. Default length yields ~24 chars.
 */
export function randomToken(bytes = 18): string {
  return crypto.randomBytes(bytes).toString("base64url");
}
