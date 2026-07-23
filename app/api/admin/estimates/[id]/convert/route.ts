import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { convertEstimateToInvoice, EstimateError } from "@/lib/estimates";

export const runtime = "nodejs";

/**
 * Convert an approved estimate into an invoice. One-way and one-time; the
 * estimate is marked converted and linked to the new invoice. Lands the
 * operator on the new invoice's job or the invoices list.
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
    return NextResponse.redirect(new URL("/admin/estimates", req.url), 303);
  }

  try {
    const invoice = await convertEstimateToInvoice(id);
    const dest = invoice.job_id ? `/admin/jobs/${invoice.job_id}` : "/admin/invoices";
    return NextResponse.redirect(new URL(`${dest}?invoice=from_estimate`, req.url), 303);
  } catch (e) {
    const msg = e instanceof EstimateError ? e.message : "Could not convert the estimate.";
    return NextResponse.redirect(
      new URL(`/admin/estimates/${id}?error=` + encodeURIComponent(msg), req.url),
      303
    );
  }
}
