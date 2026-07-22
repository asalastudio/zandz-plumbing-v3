import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";
import { STATUS_TRANSITIONS, type JobStatus } from "@/lib/db";
import {
  scheduleReviewRequestForJob,
  REVIEW_TRIGGER_STATUSES,
} from "@/lib/review-requests";

export const runtime = "nodejs";

const ALL_STATUSES: JobStatus[] = [
  "new",
  "scheduled",
  "en_route",
  "on_site",
  "paused",
  "complete",
  "invoiced",
  "paid",
  "cancelled",
];

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

  const form = await req.formData();
  const next = String(form.get("status") ?? "");
  if (!ALL_STATUSES.includes(next as JobStatus)) {
    return redirectBack(req, id, "error=bad_status");
  }

  const sb = supabase();
  const { data: job, error: fetchErr } = await sb
    .from("jobs")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr || !job) {
    return NextResponse.redirect(new URL(`/admin/jobs?error=not_found`, req.url), 303);
  }

  const allowed = STATUS_TRANSITIONS[job.status as JobStatus] ?? [];
  if (!allowed.includes(next as JobStatus)) {
    return redirectBack(req, id, "error=invalid_transition");
  }

  const { error: updateErr } = await sb.from("jobs").update({ status: next }).eq("id", id);
  if (updateErr) {
    return redirectBack(req, id, "error=db");
  }

  // Queue the review-request text once the work is done. This is the trigger
  // that used to live in the HubSpot "Closed won" workflow webhook.
  //
  // Deliberately not awaited into the response path beyond logging: a review
  // ask must never be the reason a dispatcher cannot mark a job complete.
  // scheduleReviewRequestForJob is idempotent per job, so complete -> invoiced
  // -> paid queues exactly one.
  if ((REVIEW_TRIGGER_STATUSES as readonly string[]).includes(next)) {
    try {
      const result = await scheduleReviewRequestForJob(id);
      console.log("[review-request] job", id, result);
    } catch (err) {
      console.error("[review-request] scheduling threw for job", id, err);
    }
  }

  return redirectBack(req, id, "updated=1");
}

function redirectBack(req: NextRequest, jobId: number, query: string): NextResponse {
  const fallback = new URL(`/admin/jobs/${jobId}?${query}`, req.url);
  const referer = req.headers.get("referer");
  if (!referer) return NextResponse.redirect(fallback, 303);

  try {
    const ref = new URL(referer);
    const current = new URL(req.url);
    if (ref.origin !== current.origin) return NextResponse.redirect(fallback, 303);
    if (!ref.pathname.startsWith("/admin") && !ref.pathname.startsWith("/field")) {
      return NextResponse.redirect(fallback, 303);
    }
    const [key, value] = query.split("=");
    ref.searchParams.set(key, value ?? "1");
    return NextResponse.redirect(ref, 303);
  } catch {
    return NextResponse.redirect(fallback, 303);
  }
}
