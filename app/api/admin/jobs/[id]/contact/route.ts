import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * "Log call": record first contact on a lead without moving it out of 'new'.
 *
 * The migration 012 trigger only stamps first contact when a job leaves 'new',
 * so a lead that was called but not booked yet would keep looking untouched:
 * the escalation cron would keep chasing it and the dashboard would count it
 * as never called. This stamps the same two columns the trigger would, once.
 * The trigger then leaves them alone, since it only fills a null.
 */
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.redirect(new URL("/admin/login", req.url), 303);
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const { id: idStr } = await ctx.params;
  const id = parseInt(idStr, 10);
  if (!id || Number.isNaN(id)) {
    return NextResponse.redirect(new URL("/admin/jobs?error=bad_id", req.url), 303);
  }

  const sb = supabase();
  const { data: job, error: fetchErr } = await sb
    .from("jobs")
    .select("created_at, first_contact_at")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr || !job) {
    return NextResponse.redirect(new URL("/admin/jobs?error=not_found", req.url), 303);
  }
  if (job.first_contact_at) {
    return NextResponse.redirect(new URL(`/admin/jobs/${id}?contact=already`, req.url), 303);
  }

  const now = new Date();
  const createdMs = new Date(job.created_at as string).getTime();
  const responseSeconds = Number.isFinite(createdMs)
    ? Math.max(0, Math.round((now.getTime() - createdMs) / 1000))
    : 0;

  // The null check in the filter keeps a double tap (or two people) from
  // overwriting the first stamp with a later one.
  const { data: updated, error: updateErr } = await sb
    .from("jobs")
    .update({ first_contact_at: now.toISOString(), first_response_seconds: responseSeconds })
    .eq("id", id)
    .is("first_contact_at", null)
    .select("id");

  if (updateErr) {
    console.error("[jobs.contact]", updateErr);
    return NextResponse.redirect(new URL(`/admin/jobs/${id}?error=contact`, req.url), 303);
  }

  const status = updated && updated.length > 0 ? "logged" : "already";
  return NextResponse.redirect(new URL(`/admin/jobs/${id}?contact=${status}`, req.url), 303);
}
