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
    return NextResponse.redirect(new URL("/admin/learning", req.url), 303);
  }

  const sb = supabase();
  const { data: row, error: fetchErr } = await sb
    .from("learning_resources")
    .select("published")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr || !row) {
    return NextResponse.redirect(new URL("/admin/learning?error=not_found", req.url), 303);
  }

  const { error: updateErr } = await sb
    .from("learning_resources")
    .update({ published: !row.published })
    .eq("id", id);

  if (updateErr) {
    return NextResponse.redirect(
      new URL(`/admin/learning?error=${encodeURIComponent(updateErr.message)}`, req.url),
      303
    );
  }

  return NextResponse.redirect(new URL("/admin/learning?saved=1", req.url), 303);
}
