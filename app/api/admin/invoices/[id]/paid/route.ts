import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getInvoiceContext, markInvoicePaid } from "@/lib/invoices";

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
  const invoiceId = parseInt(idStr, 10);
  if (!invoiceId || Number.isNaN(invoiceId)) {
    return NextResponse.redirect(new URL("/admin/jobs?invoice=bad_id", req.url), 303);
  }

  const formData = await req.formData();
  const paymentMethod = valueToString(formData.get("payment_method")) || "manual";

  try {
    const context = await getInvoiceContext(invoiceId);
    if (!context?.invoice.job_id) {
      return NextResponse.redirect(new URL("/admin/jobs?invoice=missing", req.url), 303);
    }

    await markInvoicePaid(invoiceId, paymentMethod);
    return NextResponse.redirect(
      new URL(`/admin/jobs/${context.invoice.job_id}?invoice=paid`, req.url),
      303
    );
  } catch (err) {
    console.error("[invoice.paid]", err);
    return NextResponse.redirect(new URL("/admin/jobs?invoice=error", req.url), 303);
  }
}

function valueToString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}
