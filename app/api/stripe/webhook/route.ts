import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { markInvoicePaidByCheckoutSession } from "@/lib/invoices";
import { stripeClient, stripeWebhookSecret } from "@/lib/stripe-checkout";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const secret = stripeWebhookSecret();
  const signature = req.headers.get("stripe-signature");

  if (!secret || !signature) {
    return NextResponse.json({ error: "Stripe webhook is not configured" }, { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = stripeClient().webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.error("[stripe.webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid Stripe signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status === "paid") {
        await markInvoicePaidByCheckoutSession(session.id, "card");
      }
    }
  } catch (err) {
    console.error("[stripe.webhook] handler failed", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
