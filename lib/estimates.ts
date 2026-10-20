/**
 * Estimates.
 *
 * The company sends an estimate, the customer approves it, then it becomes an
 * invoice. Estimates deliberately share the invoice line-item shape so the
 * conversion is a straight copy and the PDF / line-item editor are reused.
 *
 * See migration 014.
 */

import crypto from "node:crypto";
import { supabase } from "@/lib/supabase";
import {
  createCustomInvoice,
  invoiceTotalCents,
  syncJobAfterInvoice,
  type InvoiceLineItem,
  type InvoiceRecord,
  type PostalAddress,
} from "@/lib/invoices";
import { siteOrigin } from "@/lib/url";
import { pacificYmd } from "@/lib/time";

export type EstimateStatus =
  | "draft"
  | "sent"
  | "approved"
  | "declined"
  | "converted";

export interface EstimateRecord {
  id: number;
  customer_id: number | null;
  job_id: number | null;
  line_items: InvoiceLineItem[];
  amount_cents: number;
  notes: string | null;
  status: EstimateStatus;
  valid_until: string | null;
  signed_at: string | null;
  signed_name: string | null;
  converted_invoice_id: number | null;
  converted_at: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export class EstimateError extends Error {}

/** True when a PostgREST error means the estimates table has not been migrated yet. */
function isMissingTable(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === "42P01" || /relation .*estimates.* does not exist/i.test(error.message ?? "");
}

function normalizeLineItems(value: unknown): InvoiceLineItem[] {
  if (!Array.isArray(value)) return [];
  return value.map((raw) => {
    const r = (raw ?? {}) as Record<string, unknown>;
    return {
      description: String(r.description ?? ""),
      quantity: Number(r.quantity ?? 1),
      unit_price_cents: Number(r.unit_price_cents ?? 0),
      total_cents: Number(r.total_cents ?? 0),
    };
  });
}

function normalize(row: Record<string, unknown>): EstimateRecord {
  return {
    id: Number(row.id),
    customer_id: row.customer_id == null ? null : Number(row.customer_id),
    job_id: row.job_id == null ? null : Number(row.job_id),
    line_items: normalizeLineItems(row.line_items),
    amount_cents: Number(row.amount_cents ?? 0),
    notes: (row.notes as string | null) ?? null,
    status: (row.status as EstimateStatus) ?? "draft",
    valid_until: (row.valid_until as string | null) ?? null,
    signed_at: (row.signed_at as string | null) ?? null,
    signed_name: (row.signed_name as string | null) ?? null,
    converted_invoice_id:
      row.converted_invoice_id == null ? null : Number(row.converted_invoice_id),
    converted_at: (row.converted_at as string | null) ?? null,
    sent_at: (row.sent_at as string | null) ?? null,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

export async function createEstimate(input: {
  customerId: number;
  jobId?: number | null;
  lineItems: InvoiceLineItem[];
  notes?: string | null;
  validUntil?: string | null;
}): Promise<EstimateRecord> {
  const { data, error } = await supabase()
    .from("estimates")
    .insert({
      customer_id: input.customerId,
      job_id: input.jobId ?? null,
      line_items: input.lineItems,
      amount_cents: invoiceTotalCents(input.lineItems),
      notes: input.notes || null,
      valid_until: input.validUntil || null,
      status: "draft",
    })
    .select("*")
    .single();
  if (error) throw new Error(`createEstimate: ${error.message}`);
  return normalize(data);
}

export async function updateEstimate(
  id: number,
  input: { lineItems: InvoiceLineItem[]; notes?: string | null; validUntil?: string | null }
): Promise<EstimateRecord> {
  const sb = supabase();
  const { data: existing } = await sb
    .from("estimates")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  if (!existing) throw new EstimateError("Estimate not found.");
  if (existing.status === "converted") {
    throw new EstimateError("This estimate was converted to an invoice and can no longer be edited.");
  }

  const { data, error } = await sb
    .from("estimates")
    .update({
      line_items: input.lineItems,
      amount_cents: invoiceTotalCents(input.lineItems),
      notes: input.notes ?? null,
      valid_until: input.validUntil ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(`updateEstimate: ${error.message}`);
  return normalize(data);
}

/**
 * Move an estimate through its lifecycle. A converted estimate is terminal:
 * moving it back to draft or sent would let it be converted a second time.
 */
export async function setEstimateStatus(id: number, status: EstimateStatus): Promise<void> {
  const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === "sent") patch.sent_at = new Date().toISOString();
  const { data, error } = await supabase()
    .from("estimates")
    .update(patch)
    .eq("id", id)
    .neq("status", "converted")
    .select("id");
  if (error) throw new Error(`setEstimateStatus: ${error.message}`);
  if (!data || data.length === 0) {
    throw new EstimateError("This estimate was converted to an invoice and can no longer change status.");
  }
}

/**
 * Stamp an estimate as emailed. Only a draft (or a declined one being
 * re-offered) becomes "sent"; resending an approved or converted estimate must
 * not knock it back down the lifecycle.
 */
export async function markEstimateSent(id: number): Promise<void> {
  const sb = supabase();
  const { data: current, error: fetchErr } = await sb
    .from("estimates")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  if (fetchErr) throw new Error(`markEstimateSent: ${fetchErr.message}`);
  if (!current) return;

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { sent_at: now, updated_at: now };
  if (current.status === "draft" || current.status === "declined") patch.status = "sent";

  const { error } = await sb.from("estimates").update(patch).eq("id", id);
  if (error) throw new Error(`markEstimateSent: ${error.message}`);
}

/** Today's date in Pacific as YYYY-MM-DD, to compare against a date-only valid_until. */
function pacificTodayIso(): string {
  const { year, month, day } = pacificYmd();
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** True once the estimate's valid-through date has passed (Pacific calendar). */
export function isEstimateExpired(estimate: Pick<EstimateRecord, "valid_until">): boolean {
  const until = estimate.valid_until?.slice(0, 10);
  return Boolean(until && until < pacificTodayIso());
}

/**
 * Format a date-only value ("2026-11-01", as stored in estimates.valid_until)
 * as a calendar date. new Date() reads a bare date as UTC midnight, which is
 * the previous evening in Pacific, so the day is formatted on the UTC calendar
 * instead. Full timestamps fall through to the normal Pacific formatting.
 */
export function formatEstimateDate(
  value: string | null,
  month: "long" | "short" = "long"
): string {
  if (!value) return "";
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  return new Date(dateOnly ? `${value}T00:00:00Z` : value).toLocaleDateString("en-US", {
    timeZone: dateOnly ? "UTC" : "America/Los_Angeles",
    year: "numeric",
    month,
    day: "numeric",
  });
}

export async function getEstimate(id: number): Promise<EstimateRecord | null> {
  const { data, error } = await supabase()
    .from("estimates")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getEstimate: ${error.message}`);
  return data ? normalize(data) : null;
}

export interface EstimateView {
  estimate: EstimateRecord;
  customer: {
    id: number;
    name: string;
    email: string | null;
    phone_e164: string | null;
    street_address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
  } | null;
  jobServiceLabel: string | null;
}

export async function getEstimateForView(id: number): Promise<EstimateView | null> {
  const sb = supabase();
  const estimate = await getEstimate(id);
  if (!estimate) return null;

  let customer: EstimateView["customer"] = null;
  if (estimate.customer_id) {
    const { data } = await sb
      .from("customers")
      .select("id, name, email, phone_e164, street_address, city, state, zip")
      .eq("id", estimate.customer_id)
      .maybeSingle();
    if (data) {
      customer = {
        id: Number(data.id),
        name: String(data.name ?? "Customer"),
        email: (data.email as string | null) ?? null,
        phone_e164: (data.phone_e164 as string | null) ?? null,
        street_address: (data.street_address as string | null) ?? null,
        city: (data.city as string | null) ?? null,
        state: (data.state as string | null) ?? "CA",
        zip: (data.zip as string | null) ?? null,
      };
    }
  }

  let jobServiceLabel: string | null = null;
  if (estimate.job_id) {
    const { data } = await sb
      .from("jobs")
      .select("service_label, service_type")
      .eq("id", estimate.job_id)
      .maybeSingle();
    jobServiceLabel =
      (data?.service_label as string | null) ?? (data?.service_type as string | null) ?? null;
  }

  return { estimate, customer, jobServiceLabel };
}

export interface EstimateListItem {
  id: number;
  amount_cents: number;
  status: EstimateStatus;
  created_at: string;
  customer_name: string | null;
  converted_invoice_id: number | null;
}

export async function listEstimates(limit = 200): Promise<EstimateListItem[]> {
  const { data, error } = await supabase()
    .from("estimates")
    .select("id, amount_cents, status, created_at, converted_invoice_id, customer:customers(name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  // Before migration 014 the table is absent — degrade to empty rather than
  // 500ing pages that list estimates.
  if (isMissingTable(error)) return [];
  if (error) throw new Error(`listEstimates: ${error.message}`);
  return (data ?? []).map((row: Record<string, unknown>) => {
    const c = Array.isArray(row.customer) ? row.customer[0] : row.customer;
    return {
      id: Number(row.id),
      amount_cents: Number(row.amount_cents ?? 0),
      status: (row.status as EstimateStatus) ?? "draft",
      created_at: String(row.created_at ?? ""),
      customer_name: (c as { name?: string } | null)?.name ?? null,
      converted_invoice_id:
        row.converted_invoice_id == null ? null : Number(row.converted_invoice_id),
    };
  });
}

export async function listJobEstimates(jobId: number): Promise<EstimateRecord[]> {
  const { data, error } = await supabase()
    .from("estimates")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });
  // The job page calls this — never let a missing table break a core page.
  if (isMissingTable(error)) return [];
  if (error) throw new Error(`listJobEstimates: ${error.message}`);
  return (data ?? []).map(normalize);
}

/** Only an estimate the customer has seen (or approved) can become an invoice. */
const CONVERTIBLE_STATUSES: EstimateStatus[] = ["sent", "approved"];

/**
 * The bridge: turn an approved estimate into an invoice.
 *
 * One-way and one-time. The new invoice carries the estimate's exact line
 * items, customer, and job, so nothing is retyped and the numbers can't drift
 * between the two documents.
 *
 * Safe against a double click: the estimate is first claimed with a
 * conditional update (still unconverted, still sent/approved) that flips it to
 * "converted". Only the request that wins the claim creates an invoice; the
 * loser finds nothing to update and stops. If the invoice insert then fails,
 * the claim is released so the operator can try again.
 */
export async function convertEstimateToInvoice(estimateId: number): Promise<InvoiceRecord> {
  const sb = supabase();
  const estimate = await getEstimate(estimateId);
  if (!estimate) throw new EstimateError("Estimate not found.");
  if (estimate.converted_invoice_id || estimate.status === "converted") {
    throw new EstimateError("This estimate has already been converted to an invoice.");
  }
  if (!CONVERTIBLE_STATUSES.includes(estimate.status)) {
    throw new EstimateError(
      estimate.status === "declined"
        ? "This estimate was declined, so it can't become an invoice."
        : "Send the estimate or mark it approved before converting it to an invoice."
    );
  }
  if (!estimate.customer_id) {
    throw new EstimateError("This estimate has no customer, so it cannot become an invoice.");
  }
  if (estimate.line_items.length === 0) {
    throw new EstimateError("This estimate has no line items.");
  }

  const claimedAt = new Date().toISOString();
  const { data: claimed, error: claimError } = await sb
    .from("estimates")
    .update({ status: "converted", converted_at: claimedAt, updated_at: claimedAt })
    .eq("id", estimateId)
    .is("converted_invoice_id", null)
    .in("status", CONVERTIBLE_STATUSES)
    .select("id");
  if (claimError) throw new Error(`convertEstimateToInvoice claim: ${claimError.message}`);
  if (!claimed || claimed.length === 0) {
    throw new EstimateError("This estimate has already been converted to an invoice.");
  }

  let invoice: InvoiceRecord;
  try {
    invoice = await createCustomInvoice({
      customerId: estimate.customer_id,
      jobId: estimate.job_id,
      lineItems: estimate.line_items,
      notes: estimate.notes,
    });
  } catch (err) {
    await sb
      .from("estimates")
      .update({ status: estimate.status, converted_at: null, updated_at: new Date().toISOString() })
      .eq("id", estimateId)
      .is("converted_invoice_id", null);
    throw err;
  }

  const { error } = await sb
    .from("estimates")
    .update({ converted_invoice_id: invoice.id, updated_at: new Date().toISOString() })
    .eq("id", estimateId);
  if (error) {
    // The invoice exists; surface the link failure so it can be reconciled
    // rather than silently orphaning the estimate.
    throw new Error(`Invoice ${invoice.id} created, but linking the estimate failed: ${error.message}`);
  }

  // Same job rules as any other invoice: a completed job moves to invoiced,
  // unfinished work keeps its status.
  if (invoice.job_id) {
    await syncJobAfterInvoice(invoice.job_id).catch((e) =>
      console.error("[convertEstimateToInvoice] job sync failed:", e)
    );
  }

  return invoice;
}

// ── Document data (for the PDF) ─────────────────────────────────────────────

export interface EstimateDocumentData {
  estimate: EstimateRecord;
  billTo: PostalAddress;
  jobAddress: PostalAddress;
  serviceLabel: string | null;
  jobNumber: number | null;
}

export async function getEstimateForDocument(id: number): Promise<EstimateDocumentData | null> {
  const view = await getEstimateForView(id);
  if (!view) return null;
  const { estimate, customer, jobServiceLabel } = view;

  const billTo: PostalAddress = {
    name: customer?.name ?? null,
    street: customer?.street_address ?? null,
    city: customer?.city ?? null,
    state: customer?.state ?? "CA",
    zip: customer?.zip ?? null,
  };

  // The estimate carries the job's address when present, else the bill-to.
  let jobAddress: PostalAddress = billTo;
  if (estimate.job_id) {
    const { data } = await supabase()
      .from("jobs")
      .select("job_address, job_city, job_zip")
      .eq("id", estimate.job_id)
      .maybeSingle();
    if (data?.job_address) {
      jobAddress = {
        name: billTo.name,
        street: (data.job_address as string) ?? null,
        city: (data.job_city as string | null) ?? null,
        state: "CA",
        zip: (data.job_zip as string | null) ?? null,
      };
    }
  }

  return {
    estimate,
    billTo,
    jobAddress,
    serviceLabel: jobServiceLabel,
    jobNumber: estimate.job_id,
  };
}

// ── Public share token (mirrors the invoice token scheme) ───────────────────

function tokenSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("SESSION_SECRET must be set to sign estimate links.");
  return s;
}

function estimateSig(id: number): string {
  return crypto
    .createHmac("sha256", tokenSecret())
    .update(`estimate:${id}`)
    .digest("base64url")
    .slice(0, 24);
}

export function estimateToken(id: number): string {
  return `${Buffer.from(String(id)).toString("base64url")}.${estimateSig(id)}`;
}

export function verifyEstimateToken(token: string): number | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  let id: number;
  try {
    id = parseInt(Buffer.from(parts[0], "base64url").toString("utf8"), 10);
  } catch {
    return null;
  }
  if (!id || Number.isNaN(id) || id < 1) return null;
  const a = Buffer.from(parts[1]);
  const b = Buffer.from(estimateSig(id));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return id;
}

export function estimateViewUrl(id: number): string {
  return `${siteOrigin()}/e/${estimateToken(id)}`;
}
