import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";
import { countPublishedCoupons, MAX_PUBLISHED_COUPONS } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.redirect(new URL("/admin/login", req.url), 303);
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const form = await req.formData();
  const headline = String(form.get("headline") ?? "").trim();
  if (!headline) {
    return NextResponse.redirect(new URL("/admin/coupons/new?error=missing", req.url), 303);
  }

  let published = form.get("published") === "true";

  // Enforce max 3 published
  if (published) {
    const count = await countPublishedCoupons();
    if (count >= MAX_PUBLISHED_COUPONS) {
      // Save as draft and bounce back with a notice
      published = false;
      const data = buildPayload(form, headline, published);
      const sb = supabase();
      await sb.from("coupons").insert(data);
      return NextResponse.redirect(new URL("/admin/coupons?error=limit", req.url), 303);
    }
  }

  const data = buildPayload(form, headline, published);
  const sb = supabase();
  const { data: row, error } = await sb.from("coupons").insert(data).select("id").single();
  if (error) {
    return NextResponse.redirect(
      new URL(`/admin/coupons/new?error=${encodeURIComponent(error.message)}`, req.url),
      303
    );
  }

  return NextResponse.redirect(new URL(`/admin/coupons?saved=${row.id}`, req.url), 303);
}

function buildPayload(form: FormData, headline: string, published: boolean) {
  return {
    headline,
    subheadline: emptyToNull(form.get("subheadline")),
    terms: emptyToNull(form.get("terms")),
    code: emptyToNull(form.get("code")),
    image_url: emptyToNull(form.get("image_url")),
    valid_from: toIsoOrNull(form.get("valid_from")),
    valid_until: toIsoOrNull(form.get("valid_until")),
    display_order: parseIntOr(form.get("display_order"), 0),
    published,
  };
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

function parseIntOr(v: FormDataEntryValue | null, fallback: number): number {
  if (v === null) return fallback;
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) ? n : fallback;
}
