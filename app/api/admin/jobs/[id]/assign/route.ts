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
    return NextResponse.redirect(new URL("/admin/jobs", req.url), 303);
  }

  const form = await req.formData();
  const assignedRaw = String(form.get("assigned_to") ?? "").trim();
  const assigned = assignedRaw === "" ? null : parseInt(assignedRaw, 10);

  const sb = supabase();
  const { error } = await sb.from("jobs").update({ assigned_to: assigned }).eq("id", id);
  if (error) {
    return NextResponse.redirect(new URL(`/admin/jobs/${id}?error=db`, req.url), 303);
  }

  return NextResponse.redirect(new URL(`/admin/jobs/${id}`, req.url), 303);
}
