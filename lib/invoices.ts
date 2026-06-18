import crypto from "node:crypto";
import { supabase } from "@/lib/supabase";
import type { Customer, Job, JobStatus } from "@/lib/db";
import { randomToken, siteOrigin } from "@/lib/url";
import { sendInvoiceReceiptEmail } from "@/lib/invoice-email";

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
  job: Pick<Job, "id" | "customer_id" | "service_type" | "service_label" | "status">;
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
  if (!invoice.job_id) return null;

  const { data: jobData, error: jobError } = await sb
    .from("jobs")
    .select("id, customer_id, service_type, service_label, status")
    .eq("id", invoice.job_id)
    .maybeSingle();

  if (jobError) throw new Error(`getInvoiceContext job: ${jobError.message}`);
  if (!jobData) return null;

  const customerId = invoice.customer_id ?? jobData.customer_id;
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
    job: jobData as InvoiceContext["job"],
    customer: customerData as InvoiceContext["customer"],
  };
}

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

export async function markInvoiceSent(invoiceId: number): Promise<void> {
  const { error } = await supabase()
    .from("invoices")
    .update({ sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", invoiceId);

  if (error) throw new Error(`markInvoiceSent: ${error.message}`);
}

export async function syncJobAfterInvoice(jobId: number, amountCents: number): Promise<void> {
  const sb = supabase();
  const { data: job, error: jobError } = await sb
    .from("jobs")
    .select("status")
    .eq("id", jobId)
    .maybeSingle();

  if (jobError) throw new Error(`syncJobAfterInvoice job: ${jobError.message}`);

  const update: { final_amount_cents: number; updated_at: string; status?: JobStatus } = {
    final_amount_cents: amountCents,
    updated_at: new Date().toISOString(),
  };

  if (job?.status !== "paid" && job?.status !== "cancelled") {
    update.status = "invoiced";
  }

  const { error } = await sb.from("jobs").update(update).eq("id", jobId);
  if (error) throw new Error(`syncJobAfterInvoice update: ${error.message}`);
}

export async function markInvoicePaid(invoiceId: number, paymentMethod: string): Promise<void> {
  const sb = supabase();
  const now = new Date().toISOString();
  const { data: invoice, error: invoiceError } = await sb
    .from("invoices")
    .select("id, job_id, customer_id, amount_cents")
    .eq("id", invoiceId)
    .maybeSingle();

  if (invoiceError) throw new Error(`markInvoicePaid invoice: ${invoiceError.message}`);
  if (!invoice) throw new Error("Invoice not found");

  const { error: updateInvoiceError } = await sb
    .from("invoices")
    .update({
      paid_at: now,
      payment_method: paymentMethod,
      updated_at: now,
    })
    .eq("id", invoiceId);

  if (updateInvoiceError) throw new Error(`markInvoicePaid update invoice: ${updateInvoiceError.message}`);

  if (invoice.job_id) {
    const { error: updateJobError } = await sb
      .from("jobs")
      .update({
        status: "paid",
        final_amount_cents: invoice.amount_cents,
        updated_at: now,
      })
      .eq("id", invoice.job_id);

    if (updateJobError) throw new Error(`markInvoicePaid update job: ${updateJobError.message}`);
  }

  // Best-effort paid receipt to the customer. Never blocks the paid mutation
  // (covers both the manual "mark paid" route and the Stripe webhook path).
  await sendPaidReceipt({
    invoiceId,
    customerId: invoice.customer_id,
    jobId: invoice.job_id,
    amountCents: invoice.amount_cents,
    paymentMethod,
  });
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
  return process.env.SESSION_SECRET ?? "dev-insecure-invoice-secret";
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
