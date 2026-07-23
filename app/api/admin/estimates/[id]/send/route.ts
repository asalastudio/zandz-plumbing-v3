import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getEstimateForView, setEstimateStatus, estimateViewUrl } from "@/lib/estimates";
import { sendEstimateEmail } from "@/lib/estimate-email";

export const runtime = "nodejs";

/**
 * Email the estimate to the customer and mark it sent.
 *
 * This is the real "send" — the /status route only flips the flag. Here we
 * render + attach the PDF, email it, and only then move the estimate to 'sent'
 * so the status reflects a delivery that actually happened.
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

  const view = await getEstimateForView(id);
  if (!view) {
    return NextResponse.redirect(new URL("/admin/estimates?error=not_found", req.url), 303);
  }

  const { estimate, customer, jobServiceLabel } = view;
  const back = (q: string) => NextResponse.redirect(new URL(`/admin/estimates/${id}?${q}`, req.url), 303);

  if (!customer?.email) {
    return back(`error=${encodeURIComponent("This customer has no email on file. Add one, or send the PDF manually.")}`);
  }
  if (estimate.line_items.length === 0) {
    return back(`error=${encodeURIComponent("Add at least one line item before sending.")}`);
  }

  const result = await sendEstimateEmail({
    to: customer.email,
    customerName: customer.name,
    estimateId: estimate.id,
    serviceLabel: jobServiceLabel ?? "Plumbing service",
    amountCents: estimate.amount_cents,
    lineItems: estimate.line_items,
    viewUrl: estimateViewUrl(estimate.id),
    validUntil: estimate.valid_until,
    notes: estimate.notes,
  });

  if (!result.ok) {
    return back(`error=${encodeURIComponent(result.error ?? "Could not send the estimate email.")}`);
  }
  if (result.skipped) {
    return back(`error=${encodeURIComponent("Email is not configured (RESEND_API_KEY), so nothing was sent.")}`);
  }

  // Only advance the status once the email actually went out.
  await setEstimateStatus(id, "sent").catch(() => {});
  return back("sent=1");
}
