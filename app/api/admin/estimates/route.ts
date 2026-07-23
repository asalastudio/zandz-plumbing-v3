import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { parseInvoiceLineItems, InvoiceInputError } from "@/lib/invoices";
import { createEstimate } from "@/lib/estimates";

export const runtime = "nodejs";

/**
 * Create an estimate. Same line-item form contract as invoices (the shared
 * editor component), plus an optional job_id and valid_until date. Bills an
 * existing customer by id only — no name-guessing, mirroring the invoice route.
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

  const customerId = parseInt(str(form.get("customer_id")), 10);
  if (!customerId || Number.isNaN(customerId)) {
    return NextResponse.redirect(
      new URL("/admin/estimates/new?error=" + encodeURIComponent("Pick a customer first."), req.url),
      303
    );
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

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}
