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

  const form = await req.formData();
  const headline = String(form.get("headline") ?? "").trim();
  if (!headline) {
    return NextResponse.redirect(new URL(`/admin/coupons/${id}?error=missing`, req.url), 303);
  }

  let published = form.get("published") === "true";

  // If newly publishing, enforce the cap
  if (published) {
    const sb0 = supabase();
    const { data: current } = await sb0
      .from("coupons")
      .select("published")
      .eq("id", id)
      .maybeSingle();
    const isBecomingPublished = current && !current.published;
    if (isBecomingPublished) {
      const count = await countPublishedCoupons();
      if (count >= MAX_PUBLISHED_COUPONS) {
        published = false;
        const data = buildPayload(form, headline, published);
        await sb0.from("coupons").update(data).eq("id", id);
        return NextResponse.redirect(new URL("/admin/coupons?error=limit", req.url), 303);
      }
    }
  }

  const data = buildPayload(form, headline, published);
  const sb = supabase();
  const { error } = await sb.from("coupons").update(data).eq("id", id);
  if (error) {
    return NextResponse.redirect(
      new URL(`/admin/coupons/${id}?error=${encodeURIComponent(error.message)}`, req.url),
      303
    );
  }

  return NextResponse.redirect(new URL(`/admin/coupons?saved=${id}`, req.url), 303);
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
