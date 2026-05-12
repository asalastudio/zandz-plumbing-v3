import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";
import { STATUS_TRANSITIONS, type JobStatus } from "@/lib/db";

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
    return NextResponse.redirect(new URL("/admin/jobs", req.url), 303);
  }

  const form = await req.formData();
  const next = String(form.get("status") ?? "");
  if (!ALL_STATUSES.includes(next as JobStatus)) {
    return NextResponse.redirect(new URL(`/admin/jobs/${id}?error=bad_status`, req.url), 303);
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
    return NextResponse.redirect(new URL(`/admin/jobs/${id}?error=invalid_transition`, req.url), 303);
  }

  const { error: updateErr } = await sb.from("jobs").update({ status: next }).eq("id", id);
  if (updateErr) {
    return NextResponse.redirect(new URL(`/admin/jobs/${id}?error=db`, req.url), 303);
  }

  return NextResponse.redirect(new URL(`/admin/jobs/${id}`, req.url), 303);
}
