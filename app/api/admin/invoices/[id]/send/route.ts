import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { sendInvoiceEmail } from "@/lib/invoice-email";
import {
  ensureCustomerTrackingToken,
  getInvoiceContext,
  markInvoiceSent,
  trackingUrl,
  updateInvoicePaymentLink,
} from "@/lib/invoices";
import { createCheckoutSessionForInvoice } from "@/lib/stripe-checkout";

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

  try {
    const context = await getInvoiceContext(invoiceId);
    if (!context || !context.invoice.job_id || !context.invoice.customer_id) {
      return NextResponse.redirect(new URL("/admin/jobs?invoice=missing", req.url), 303);
    }

    const { invoice, job, customer } = context;
    const jobId = invoice.job_id;
    const customerId = invoice.customer_id;
    if (!jobId || !customerId) {
      return NextResponse.redirect(new URL("/admin/jobs?invoice=missing", req.url), 303);
    }

    const jobUrl = new URL(`/admin/jobs/${jobId}`, req.url);

    if (!customer?.email) {
      jobUrl.searchParams.set("invoice", "no_email");
      return NextResponse.redirect(jobUrl, 303);
    }

    const token = await ensureCustomerTrackingToken({
      customerId,
      jobId,
    });
    const customerTrackingUrl = trackingUrl(token);

    let paymentUrl = invoice.stripe_payment_link_url;
    if (!paymentUrl && !invoice.paid_at) {
      const checkout = await createCheckoutSessionForInvoice({
        invoiceId: invoice.id,
        jobId,
        customerEmail: customer.email,
        customerName: customer.name,
        lineItems: invoice.line_items,
        successUrl: trackingUrl(token, { payment: "success" }),
        cancelUrl: trackingUrl(token, { payment: "cancelled" }),
      });

      if (checkout.ok && !checkout.skipped) {
        paymentUrl = checkout.paymentUrl;
        await updateInvoicePaymentLink({
          invoiceId: invoice.id,
          checkoutSessionId: checkout.checkoutSessionId,
          paymentUrl,
        });
      } else if (!checkout.ok) {
        console.error("[invoice.send] Stripe checkout failed", checkout.error);
      }
    }

    const email = await sendInvoiceEmail({
      to: customer.email,
      customerName: customer.name,
      invoiceId: invoice.id,
      serviceLabel: job.service_label ?? job.service_type,
      amountCents: invoice.amount_cents,
      lineItems: invoice.line_items,
      trackingUrl: customerTrackingUrl,
      paymentUrl,
      notes: invoice.notes,
    });

    jobUrl.searchParams.set("invoice", email.ok && !email.skipped ? "sent" : "email_skipped");
    if (!email.ok) {
      console.error("[invoice.send] email failed", email.error);
      jobUrl.searchParams.set("invoice", "email_failed");
    } else if (!email.skipped) {
      await markInvoiceSent(invoice.id);
    }

    return NextResponse.redirect(jobUrl, 303);
  } catch (err) {
    console.error("[invoice.send]", err);
    return NextResponse.redirect(new URL(`/admin/jobs?invoice=error`, req.url), 303);
  }
}
