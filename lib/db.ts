import { supabase } from "@/lib/supabase";
import {
  PACIFIC_TZ,
  startOfPacificDay,
  endOfPacificDay,
  startOfPacificWeek,
  startOfPacificMonth,
  pacificMonthsAgo,
} from "@/lib/time";

/**
 * Typed query helpers for Z and Z OS.
 *
 * All queries run server-side with the service-role key (bypasses RLS).
 * Callers are server components / API routes inside the auth-gated admin.
 */

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

  if (opts.search) {
    const s = `%${opts.search}%`;
    q = q.or(`name.ilike.${s},phone_e164.ilike.${s},email.ilike.${s},street_address.ilike.${s},city.ilike.${s}`);
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
  const safe = term.replace(/[,()*:%\\]/g, " ").trim();
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

export async function getCustomerInvoiceHistory(
  customerId: number,
  limit = 100
): Promise<InvoiceHistory[]> {
  const sb = supabase();
  const { data, error } = await sb
    .from("invoice_history")
    .select("*")
    .eq("customer_id", customerId)
    .order("completed_on", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw new Error(`getCustomerInvoiceHistory: ${error.message}`);
  return (data ?? []) as InvoiceHistory[];
}

export async function getCustomerLifetimeStats(customerId: number): Promise<{
  totalRevenueCents: number;
  totalBalanceCents: number;
  invoiceCount: number;
  firstCompletedOn: string | null;
  lastCompletedOn: string | null;
}> {
  const sb = supabase();
  const { data, error } = await sb
    .from("invoice_history")
    .select("total_cents, balance_cents, completed_on")
    .eq("customer_id", customerId);
  if (error) throw new Error(`getCustomerLifetimeStats: ${error.message}`);

  const rows = (data ?? []) as Pick<InvoiceHistory, "total_cents" | "balance_cents" | "completed_on">[];
  let totalRevenueCents = 0;
  let totalBalanceCents = 0;
  let firstCompletedOn: string | null = null;
  let lastCompletedOn: string | null = null;
  for (const r of rows) {
    totalRevenueCents += r.total_cents ?? 0;
    totalBalanceCents += r.balance_cents ?? 0;
    if (r.completed_on) {
      if (!firstCompletedOn || r.completed_on < firstCompletedOn) firstCompletedOn = r.completed_on;
      if (!lastCompletedOn || r.completed_on > lastCompletedOn) lastCompletedOn = r.completed_on;
    }
  }
  return {
    totalRevenueCents,
    totalBalanceCents,
    invoiceCount: rows.length,
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
  const startOfMonth = startOfPacificMonth(now).toISOString();
  const startOfWeek = startOfPacificWeek(now);
  const twelveMoAgo = pacificMonthsAgo(12, now).toISOString();
  const twentyFourMoAgo = pacificMonthsAgo(24, now).toISOString();

  // Pull every invoice in one shot, paginating since Supabase caps each
  // request at 1000 rows. Aggregates are done in JS.
  const allInv: Array<{
    total_cents: number | null;
    balance_cents: number | null;
    completed_on: string | null;
    job_type: string | null;
  }> = [];
  {
    const PAGE = 1000;
    let from = 0;
    while (true) {
      const { data, error } = await sb
        .from("invoice_history")
        .select("total_cents, balance_cents, completed_on, job_type")
        .range(from, from + PAGE - 1);
      if (error) throw new Error(`getDashboardKpis invoices: ${error.message}`);
      allInv.push(...(data ?? []));
      if (!data || data.length < PAGE) break;
      from += PAGE;
    }
  }

  let lifetimeRevenueCents = 0;
  let revenueThisMonthCents = 0;
  let revenueLast12MoCents = 0;
  let revenuePrev12MoCents = 0;
  let unpaidBalanceCents = 0;
  let unpaidInvoiceCount = 0;
  const jobTypesThisMonth = new Map<string, { count: number; revenueCents: number }>();

  for (const i of allInv) {
    const total = i.total_cents ?? 0;
    lifetimeRevenueCents += total;
    const balance = i.balance_cents ?? 0;
    if (balance > 0) {
      unpaidBalanceCents += balance;
      unpaidInvoiceCount += 1;
    }
    if (i.completed_on) {
      if (i.completed_on >= startOfMonth) {
        revenueThisMonthCents += total;
        const t = i.job_type ?? "Unknown";
        const cur = jobTypesThisMonth.get(t) ?? { count: 0, revenueCents: 0 };
        cur.count += 1;
        cur.revenueCents += total;
        jobTypesThisMonth.set(t, cur);
      }
      if (i.completed_on >= twelveMoAgo) revenueLast12MoCents += total;
      else if (i.completed_on >= twentyFourMoAgo) revenuePrev12MoCents += total;
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

  // Pull all invoices (paginated)
  const allInv: Array<{
    customer_id: number | null;
    total_cents: number | null;
    completed_on: string | null;
    job_type: string | null;
  }> = [];
  {
    const PAGE = 1000;
    let from = 0;
    while (true) {
      const { data, error } = await sb
        .from("invoice_history")
        .select("customer_id, total_cents, completed_on, job_type")
        .range(from, from + PAGE - 1);
      if (error) throw new Error(`getAnalytics invoices: ${error.message}`);
      allInv.push(...(data ?? []));
      if (!data || data.length < PAGE) break;
      from += PAGE;
    }
  }

  // Pull all customers (paginated)
  const allCust: Array<{
    id: number;
    name: string;
    city: string | null;
    phone_e164: string | null;
    created_at: string;
    last_job_completed_at: string | null;
  }> = [];
  {
    const PAGE = 1000;
    let from = 0;
    while (true) {
      const { data, error } = await sb
        .from("customers")
        .select("id, name, city, phone_e164, created_at, last_job_completed_at")
        .range(from, from + PAGE - 1);
      if (error) throw new Error(`getAnalytics customers: ${error.message}`);
      allCust.push(...(data ?? []));
      if (!data || data.length < PAGE) break;
      from += PAGE;
    }
  }

  const custById = new Map(allCust.map((c) => [c.id, c]));

  // ── Monthly revenue rollup (last 24 months) ──
  const monthlyMap = new Map<string, { revenueCents: number; invoiceCount: number }>();
  for (const i of allInv) {
    if (!i.completed_on) continue;
    const month = i.completed_on.slice(0, 7); // YYYY-MM
    const cur = monthlyMap.get(month) ?? { revenueCents: 0, invoiceCount: 0 };
    cur.revenueCents += i.total_cents ?? 0;
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
    if (i.customer_id != null) {
      const cur = perCustomer.get(i.customer_id) ?? {
        revenueCents: 0,
        jobCount: 0,
        lastCompletedOn: null,
      };
      cur.revenueCents += i.total_cents ?? 0;
      cur.jobCount += 1;
      if (i.completed_on && (!cur.lastCompletedOn || i.completed_on > cur.lastCompletedOn)) {
        cur.lastCompletedOn = i.completed_on;
      }
      perCustomer.set(i.customer_id, cur);
    }

    const jt = i.job_type ?? "Unknown";
    const jtCur = jobTypeMap.get(jt) ?? { count: 0, revenueCents: 0 };
    jtCur.count += 1;
    jtCur.revenueCents += i.total_cents ?? 0;
    jobTypeMap.set(jt, jtCur);
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

  if (opts.status === "open") {
    q = q.in("status", OPEN_STATUSES);
  } else if (opts.status && opts.status !== "all") {
    q = q.eq("status", opts.status);
  }
  if (opts.assignedTo) q = q.eq("assigned_to", opts.assignedTo);
  if (opts.search) {
    const s = `%${opts.search}%`;
    q = q.or(`service_label.ilike.${s},service_type.ilike.${s},job_address.ilike.${s}`);
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

export const STATUS_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  new: ["scheduled", "cancelled"],
  scheduled: ["en_route", "on_site", "cancelled", "paused"],
  en_route: ["on_site", "paused", "cancelled"],
  on_site: ["complete", "paused"],
  paused: ["en_route", "on_site", "scheduled", "cancelled"],
  complete: ["invoiced"],
  invoiced: ["paid"],
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
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: PACIFIC_TZ,
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

export async function listCoupons(opts: { publishedOnly?: boolean } = {}): Promise<Coupon[]> {
  const sb = supabase();
  let q = sb
    .from("coupons")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (opts.publishedOnly) q = q.eq("published", true);
  const { data, error } = await q;
  if (error) throw new Error(`listCoupons: ${error.message}`);
  return (data ?? []) as Coupon[];
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
