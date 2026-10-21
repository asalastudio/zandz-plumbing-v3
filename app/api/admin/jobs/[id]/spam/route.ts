import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";
import { STATUS_TRANSITIONS, type JobStatus } from "@/lib/db";
import { PACIFIC_TZ } from "@/lib/time";

export const runtime = "nodejs";

/**
 * "Spam": cancel a junk lead (vendor pitch, out-of-area bot) and say why in
 * the internal notes, so it leaves the lead inbox and the escalation cron.
 *
 * Its own route because the status route takes no note. Cancelling does not
 * stamp first contact (the migration 012 trigger skips 'cancelled'), so junk
 * never flatters the response-time numbers.
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
    .select("status, internal_notes")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr || !job) {
    return NextResponse.redirect(new URL("/admin/jobs?error=not_found", req.url), 303);
  }

  const allowed = STATUS_TRANSITIONS[job.status as JobStatus] ?? [];
  if (!allowed.includes("cancelled")) {
    return NextResponse.redirect(new URL(`/admin/jobs/${id}?error=invalid_transition`, req.url), 303);
  }

  const today = new Date().toLocaleDateString("en-US", {
    timeZone: PACIFIC_TZ,
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const note = `Marked as spam by office on ${today}`;
  const existing = String(job.internal_notes ?? "").trim();
  const internalNotes = existing ? `${existing}\n${note}` : note;

  // Filter on the status we read so a job that moved meanwhile isn't cancelled.
  const { data: updated, error: updateErr } = await sb
    .from("jobs")
    .update({ status: "cancelled", internal_notes: internalNotes })
    .eq("id", id)
    .eq("status", job.status)
    .select("id");

  if (updateErr || !updated || updated.length === 0) {
    if (updateErr) console.error("[jobs.spam]", updateErr);
    return NextResponse.redirect(new URL(`/admin/jobs/${id}?error=db`, req.url), 303);
  }

  // Back to the inbox so the next lead is one tap away.
  return NextResponse.redirect(new URL(`/admin/jobs?status=new&spam=${id}`, req.url), 303);
}
