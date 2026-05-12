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
  const name = String(form.get("name") ?? "").trim();
  if (!name) {
    return NextResponse.redirect(new URL("/admin/customers/new?error=missing_name", req.url), 303);
  }

  const data: Record<string, string | null> = {
    name,
    phone_e164: emptyToNull(form.get("phone_e164")),
    email: emptyToNull(form.get("email")),
    hubspot_contact_id: emptyToNull(form.get("hubspot_contact_id")),
    street_address: emptyToNull(form.get("street_address")),
    city: emptyToNull(form.get("city")),
    state: emptyToNull(form.get("state")) ?? "CA",
    zip: emptyToNull(form.get("zip")),
    neighborhood: emptyToNull(form.get("neighborhood")),
    notes: emptyToNull(form.get("notes")),
  };

  const sb = supabase();
  const { data: row, error } = await sb.from("customers").insert(data).select("id").single();
  if (error) {
    console.error("[customers.create]", error);
    return NextResponse.redirect(new URL("/admin/customers/new?error=db", req.url), 303);
  }

  return NextResponse.redirect(new URL(`/admin/customers/${row.id}`, req.url), 303);
}

function emptyToNull(v: FormDataEntryValue | null): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}
