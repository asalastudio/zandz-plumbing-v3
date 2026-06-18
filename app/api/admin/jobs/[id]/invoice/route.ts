import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getJob } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";
import { sendInvoiceEmail } from "@/lib/invoice-email";
import {
  createJobInvoice,
  ensureCustomerTrackingToken,
  invoiceTotalCents,
  InvoiceInputError,
  markInvoiceSent,
  parseInvoiceLineItems,
  syncJobAfterInvoice,
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
  const jobId = parseInt(idStr, 10);
  if (!jobId || Number.isNaN(jobId)) {
    return NextResponse.redirect(new URL("/admin/jobs?error=bad_id", req.url), 303);
  }

  const job = await getJob(jobId);
  if (!job || !job.customer_id) {
    return NextResponse.redirect(new URL(`/admin/jobs/${jobId}?invoice=no_customer`, req.url), 303);
  }

  // Only invoice once the work is done. Mirrors the status state machine
  // (complete -> invoiced -> paid) so a job cannot jump straight from
  // new/scheduled/on_site to invoiced by hitting this route.
  const INVOICEABLE = new Set(["complete", "invoiced", "paid"]);
  if (!INVOICEABLE.has(job.status)) {
    return NextResponse.redirect(new URL(`/admin/jobs/${jobId}?invoice=not_complete`, req.url), 303);
  }

  let lineItems;
  let notes: string | null;
  let sendNow = false;
  try {
    const formData = await req.formData();
    lineItems = parseInvoiceLineItems(formData);
    notes = valueToString(formData.get("notes")).trim() || null;
    sendNow = formData.get("send_invoice") === "on";
  } catch (err) {
    const code = err instanceof InvoiceInputError ? "invalid" : "error";
    console.error("[invoice.create] invalid input", err);
    return NextResponse.redirect(new URL(`/admin/jobs/${jobId}?invoice=${code}`, req.url), 303);
  }

  try {
    const invoice = await createJobInvoice({
      jobId,
      customerId: job.customer_id,
      lineItems,
      notes,
    });
    await syncJobAfterInvoice(jobId, invoiceTotalCents(lineItems));

    if (!sendNow) {
      return NextResponse.redirect(new URL(`/admin/jobs/${jobId}?invoice=created`, req.url), 303);
    }

    const customer = job.customer;
    if (!customer?.email) {
      return NextResponse.redirect(new URL(`/admin/jobs/${jobId}?invoice=no_email`, req.url), 303);
    }

    const token = await ensureCustomerTrackingToken({
      customerId: job.customer_id,
      jobId,
    });
    const customerTrackingUrl = trackingUrl(token);

    let paymentUrl: string | null = null;
    const checkout = await createCheckoutSessionForInvoice({
      invoiceId: invoice.id,
      jobId,
      customerEmail: customer.email,
      customerName: customer.name,
      lineItems,
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
      console.error("[invoice.create] Stripe checkout failed", checkout.error);
    }

    const email = await sendInvoiceEmail({
      to: customer.email,
      customerName: customer.name,
      invoiceId: invoice.id,
      serviceLabel: job.service_label ?? job.service_type,
      amountCents: invoice.amount_cents,
      lineItems,
      trackingUrl: customerTrackingUrl,
      paymentUrl,
      notes,
    });

    if (!email.ok) {
      console.error("[invoice.create] email failed", email.error);
      return NextResponse.redirect(new URL(`/admin/jobs/${jobId}?invoice=email_failed`, req.url), 303);
    }

    if (email.skipped) {
      return NextResponse.redirect(new URL(`/admin/jobs/${jobId}?invoice=email_skipped`, req.url), 303);
    }

    await markInvoiceSent(invoice.id);
    return NextResponse.redirect(new URL(`/admin/jobs/${jobId}?invoice=sent`, req.url), 303);
  } catch (err) {
    console.error("[invoice.create]", err);
    return NextResponse.redirect(new URL(`/admin/jobs/${jobId}?invoice=error`, req.url), 303);
  }
}

function valueToString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}
