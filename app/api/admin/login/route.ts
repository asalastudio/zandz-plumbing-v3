import { NextRequest, NextResponse } from "next/server";
import { login, verifyAdminPassword } from "@/lib/auth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * Brute-force throttle. The whole OS is gated by one shared password, so we
 * cap failed attempts per client IP with a sliding window + temporary block.
 *
 * The count lives in the login_attempts table (migration 016) so every
 * serverless instance sees the same number. A global cap on top of the per-IP
 * one stops an attacker who rotates IPs. If the table isn't there yet, it
 * falls back to the old per-instance memory map. bcrypt cost is the second
 * layer either way.
 */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 8;
const MAX_GLOBAL_FAILURES = 40;
const BLOCK_MS = 15 * 60 * 1000;
const PRUNE_AFTER_MS = 24 * 60 * 60 * 1000;
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

  if (await isThrottled(ip, now)) {
    return NextResponse.redirect(new URL("/admin/login?error=throttled", req.url), 303);
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
    await registerFailure(ip, now);
    return NextResponse.redirect(new URL("/admin/login?error=invalid", req.url), 303);
  }

  attempts.delete(ip);
  await recordSuccess(ip, now);
  await login();
  return NextResponse.redirect(new URL(safeNext, req.url), 303);
}

/**
 * Shared-ledger check. Returns null when the ledger can't be read (table not
 * migrated yet, Supabase down), so the caller falls back to memory.
 */
async function ledgerThrottled(ip: string, now: number): Promise<boolean | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const since = new Date(now - WINDOW_MS).toISOString();
    const sb = supabase();
    const [perIp, global] = await Promise.all([
      sb
        .from("login_attempts")
        .select("id", { count: "exact", head: true })
        .eq("ip", ip)
        .eq("succeeded", false)
        .gte("attempted_at", since),
      sb
        .from("login_attempts")
        .select("id", { count: "exact", head: true })
        .eq("succeeded", false)
        .gte("attempted_at", since),
    ]);
    if (perIp.error || global.error) return null;
    return (perIp.count ?? 0) >= MAX_FAILURES || (global.count ?? 0) >= MAX_GLOBAL_FAILURES;
  } catch {
    return null;
  }
}

async function isThrottled(ip: string, now: number): Promise<boolean> {
  const shared = await ledgerThrottled(ip, now);
  if (shared !== null) return shared;

  const rec = attempts.get(ip);
  if (rec && rec.blockedUntil > now) return true;
  // Reset a stale window.
  if (rec && now - rec.first > WINDOW_MS) attempts.delete(ip);
  return false;
}

async function writeAttempt(ip: string, succeeded: boolean): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase().from("login_attempts").insert({ ip, succeeded });
    return !error;
  } catch {
    return false;
  }
}

async function recordSuccess(ip: string, now: number): Promise<void> {
  if (!(await writeAttempt(ip, true))) return;
  // Keep the ledger small; nothing older than a day matters to the throttle.
  try {
    await supabase()
      .from("login_attempts")
      .delete()
      .lt("attempted_at", new Date(now - PRUNE_AFTER_MS).toISOString());
  } catch {
    // Pruning is housekeeping; a failure here must not block the login.
  }
}

async function registerFailure(ip: string, now: number): Promise<void> {
  // Always count in memory too, so a ledger outage mid-attack still slows it.
  registerMemoryFailure(ip, now);
  await writeAttempt(ip, false);
}

function registerMemoryFailure(ip: string, now: number): void {
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
