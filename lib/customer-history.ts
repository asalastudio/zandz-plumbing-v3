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
  totalCents: number;
}

export async function getArchivedCustomerWork(customerId: number): Promise<ArchivedWork> {
  const { data, error } = await supabase()
    .from("invoice_history_archive")
    .select("id, invoiced_on, completed_on, job_type, technician, job_number, total_cents")
    .eq("customer_id", customerId)
    .order("invoiced_on", { ascending: false })
    .limit(200);

  if (error || !data) return { rows: [], totalCents: 0 };

  const rows = data.map((r) => ({
    id: Number(r.id),
    invoicedOn: (r.invoiced_on as string | null) ?? null,
    completedOn: (r.completed_on as string | null) ?? null,
    jobType: (r.job_type as string | null) ?? null,
    technician: (r.technician as string | null) ?? null,
    jobNumber: r.job_number == null ? null : String(r.job_number),
    totalCents: Number(r.total_cents ?? 0),
  }));

  return { rows, totalCents: rows.reduce((sum, r) => sum + r.totalCents, 0) };
}
