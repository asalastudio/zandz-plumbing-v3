import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";

const ROLES = ["owner", "lead_plumber", "plumber", "apprentice", "helper", "office"];

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.redirect(new URL("/admin/login", req.url), 303);
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const form = await req.formData();
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const role = String(form.get("role") ?? "").trim();
  const phone = String(form.get("phone_e164") ?? "").trim() || null;

  if (!name || !email || !role || !ROLES.includes(role)) {
    return NextResponse.redirect(new URL("/admin/crew?error=missing", req.url), 303);
  }

  const sb = supabase();
  const { error } = await sb
    .from("crew")
    .insert({ name, email, role, phone_e164: phone, active: true });

  if (error) {
    console.error("[crew.create]", error);
    return NextResponse.redirect(new URL(`/admin/crew?error=${encodeURIComponent(error.message)}`, req.url), 303);
  }

  return NextResponse.redirect(new URL("/admin/crew?added=1", req.url), 303);
}
