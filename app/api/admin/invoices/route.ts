import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { sendInvoiceEmail } from "@/lib/invoice-email";
import { sendInvoiceSms } from "@/lib/invoice-sms";
import {
  createCustomInvoice,
  invoiceViewUrl,
  markInvoiceSent,
  parseInvoiceLineItems,
  InvoiceInputError,
} from "@/lib/invoices";
import { toE164 } from "@/lib/twilio";

export const runtime = "nodejs";

/**
 * Create a standalone (custom) invoice for any customer and, optionally,
 * send it immediately by email and/or text. The customer is upserted by
 * phone then email (so an existing customer is reused, not duplicated).
 */
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.redirect(new URL("/admin/login", req.url), 303);
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return back(req, "bad_request");
  }

  const name = str(form.get("customer_name"));
  const email = str(form.get("customer_email")) || null;
  const phoneRaw = str(form.get("customer_phone"));
  const phoneE164 = phoneRaw ? toE164(phoneRaw) : null;
  const notes = str(form.get("notes")) || null;
  const channelEmail = form.get("channel_email") === "on";
  const channelText = form.get("channel_text") === "on";
  const sendNow = form.get("send_now") === "on";

  if (!name) return back(req, "name_required");
  if (phoneRaw && !phoneE164) return back(req, "bad_phone");
  if (!email && !phoneE164) return back(req, "contact_required");

  let lineItems;
  try {
    lineItems = parseInvoiceLineItems(form);
  } catch (err) {
    if (err instanceof InvoiceInputError) return back(req, "invalid_items");
    console.error("[invoice.custom] parse", err);
    return back(req, "error");
  }

  try {
    const sb = supabase();

    // Upsert customer (phone first, then email).
    let customerId: number | undefined;
    if (phoneE164) {
      const { data } = await sb
        .from("customers")
        .select("id")
        .eq("phone_e164", phoneE164)
        .limit(1)
        .maybeSingle();
      if (data?.id) customerId = data.id as number;
    }
    if (!customerId && email) {
      const { data } = await sb
        .from("customers")
        .select("id")
        .eq("email", email)
        .limit(1)
        .maybeSingle();
      if (data?.id) customerId = data.id as number;
    }
    if (!customerId) {
      const { data, error } = await sb
        .from("customers")
        .insert({ name, email, phone_e164: phoneE164 })
        .select("id")
        .single();
      if (error) throw new Error(`customer insert: ${error.message}`);
      customerId = data.id as number;
    }

    const invoice = await createCustomInvoice({ customerId, lineItems, notes });

    if (!sendNow || (!channelEmail && !channelText)) {
      return NextResponse.redirect(new URL("/admin/invoices?status=created", req.url), 303);
    }

    const viewUrl = invoiceViewUrl(invoice.id);
    const label = lineItems.length === 1 ? lineItems[0].description : "Plumbing services";
    const outcomes: string[] = [];

    if (channelEmail && email) {
      const r = await sendInvoiceEmail({
        to: email,
        customerName: name,
        invoiceId: invoice.id,
        serviceLabel: label,
        amountCents: invoice.amount_cents,
        lineItems,
        trackingUrl: viewUrl,
        paymentUrl: null,
        notes,
      });
      outcomes.push(r.ok ? (r.skipped ? "email_skipped" : "email_sent") : "email_failed");
    } else if (channelEmail && !email) {
      outcomes.push("email_no_address");
    }

    if (channelText && phoneE164) {
      const r = await sendInvoiceSms({
        toPhoneE164: phoneE164,
        customerName: name,
        invoiceId: invoice.id,
        amountCents: invoice.amount_cents,
        viewUrl,
      });
      outcomes.push(r.ok ? (r.skipped ? "text_skipped" : "text_sent") : "text_failed");
    } else if (channelText && !phoneE164) {
      outcomes.push("text_no_phone");
    }

    if (outcomes.some((o) => o.endsWith("_sent"))) {
      await markInvoiceSent(invoice.id);
    }

    const status = outcomes.join(",") || "created";
    return NextResponse.redirect(
      new URL(`/admin/invoices?status=${encodeURIComponent(status)}`, req.url),
      303
    );
  } catch (err) {
    console.error("[invoice.custom]", err);
    return back(req, "error");
  }
}

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

function back(req: NextRequest, code: string) {
  return NextResponse.redirect(new URL(`/admin/invoices/new?error=${code}`, req.url), 303);
}
