import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";
import { extractYouTubeId, youtubeThumbnailUrl } from "@/lib/db";

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

  const form = await req.formData();
  const title = String(form.get("title") ?? "").trim();
  const url = String(form.get("url") ?? "").trim();
  const mediaType = String(form.get("media_type") ?? "video");

  if (!title || !url) {
    return NextResponse.redirect(new URL(`/admin/learning/${id}?error=missing`, req.url), 303);
  }

  const ytId = mediaType === "video" ? extractYouTubeId(url) : null;
  const thumb = String(form.get("thumbnail_url") ?? "").trim() || (ytId ? youtubeThumbnailUrl(ytId) : null);

  const data = {
    media_type: mediaType,
    title,
    description: emptyToNull(form.get("description")),
    category: String(form.get("category") ?? "general"),
    url,
    thumbnail_url: thumb,
    sort_order: parseIntOr(form.get("sort_order"), 0),
    published: form.get("published") === "true",
  };

  const sb = supabase();
  const { error } = await sb.from("learning_resources").update(data).eq("id", id);

  if (error) {
    return NextResponse.redirect(
      new URL(`/admin/learning/${id}?error=${encodeURIComponent(error.message)}`, req.url),
      303
    );
  }

  return NextResponse.redirect(new URL(`/admin/learning?saved=${id}`, req.url), 303);
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
