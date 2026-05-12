import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";
import { countPublishedCoupons, MAX_PUBLISHED_COUPONS } from "@/lib/db";

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
    return NextResponse.redirect(new URL("/admin/coupons", req.url), 303);
  }

  const sb = supabase();
  const { data: row, error: fetchErr } = await sb
    .from("coupons")
    .select("published")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr || !row) {
    return NextResponse.redirect(new URL("/admin/coupons?error=not_found", req.url), 303);
  }

  const newPublished = !row.published;

  // If turning ON, enforce the cap
  if (newPublished) {
    const count = await countPublishedCoupons();
    if (count >= MAX_PUBLISHED_COUPONS) {
      return NextResponse.redirect(new URL("/admin/coupons?error=limit", req.url), 303);
    }
  }

  const { error: updateErr } = await sb
    .from("coupons")
    .update({ published: newPublished })
    .eq("id", id);

  if (updateErr) {
    return NextResponse.redirect(
      new URL(`/admin/coupons?error=${encodeURIComponent(updateErr.message)}`, req.url),
      303
    );
  }

  return NextResponse.redirect(new URL("/admin/coupons?saved=1", req.url), 303);
}
