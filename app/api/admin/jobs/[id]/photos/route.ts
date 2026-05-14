import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  isUploadablePhoto,
  saveJobPhoto,
  type JobPhotoCategory,
} from "@/lib/job-photos";

export const runtime = "nodejs";

const CATEGORIES: JobPhotoCategory[] = ["before", "after", "failure", "permit", "invoice", "other"];

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
    return NextResponse.redirect(new URL("/admin/jobs?error=bad_id", req.url), 303);
  }

  const form = await req.formData();
  const photoValue = form.get("photo");
  const categoryValue = String(form.get("category") ?? "other");
  const category = CATEGORIES.includes(categoryValue as JobPhotoCategory)
    ? (categoryValue as JobPhotoCategory)
    : "other";

  if (!(photoValue instanceof File) || !isUploadablePhoto(photoValue)) {
    return redirectBack(req, id, "photo=missing");
  }

  try {
    await saveJobPhoto({
      jobId: id,
      file: photoValue,
      category,
      caption: stringOrNull(form.get("caption")),
    });
  } catch (err) {
    console.error("[jobs.photos]", err);
    return redirectBack(req, id, "photo=error");
  }

  return redirectBack(req, id, "photo=1");
}

function stringOrNull(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function redirectBack(req: NextRequest, jobId: number, query: string): NextResponse {
  const fallback = new URL(`/admin/jobs/${jobId}?${query}`, req.url);
  const referer = req.headers.get("referer");
  if (!referer) return NextResponse.redirect(fallback, 303);

  try {
    const ref = new URL(referer);
    const current = new URL(req.url);
    if (ref.origin !== current.origin) return NextResponse.redirect(fallback, 303);
    const [key, value] = query.split("=");
    ref.searchParams.set(key, value ?? "1");
    return NextResponse.redirect(ref, 303);
  } catch {
    return NextResponse.redirect(fallback, 303);
  }
}
