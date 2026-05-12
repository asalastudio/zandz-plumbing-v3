import { supabase } from "@/lib/supabase";

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
  name: string;
  phone_e164: string | null;
  email: string | null;
  street_address: string | null;
  city: string | null;
  state: string;
  zip: string | null;
  neighborhood: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
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

export interface CustomerListOpts {
  search?: string;
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

  let q = sb
    .from("customers")
    .select("*", { count: "exact" })
    .order("name", { ascending: true })
    .range(offset, offset + limit - 1);

  if (opts.search) {
    const s = `%${opts.search}%`;
    q = q.or(`name.ilike.${s},phone_e164.ilike.${s},email.ilike.${s},street_address.ilike.${s}`);
  }

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
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(day);
  end.setHours(23, 59, 59, 999);

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
  new: "bg-white/10 text-white",
  scheduled: "bg-blue-500/20 text-blue-300",
  en_route: "bg-yellow-500/20 text-yellow-300",
  on_site: "bg-[#F96302]/20 text-[#F96302]",
  paused: "bg-amber-700/30 text-amber-300",
  complete: "bg-emerald-500/20 text-emerald-300",
  invoiced: "bg-purple-500/20 text-purple-300",
  paid: "bg-emerald-600/30 text-emerald-200",
  cancelled: "bg-red-500/20 text-red-300",
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
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDate(iso: string | null): string {
  if (!iso) return "·";
  return new Date(iso).toLocaleDateString("en-US", {
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
