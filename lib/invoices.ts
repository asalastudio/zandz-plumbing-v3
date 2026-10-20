import crypto from "node:crypto";
import { supabase } from "@/lib/supabase";
import type { Customer, Job, JobStatus } from "@/lib/db";
import { randomToken, siteOrigin } from "@/lib/url";
import { sendInvoiceReceiptEmail } from "@/lib/invoice-email";
import { isStripeConfigured, stripeClient } from "@/lib/stripe-checkout";

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price_cents: number;
  total_cents: number;
}

export interface InvoiceRecord {
  id: number;
  job_id: number | null;
  customer_id: number | null;
  amount_cents: number;
  stripe_payment_link_id: string | null;
  stripe_payment_link_url: string | null;
  stripe_checkout_session_id: string | null;
  line_items: InvoiceLineItem[];
  sent_at: string | null;
  paid_at: string | null;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceContext {
  invoice: InvoiceRecord;
  /** Null for a standalone (custom) invoice that was never tied to a job. */
  job: Pick<Job, "id" | "customer_id" | "service_type" | "service_label" | "status"> | null;
  customer: Pick<Customer, "id" | "name" | "email" | "phone_e164"> | null;
}

export class InvoiceInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvoiceInputError";
  }
}

export function parseInvoiceLineItems(formData: FormData): InvoiceLineItem[] {
  const descriptions = formData.getAll("description");
  const quantities = formData.getAll("quantity");
  const unitPrices = formData.getAll("unit_price");
  const max = Math.max(descriptions.length, quantities.length, unitPrices.length);
  const items: InvoiceLineItem[] = [];

  for (let i = 0; i < max; i += 1) {
    const description = valueToString(descriptions[i]).trim();
    const quantityRaw = valueToString(quantities[i]).trim();
    const unitRaw = valueToString(unitPrices[i]).trim();

    if (!description && !quantityRaw && !unitRaw) continue;
    if (!description) throw new InvoiceInputError("Every invoice line needs a description.");

    const quantity = parseQuantity(quantityRaw || "1");
    if (quantity == null) throw new InvoiceInputError("Quantity must be a number greater than zero.");

    const unitPriceCents = parseDollarsToCents(unitRaw);
    if (unitPriceCents == null) throw new InvoiceInputError("Price must be a valid dollar amount.");

    const totalCents = Math.round(unitPriceCents * quantity);
    if (totalCents <= 0) throw new InvoiceInputError("Line item total must be greater than zero.");

    items.push({
      description,
      quantity,
      unit_price_cents: unitPriceCents,
      total_cents: totalCents,
    });
  }

  if (items.length === 0) throw new InvoiceInputError("Add at least one invoice line item.");
  return items;
}

export function invoiceTotalCents(items: InvoiceLineItem[]): number {
  return items.reduce((sum, item) => sum + item.total_cents, 0);
}

export async function listJobInvoices(jobId: number): Promise<InvoiceRecord[]> {
  const { data, error } = await supabase()
    .from("invoices")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`listJobInvoices: ${error.message}`);
  return (data ?? []).map(normalizeInvoice);
}

export async function listPublicJobInvoices(jobId: number): Promise<InvoiceRecord[]> {
  const { data, error } = await supabase()
    .from("invoices")
    .select("id, job_id, customer_id, amount_cents, stripe_payment_link_url, line_items, sent_at, paid_at, payment_method, notes, created_at, updated_at")
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`listPublicJobInvoices: ${error.message}`);
  return (data ?? []).map(normalizeInvoice);
}

export async function createJobInvoice(input: {
  jobId: number;
  customerId: number;
  lineItems: InvoiceLineItem[];
  notes?: string | null;
}): Promise<InvoiceRecord> {
  const amountCents = invoiceTotalCents(input.lineItems);
  const { data, error } = await supabase()
    .from("invoices")
    .insert({
      job_id: input.jobId,
      customer_id: input.customerId,
      amount_cents: amountCents,
      line_items: input.lineItems,
      notes: input.notes || null,
    })
    .select("*")
    .single();

  if (error) throw new Error(`createJobInvoice: ${error.message}`);
  return normalizeInvoice(data);
}

/**
 * Edit an existing invoice's line items and notes.
 *
 * Refused once the invoice is paid — the amount on a paid invoice is a settled
 * fact, and quietly changing it would desync the money. Recomputes the total
 * from the new lines and re-syncs the job's final amount so the dashboard and a
 * re-sent copy stay consistent.
 *
 * Any stored Stripe Checkout link is dropped: it was minted for the old line
 * items, so paying it would collect the old amount. The next send mints a
 * fresh one.
 */
export async function updateInvoice(
  invoiceId: number,
  input: { lineItems: InvoiceLineItem[]; notes?: string | null }
): Promise<InvoiceRecord> {
  const sb = supabase();

  const { data: existing, error: fetchErr } = await sb
    .from("invoices")
    .select("id, job_id, paid_at, stripe_checkout_session_id")
    .eq("id", invoiceId)
    .maybeSingle();
  if (fetchErr) throw new Error(`updateInvoice fetch: ${fetchErr.message}`);
  if (!existing) throw new InvoiceInputError("Invoice not found.");
  if (existing.paid_at) {
    throw new InvoiceInputError("This invoice is marked paid and can no longer be edited.");
  }

  const amountCents = invoiceTotalCents(input.lineItems);

  const { data: updated, error: upErr } = await sb
    .from("invoices")
    .update({
      line_items: input.lineItems,
      amount_cents: amountCents,
      notes: input.notes ?? null,
      stripe_payment_link_url: null,
      stripe_payment_link_id: null,
      stripe_checkout_session_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", invoiceId)
    .select("*")
    .single();
  if (upErr) throw new Error(`updateInvoice: ${upErr.message}`);

  // Close the old Checkout session too, so a customer holding the old email
  // can't pay the stale amount into a session we no longer track.
  const oldSessionId = nullableString(existing.stripe_checkout_session_id);
  if (oldSessionId) await expireCheckoutSession(oldSessionId);

  // Keep the linked job's final amount in step with the edited total.
  if (existing.job_id) {
    await syncJobAfterInvoice(existing.job_id as number).catch((e) =>
      console.error("[updateInvoice] job sync failed:", e)
    );
  }

  return normalizeInvoice(updated);
}

export async function getInvoiceContext(invoiceId: number): Promise<InvoiceContext | null> {
  const sb = supabase();
  const { data: invoiceData, error: invoiceError } = await sb
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .maybeSingle();

  if (invoiceError) throw new Error(`getInvoiceContext invoice: ${invoiceError.message}`);
  if (!invoiceData) return null;

  const invoice = normalizeInvoice(invoiceData);

  // Standalone invoices have no job; the customer comes straight off the
  // invoice row.
  let jobData: InvoiceContext["job"] = null;
  if (invoice.job_id) {
    const { data, error: jobError } = await sb
      .from("jobs")
      .select("id, customer_id, service_type, service_label, status")
      .eq("id", invoice.job_id)
      .maybeSingle();

    if (jobError) throw new Error(`getInvoiceContext job: ${jobError.message}`);
    jobData = (data as InvoiceContext["job"]) ?? null;
  }

  const customerId = invoice.customer_id ?? jobData?.customer_id ?? null;
  const { data: customerData, error: customerError } = customerId
    ? await sb
        .from("customers")
        .select("id, name, email, phone_e164")
        .eq("id", customerId)
        .maybeSingle()
    : { data: null, error: null };

  if (customerError) throw new Error(`getInvoiceContext customer: ${customerError.message}`);

  return {
    invoice,
    job: jobData,
    customer: customerData as InvoiceContext["customer"],
  };
}

const TRACKING_TOKEN_TTL_DAYS = 180;

export async function ensureCustomerTrackingToken(input: {
  customerId: number;
  jobId: number;
}): Promise<string> {
  const sb = supabase();
  const { data: existing, error: existingError } = await sb
    .from("customer_tokens")
    .select("token, expires_at")
    .eq("job_id", input.jobId)
    .eq("customer_id", input.customerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) throw new Error(`ensureCustomerTrackingToken lookup: ${existingError.message}`);
  if (existing?.token && (!existing.expires_at || new Date(existing.expires_at) > new Date())) {
    return existing.token;
  }

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const token = randomToken(24);
    const { data, error } = await sb
      .from("customer_tokens")
      .insert({
        token,
        customer_id: input.customerId,
        job_id: input.jobId,
        // Long enough to cover the job and the invoice; not forever.
        expires_at: new Date(Date.now() + TRACKING_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select("token")
      .single();

    if (!error && data?.token) return data.token;
    if (!error || !error.message.toLowerCase().includes("duplicate")) {
      throw new Error(`ensureCustomerTrackingToken insert: ${error?.message ?? "unknown error"}`);
    }
  }

  throw new Error("ensureCustomerTrackingToken: token collision");
}

export function trackingUrl(token: string, params?: Record<string, string>): string {
  const url = new URL(`/track/${token}`, siteOrigin());
  for (const [key, value] of Object.entries(params ?? {})) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

export async function updateInvoicePaymentLink(input: {
  invoiceId: number;
  checkoutSessionId: string;
  paymentUrl: string;
}): Promise<void> {
  const { error } = await supabase()
    .from("invoices")
    .update({
      stripe_checkout_session_id: input.checkoutSessionId,
      stripe_payment_link_url: input.paymentUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.invoiceId);

  if (error) throw new Error(`updateInvoicePaymentLink: ${error.message}`);
}

/**
 * Stripe expires a Checkout session 24 hours after it is created. Anything
 * older than this is treated as dead, leaving an hour of slack for a customer
 * who opens the email late.
 */
const CHECKOUT_REUSE_MS = 23 * 60 * 60 * 1000;

/**
 * The stored Checkout link, if it is still safe to put in front of a
 * customer. Returns null when there is none, when it is close to expiring
 * (and expires it so the webhook can't receive a payment we no longer track),
 * or when Stripe is not configured and the link can't be checked at all.
 */
export async function reusableCheckoutUrl(invoice: InvoiceRecord): Promise<string | null> {
  const sessionId = invoice.stripe_checkout_session_id;
  if (!sessionId || !invoice.stripe_payment_link_url) return null;
  if (!isStripeConfigured()) return null;

  try {
    const session = await stripeClient().checkout.sessions.retrieve(sessionId);
    const fresh =
      session.status === "open" && Date.now() - session.created * 1000 < CHECKOUT_REUSE_MS;
    if (fresh && session.url) return session.url;
    if (session.status === "open") await expireCheckoutSession(sessionId);
    return null;
  } catch (err) {
    console.error("[invoices] checkout session lookup failed:", err);
    return null;
  }
}

/** Best-effort: close a Checkout session so it can no longer take a payment. */
async function expireCheckoutSession(sessionId: string): Promise<void> {
  if (!isStripeConfigured()) return;
  try {
    await stripeClient().checkout.sessions.expire(sessionId);
  } catch (err) {
    // Already expired or completed sessions reject this; either way it can't
    // take a new payment, which is all we need.
    console.warn("[invoices] could not expire checkout session", sessionId, err);
  }
}

export async function markInvoiceSent(invoiceId: number): Promise<void> {
  const { error } = await supabase()
    .from("invoices")
    .update({ sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", invoiceId);

  if (error) throw new Error(`markInvoiceSent: ${error.message}`);
}

/** Job statuses where the work is done, so invoice money may move the job along. */
const WORK_DONE_STATUSES: JobStatus[] = ["complete", "invoiced", "paid"];

/**
 * Bring a job's money fields in line with the invoices attached to it.
 *
 *  - final_amount_cents is the sum of every invoice on the job, so paying one
 *    of several invoices never overwrites the total with a partial amount.
 *  - Status only moves once the work is done (complete or later): any open
 *    invoice means "invoiced", all invoices paid means "paid". A job that is
 *    still new / scheduled / on site keeps its status, so a deposit invoice
 *    can't skip the crew's steps.
 *  - With no invoices left, an "invoiced" job falls back to "complete".
 *
 * The first time a job reaches "paid" it counts toward the customer's
 * lifetime_jobs. job_status_log (written by a trigger on every status change)
 * tells us whether it has been paid before, so a job that reopens for an
 * extra invoice isn't counted twice.
 */
async function reconcileJobMoney(jobId: number): Promise<void> {
  const sb = supabase();
  const [jobRes, invoicesRes] = await Promise.all([
    sb.from("jobs").select("status, customer_id").eq("id", jobId).maybeSingle(),
    sb.from("invoices").select("amount_cents, paid_at").eq("job_id", jobId),
  ]);
  if (jobRes.error) throw new Error(`reconcileJobMoney job: ${jobRes.error.message}`);
  if (invoicesRes.error) throw new Error(`reconcileJobMoney invoices: ${invoicesRes.error.message}`);

  const job = jobRes.data;
  if (!job) return;
  const status = job.status as JobStatus;
  const invoices = invoicesRes.data ?? [];

  const update: { final_amount_cents?: number | null; status?: JobStatus; updated_at: string } = {
    updated_at: new Date().toISOString(),
  };

  if (invoices.length === 0) {
    if (status === "invoiced") {
      update.status = "complete";
      update.final_amount_cents = null;
    }
  } else {
    update.final_amount_cents = invoices.reduce((sum, i) => sum + Number(i.amount_cents ?? 0), 0);
    if (WORK_DONE_STATUSES.includes(status)) {
      const target: JobStatus = invoices.every((i) => i.paid_at) ? "paid" : "invoiced";
      if (target !== status) update.status = target;
    }
  }

  let firstTimePaid = false;
  if (update.status === "paid") {
    const { count } = await sb
      .from("job_status_log")
      .select("id", { count: "exact", head: true })
      .eq("job_id", jobId)
      .eq("status", "paid");
    firstTimePaid = (count ?? 0) === 0;
  }

  const { error } = await sb.from("jobs").update(update).eq("id", jobId);
  if (error) throw new Error(`reconcileJobMoney update: ${error.message}`);

  if (firstTimePaid && job.customer_id) {
    await bumpCustomerStats(Number(job.customer_id), { jobs: 1 });
  }
}

/**
 * Re-sync a job after one of its invoices was created, edited, or converted
 * from an estimate. See reconcileJobMoney for the rules.
 */
export async function syncJobAfterInvoice(jobId: number): Promise<void> {
  await reconcileJobMoney(jobId);
}

/**
 * Add to a customer's running lifetime figures. migration 007 reset these to
 * zero, so from then on they only move here, as money is actually collected.
 * Best-effort: the payment is already recorded, and a failed counter update
 * must not turn that into an error for the operator.
 */
async function bumpCustomerStats(
  customerId: number,
  input: { revenueCents?: number; jobs?: number; servicedAt?: string }
): Promise<void> {
  try {
    const sb = supabase();
    const { data: c, error } = await sb
      .from("customers")
      .select("lifetime_revenue_cents, lifetime_jobs, last_job_completed_at")
      .eq("id", customerId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!c) return;

    const patch: Record<string, number | string> = {};
    if (input.revenueCents) {
      patch.lifetime_revenue_cents = Number(c.lifetime_revenue_cents ?? 0) + input.revenueCents;
    }
    if (input.jobs) patch.lifetime_jobs = Number(c.lifetime_jobs ?? 0) + input.jobs;
    if (input.servicedAt) {
      const prev = c.last_job_completed_at ? new Date(c.last_job_completed_at).getTime() : 0;
      if (new Date(input.servicedAt).getTime() > prev) patch.last_job_completed_at = input.servicedAt;
    }
    if (Object.keys(patch).length === 0) return;

    const { error: upErr } = await sb.from("customers").update(patch).eq("id", customerId);
    if (upErr) throw new Error(upErr.message);
  } catch (err) {
    console.error("[invoices] customer lifetime update failed:", customerId, err);
  }
}

/**
 * Record a payment. Idempotent: an invoice that is already paid is left alone
 * and no second receipt goes out, so the Stripe webhook retrying, or the
 * operator double-clicking "Mark paid", is harmless. The paid stamp is
 * claimed with a conditional update so two callers racing can't both run the
 * side effects.
 */
export async function markInvoicePaid(
  invoiceId: number,
  paymentMethod: string
): Promise<{ alreadyPaid: boolean; jobId: number | null }> {
  const sb = supabase();
  const now = new Date().toISOString();
  const { data: invoice, error: invoiceError } = await sb
    .from("invoices")
    .select("id, job_id, customer_id, amount_cents, paid_at")
    .eq("id", invoiceId)
    .maybeSingle();

  if (invoiceError) throw new Error(`markInvoicePaid invoice: ${invoiceError.message}`);
  if (!invoice) throw new Error("Invoice not found");

  const jobId = invoice.job_id == null ? null : Number(invoice.job_id);
  if (invoice.paid_at) return { alreadyPaid: true, jobId };

  const { data: claimed, error: updateInvoiceError } = await sb
    .from("invoices")
    .update({
      paid_at: now,
      payment_method: paymentMethod,
      updated_at: now,
    })
    .eq("id", invoiceId)
    .is("paid_at", null)
    .select("id");

  if (updateInvoiceError) throw new Error(`markInvoicePaid update invoice: ${updateInvoiceError.message}`);
  if (!claimed || claimed.length === 0) return { alreadyPaid: true, jobId };

  const amountCents = Number(invoice.amount_cents ?? 0);
  const customerId = invoice.customer_id == null ? null : Number(invoice.customer_id);

  if (customerId) {
    await bumpCustomerStats(customerId, { revenueCents: amountCents, servicedAt: now });
  }

  // The invoice is already stamped paid, and a retry would now see it as paid
  // and skip this step, so a job-sync failure is logged rather than thrown.
  if (jobId) {
    await reconcileJobMoney(jobId).catch((e) =>
      console.error("[markInvoicePaid] job sync failed:", jobId, e)
    );
  }

  // Best-effort paid receipt to the customer. Never blocks the paid mutation
  // (covers both the manual "mark paid" route and the Stripe webhook path).
  await sendPaidReceipt({
    invoiceId,
    customerId,
    jobId,
    amountCents,
    paymentMethod,
  });

  return { alreadyPaid: false, jobId };
}

async function sendPaidReceipt(input: {
  invoiceId: number;
  customerId: number | null;
  jobId: number | null;
  amountCents: number;
  paymentMethod: string;
}): Promise<void> {
  try {
    if (!input.customerId) return;
    const sb = supabase();
    const { data: customer } = await sb
      .from("customers")
      .select("name, email")
      .eq("id", input.customerId)
      .maybeSingle();
    if (!customer?.email) return;

    let serviceLabel = "service";
    if (input.jobId) {
      const { data: job } = await sb
        .from("jobs")
        .select("service_label, service_type")
        .eq("id", input.jobId)
        .maybeSingle();
      serviceLabel = job?.service_label ?? job?.service_type ?? serviceLabel;
    }

    await sendInvoiceReceiptEmail({
      to: customer.email,
      customerName: customer.name ?? "there",
      invoiceId: input.invoiceId,
      amountCents: input.amountCents,
      serviceLabel,
      paymentMethod: input.paymentMethod,
    });
  } catch (err) {
    console.error("[invoices] paid receipt email failed:", err);
  }
}

export async function markInvoicePaidByCheckoutSession(
  checkoutSessionId: string,
  paymentMethod = "card"
): Promise<void> {
  const { data, error } = await supabase()
    .from("invoices")
    .select("id")
    .eq("stripe_checkout_session_id", checkoutSessionId)
    .maybeSingle();

  if (error) throw new Error(`markInvoicePaidByCheckoutSession: ${error.message}`);
  if (!data?.id) return;
  await markInvoicePaid(data.id, paymentMethod);
}

/**
 * Delete an invoice. Paid invoices are refused: the money was collected and
 * already counted toward the customer's lifetime figures, so removing the
 * record would leave the books wrong.
 *
 * An estimate that was converted into this invoice is released first (its
 * link is cleared and it goes back to approved, so it can be converted again);
 * otherwise the foreign key blocks the delete. The job is then re-synced: with
 * no invoices left an "invoiced" job reverts to "complete", otherwise its
 * final amount is re-summed. Returns the affected job_id (if any) so the
 * caller can redirect sensibly.
 */
export async function deleteInvoice(invoiceId: number): Promise<{ jobId: number | null }> {
  const sb = supabase();
  const { data: invoice, error: lookupError } = await sb
    .from("invoices")
    .select("id, job_id, paid_at")
    .eq("id", invoiceId)
    .maybeSingle();
  if (lookupError) throw new Error(`deleteInvoice lookup: ${lookupError.message}`);
  if (!invoice) return { jobId: null };
  if (invoice.paid_at) {
    throw new InvoiceInputError("This invoice is marked paid, so it can't be deleted.");
  }

  const jobId = invoice.job_id == null ? null : Number(invoice.job_id);

  const { error: releaseError } = await sb
    .from("estimates")
    .update({
      converted_invoice_id: null,
      converted_at: null,
      status: "approved",
      updated_at: new Date().toISOString(),
    })
    .eq("converted_invoice_id", invoiceId);
  // 42P01: the estimates table isn't there (pre-014), so nothing can point here.
  if (releaseError && releaseError.code !== "42P01") {
    throw new Error(`deleteInvoice release estimate: ${releaseError.message}`);
  }

  // Re-check paid_at in the delete itself, in case a payment landed meanwhile.
  const { error: deleteError } = await sb
    .from("invoices")
    .delete()
    .eq("id", invoiceId)
    .is("paid_at", null);
  if (deleteError) throw new Error(`deleteInvoice: ${deleteError.message}`);

  if (jobId) {
    await reconcileJobMoney(jobId).catch((e) =>
      console.error("[deleteInvoice] job sync failed:", e)
    );
  }

  return { jobId };
}

// ── Standalone (custom) invoices ────────────────────────────────────────────

/**
 * Create an invoice that is NOT required to be tied to a job. customer_id is
 * required; job_id is optional. Used by the custom-invoice builder.
 */
export async function createCustomInvoice(input: {
  customerId: number;
  jobId?: number | null;
  lineItems: InvoiceLineItem[];
  notes?: string | null;
}): Promise<InvoiceRecord> {
  const amountCents = invoiceTotalCents(input.lineItems);
  const { data, error } = await supabase()
    .from("invoices")
    .insert({
      job_id: input.jobId ?? null,
      customer_id: input.customerId,
      amount_cents: amountCents,
      line_items: input.lineItems,
      notes: input.notes || null,
    })
    .select("*")
    .single();

  if (error) throw new Error(`createCustomInvoice: ${error.message}`);
  return normalizeInvoice(data);
}

export interface InvoiceView {
  invoice: InvoiceRecord;
  customer: { id: number; name: string; email: string | null; phone_e164: string | null } | null;
  jobServiceLabel: string | null;
}

/** Load an invoice + its customer for the public view / sending. No job required. */
export async function getInvoiceForView(invoiceId: number): Promise<InvoiceView | null> {
  const sb = supabase();
  const { data: invoiceData, error } = await sb
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .maybeSingle();

  if (error) throw new Error(`getInvoiceForView: ${error.message}`);
  if (!invoiceData) return null;

  const invoice = normalizeInvoice(invoiceData);

  let customer: InvoiceView["customer"] = null;
  if (invoice.customer_id) {
    const { data } = await sb
      .from("customers")
      .select("id, name, email, phone_e164")
      .eq("id", invoice.customer_id)
      .maybeSingle();
    if (data) {
      customer = {
        id: Number(data.id),
        name: String(data.name ?? "Customer"),
        email: nullableString(data.email),
        phone_e164: nullableString(data.phone_e164),
      };
    }
  }

  let jobServiceLabel: string | null = null;
  if (invoice.job_id) {
    const { data } = await sb
      .from("jobs")
      .select("service_label, service_type")
      .eq("id", invoice.job_id)
      .maybeSingle();
    jobServiceLabel = nullableString(data?.service_label) ?? nullableString(data?.service_type);
  }

  return { invoice, customer, jobServiceLabel };
}

// ──────────────────────────────────────────────────────────────────────────
// Document rendering (PDF)
// ──────────────────────────────────────────────────────────────────────────

export interface PostalAddress {
  name: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
}

export interface InvoiceDocumentData {
  invoice: InvoiceRecord;
  /** BILL TO — the customer's own address on file. */
  billTo: PostalAddress;
  /** JOB ADDRESS — where the work happened. Falls back to billTo when the job
   *  has no address of its own, which is the case for web leads (ZIP only). */
  jobAddress: PostalAddress;
  serviceLabel: string | null;
  jobStatus: string | null;
  completedOn: string | null;
}

/**
 * Everything the invoice PDF needs, in one round trip.
 *
 * getInvoiceForView deliberately returns a thin shape for the public token
 * page; the document needs postal addresses on both sides, which that query
 * does not select.
 */
export async function getInvoiceForDocument(
  invoiceId: number
): Promise<InvoiceDocumentData | null> {
  const sb = supabase();

  const { data: invoiceData, error } = await sb
    .from("invoices").select("*").eq("id", invoiceId).maybeSingle();
  if (error) throw new Error(`getInvoiceForDocument: ${error.message}`);
  if (!invoiceData) return null;

  const invoice = normalizeInvoice(invoiceData);

  const [customerRes, jobRes] = await Promise.all([
    invoice.customer_id
      ? sb.from("customers")
          .select("name, street_address, city, state, zip")
          .eq("id", invoice.customer_id).maybeSingle()
      : Promise.resolve({ data: null }),
    invoice.job_id
      ? sb.from("jobs")
          .select("service_label, service_type, job_address, job_city, job_zip, status, updated_at")
          .eq("id", invoice.job_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const c = customerRes.data;
  const j = jobRes.data;

  const billTo: PostalAddress = {
    name: nullableString(c?.name),
    street: nullableString(c?.street_address),
    city: nullableString(c?.city),
    // customers.state defaults to CA at the DB level, but older rows may be
    // null. The document should never print a bare city with no state.
    state: nullableString(c?.state) ?? "CA",
    zip: nullableString(c?.zip),
  };

  const hasJobAddress = Boolean(nullableString(j?.job_address));
  const jobAddress: PostalAddress = hasJobAddress
    ? {
        name: billTo.name,
        street: nullableString(j?.job_address),
        city: nullableString(j?.job_city),
        state: "CA",
        zip: nullableString(j?.job_zip),
      }
    : billTo;

  return {
    invoice,
    billTo,
    jobAddress,
    serviceLabel:
      nullableString(j?.service_label) ?? nullableString(j?.service_type),
    jobStatus: nullableString(j?.status),
    // The job's last touch is the closest thing to a completion timestamp
    // until a dedicated column exists.
    completedOn:
      j?.status === "complete" || j?.status === "invoiced" || j?.status === "paid"
        ? nullableString(j?.updated_at)
        : null,
  };
}

export interface InvoiceListItem {
  id: number;
  amount_cents: number;
  sent_at: string | null;
  paid_at: string | null;
  created_at: string;
  customer_name: string | null;
  job_id: number | null;
}

export async function listInvoices(limit = 200): Promise<InvoiceListItem[]> {
  const { data, error } = await supabase()
    .from("invoices")
    .select("id, amount_cents, sent_at, paid_at, created_at, job_id, customers(name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`listInvoices: ${error.message}`);
  return (data ?? []).map((row: Record<string, unknown>) => {
    const cust = row.customers as { name?: string } | { name?: string }[] | null;
    const customer_name = Array.isArray(cust)
      ? (cust[0]?.name ?? null)
      : (cust?.name ?? null);
    return {
      id: Number(row.id),
      amount_cents: Number(row.amount_cents ?? 0),
      sent_at: nullableString(row.sent_at),
      paid_at: nullableString(row.paid_at),
      created_at: String(row.created_at ?? ""),
      customer_name,
      job_id: row.job_id == null ? null : Number(row.job_id),
    };
  });
}

// ── Signed public invoice tokens (no DB row needed) ─────────────────────────
//
// token = base64url(invoiceId) + "." + HMAC(invoiceId). Verifiable, stateless,
// and tamper-proof, so the public /i/[token] page needs no schema change.

function invoiceTokenSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;
  // A known fallback would let anyone mint valid invoice links. Dev only.
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set to sign invoice links");
  }
  return "dev-insecure-invoice-secret";
}

function invoiceSig(invoiceId: number): string {
  return crypto
    .createHmac("sha256", invoiceTokenSecret())
    .update(`invoice:${invoiceId}`)
    .digest("base64url")
    .slice(0, 24);
}

export function invoiceToken(invoiceId: number): string {
  const payload = Buffer.from(String(invoiceId)).toString("base64url");
  return `${payload}.${invoiceSig(invoiceId)}`;
}

export function verifyInvoiceToken(token: string): number | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  let id: number;
  try {
    id = parseInt(Buffer.from(payload, "base64url").toString("utf8"), 10);
  } catch {
    return null;
  }
  if (!id || Number.isNaN(id) || id < 1) return null;
  const expected = invoiceSig(id);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return id;
}

export function invoiceViewUrl(invoiceId: number): string {
  return `${siteOrigin()}/i/${invoiceToken(invoiceId)}`;
}

function valueToString(value: FormDataEntryValue | undefined): string {
  return typeof value === "string" ? value : "";
}

function parseQuantity(value: string): number | null {
  const n = Number(value.replace(/,/g, ""));
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100) / 100;
}

function parseDollarsToCents(value: string): number | null {
  const cleaned = value.replace(/[$,\s]/g, "");
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

function normalizeInvoice(row: Record<string, unknown>): InvoiceRecord {
  return {
    id: Number(row.id),
    job_id: row.job_id == null ? null : Number(row.job_id),
    customer_id: row.customer_id == null ? null : Number(row.customer_id),
    amount_cents: Number(row.amount_cents ?? 0),
    stripe_payment_link_id: nullableString(row.stripe_payment_link_id),
    stripe_payment_link_url: nullableString(row.stripe_payment_link_url),
    stripe_checkout_session_id: nullableString(row.stripe_checkout_session_id),
    line_items: normalizeLineItems(row.line_items),
    sent_at: nullableString(row.sent_at),
    paid_at: nullableString(row.paid_at),
    payment_method: nullableString(row.payment_method),
    notes: nullableString(row.notes),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

function normalizeLineItems(value: unknown): InvoiceLineItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      return {
        description: String(row.description ?? "Invoice item"),
        quantity: Number(row.quantity ?? 1),
        unit_price_cents: Number(row.unit_price_cents ?? 0),
        total_cents: Number(row.total_cents ?? 0),
      };
    })
    .filter((item): item is InvoiceLineItem => Boolean(item));
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}
