import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { sendInvoiceEmail } from "@/lib/invoice-email";
import { sendInvoiceSms } from "@/lib/invoice-sms";
import {
  ensureCustomerTrackingToken,
  getInvoiceContext,
  invoiceViewUrl,
  markInvoiceSent,
  reusableCheckoutUrl,
  trackingUrl,
  updateInvoicePaymentLink,
  type InvoiceContext,
} from "@/lib/invoices";
import { createCheckoutSessionForInvoice } from "@/lib/stripe-checkout";

export const runtime = "nodejs";

/**
 * (Re)send an invoice to the customer.
 *
 *  - Job invoices go out by email with the job tracking link, and land the
 *    operator back on the job page.
 *  - Standalone (custom) invoices have no job or tracking page, so they link to
 *    the public invoice view instead. They go by email when there is one on
 *    file, otherwise by text, and land back on the invoices list.
 *
 * A stored Stripe Checkout link is only reused while its session is fresh
 * (sessions expire after 24h); otherwise a new one is minted when Stripe is
 * configured, and the email goes without a pay button when it is not.
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

  try {
    const context = await getInvoiceContext(invoiceId);
    if (!context || !context.invoice.customer_id) {
      return NextResponse.redirect(new URL("/admin/invoices?status=missing", req.url), 303);
    }

    return context.job
      ? await sendJobInvoice(req, context, context.job)
      : await sendStandaloneInvoice(req, context);
  } catch (err) {
    console.error("[invoice.send]", err);
    return NextResponse.redirect(new URL(`/admin/invoices?status=send_failed`, req.url), 303);
  }
}

async function sendJobInvoice(
  req: NextRequest,
  { invoice, customer }: InvoiceContext,
  job: NonNullable<InvoiceContext["job"]>
): Promise<NextResponse> {
  const jobUrl = new URL(`/admin/jobs/${job.id}`, req.url);
  const customerId = invoice.customer_id as number;

  if (!customer?.email) {
    jobUrl.searchParams.set("invoice", "no_email");
    return NextResponse.redirect(jobUrl, 303);
  }

  const token = await ensureCustomerTrackingToken({ customerId, jobId: job.id });
  const customerTrackingUrl = trackingUrl(token);

  let paymentUrl: string | null = null;
  if (!invoice.paid_at) {
    paymentUrl = await reusableCheckoutUrl(invoice);
    if (!paymentUrl) {
      const checkout = await createCheckoutSessionForInvoice({
        invoiceId: invoice.id,
        jobId: job.id,
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
}

async function sendStandaloneInvoice(
  req: NextRequest,
  { invoice, customer }: InvoiceContext
): Promise<NextResponse> {
  const back = (status: string) =>
    NextResponse.redirect(
      new URL(`/admin/invoices?status=${encodeURIComponent(status)}`, req.url),
      303
    );

  if (!customer?.email && !customer?.phone_e164) return back("no_contact");

  const viewUrl = invoiceViewUrl(invoice.id);
  const label =
    invoice.line_items.length === 1 ? invoice.line_items[0].description : "Plumbing services";
  // Standalone invoices are never given a new Checkout session here (the
  // Stripe helper is built around a job), but a still-fresh one is reused.
  const paymentUrl = invoice.paid_at ? null : await reusableCheckoutUrl(invoice);

  let outcome: string;
  if (customer.email) {
    const r = await sendInvoiceEmail({
      to: customer.email,
      customerName: customer.name,
      invoiceId: invoice.id,
      serviceLabel: label,
      amountCents: invoice.amount_cents,
      lineItems: invoice.line_items,
      trackingUrl: viewUrl,
      paymentUrl,
      notes: invoice.notes,
    });
    if (!r.ok) console.error("[invoice.send] email failed", r.error);
    outcome = r.ok ? (r.skipped ? "email_skipped" : "email_sent") : "email_failed";
  } else {
    const r = await sendInvoiceSms({
      toPhoneE164: customer.phone_e164 as string,
      customerName: customer.name,
      invoiceId: invoice.id,
      amountCents: invoice.amount_cents,
      viewUrl,
    });
    if (!r.ok) console.error("[invoice.send] text failed", r.error);
    outcome = r.ok ? (r.skipped ? "text_skipped" : "text_sent") : "text_failed";
  }

  if (outcome.endsWith("_sent")) await markInvoiceSent(invoice.id);
  return back(outcome);
}
