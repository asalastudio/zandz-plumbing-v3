import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

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
  const scheduledStart = toIsoOrNull(form.get("scheduled_start"));
  const scheduledEnd = toIsoOrNull(form.get("scheduled_end"));

  const sb = supabase();
  const { data: job, error: fetchErr } = await sb
    .from("jobs")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr || !job) {
    return NextResponse.redirect(new URL("/admin/jobs?error=not_found", req.url), 303);
  }

  const update: Record<string, unknown> = {
    scheduled_start: scheduledStart,
    scheduled_end: scheduledEnd,
  };

  if (scheduledStart && job.status === "new") {
    update.status = "scheduled";
  }

  const { error: updateErr } = await sb.from("jobs").update(update).eq("id", id);
  if (updateErr) {
    console.error("[jobs.schedule]", updateErr);
    return NextResponse.redirect(new URL(`/admin/jobs/${id}?error=schedule`, req.url), 303);
  }

  return NextResponse.redirect(new URL(`/admin/jobs/${id}`, req.url), 303);
}

function emptyToNull(v: FormDataEntryValue | null): string | null {
  if (v === null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

function toIsoOrNull(v: FormDataEntryValue | null): string | null {
  const s = emptyToNull(v);
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
