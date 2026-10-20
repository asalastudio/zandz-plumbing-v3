import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { markInvoicePaid } from "@/lib/invoices";

export const runtime = "nodejs";

/**
 * Record a payment by hand. Works for job invoices (lands on the job page) and
 * standalone invoices (lands on the invoices list). Marking an invoice that is
 * already paid is a no-op, so a double click can't resend the receipt.
 */
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
    return NextResponse.redirect(new URL("/admin/invoices?status=bad_id", req.url), 303);
  }

  const formData = await req.formData();
  const paymentMethod = valueToString(formData.get("payment_method")) || "manual";

  try {
    const { jobId } = await markInvoicePaid(invoiceId, paymentMethod);
    const dest = jobId ? `/admin/jobs/${jobId}?invoice=paid` : "/admin/invoices?status=paid";
    return NextResponse.redirect(new URL(dest, req.url), 303);
  } catch (err) {
    console.error("[invoice.paid]", err);
    return NextResponse.redirect(new URL("/admin/invoices?status=paid_failed", req.url), 303);
  }
}

function valueToString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}
