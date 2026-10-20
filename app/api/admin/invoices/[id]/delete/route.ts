import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { deleteInvoice, InvoiceInputError } from "@/lib/invoices";

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
  // OS paths, mirroring the login route's safe-redirect guard. The job page
  // reads ?invoice=, the invoice list reads ?status=.
  let returnTo: string | null = null;
  try {
    const form = await req.formData();
    const requested = String(form.get("next") ?? "");
    if (requested.startsWith("/admin") || requested.startsWith("/field")) returnTo = requested;
  } catch {
    /* no form body — use default */
  }
  const done = (code: string) => {
    const dest = returnTo
      ? `${returnTo}${returnTo.includes("?") ? "&" : "?"}invoice=${code}`
      : `/admin/invoices?status=${code}`;
    return NextResponse.redirect(new URL(dest, req.url), 303);
  };

  if (!id || Number.isNaN(id)) return done("bad_id");

  try {
    await deleteInvoice(id);
  } catch (err) {
    if (err instanceof InvoiceInputError) return done("paid_locked");
    console.error("[invoice.delete]", err);
    return done("delete_failed");
  }

  return done("deleted");
}
