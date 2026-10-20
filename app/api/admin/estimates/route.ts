import { NextRequest, NextResponse } from "next/server";
import { normalizeNanpToE164 } from "@/lib/phone";
import { isAuthenticated } from "@/lib/auth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { parseInvoiceLineItems, InvoiceInputError } from "@/lib/invoices";
import { createEstimate } from "@/lib/estimates";

export const runtime = "nodejs";

/**
 * Create an estimate. Same line-item form contract as invoices (the shared
 * editor component), plus an optional job_id and valid_until date. Uses the
 * picked customer by id, or creates a new one from the typed fields with the
 * same duplicate guard as the invoice route. No name-guessing either way.
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
    return NextResponse.redirect(new URL("/admin/estimates/new?error=bad_request", req.url), 303);
  }

  let customerId = parseInt(str(form.get("customer_id")), 10);
  if (!customerId || Number.isNaN(customerId)) {
    // "New customer instead" in the picker posts typed fields rather than an
    // id. Create the customer the same way the invoice builder does, so the
    // operator's line items aren't lost to a "pick a customer" error.
    const created = await createCustomerFromForm(form);
    if ("error" in created) {
      return NextResponse.redirect(
        new URL("/admin/estimates/new?error=" + encodeURIComponent(created.error), req.url),
        303
      );
    }
    customerId = created.id;
  }
  const jobIdRaw = str(form.get("job_id"));
  const jobId = jobIdRaw ? parseInt(jobIdRaw, 10) : null;
  const notes = str(form.get("notes")) || null;
  const validUntil = str(form.get("valid_until")) || null;
  const returnTo = str(form.get("return_to"));

  try {
    const lineItems = parseInvoiceLineItems(form);
    const estimate = await createEstimate({ customerId, jobId, lineItems, notes, validUntil });
    const dest = returnTo && returnTo.startsWith("/admin") ? returnTo : `/admin/estimates/${estimate.id}`;
    return NextResponse.redirect(new URL(`${dest}?estimate=created`, req.url), 303);
  } catch (e) {
    const msg = e instanceof InvoiceInputError ? e.message : "Could not create the estimate.";
    return NextResponse.redirect(
      new URL("/admin/estimates/new?error=" + encodeURIComponent(msg), req.url),
      303
    );
  }
}

async function createCustomerFromForm(form: FormData): Promise<{ id: number } | { error: string }> {
  const name = str(form.get("customer_name"));
  const email = str(form.get("customer_email")) || null;
  const phoneRaw = str(form.get("customer_phone"));
  const phone = phoneRaw ? normalizeNanpToE164(phoneRaw) : null;

  if (!name) return { error: "Pick a customer, or enter a name for a new one." };
  if (phoneRaw && !phone) return { error: "That phone number doesn't look like a US number." };
  if (!email && !phone) return { error: "Add a phone or email for the new customer." };

  const sb = supabase();
  // Same duplicate guard as the invoice builder: never silently create a
  // second record for someone who is already a customer.
  if (form.get("confirm_new") !== "on") {
    const byPhone = phone
      ? await sb.from("customers").select("id").eq("phone_e164", phone).limit(1).maybeSingle()
      : null;
    const byEmail =
      !byPhone?.data && email
        ? await sb.from("customers").select("id").ilike("email", email).limit(1).maybeSingle()
        : null;
    if (byPhone?.data || byEmail?.data) {
      return { error: "That phone or email already belongs to a customer. Search for them instead." };
    }
  }

  const { data, error } = await sb
    .from("customers")
    .insert({ name, email, phone_e164: phone })
    .select("id")
    .single();
  if (error || !data) return { error: "Could not create the customer." };
  return { id: data.id as number };
}

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}
