import Stripe from "stripe";
import type { InvoiceLineItem } from "@/lib/invoices";

let client: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function stripeWebhookSecret(): string | undefined {
  return process.env.STRIPE_WEBHOOK_SECRET;
}

export function stripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not set");
  client ??= new Stripe(secretKey);
  return client;
}

export async function createCheckoutSessionForInvoice(input: {
  invoiceId: number;
  jobId: number;
  customerEmail?: string | null;
  customerName?: string | null;
  lineItems: InvoiceLineItem[];
  successUrl: string;
  cancelUrl: string;
}): Promise<
  | { ok: true; skipped?: false; checkoutSessionId: string; paymentUrl: string }
  | { ok: true; skipped: true; error: string }
  | { ok: false; error: string }
> {
  if (!isStripeConfigured()) {
    return { ok: true, skipped: true, error: "Stripe is not configured" };
  }

  try {
    const session = await stripeClient().checkout.sessions.create({
      mode: "payment",
      customer_email: input.customerEmail || undefined,
      client_reference_id: `invoice:${input.invoiceId}`,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: {
        invoice_id: String(input.invoiceId),
        job_id: String(input.jobId),
      },
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `Z and Z Plumbing invoice #${input.invoiceId}`,
          footer: "Thank you for choosing Z and Z Plumbing.",
          metadata: {
            invoice_id: String(input.invoiceId),
            job_id: String(input.jobId),
          },
        },
      },
      line_items: input.lineItems.map((item) => ({
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: item.total_cents,
          product_data: {
            name: item.description,
            description:
              item.quantity === 1
                ? undefined
                : `${item.quantity} x ${(item.unit_price_cents / 100).toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}`,
          },
        },
      })),
    });

    if (!session.url) {
      return { ok: false, error: "Stripe did not return a Checkout URL" };
    }

    return {
      ok: true,
      checkoutSessionId: session.id,
      paymentUrl: session.url,
    };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
