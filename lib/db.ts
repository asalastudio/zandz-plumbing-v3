import { supabase } from "@/lib/supabase";
import {
  PACIFIC_TZ,
  startOfPacificDay,
  endOfPacificDay,
  startOfPacificWeek,
  startOfPacificMonth,
  pacificMonthsAgo,
  pacificMidnight,
  pacificYmd,
} from "@/lib/time";

/**
 * Typed query helpers for Z and Z OS.
 *
 * All queries run server-side with the service-role key (bypasses RLS).
 * Callers are server components / API routes inside the auth-gated admin.
 */

/**
 * Make free text safe to interpolate into a PostgREST `.or()` filter. Commas
 * and parentheses are the filter grammar itself, `*` and `%` are wildcards,
 * `:` and quotes change how a value is parsed, and backslash escapes. Any of
 * them in a search box would otherwise corrupt the filter and 500 the page.
 */
function orSafe(term: string): string {
  return term.replace(/[,()*:%\\"]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Page through a query 1,000 rows at a time (PostgREST's per-request cap), so
 * an aggregate never quietly stops at the first page. `build` must return the
 * same consistently ordered query for each range.
 */
async function selectAllPages<T>(
  label: string,
  build: (
    from: number,
    to: number
  ) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>
): Promise<T[]> {
  const PAGE = 1000;
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await build(from, from + PAGE - 1);
    if (error) throw new Error(`${label}: ${error.message}`);
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return rows;
}

// ──────────────────────────────────────────────────────────────────────────
// Types (mirror the supabase schema in 002_fsm_core.sql)
// ──────────────────────────────────────────────────────────────────────────

export type JobStatus =
  | "new"
  | "scheduled"
  | "en_route"
  | "on_site"
  | "paused"
  | "complete"
  | "invoiced"
  | "paid"
  | "cancelled";

export interface Crew {
  id: number;
  email: string;
  name: string;
  role: "owner" | "lead_plumber" | "plumber" | "apprentice" | "helper" | "office";
  phone_e164: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  hubspot_contact_id: string | null;
  servicetitan_customer_id: string | null;
  name: string;
  phone_e164: string | null;
  email: string | null;
  street_address: string | null;
  city: string | null;
  state: string;
  zip: string | null;
  neighborhood: string | null;
  notes: string | null;
  customer_type: string | null;
  lifetime_revenue_cents: number | null;
  lifetime_jobs: number | null;
  last_job_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceHistory {
  id: number;
  customer_id: number | null;
  servicetitan_invoice_id: string | null;
  servicetitan_job_id: string | null;
  job_number: string | null;
  completed_on: string | null;
  invoiced_on: string | null;
  job_type: string | null;
  business_unit: string | null;
  technician: string | null;
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  balance_cents: number;
  status: string | null;
  raw_customer_name: string | null;
  raw_location: string | null;
}

export interface Job {
  id: number;
  customer_id: number | null;
  hubspot_deal_id: string | null;
  service_type: string;
  service_label: string | null;
  status: JobStatus;
  scheduled_start: string | null;
  scheduled_end: string | null;
  job_address: string | null;
  job_city: string | null;
  job_zip: string | null;
  customer_notes: string | null;
  internal_notes: string | null;
  estimated_amount_cents: number | null;
  final_amount_cents: number | null;
  created_by: number | null;
  assigned_to: number | null;
  created_at: string;
  updated_at: string;
}

export interface JobWithRelations extends Job {
  customer?: Customer | null;
  assignee?: Crew | null;
}

export interface NewLeadNotification {
  id: number;
  service_type: string;
  service_label: string | null;
  job_city: string | null;
  job_zip: string | null;
  created_at: string;
  customer?: Pick<Customer, "id" | "name" | "phone_e164" | "email"> | null;
}

// ──────────────────────────────────────────────────────────────────────────
// Crew
// ──────────────────────────────────────────────────────────────────────────

export async function listCrew(opts: { activeOnly?: boolean } = {}): Promise<Crew[]> {
  const sb = supabase();
  let q = sb.from("crew").select("*").order("name", { ascending: true });
  if (opts.activeOnly) q = q.eq("active", true);
  const { data, error } = await q;
  if (error) throw new Error(`listCrew: ${error.message}`);
  return (data ?? []) as Crew[];
}

export async function getCrewMember(id: number): Promise<Crew | null> {
  const sb = supabase();
  const { data, error } = await sb.from("crew").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`getCrewMember: ${error.message}`);
  return data as Crew | null;
}

// ──────────────────────────────────────────────────────────────────────────
// Customers
// ──────────────────────────────────────────────────────────────────────────

export type CustomerSort = "name" | "revenue" | "last_job" | "jobs";
export type CustomerFilter = "all" | "active" | "dormant" | "top_spenders" | "no_contact";

export interface CustomerListOpts {
  search?: string;
  sort?: CustomerSort;
  filter?: CustomerFilter;
  limit?: number;
  offset?: number;
}

export async function listCustomers(opts: CustomerListOpts = {}): Promise<{
  rows: Customer[];
  count: number;
}> {
  const sb = supabase();
  const limit = opts.limit ?? 50;
  const offset = opts.offset ?? 0;

  let q = sb.from("customers").select("*", { count: "exact" });

  // Sort
  switch (opts.sort) {
    case "revenue":
      q = q.order("lifetime_revenue_cents", { ascending: false, nullsFirst: false });
      break;
    case "last_job":
      q = q.order("last_job_completed_at", { ascending: false, nullsFirst: false });
      break;
    case "jobs":
      q = q.order("lifetime_jobs", { ascending: false, nullsFirst: false });
      break;
    case "name":
    default:
      q = q.order("name", { ascending: true });
  }

  // Filter
  switch (opts.filter) {
    case "active": {
      const twelveMoAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
      q = q.gte("last_job_completed_at", twelveMoAgo);
      break;
    }
    case "dormant": {
      const twelveMoAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
      q = q.lt("last_job_completed_at", twelveMoAgo);
      break;
    }
    case "top_spenders":
      q = q.gt("lifetime_revenue_cents", 100000); // > $1000
      break;
    case "no_contact":
      q = q.is("phone_e164", null).is("email", null);
      break;
  }

  const safe = opts.search ? orSafe(opts.search) : "";
  if (safe) {
    const s = `%${safe}%`;
    const clauses = [
      `name.ilike.${s}`,
      `phone_e164.ilike.${s}`,
      `email.ilike.${s}`,
      `street_address.ilike.${s}`,
      `city.ilike.${s}`,
    ];
    // Phones are stored as +15105551234, so "(510) 555-01" only matches on
    // its digits.
    const digits = safe.replace(/\D/g, "");
    if (digits.length >= 3) clauses.push(`phone_e164.ilike.%${digits}%`);
    q = q.or(clauses.join(","));
  }

  q = q.range(offset, offset + limit - 1);

  const { data, error, count } = await q;
  if (error) throw new Error(`listCustomers: ${error.message}`);
  return { rows: (data ?? []) as Customer[], count: count ?? 0 };
}

export async function getCustomer(id: number): Promise<Customer | null> {
  const sb = supabase();
  const { data, error } = await sb.from("customers").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`getCustomer: ${error.message}`);
  return data as Customer | null;
}

export async function getCustomerJobs(customerId: number, limit = 20): Promise<Job[]> {
  const sb = supabase();
  const { data, error } = await sb
    .from("jobs")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`getCustomerJobs: ${error.message}`);
  return (data ?? []) as Job[];
}

// ──────────────────────────────────────────────────────────────────────────
// Service catalog (pricebook) search — shared by the invoice line-item picker
// and the AI assistant.
// ──────────────────────────────────────────────────────────────────────────

export interface ServiceCatalogItem {
  id: number;
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  price_cents: number;
  cost_cents: number;
  hours: number | null;
}

/**
 * Case-insensitive search over active pricebook services by code / name /
 * category. The term is stripped of PostgREST `.or()` metacharacters before
 * interpolation so a stray comma or paren can't corrupt the filter.
 */
export async function searchServiceCatalog(term: string, limit = 8): Promise<ServiceCatalogItem[]> {
  const safe = orSafe(term);
  if (!safe) return [];
  const like = `%${safe}%`;
  const { data, error } = await supabase()
    .from("service_catalog")
    .select("id, code, name, description, category, price_cents, cost_cents, hours")
    .eq("active", true)
    .or(`code.ilike.${like},name.ilike.${like},category.ilike.${like}`)
    .order("name", { ascending: true })
    .limit(limit);
  if (error) throw new Error(`searchServiceCatalog: ${error.message}`);
  return (data ?? []) as ServiceCatalogItem[];
}

export interface ServiceMaterial {
  code: string;
  name: string;
  quantity: number;
  unit: string | null;
  price: string;
}

/**
 * Materials/parts linked to a pricebook service code. Returns [] gracefully if
 * the materials data hasn't been imported yet (the table may not exist).
 */
export async function getServiceMaterials(serviceCode: string): Promise<ServiceMaterial[]> {
  const { data, error } = await supabase()
    .from("service_materials")
    .select("quantity, material:materials(code, name, unit, price_cents)")
    .eq("service_code", serviceCode);
  if (error || !data) return [];
  return data.map((row: Record<string, unknown>) => {
    const m = (Array.isArray(row.material) ? row.material[0] : row.material) as
      | { code?: string; name?: string; unit?: string | null; price_cents?: number }
      | null;
    return {
      code: String(m?.code ?? ""),
      name: String(m?.name ?? "Material"),
      quantity: Number(row.quantity ?? 1),
      unit: (m?.unit as string | null) ?? null,
      price: formatMoney(Number(m?.price_cents ?? 0)),
    };
  });
}

// ──────────────────────────────────────────────────────────────────────────
// Money rollups
//
// Real money lives in `invoices` (raised in Z and Z OS). `invoice_history` only
// holds ServiceTitan imports and was emptied by migration 007, but it is still
// folded in so any re-imported legacy rows count. The two sources disagree on
// meaning, so each is normalized:
//   - OS invoice:     revenue once paid (dated by paid_at), balance while unpaid.
//   - Legacy import:  revenue = total (dated by completed_on), balance as imported.
// ──────────────────────────────────────────────────────────────────────────

interface MoneyRow {
  customerId: number | null;
  /** Collected on this invoice (0 while an OS invoice is unpaid). */
  revenueCents: number;
  /** Still owed on this invoice. */
  balanceCents: number;
  /** When the revenue landed: a timestamp (OS) or a YYYY-MM-DD date (legacy). */
  revenueOn: string | null;
  jobType: string;
}

type OsInvoiceRow = {
  id: number;
  customer_id: number | null;
  job_id: number | null;
  amount_cents: number | null;
  sent_at: string | null;
  paid_at: string | null;
  created_at: string;
  job: { service_label: string | null; service_type: string | null } | { service_label: string | null; service_type: string | null }[] | null;
};

const OS_INVOICE_COLUMNS =
  "id, customer_id, job_id, amount_cents, sent_at, paid_at, created_at, job:jobs!invoices_job_id_fkey(service_label, service_type)";

function osJobType(row: OsInvoiceRow): string {
  const job = Array.isArray(row.job) ? row.job[0] : row.job;
  return job?.service_label ?? job?.service_type ?? "Custom invoice";
}

function osMoneyRow(row: OsInvoiceRow): MoneyRow {
  const amount = Number(row.amount_cents ?? 0);
  const paid = Boolean(row.paid_at);
  return {
    customerId: row.customer_id == null ? null : Number(row.customer_id),
    revenueCents: paid ? amount : 0,
    balanceCents: paid ? 0 : amount,
    revenueOn: row.paid_at,
    jobType: osJobType(row),
  };
}

type LegacyInvoiceRow = Pick<
  InvoiceHistory,
  "customer_id" | "total_cents" | "balance_cents" | "completed_on" | "job_type"
>;

function legacyMoneyRow(row: LegacyInvoiceRow): MoneyRow {
  return {
    customerId: row.customer_id,
    revenueCents: row.total_cents ?? 0,
    balanceCents: row.balance_cents ?? 0,
    revenueOn: row.completed_on,
    jobType: row.job_type ?? "Unknown",
  };
}

/** Every invoice in both sources, paginated, optionally for one customer. */
async function loadMoneyRows(customerId?: number): Promise<MoneyRow[]> {
  const sb = supabase();
  const [os, legacy] = await Promise.all([
    selectAllPages<OsInvoiceRow>("invoices", (from, to) => {
      let q = sb.from("invoices").select(OS_INVOICE_COLUMNS);
      if (customerId) q = q.eq("customer_id", customerId);
      return q.order("id", { ascending: true }).range(from, to);
    }),
    selectAllPages<LegacyInvoiceRow>("invoice_history", (from, to) => {
      let q = sb
        .from("invoice_history")
        .select("customer_id, total_cents, balance_cents, completed_on, job_type");
      if (customerId) q = q.eq("customer_id", customerId);
      return q.order("id", { ascending: true }).range(from, to);
    }),
  ]);
  return [...os.map(osMoneyRow), ...legacy.map(legacyMoneyRow)];
}

/** Epoch ms for a timestamp, or for Pacific midnight of a bare YYYY-MM-DD date. */
function moneyDateMs(value: string): number {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    return pacificMidnight(y, m, d).getTime();
  }
  return new Date(value).getTime();
}

/** "YYYY-MM" of the Pacific calendar month a money date falls in. */
function moneyMonthKey(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value.slice(0, 7);
  const { year, month } = pacificYmd(new Date(value));
  return `${year}-${String(month).padStart(2, "0")}`;
}

/**
 * One row of a customer's invoice history. Keeps the InvoiceHistory shape the
 * assistant already reads, plus enough to link an OS invoice back to its job.
 */
export interface CustomerInvoiceRow extends InvoiceHistory {
  source: "os" | "legacy";
  /** The Z and Z OS invoice id (null for legacy imports). */
  invoice_id: number | null;
  /** The Z and Z OS job the invoice belongs to, if any. */
  os_job_id: number | null;
}

export async function getCustomerInvoiceHistory(
  customerId: number,
  limit = 100
): Promise<CustomerInvoiceRow[]> {
  const sb = supabase();
  const [osRes, legacyRes] = await Promise.all([
    sb
      .from("invoices")
      .select(OS_INVOICE_COLUMNS)
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
      .limit(limit),
    sb
      .from("invoice_history")
      .select("*")
      .eq("customer_id", customerId)
      .order("completed_on", { ascending: false, nullsFirst: false })
      .limit(limit),
  ]);
  if (osRes.error) throw new Error(`getCustomerInvoiceHistory invoices: ${osRes.error.message}`);
  if (legacyRes.error) throw new Error(`getCustomerInvoiceHistory: ${legacyRes.error.message}`);

  const os: CustomerInvoiceRow[] = ((osRes.data ?? []) as OsInvoiceRow[]).map((r) => {
    const amount = Number(r.amount_cents ?? 0);
    return {
      id: Number(r.id),
      customer_id: r.customer_id == null ? null : Number(r.customer_id),
      servicetitan_invoice_id: null,
      servicetitan_job_id: null,
      job_number: null,
      // The date that matters on the list: when it was paid, else when raised.
      completed_on: r.paid_at ?? r.created_at,
      invoiced_on: r.sent_at,
      job_type: osJobType(r),
      business_unit: null,
      technician: null,
      subtotal_cents: amount,
      tax_cents: 0,
      total_cents: amount,
      balance_cents: r.paid_at ? 0 : amount,
      status: r.paid_at ? "Paid" : r.sent_at ? "Sent" : "Draft",
      raw_customer_name: null,
      raw_location: null,
      source: "os",
      invoice_id: Number(r.id),
      os_job_id: r.job_id == null ? null : Number(r.job_id),
    };
  });
  const legacy: CustomerInvoiceRow[] = ((legacyRes.data ?? []) as InvoiceHistory[]).map((r) => ({
    ...r,
    source: "legacy",
    invoice_id: null,
    os_job_id: null,
  }));

  return [...os, ...legacy]
    .sort((a, b) => moneyDateMs(b.completed_on ?? "1970-01-01") - moneyDateMs(a.completed_on ?? "1970-01-01"))
    .slice(0, limit);
}

export async function getCustomerLifetimeStats(customerId: number): Promise<{
  totalRevenueCents: number;
  totalBalanceCents: number;
  /** Invoices that brought in money (paid OS invoices plus legacy imports). */
  invoiceCount: number;
  firstCompletedOn: string | null;
  lastCompletedOn: string | null;
}> {
  const rows = await loadMoneyRows(customerId);

  let totalRevenueCents = 0;
  let totalBalanceCents = 0;
  let invoiceCount = 0;
  let firstCompletedOn: string | null = null;
  let lastCompletedOn: string | null = null;
  for (const r of rows) {
    totalRevenueCents += r.revenueCents;
    totalBalanceCents += r.balanceCents;
    if (r.revenueCents > 0) invoiceCount += 1;
    if (r.revenueOn) {
      const ms = moneyDateMs(r.revenueOn);
      if (!firstCompletedOn || ms < moneyDateMs(firstCompletedOn)) firstCompletedOn = r.revenueOn;
      if (!lastCompletedOn || ms > moneyDateMs(lastCompletedOn)) lastCompletedOn = r.revenueOn;
    }
  }
  return {
    totalRevenueCents,
    totalBalanceCents,
    invoiceCount,
    firstCompletedOn,
    lastCompletedOn,
  };
}

// ──────────────────────────────────────────────────────────────────────────
// Dashboard KPIs
// ──────────────────────────────────────────────────────────────────────────

export interface DashboardKpis {
  lifetimeRevenueCents: number;
  revenueThisMonthCents: number;
  revenueLast12MoCents: number;
  revenuePrev12MoCents: number;
  unpaidBalanceCents: number;
  unpaidInvoiceCount: number;
  customerCount: number;
  activeCustomerCount: number;
  jobsThisWeek: number;
  jobsReadyToInvoice: number;
  topJobTypeThisMonth: { type: string; count: number; revenueCents: number } | null;
}

export async function getDashboardKpis(): Promise<DashboardKpis> {
  const sb = supabase();
  const now = new Date();
  // Anchor all boundaries to Pacific so a California business sees correct
  // "this month / this week / last 12 months" buckets on the UTC runtime.
  const startOfMonthMs = startOfPacificMonth(now).getTime();
  const startOfWeek = startOfPacificWeek(now);
  const twelveMoAgo = pacificMonthsAgo(12, now).toISOString();
  const twelveMoAgoMs = new Date(twelveMoAgo).getTime();
  const twentyFourMoAgoMs = pacificMonthsAgo(24, now).getTime();

  // Every invoice from both sources (paginated past the 1,000-row cap).
  // Revenue is bucketed by when it was paid; open balance is whatever is
  // still unpaid. Aggregates are done in JS.
  const allInv = await loadMoneyRows();

  let lifetimeRevenueCents = 0;
  let revenueThisMonthCents = 0;
  let revenueLast12MoCents = 0;
  let revenuePrev12MoCents = 0;
  let unpaidBalanceCents = 0;
  let unpaidInvoiceCount = 0;
  const jobTypesThisMonth = new Map<string, { count: number; revenueCents: number }>();

  for (const i of allInv) {
    const total = i.revenueCents;
    lifetimeRevenueCents += total;
    if (i.balanceCents > 0) {
      unpaidBalanceCents += i.balanceCents;
      unpaidInvoiceCount += 1;
    }
    if (i.revenueOn && total > 0) {
      const at = moneyDateMs(i.revenueOn);
      if (at >= startOfMonthMs) {
        revenueThisMonthCents += total;
        const cur = jobTypesThisMonth.get(i.jobType) ?? { count: 0, revenueCents: 0 };
        cur.count += 1;
        cur.revenueCents += total;
        jobTypesThisMonth.set(i.jobType, cur);
      }
      if (at >= twelveMoAgoMs) revenueLast12MoCents += total;
      else if (at >= twentyFourMoAgoMs) revenuePrev12MoCents += total;
    }
  }

  const [
    { count: customerCount },
    { count: activeCustomerCount },
    { count: jobsThisWeek },
    { count: jobsReadyToInvoice },
  ] = await Promise.all([
    sb.from("customers").select("id", { count: "exact", head: true }),
    sb
      .from("customers")
      .select("id", { count: "exact", head: true })
      .gte("last_job_completed_at", twelveMoAgo),
    sb
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .gte("scheduled_start", startOfWeek.toISOString()),
    sb.from("jobs").select("id", { count: "exact", head: true }).eq("status", "complete"),
  ]);

  const topJobType =
    [...jobTypesThisMonth.entries()].sort((a, b) => b[1].revenueCents - a[1].revenueCents)[0] ?? null;

  return {
    lifetimeRevenueCents,
    revenueThisMonthCents,
    revenueLast12MoCents,
    revenuePrev12MoCents,
    unpaidBalanceCents,
    unpaidInvoiceCount,
    customerCount: customerCount ?? 0,
    activeCustomerCount: activeCustomerCount ?? 0,
    jobsThisWeek: jobsThisWeek ?? 0,
    jobsReadyToInvoice: jobsReadyToInvoice ?? 0,
    topJobTypeThisMonth: topJobType
      ? { type: topJobType[0], count: topJobType[1].count, revenueCents: topJobType[1].revenueCents }
      : null,
  };
}

// ──────────────────────────────────────────────────────────────────────────
// Speed to lead
// ──────────────────────────────────────────────────────────────────────────

export interface SlaBreachJob {
  id: number;
  customerName: string | null;
  serviceLabel: string | null;
  createdAt: string;
  waitingMinutes: number;
}

export interface ResponseTimeStats {
  /** Median seconds from lead arriving to first contact. Null until there's data. */
  medianSeconds: number | null;
  /** 90th percentile — the tail is what loses jobs, so show it next to the median. */
  p90Seconds: number | null;
  sampleSize: number;
  /**
   * Leads sitting in 'new' that have already blown through the escalation
   * ladder, oldest first. Capped for display; use breachCount for the total.
   */
  breaches: SlaBreachJob[];
  /** Exact number of breached leads, not limited by the display cap. */
  breachCount: number;
}

/**
 * How fast leads actually get worked.
 *
 * Reads jobs.first_response_seconds, stamped by the stamp_job_first_contact
 * trigger (migration 012) the moment a job leaves 'new'. Before that migration
 * there is no history, so early numbers will be based on a small sample —
 * sampleSize is returned so callers can say so rather than implying precision.
 */
export async function getResponseTimeStats(days = 30): Promise<ResponseTimeStats> {
  const sb = supabase();
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const [responded, { data: waiting }, { count: breachCount }] = await Promise.all([
    selectAllPages<{ first_response_seconds: number | null }>("getResponseTimeStats", (from, to) =>
      sb
        .from("jobs")
        .select("first_response_seconds")
        .not("first_response_seconds", "is", null)
        .gte("first_contact_at", cutoff)
        .order("id", { ascending: true })
        .range(from, to)
    ),
    sb
      .from("jobs")
      .select("id, created_at, service_label, service_type, customers(name)")
      .eq("status", "new")
      .is("first_contact_at", null)
      .gte("sla_alert_level", 3)
      .order("created_at", { ascending: true })
      .limit(20),
    sb
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("status", "new")
      .is("first_contact_at", null)
      .gte("sla_alert_level", 3),
  ]);

  const samples = responded
    .map((r) => r.first_response_seconds as number)
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);

  const now = Date.now();
  const breaches: SlaBreachJob[] = (waiting ?? []).map((j) => {
    const customer = Array.isArray(j.customers) ? j.customers[0] : j.customers;
    return {
      id: j.id as number,
      customerName: customer?.name ?? null,
      serviceLabel: (j.service_label ?? j.service_type) as string | null,
      createdAt: j.created_at as string,
      waitingMinutes: Math.floor(
        (now - new Date(j.created_at as string).getTime()) / 60000
      ),
    };
  });

  return {
    medianSeconds: percentile(samples, 0.5),
    p90Seconds: percentile(samples, 0.9),
    sampleSize: samples.length,
    breaches,
    breachCount: breachCount ?? breaches.length,
  };
}

/** Nearest-rank percentile over a pre-sorted ascending array. */
function percentile(sorted: number[], p: number): number | null {
  if (sorted.length === 0) return null;
  const rank = Math.ceil(p * sorted.length);
  return sorted[Math.min(Math.max(rank, 1), sorted.length) - 1];
}

/** "4m 12s" / "48s" / "2h 5m". For response times, which span three orders of magnitude. */
export function formatDuration(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) return "—";
  if (seconds < 60) return `${Math.round(seconds)}s`;

  const mins = Math.floor(seconds / 60);
  if (mins < 60) {
    const rem = Math.round(seconds % 60);
    return rem ? `${mins}m ${rem}s` : `${mins}m`;
  }

  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return remMins ? `${hours}h ${remMins}m` : `${hours}h`;
}

// ──────────────────────────────────────────────────────────────────────────
// Analytics queries
// ──────────────────────────────────────────────────────────────────────────

export interface AnalyticsData {
  monthlyRevenue: Array<{ month: string; revenueCents: number; invoiceCount: number }>;
  topCustomers: Array<{
    id: number;
    name: string;
    city: string | null;
    revenueCents: number;
    jobCount: number;
    lastCompletedOn: string | null;
  }>;
  jobTypeBreakdown: Array<{
    type: string;
    count: number;
    revenueCents: number;
    avgTicketCents: number;
  }>;
  revenueByCity: Array<{ city: string; revenueCents: number; jobCount: number; customerCount: number }>;
  dormantCustomers: Array<{
    id: number;
    name: string;
    city: string | null;
    phone_e164: string | null;
    lastCompletedOn: string | null;
    revenueCents: number;
  }>;
  newCustomersByMonth: Array<{ month: string; count: number }>;
  totals: {
    invoiceCount: number;
    customerCount: number;
    customersWithJobs: number;
    repeatCustomerRate: number;
  };
}

export async function getAnalytics(): Promise<AnalyticsData> {
  const sb = supabase();

  // Revenue only: paid OS invoices (dated by paid_at) plus any legacy imports.
  // Unpaid invoices are open balance, not revenue, so they're left out here.
  const [moneyRows, allCust] = await Promise.all([
    loadMoneyRows(),
    selectAllPages<{
      id: number;
      name: string;
      city: string | null;
      phone_e164: string | null;
      created_at: string;
      last_job_completed_at: string | null;
    }>("getAnalytics customers", (from, to) =>
      sb
        .from("customers")
        .select("id, name, city, phone_e164, created_at, last_job_completed_at")
        .order("id", { ascending: true })
        .range(from, to)
    ),
  ]);
  const allInv = moneyRows.filter((i) => i.revenueCents > 0);

  const custById = new Map(allCust.map((c) => [c.id, c]));

  // ── Monthly revenue rollup (last 24 months, Pacific calendar months) ──
  const monthlyMap = new Map<string, { revenueCents: number; invoiceCount: number }>();
  for (const i of allInv) {
    if (!i.revenueOn) continue;
    const month = moneyMonthKey(i.revenueOn); // YYYY-MM
    const cur = monthlyMap.get(month) ?? { revenueCents: 0, invoiceCount: 0 };
    cur.revenueCents += i.revenueCents;
    cur.invoiceCount += 1;
    monthlyMap.set(month, cur);
  }
  const monthlyRevenue = [...monthlyMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-24)
    .map(([month, v]) => ({ month, ...v }));

  // ── Per-customer rollup ──
  const perCustomer = new Map<
    number,
    { revenueCents: number; jobCount: number; lastCompletedOn: string | null }
  >();
  const jobTypeMap = new Map<string, { count: number; revenueCents: number }>();
  for (const i of allInv) {
    if (i.customerId != null) {
      const cur = perCustomer.get(i.customerId) ?? {
        revenueCents: 0,
        jobCount: 0,
        lastCompletedOn: null,
      };
      cur.revenueCents += i.revenueCents;
      cur.jobCount += 1;
      if (
        i.revenueOn &&
        (!cur.lastCompletedOn || moneyDateMs(i.revenueOn) > moneyDateMs(cur.lastCompletedOn))
      ) {
        cur.lastCompletedOn = i.revenueOn;
      }
      perCustomer.set(i.customerId, cur);
    }

    const jtCur = jobTypeMap.get(i.jobType) ?? { count: 0, revenueCents: 0 };
    jtCur.count += 1;
    jtCur.revenueCents += i.revenueCents;
    jobTypeMap.set(i.jobType, jtCur);
  }

  // ── Top 20 customers ──
  const topCustomers = [...perCustomer.entries()]
    .sort((a, b) => b[1].revenueCents - a[1].revenueCents)
    .slice(0, 20)
    .map(([cid, v]) => {
      const c = custById.get(cid);
      return {
        id: cid,
        name: c?.name ?? "Unknown",
        city: c?.city ?? null,
        ...v,
      };
    });

  // ── Job type breakdown ──
  const jobTypeBreakdown = [...jobTypeMap.entries()]
    .sort((a, b) => b[1].revenueCents - a[1].revenueCents)
    .map(([type, v]) => ({
      type,
      ...v,
      avgTicketCents: v.count > 0 ? Math.round(v.revenueCents / v.count) : 0,
    }));

  // ── Revenue by city ──
  const cityMap = new Map<
    string,
    { revenueCents: number; jobCount: number; customerIds: Set<number> }
  >();
  for (const [cid, v] of perCustomer.entries()) {
    const c = custById.get(cid);
    const city = c?.city ?? "Unknown";
    const cur = cityMap.get(city) ?? {
      revenueCents: 0,
      jobCount: 0,
      customerIds: new Set<number>(),
    };
    cur.revenueCents += v.revenueCents;
    cur.jobCount += v.jobCount;
    cur.customerIds.add(cid);
    cityMap.set(city, cur);
  }
  const revenueByCity = [...cityMap.entries()]
    .map(([city, v]) => ({
      city,
      revenueCents: v.revenueCents,
      jobCount: v.jobCount,
      customerCount: v.customerIds.size,
    }))
    .sort((a, b) => b.revenueCents - a.revenueCents)
    .slice(0, 12);

  // ── Dormant customers (last job > 12 mo ago) ──
  // Reads from customers.last_job_completed_at directly, which is preserved
  // from the legacy import even after invoice_history is cleaned. This keeps
  // re-engagement outreach working without depending on the muddy financial
  // data we archived in migration 007.
  const twelveMoAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
  const dormantCustomers = allCust
    .filter((c) => c.last_job_completed_at && c.last_job_completed_at < twelveMoAgo)
    .sort((a, b) =>
      (b.last_job_completed_at ?? "").localeCompare(a.last_job_completed_at ?? "")
    )
    .slice(0, 25)
    .map((c) => ({
      id: c.id,
      name: c.name,
      city: c.city,
      phone_e164: c.phone_e164,
      lastCompletedOn: c.last_job_completed_at,
      revenueCents: perCustomer.get(c.id)?.revenueCents ?? 0,
    }));

  // ── New customers per month (last 24) ──
  const newCustMap = new Map<string, number>();
  for (const c of allCust) {
    if (!c.created_at) continue;
    const month = c.created_at.slice(0, 7);
    newCustMap.set(month, (newCustMap.get(month) ?? 0) + 1);
  }
  const newCustomersByMonth = [...newCustMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-24)
    .map(([month, count]) => ({ month, count }));

  // ── Totals ──
  const customersWithJobs = perCustomer.size;
  const repeatCustomers = [...perCustomer.values()].filter((v) => v.jobCount > 1).length;
  const repeatCustomerRate =
    customersWithJobs > 0 ? repeatCustomers / customersWithJobs : 0;

  return {
    monthlyRevenue,
    topCustomers,
    jobTypeBreakdown,
    revenueByCity,
    dormantCustomers,
    newCustomersByMonth,
    totals: {
      invoiceCount: allInv.length,
      customerCount: allCust.length,
      customersWithJobs,
      repeatCustomerRate,
    },
  };
}

export function formatMoneyShort(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 10_000) return `$${(dollars / 1000).toFixed(0)}K`;
  if (dollars >= 1000) return `$${(dollars / 1000).toFixed(1)}K`;
  return `$${dollars.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

// ──────────────────────────────────────────────────────────────────────────
// Jobs
// ──────────────────────────────────────────────────────────────────────────

export interface JobListOpts {
  status?: JobStatus | "open" | "all";
  /** Match any of these statuses. Takes precedence over `status`. */
  statuses?: JobStatus[];
  assignedTo?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export const OPEN_STATUSES: JobStatus[] = ["new", "scheduled", "en_route", "on_site", "paused"];

export async function listJobs(opts: JobListOpts = {}): Promise<{
  rows: JobWithRelations[];
  count: number;
}> {
  const sb = supabase();
  const limit = opts.limit ?? 100;
  const offset = opts.offset ?? 0;

  let q = sb
    .from("jobs")
    .select(
      "*, customer:customers(id, name, phone_e164, street_address, city, zip), assignee:crew!jobs_assigned_to_fkey(id, name, role)",
      { count: "exact" }
    )
    .order("scheduled_start", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (opts.statuses && opts.statuses.length > 0) {
    q = q.in("status", opts.statuses);
  } else if (opts.status === "open") {
    q = q.in("status", OPEN_STATUSES);
  } else if (opts.status && opts.status !== "all") {
    q = q.eq("status", opts.status);
  }
  if (opts.assignedTo) q = q.eq("assigned_to", opts.assignedTo);
  const safe = opts.search ? orSafe(opts.search) : "";
  if (safe) {
    const s = `%${safe}%`;
    const clauses = [`service_label.ilike.${s}`, `service_type.ilike.${s}`, `job_address.ilike.${s}`];
    // Most searches are a customer's name, which lives on the customers table.
    // Resolve matching customers first and pull their jobs in by id.
    const { data: matches } = await sb
      .from("customers")
      .select("id")
      .ilike("name", s)
      .limit(200);
    const ids = (matches ?? []).map((c) => Number(c.id)).filter(Number.isFinite);
    if (ids.length > 0) clauses.push(`customer_id.in.(${ids.join(",")})`);
    q = q.or(clauses.join(","));
  }

  const { data, error, count } = await q;
  if (error) throw new Error(`listJobs: ${error.message}`);
  return { rows: (data ?? []) as JobWithRelations[], count: count ?? 0 };
}

export async function listNewLeadNotifications(limit = 5): Promise<{
  rows: NewLeadNotification[];
  count: number;
}> {
  const sb = supabase();
  const { data, error, count } = await sb
    .from("jobs")
    .select(
      "id, service_type, service_label, job_city, job_zip, created_at, customer:customers(id, name, phone_e164, email)",
      { count: "exact" }
    )
    .eq("status", "new")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`listNewLeadNotifications: ${error.message}`);
  const rows = (data ?? []).map((row) => {
    const customer = Array.isArray(row.customer) ? row.customer[0] : row.customer;
    return {
      ...row,
      customer: customer ?? null,
    };
  }) as NewLeadNotification[];

  return { rows, count: count ?? 0 };
}

export async function getJob(id: number): Promise<JobWithRelations | null> {
  const sb = supabase();
  const { data, error } = await sb
    .from("jobs")
    .select(
      "*, customer:customers(*), assignee:crew!jobs_assigned_to_fkey(id, name, role, phone_e164)"
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getJob: ${error.message}`);
  return data as JobWithRelations | null;
}

export async function getJobsForDay(day: Date): Promise<JobWithRelations[]> {
  const sb = supabase();
  // Bucket by the Pacific calendar day, not the UTC day.
  const start = startOfPacificDay(day);
  const end = endOfPacificDay(day);

  const { data, error } = await sb
    .from("jobs")
    .select(
      "*, customer:customers(id, name, phone_e164, street_address, city), assignee:crew!jobs_assigned_to_fkey(id, name, role)"
    )
    .gte("scheduled_start", start.toISOString())
    .lte("scheduled_start", end.toISOString())
    .order("scheduled_start", { ascending: true });

  if (error) throw new Error(`getJobsForDay: ${error.message}`);
  return (data ?? []) as JobWithRelations[];
}

// ──────────────────────────────────────────────────────────────────────────
// Status / pricing helpers
// ──────────────────────────────────────────────────────────────────────────

export const STATUS_LABEL: Record<JobStatus, string> = {
  new: "New",
  scheduled: "Scheduled",
  en_route: "En Route",
  on_site: "On Site",
  paused: "Paused",
  complete: "Complete",
  invoiced: "Invoiced",
  paid: "Paid",
  cancelled: "Cancelled",
};

export const STATUS_COLOR: Record<JobStatus, string> = {
  new: "bg-line text-ink",
  scheduled: "bg-blue-100 text-blue-700",
  en_route: "bg-amber-100 text-amber-700",
  on_site: "bg-[#F96302]/15 text-[#B24400]",
  paused: "bg-amber-100 text-amber-800",
  complete: "bg-emerald-100 text-emerald-700",
  invoiced: "bg-purple-100 text-purple-700",
  paid: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-700",
};

/**
 * Manual status moves (the job page's "Move to" buttons and the field app).
 * Invoiced and paid are deliberately absent: they are reached only by
 * creating an invoice and recording its payment, which is where the money
 * side effects (final amount, customer lifetime totals, receipt) happen.
 */
export const STATUS_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  new: ["scheduled", "cancelled"],
  scheduled: ["en_route", "on_site", "cancelled", "paused"],
  en_route: ["on_site", "paused", "cancelled"],
  on_site: ["complete", "paused"],
  paused: ["en_route", "on_site", "scheduled", "cancelled"],
  complete: [],
  invoiced: [],
  paid: [],
  cancelled: [],
};

export function formatMoney(cents: number | null): string {
  if (cents == null) return "·";
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return "·";
  return new Date(iso).toLocaleString("en-US", {
    timeZone: PACIFIC_TZ,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDate(iso: string | null): string {
  if (!iso) return "·";
  // A bare YYYY-MM-DD (a `date` column) has no time zone. new Date() would read
  // it as UTC midnight, the evening before in Pacific, so format it on the UTC
  // calendar to keep the day it names.
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(iso);
  return new Date(dateOnly ? `${iso}T00:00:00Z` : iso).toLocaleDateString("en-US", {
    timeZone: dateOnly ? "UTC" : PACIFIC_TZ,
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ──────────────────────────────────────────────────────────────────────────
// Learning resources (videos + images shown on /videos/)
// ──────────────────────────────────────────────────────────────────────────

export type LearningMediaType = "video" | "image";

export interface LearningResource {
  id: number;
  media_type: LearningMediaType;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  url: string;
  thumbnail_url: string | null;
  duration_sec: number | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export const LEARNING_CATEGORIES: { value: string; label: string }[] = [
  { value: "sewer-and-drain", label: "Sewer & Drain" },
  { value: "water-heater", label: "Water Heater" },
  { value: "emergency", label: "Emergency" },
  { value: "maintenance", label: "Maintenance" },
  { value: "diy", label: "DIY Fixes" },
  { value: "behind-the-scenes", label: "Behind the Scenes" },
  { value: "general", label: "General" },
];

export async function listLearningResources(opts: {
  publishedOnly?: boolean;
  category?: string;
} = {}): Promise<LearningResource[]> {
  const sb = supabase();
  let q = sb
    .from("learning_resources")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (opts.publishedOnly) q = q.eq("published", true);
  if (opts.category) q = q.eq("category", opts.category);
  const { data, error } = await q;
  if (error) throw new Error(`listLearningResources: ${error.message}`);
  return (data ?? []) as LearningResource[];
}

export async function getLearningResource(id: number): Promise<LearningResource | null> {
  const sb = supabase();
  const { data, error } = await sb
    .from("learning_resources")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getLearningResource: ${error.message}`);
  return data as LearningResource | null;
}

/**
 * Best-effort extraction of the YouTube video ID from a URL the user pasted.
 * Accepts watch?v=, youtu.be/, /embed/, /shorts/. Returns null for non-YT.
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1).split("/")[0] || null;
    }
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      const m = u.pathname.match(/\/(embed|shorts|v)\/([^/?#]+)/);
      if (m) return m[2];
    }
    return null;
  } catch {
    return null;
  }
}

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
}

export function youtubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

// ──────────────────────────────────────────────────────────────────────────
// Coupons (max 3 published)
// ──────────────────────────────────────────────────────────────────────────

export interface Coupon {
  id: number;
  headline: string;
  subheadline: string | null;
  terms: string | null;
  code: string | null;
  image_url: string | null;
  valid_from: string | null;
  valid_until: string | null;
  display_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export const MAX_PUBLISHED_COUPONS = 3;

/**
 * Coupons for the admin (everything) or the public site.
 *
 * `liveOnly` is what public callers want: published AND inside the coupon's
 * valid-from / valid-until window by today's Pacific date. The window check
 * runs in JS (the table holds a handful of rows) so it can read both the
 * current and the older way dates were stored; see couponDay.
 */
export async function listCoupons(
  opts: { publishedOnly?: boolean; liveOnly?: boolean } = {}
): Promise<Coupon[]> {
  const sb = supabase();
  let q = sb
    .from("coupons")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (opts.publishedOnly || opts.liveOnly) q = q.eq("published", true);
  const { data, error } = await q;
  if (error) throw new Error(`listCoupons: ${error.message}`);
  const rows = (data ?? []) as Coupon[];
  return opts.liveOnly ? rows.filter((c) => isCouponLive(c)) : rows;
}

function isoDay(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * The calendar day (YYYY-MM-DD) a coupon date was set to in the admin form.
 *
 * Saves now store valid_from as the start and valid_until as the end of the
 * picked day in Pacific. Older saves stored the picked date as UTC midnight,
 * which reads as the evening before in Pacific, so an exact UTC midnight is
 * taken as that UTC date instead.
 */
export function couponDay(value: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const utcMidnight =
    d.getUTCHours() === 0 &&
    d.getUTCMinutes() === 0 &&
    d.getUTCSeconds() === 0 &&
    d.getUTCMilliseconds() === 0;
  if (utcMidnight) return d.toISOString().slice(0, 10);
  const { year, month, day } = pacificYmd(d);
  return isoDay(year, month, day);
}

/** Where a coupon stands against today's Pacific date. */
export function couponState(
  c: Pick<Coupon, "published" | "valid_from" | "valid_until">,
  now: Date = new Date()
): "draft" | "upcoming" | "live" | "expired" {
  if (!c.published) return "draft";
  const { year, month, day } = pacificYmd(now);
  const today = isoDay(year, month, day);
  const from = couponDay(c.valid_from);
  const until = couponDay(c.valid_until);
  if (until && until < today) return "expired";
  if (from && from > today) return "upcoming";
  return "live";
}

/** Published and inside its date window, judged by today's Pacific date. */
export function isCouponLive(
  c: Pick<Coupon, "published" | "valid_from" | "valid_until">,
  now: Date = new Date()
): boolean {
  return couponState(c, now) === "live";
}

/** "Oct 31, 2026" for a coupon date, on the day the operator picked. */
export function formatCouponDate(value: string | null): string {
  return formatDate(couponDay(value));
}

/**
 * Turn the admin form's date-only input into the stored timestamp: the start
 * of that day in Pacific for valid_from, the last millisecond of it for
 * valid_until. Storing UTC midnight instead ended a coupon at 5pm the day
 * before its "valid until" date.
 */
export function couponBoundaryIso(input: string | null, edge: "start" | "end"): string | null {
  if (!input) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  if (m) {
    const start = pacificMidnight(Number(m[1]), Number(m[2]), Number(m[3]));
    return (edge === "start" ? start : endOfPacificDay(start)).toISOString();
  }
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export async function getCoupon(id: number): Promise<Coupon | null> {
  const sb = supabase();
  const { data, error } = await sb.from("coupons").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`getCoupon: ${error.message}`);
  return data as Coupon | null;
}

export async function countPublishedCoupons(): Promise<number> {
  const sb = supabase();
  const { count, error } = await sb
    .from("coupons")
    .select("id", { count: "exact", head: true })
    .eq("published", true);
  if (error) throw new Error(`countPublishedCoupons: ${error.message}`);
  return count ?? 0;
}
