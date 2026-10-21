import { supabase } from "@/lib/supabase";

/**
 * Past work from the ServiceTitan years (2021 to 2023).
 *
 * Migration 007 moved every imported ServiceTitan invoice into
 * invoice_history_archive so OS revenue would start clean. That kept the
 * dashboard honest but hid each customer's history from the screens Jay uses
 * on a call: "we cleared your main line in 2023" was invisible. This reads the
 * archive for one customer, read-only, so it can be shown alongside OS work
 * without ever counting toward OS revenue.
 */

export interface ArchivedWorkRow {
  id: number;
  invoicedOn: string | null;
  completedOn: string | null;
  jobType: string | null;
  technician: string | null;
  jobNumber: string | null;
  totalCents: number;
}

export interface ArchivedWork {
  rows: ArchivedWorkRow[];
  /** Every archived invoice for the customer, not just the rows shown. */
  totalCents: number;
  totalCount: number;
  /** True when `rows` stops short of `totalCount`. */
  truncated: boolean;
}

const ROW_LIMIT = 200;
const PAGE = 1000;

export async function getArchivedCustomerWork(customerId: number): Promise<ArchivedWork> {
  const empty: ArchivedWork = { rows: [], totalCents: 0, totalCount: 0, truncated: false };
  const sb = supabase();

  const { data, error } = await sb
    .from("invoice_history_archive")
    .select("id, invoiced_on, completed_on, job_type, technician, job_number, total_cents")
    .eq("customer_id", customerId)
    .order("invoiced_on", { ascending: false, nullsFirst: false })
    .limit(ROW_LIMIT);

  if (error) console.error("[customer-history.archive]", customerId, error);
  if (error || !data) return empty;

  const rows = data.map((r) => ({
    id: Number(r.id),
    invoicedOn: (r.invoiced_on as string | null) ?? null,
    completedOn: (r.completed_on as string | null) ?? null,
    jobType: (r.job_type as string | null) ?? null,
    technician: (r.technician as string | null) ?? null,
    jobNumber: r.job_number == null ? null : String(r.job_number),
    totalCents: Number(r.total_cents ?? 0),
  }));

  // Short history (the usual case): the rows already hold everything.
  if (rows.length < ROW_LIMIT) {
    return {
      rows,
      totalCents: rows.reduce((sum, r) => sum + r.totalCents, 0),
      totalCount: rows.length,
      truncated: false,
    };
  }

  // Long history (a landlord or property manager): total every archived
  // invoice in pages, so the billed figure isn't capped at the rows shown.
  let totalCents = 0;
  let totalCount = 0;
  for (let from = 0; ; from += PAGE) {
    const { data: page, error: pageError } = await sb
      .from("invoice_history_archive")
      .select("id, total_cents")
      .eq("customer_id", customerId)
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (pageError) {
      console.error("[customer-history.archive-total]", customerId, pageError);
      break;
    }
    for (const r of page ?? []) totalCents += Number(r.total_cents ?? 0);
    totalCount += page?.length ?? 0;
    if (!page || page.length < PAGE) break;
  }

  return { rows, totalCents, totalCount, truncated: totalCount > rows.length };
}
