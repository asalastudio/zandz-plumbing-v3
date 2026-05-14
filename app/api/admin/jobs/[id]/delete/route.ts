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

  const { error } = await sb.from("jobs").delete().eq("id", id);
  if (error) {
    console.error("[jobs.delete]", error);
    return NextResponse.redirect(new URL(`/admin/jobs/${id}?error=delete_failed`, req.url), 303);
  }

  return NextResponse.redirect(new URL("/admin/jobs?deleted=1", req.url), 303);
}
