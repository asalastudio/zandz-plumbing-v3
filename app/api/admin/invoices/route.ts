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
  syncJobAfterInvoice,
  InvoiceInputError,
} from "@/lib/invoices";
import { toE164 } from "@/lib/twilio";

export const runtime = "nodejs";

/**
 * Create a standalone (custom) invoice and, optionally, send it immediately by
 * email and/or text.
 *
 * Two customer paths:
 *  - customer_id present → bill that exact existing record (the picker path).
 *    No name-guessing, no contact upsert, so a typed name can never silently
 *    overwrite or merge into the wrong customer.
 *  - new_customer        → create a fresh customer from the typed fields. If the
 *    phone/email collides with an existing customer we refuse unless the
 *    operator passed confirm_new, so the old "Janan billed as Eric" merge
 *    can't happen by accident.
 *
 * An optional job_id links the invoice to a job and marks that job invoiced.
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

  const customerIdRaw = str(form.get("customer_id"));
  const jobIdRaw = str(form.get("job_id"));
  const confirmNew = form.get("confirm_new") === "on";
  const name = str(form.get("customer_name"));
  const emailInput = str(form.get("customer_email")) || null;
  const phoneRaw = str(form.get("customer_phone"));
  const phoneInput = phoneRaw ? toE164(phoneRaw) : null;
  const notes = str(form.get("notes")) || null;
  const channelEmail = form.get("channel_email") === "on";
  const channelText = form.get("channel_text") === "on";
  const sendNow = form.get("send_now") === "on";

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

    // ── Resolve the customer ──
    let customerId: number;
    let name_: string;
    let email: string | null;
    let phoneE164: string | null;

    const selectedId = customerIdRaw ? parseInt(customerIdRaw, 10) : NaN;
    if (selectedId && !Number.isNaN(selectedId)) {
      // Existing customer chosen in the picker — bill them exactly.
      const { data: customer, error } = await sb
        .from("customers")
        .select("id, name, email, phone_e164")
        .eq("id", selectedId)
        .maybeSingle();
      if (error) throw new Error(`customer lookup: ${error.message}`);
      if (!customer) return back(req, "error");
      customerId = customer.id as number;
      name_ = String(customer.name ?? "Customer");
      email = (customer.email as string | null) ?? null;
      phoneE164 = (customer.phone_e164 as string | null) ?? null;
    } else {
      // New customer from typed fields.
      if (!name) return back(req, "name_required");
      if (phoneRaw && !phoneInput) return back(req, "bad_phone");
      if (!emailInput && !phoneInput) return back(req, "contact_required");

      // Duplicate guard (phone first, then email) — mirror the lookup endpoint.
      let existingId: number | undefined;
      if (phoneInput) {
        const { data } = await sb
          .from("customers")
          .select("id")
          .eq("phone_e164", phoneInput)
          .limit(1)
          .maybeSingle();
        if (data?.id) existingId = data.id as number;
      }
      if (!existingId && emailInput) {
        const { data } = await sb
          .from("customers")
          .select("id")
          .ilike("email", emailInput)
          .limit(1)
          .maybeSingle();
        if (data?.id) existingId = data.id as number;
      }

      if (existingId && !confirmNew) {
        // Don't silently merge into a different record — make the operator choose.
        return back(req, "duplicate_unconfirmed");
      }

      const { data, error } = await sb
        .from("customers")
        .insert({ name, email: emailInput, phone_e164: phoneInput })
        .select("id")
        .single();
      if (error) throw new Error(`customer insert: ${error.message}`);
      customerId = data.id as number;
      name_ = name;
      email = emailInput;
      phoneE164 = phoneInput;
    }

    // ── Optional job link (must belong to the resolved customer) ──
    let jobId: number | null = null;
    const selectedJobId = jobIdRaw ? parseInt(jobIdRaw, 10) : NaN;
    if (selectedJobId && !Number.isNaN(selectedJobId)) {
      const { data: job } = await sb
        .from("jobs")
        .select("id, customer_id")
        .eq("id", selectedJobId)
        .maybeSingle();
      if (job && job.customer_id === customerId) jobId = job.id as number;
    }

    const invoice = await createCustomInvoice({ customerId, jobId, lineItems, notes });
    if (jobId) await syncJobAfterInvoice(jobId, invoice.amount_cents);

    if (!sendNow || (!channelEmail && !channelText)) {
      return NextResponse.redirect(new URL("/admin/invoices?status=created", req.url), 303);
    }

    const viewUrl = invoiceViewUrl(invoice.id);
    const label = lineItems.length === 1 ? lineItems[0].description : "Plumbing services";
    const outcomes: string[] = [];

    if (channelEmail && email) {
      const r = await sendInvoiceEmail({
        to: email,
        customerName: name_,
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
        customerName: name_,
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
