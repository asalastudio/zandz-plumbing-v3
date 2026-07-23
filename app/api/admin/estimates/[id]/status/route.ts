import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { setEstimateStatus, type EstimateStatus } from "@/lib/estimates";

export const runtime = "nodejs";

const ALLOWED: EstimateStatus[] = ["draft", "sent", "approved", "declined"];

/** Move an estimate through its lifecycle (not conversion — that has its own route). */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.redirect(new URL("/admin/login", req.url), 303);
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const { id: idStr } = await ctx.params;
  const id = parseInt(idStr, 10);
  if (!id || Number.isNaN(id)) {
    return NextResponse.redirect(new URL("/admin/estimates", req.url), 303);
  }

  const form = await req.formData();
  const next = String(form.get("status") ?? "") as EstimateStatus;
  if (!ALLOWED.includes(next)) {
    return NextResponse.redirect(new URL(`/admin/estimates/${id}?error=bad_status`, req.url), 303);
  }

  try {
    await setEstimateStatus(id, next);
  } catch (e) {
    return NextResponse.redirect(
      new URL(`/admin/estimates/${id}?error=` + encodeURIComponent((e as Error).message), req.url),
      303
    );
  }
  return NextResponse.redirect(new URL(`/admin/estimates/${id}?updated=1`, req.url), 303);
}
