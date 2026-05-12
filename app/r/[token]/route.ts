import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Click-tracking redirect.
 *
 * Customer taps the link in their review-request SMS → hits /r/[token].
 * We record the click, then 302 to the real Google review URL.
 *
 * Fallback if Supabase isn't configured: just redirect.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FALLBACK_REVIEW_URL =
  process.env.GOOGLE_REVIEW_URL ?? "https://www.google.com/search?q=Z+and+Z+Plumbing+reviews";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ token: string }> }
) {
  const { token } = await ctx.params;
  const target = process.env.GOOGLE_REVIEW_URL ?? FALLBACK_REVIEW_URL;

  if (!isSupabaseConfigured() || !token) {
    return NextResponse.redirect(target, 302);
  }

  try {
    const sb = supabase();
    const { data: row } = await sb
      .from("review_requests")
      .select("id, link_clicked_at, click_count")
      .eq("click_token", token)
      .maybeSingle();

    if (row) {
      await sb
        .from("review_requests")
        .update({
          link_clicked_at: row.link_clicked_at ?? new Date().toISOString(),
          click_count: (row.click_count ?? 0) + 1,
        })
        .eq("id", row.id);
    }
  } catch (err) {
    console.error("[click-tracker] error:", err);
  }

  return NextResponse.redirect(target, 302);
}
