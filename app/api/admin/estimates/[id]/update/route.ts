import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { parseInvoiceLineItems, InvoiceInputError } from "@/lib/invoices";
import { updateEstimate, EstimateError } from "@/lib/estimates";

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
  if (!id || Number.isNaN(id)) {
    return NextResponse.redirect(new URL("/admin/estimates", req.url), 303);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.redirect(new URL(`/admin/estimates/${id}/edit?error=bad_request`, req.url), 303);
  }

  const notes = str(form.get("notes")) || null;
  const validUntil = str(form.get("valid_until")) || null;

  try {
    const lineItems = parseInvoiceLineItems(form);
    await updateEstimate(id, { lineItems, notes, validUntil });
  } catch (e) {
    const msg =
      e instanceof InvoiceInputError || e instanceof EstimateError
        ? e.message
        : "Could not update the estimate.";
    return NextResponse.redirect(
      new URL(`/admin/estimates/${id}/edit?error=` + encodeURIComponent(msg), req.url),
      303
    );
  }

  return NextResponse.redirect(new URL(`/admin/estimates/${id}?updated=1`, req.url), 303);
}

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}
