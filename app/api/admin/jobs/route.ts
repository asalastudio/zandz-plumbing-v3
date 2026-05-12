import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.redirect(new URL("/admin/login", req.url), 303);
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const form = await req.formData();
  const customerId = parseIntOrNull(form.get("customer_id"));
  const serviceType = String(form.get("service_type") ?? "").trim();
  if (!customerId || !serviceType) {
    return NextResponse.redirect(new URL("/admin/jobs/new?error=missing", req.url), 303);
  }

  const estimatedDollars = parseFloatOrNull(form.get("estimated_amount"));

  const data: Record<string, unknown> = {
    customer_id: customerId,
    service_type: serviceType,
    service_label: emptyToNull(form.get("service_label")),
    status: parseStatusOrDefault(form.get("scheduled_start")),
    scheduled_start: toIsoOrNull(form.get("scheduled_start")),
    scheduled_end: toIsoOrNull(form.get("scheduled_end")),
    assigned_to: parseIntOrNull(form.get("assigned_to")),
    job_address: emptyToNull(form.get("job_address")),
    job_city: emptyToNull(form.get("job_city")),
    job_zip: emptyToNull(form.get("job_zip")),
    customer_notes: emptyToNull(form.get("customer_notes")),
    internal_notes: emptyToNull(form.get("internal_notes")),
    estimated_amount_cents: estimatedDollars != null ? Math.round(estimatedDollars * 100) : null,
  };

  const sb = supabase();
  const { data: row, error } = await sb.from("jobs").insert(data).select("id").single();
  if (error) {
    console.error("[jobs.create]", error);
    return NextResponse.redirect(new URL("/admin/jobs/new?error=db", req.url), 303);
  }

  return NextResponse.redirect(new URL(`/admin/jobs/${row.id}`, req.url), 303);
}

function emptyToNull(v: FormDataEntryValue | null): string | null {
  if (v === null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

function parseIntOrNull(v: FormDataEntryValue | null): number | null {
  if (v === null) return null;
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) ? n : null;
}

function parseFloatOrNull(v: FormDataEntryValue | null): number | null {
  if (v === null) return null;
  const n = parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}

function toIsoOrNull(v: FormDataEntryValue | null): string | null {
  const s = emptyToNull(v);
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function parseStatusOrDefault(scheduledStartRaw: FormDataEntryValue | null): string {
  return scheduledStartRaw && String(scheduledStartRaw).trim() ? "scheduled" : "new";
}
