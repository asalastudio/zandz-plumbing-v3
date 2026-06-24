import { NextRequest, NextResponse } from "next/server";
import { login, verifyAdminPassword } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * Brute-force throttle. The whole OS is gated by one shared password, so we
 * cap failed attempts per client IP with a sliding window + temporary block.
 * In-memory (per serverless instance) — Fluid Compute reuses instances, so it
 * meaningfully slows online guessing; bcrypt cost is the second layer.
 */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 8;
const BLOCK_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; first: number; blockedUntil: number }>();

function clientIp(req: NextRequest): string {
  // On Vercel, x-real-ip is injected by the platform and cannot be overridden
  // by the client. The leftmost x-forwarded-for value IS client-supplied
  // (Vercel appends the true IP as the last hop), so never key on XFF[0].
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const parts = fwd.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1]!; // last hop, not the spoofable first
  }
  return "unknown";
}

/** Best-effort eviction so the per-instance Map cannot grow without bound. */
function sweep(now: number): void {
  if (attempts.size <= 1000) return;
  for (const [k, v] of attempts) {
    if (v.blockedUntil <= now && now - v.first > WINDOW_MS) attempts.delete(k);
  }
  if (attempts.size > 5000) attempts.clear();
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const now = Date.now();
  sweep(now);

  const rec = attempts.get(ip);
  if (rec && rec.blockedUntil > now) {
    return NextResponse.redirect(new URL("/admin/login?error=throttled", req.url), 303);
  }
  // Reset a stale window.
  if (rec && now - rec.first > WINDOW_MS) {
    attempts.delete(ip);
  }

  const formData = await req.formData();
  const password = (formData.get("password") as string | null)?.trim() ?? "";
  const next = (formData.get("next") as string | null) ?? "/admin";

  // Safety: only redirect into the authenticated OS surfaces.
  const safeNext = next.startsWith("/admin") || next.startsWith("/field") ? next : "/admin";

  if (!process.env.ADMIN_PASSWORD_HASH || !process.env.SESSION_SECRET) {
    return NextResponse.redirect(new URL("/admin/login?error=not-configured", req.url), 303);
  }

  if (!password) {
    return NextResponse.redirect(new URL("/admin/login?error=missing", req.url), 303);
  }

  const ok = await verifyAdminPassword(password);
  if (!ok) {
    registerFailure(ip, now);
    return NextResponse.redirect(new URL("/admin/login?error=invalid", req.url), 303);
  }

  attempts.delete(ip);
  await login();
  return NextResponse.redirect(new URL(safeNext, req.url), 303);
}

function registerFailure(ip: string, now: number): void {
  const rec = attempts.get(ip);
  if (!rec || now - rec.first > WINDOW_MS) {
    attempts.set(ip, { count: 1, first: now, blockedUntil: 0 });
    return;
  }
  rec.count += 1;
  if (rec.count >= MAX_FAILURES) {
    rec.blockedUntil = now + BLOCK_MS;
  }
}
