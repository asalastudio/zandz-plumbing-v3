import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";
import { extractYouTubeId, youtubeThumbnailUrl } from "@/lib/db";

export const runtime = "nodejs";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function uniqueSlug(base: string): Promise<string> {
  const sb = supabase();
  let slug = base || `resource-${Date.now()}`;
  let i = 1;
  while (true) {
    const { data } = await sb
      .from("learning_resources")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return slug;
    i += 1;
    slug = `${base}-${i}`;
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.redirect(new URL("/admin/login", req.url), 303);
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const form = await req.formData();
  const title = String(form.get("title") ?? "").trim();
  const url = String(form.get("url") ?? "").trim();
  const mediaType = String(form.get("media_type") ?? "video");

  if (!title || !url) {
    return NextResponse.redirect(new URL("/admin/learning/new?error=missing", req.url), 303);
  }
  // Validate against the enum before the insert so an out-of-range value gives
  // a clean error instead of leaking a raw Postgres enum error into the URL.
  if (mediaType !== "video" && mediaType !== "image") {
    return NextResponse.redirect(new URL("/admin/learning/new?error=invalid_media_type", req.url), 303);
  }

  const ytId = mediaType === "video" ? extractYouTubeId(url) : null;
  const thumb = String(form.get("thumbnail_url") ?? "").trim() || (ytId ? youtubeThumbnailUrl(ytId) : null);
  const slug = await uniqueSlug(slugify(title));

  const data = {
    media_type: mediaType,
    title,
    slug,
    description: emptyToNull(form.get("description")),
    category: String(form.get("category") ?? "general"),
    url,
    thumbnail_url: thumb,
    sort_order: parseIntOr(form.get("sort_order"), 0),
    published: form.get("published") === "true",
  };

  const sb = supabase();
  const { data: row, error } = await sb
    .from("learning_resources")
    .insert(data)
    .select("id")
    .single();

  if (error) {
    return NextResponse.redirect(
      new URL(`/admin/learning/new?error=${encodeURIComponent(error.message)}`, req.url),
      303
    );
  }

  return NextResponse.redirect(new URL(`/admin/learning?saved=${row.id}`, req.url), 303);
}

function emptyToNull(v: FormDataEntryValue | null): string | null {
  if (v === null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

function parseIntOr(v: FormDataEntryValue | null, fallback: number): number {
  if (v === null) return fallback;
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) ? n : fallback;
}
