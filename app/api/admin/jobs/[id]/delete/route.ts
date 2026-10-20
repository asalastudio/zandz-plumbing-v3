import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";

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
    return NextResponse.redirect(new URL("/admin/jobs?error=bad_id", req.url), 303);
  }

  const sb = supabase();

  const { count: invoiceCount, error: invoiceErr } = await sb
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("job_id", id);

  if (invoiceErr) {
    console.error("[jobs.delete] invoice check failed", invoiceErr);
    return NextResponse.redirect(new URL(`/admin/jobs/${id}?error=delete_check`, req.url), 303);
  }

  if ((invoiceCount ?? 0) > 0) {
    return NextResponse.redirect(new URL(`/admin/jobs/${id}?error=has_invoice`, req.url), 303);
  }

  await sb.from("customer_tokens").delete().eq("job_id", id);

  // Web leads leave an SMS consent row pointing at the job, and estimates can
  // hang off it too. Neither should die with the job: consent is the A2P
  // evidence trail, and an estimate is still the customer's document. Detach
  // them so the foreign keys don't block the delete. (Migration 016 makes
  // these ON DELETE SET NULL; doing it here as well means deletes work before
  // that is applied.)
  const detach = await Promise.all([
    sb.from("sms_consent").update({ job_id: null }).eq("job_id", id),
    sb.from("estimates").update({ job_id: null }).eq("job_id", id),
  ]);
  for (const { error: detachErr } of detach) {
    // 42P01 = table not migrated yet, so there is nothing to detach.
    if (detachErr && detachErr.code !== "42P01") {
      console.error("[jobs.delete] detach failed", detachErr);
      return NextResponse.redirect(new URL(`/admin/jobs/${id}?error=delete_failed`, req.url), 303);
    }
  }

  const { error } = await sb.from("jobs").delete().eq("id", id);
  if (error) {
    console.error("[jobs.delete]", error);
    return NextResponse.redirect(new URL(`/admin/jobs/${id}?error=delete_failed`, req.url), 303);
  }

  return NextResponse.redirect(new URL("/admin/jobs?deleted=1", req.url), 303);
}
