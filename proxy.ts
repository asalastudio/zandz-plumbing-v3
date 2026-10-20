import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSessionCookie } from "@/lib/auth";

/**
 * Two jobs, split by path.
 *
 * 1. Session gate for /admin/* (except the login page) and /field/*.
 *    Every page request, including RSC navigation and prefetch requests, must
 *    carry a valid sealed admin cookie before anything renders. The (authed)
 *    layout also checks, but a layout check alone is bypassable: Next skips
 *    re-rendering shared layouts on client navigation, so a crafted RSC
 *    request can render a page without its layout ever running.
 *
 * 2. Defense-in-depth CSRF guard for /api/admin/* mutations.
 *    The admin session cookie is already SameSite=lax (which blocks most
 *    cross-site POSTs). This rejects any state-changing request whose Origin
 *    header does not match the request host, closing the gap for the cases
 *    SameSite does not cover. Same-origin form posts always carry a matching
 *    Origin; cross-site CSRF attempts carry a foreign one. Every /api/admin
 *    route still checks the session itself.
 *
 * The public lead form, Stripe/Twilio webhooks, and the crons (which
 * authenticate by signature/bearer and legitimately have no browser Origin)
 * are outside the matcher and untouched.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/admin")) {
    return csrfGuard(req);
  }

  if (isLoginPath(pathname)) {
    return NextResponse.next();
  }

  const authed = await isValidAdminSessionCookie(req.cookies.get(ADMIN_SESSION_COOKIE)?.value);
  if (authed) {
    return NextResponse.next();
  }

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/admin/login/";
  loginUrl.search = "";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

function isLoginPath(pathname: string): boolean {
  return pathname === "/admin/login" || pathname === "/admin/login/";
}

function csrfGuard(req: NextRequest) {
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
  matcher: ["/api/admin/:path*", "/admin/:path*", "/field/:path*"],
};
