import { NextRequest, NextResponse } from "next/server";

/**
 * Defense-in-depth CSRF guard for admin mutations.
 *
 * The admin session cookie is already SameSite=lax (which blocks most
 * cross-site POSTs). This rejects any state-changing request to /api/admin/*
 * whose Origin header does not match the request host, closing the gap for
 * the cases SameSite does not cover. Same-origin form posts always carry a
 * matching Origin; cross-site CSRF attempts carry a foreign one.
 *
 * Scoped to /api/admin/* only, so the public lead form, Stripe/Twilio/HubSpot
 * webhooks, and the cron endpoint (which authenticate by signature/bearer and
 * legitimately have no browser Origin) are untouched.
 */
export function proxy(req: NextRequest) {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return NextResponse.next();
  }

  const origin = req.headers.get("origin");
  if (origin) {
    const host = req.headers.get("host");
    let originHost: string | null = null;
    try {
      originHost = new URL(origin).host;
    } catch {
      originHost = null;
    }
    if (!originHost || originHost !== host) {
      return NextResponse.json(
        { error: "Cross-origin request blocked" },
        { status: 403 }
      );
    }
  }

  // No Origin header: fall back to the SameSite=lax session cookie.
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*"],
};
