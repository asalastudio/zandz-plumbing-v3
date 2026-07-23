import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { updateInvoice, parseInvoiceLineItems, InvoiceInputError } from "@/lib/invoices";

export const runtime = "nodejs";

/**
 * Edit an existing invoice's line items and notes. Same line-item form contract
 * as create (description/quantity/unit_price arrays), so the shared editor
 * component works unchanged. `return_to` lets the job page send the operator
 * back to the job instead of the invoices list.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.redirect(new URL("/admin/login", req.url), 303);
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const { id: idStr } = await ctx.params;
  const id = parseInt(idStr, 10);
  if (!id || Number.isNaN(id)) {
    return NextResponse.redirect(new URL("/admin/invoices?error=bad_id", req.url), 303);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.redirect(new URL(`/admin/invoices/${id}/edit?error=bad_request`, req.url), 303);
  }

  const returnTo = str(form.get("return_to"));
  const notes = str(form.get("notes")) || null;

  try {
    const lineItems = parseInvoiceLineItems(form);
    await updateInvoice(id, { lineItems, notes });
  } catch (e) {
    const msg = e instanceof InvoiceInputError ? e.message : "Could not update the invoice.";
    return NextResponse.redirect(
      new URL(`/admin/invoices/${id}/edit?error=${encodeURIComponent(msg)}`, req.url),
      303
    );
  }

  const dest = returnTo && returnTo.startsWith("/admin") ? returnTo : "/admin/invoices";
  return NextResponse.redirect(new URL(`${dest}${dest.includes("?") ? "&" : "?"}invoice=updated`, req.url), 303);
}

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}
