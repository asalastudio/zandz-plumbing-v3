import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { deleteInvoice } from "@/lib/invoices";

export const runtime = "nodejs";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.redirect(new URL("/admin/login", req.url), 303);
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const { id: idStr } = await ctx.params;
  const id = parseInt(idStr, 10);

  // Where to return to (the job page or the invoice list). Only allow internal
  // OS paths, mirroring the login route's safe-redirect guard.
  let next = "/admin/invoices?status=deleted";
  try {
    const form = await req.formData();
    const requested = String(form.get("next") ?? "");
    if (requested.startsWith("/admin") || requested.startsWith("/field")) {
      next = `${requested}${requested.includes("?") ? "&" : "?"}invoice=deleted`;
    }
  } catch {
    /* no form body — use default */
  }

  if (!id || Number.isNaN(id)) {
    return NextResponse.redirect(new URL("/admin/invoices?status=bad_id", req.url), 303);
  }

  try {
    await deleteInvoice(id);
  } catch (err) {
    console.error("[invoice.delete]", err);
    return NextResponse.redirect(new URL("/admin/invoices?status=delete_failed", req.url), 303);
  }

  return NextResponse.redirect(new URL(next, req.url), 303);
}
