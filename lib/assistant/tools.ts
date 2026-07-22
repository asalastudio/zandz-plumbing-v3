import { tool } from "ai";
import { z } from "zod";
import {
  searchServiceCatalog,
  getServiceMaterials,
  listCustomers,
  getCustomer,
  getCustomerJobs,
  getCustomerInvoiceHistory,
  getCustomerLifetimeStats,
  getJob,
  getDashboardKpis,
  formatMoney,
  STATUS_LABEL,
  type JobStatus,
} from "@/lib/db";

/** Wrap a tool body so a failed lookup returns an error object instead of
 *  throwing and killing the whole stream. */
function safe<T>(fn: () => Promise<T>): Promise<T | { error: string }> {
  return fn().catch((e: unknown) => ({ error: (e as Error)?.message ?? "lookup failed" }));
}

/**
 * Argument schemas, exported separately so the voice bridge can validate what
 * the speech model transcribed before it reaches a tool. Defined once here and
 * referenced by the tool definitions below so the two cannot diverge.
 */
export const assistantToolSchemas = {
  searchPricebook: z.object({
    query: z
      .string()
      .describe("Service to search, e.g. 'water heater', 'main line stoppage', or a code like 'H6110'"),
  }),
  findCustomer: z.object({ query: z.string() }),
  // Coerce the numeric ids: the voice path can transcribe a job number as the
  // string "42", and a strict z.number() would reject it. Coercion accepts both
  // a real number (the text assistant) and a numeric string (Lisa).
  getCustomerContext: z.object({ customerId: z.coerce.number() }),
  getJobContext: z.object({ jobId: z.coerce.number() }),
  getJobMaterials: z.object({ serviceCode: z.string() }),
  businessKpis: z.object({}),
} as const;

/**
 * Read-only tools the assistant uses to ground every answer in Z and Z's live
 * data. All run server-side under the service-role client. None can write.
 */
export const assistantTools = {
  searchPricebook: tool({
    description:
      "Search the company pricebook for a plumbing service to get its price, estimated labor hours, and scope of work. Use for ANY pricing, duration, or 'what's involved' question.",
    inputSchema: assistantToolSchemas.searchPricebook,
    execute: ({ query }) =>
      safe(async () => {
        const rows = await searchServiceCatalog(query, 8);
        if (rows.length === 0) return { results: [], note: "No matching pricebook service." };
        return {
          results: rows.map((r) => ({
            code: r.code,
            name: r.name,
            category: r.category,
            // A missing price must never render as "$0.00". Roughly a third of
            // the imported catalog has no price loaded, and formatMoney(0) reads
            // as "this job is free" to both the model and the operator.
            ...(r.price_cents
              ? { price: formatMoney(r.price_cents), price_status: "loaded" }
              : {
                  price: null,
                  price_status: "not_loaded",
                  price_note:
                    "No price in the pricebook for this code. Do not quote a number. Tell the operator to check with Jay.",
                }),
            estimated_hours: r.hours || null,
            scope_of_work: r.description,
          })),
        };
      }),
  }),

  findCustomer: tool({
    description:
      "Find a customer by name, phone, email, or address. Returns matches so you can confirm which one before pulling full context.",
    inputSchema: assistantToolSchemas.findCustomer,
    execute: ({ query }) =>
      safe(async () => {
        const { rows } = await listCustomers({ search: query, limit: 8, sort: "name" });
        return {
          matches: rows.map((c) => ({
            id: c.id,
            name: c.name,
            phone: c.phone_e164,
            email: c.email,
            city: c.city,
            lifetime_value: formatMoney(c.lifetime_revenue_cents ?? 0),
          })),
        };
      }),
  }),

  getCustomerContext: tool({
    description:
      "Get full context on one customer by id: profile, recent jobs, invoice history, and lifetime stats. Call findCustomer first to get the id.",
    inputSchema: assistantToolSchemas.getCustomerContext,
    execute: ({ customerId }) =>
      safe(async () => {
        const [customer, jobs, history, stats] = await Promise.all([
          getCustomer(customerId),
          getCustomerJobs(customerId, 15),
          getCustomerInvoiceHistory(customerId, 30),
          getCustomerLifetimeStats(customerId),
        ]);
        if (!customer) return { error: "Customer not found." };
        return {
          profile: {
            id: customer.id,
            name: customer.name,
            phone: customer.phone_e164,
            email: customer.email,
            address: [customer.street_address, customer.city, customer.state, customer.zip]
              .filter(Boolean)
              .join(", "),
            type: customer.customer_type,
            notes: customer.notes,
          },
          lifetime: {
            total_spent: formatMoney(stats.totalRevenueCents),
            open_balance: formatMoney(stats.totalBalanceCents),
            completed_jobs: stats.invoiceCount,
            last_service: stats.lastCompletedOn,
          },
          recent_jobs: jobs.map((j) => ({
            id: j.id,
            service: j.service_label ?? j.service_type,
            status: STATUS_LABEL[j.status as JobStatus] ?? j.status,
            scheduled: j.scheduled_start,
          })),
          recent_invoices: history.slice(0, 10).map((h) => ({
            completed: h.completed_on,
            type: h.job_type,
            total: formatMoney(h.total_cents),
            balance: formatMoney(h.balance_cents),
          })),
        };
      }),
  }),

  getJobContext: tool({
    description:
      "Get details on a specific job by its id: service, current status, schedule, assigned crew, amounts, address, and the customer.",
    inputSchema: assistantToolSchemas.getJobContext,
    execute: ({ jobId }) =>
      safe(async () => {
        const j = await getJob(jobId);
        if (!j) return { error: "Job not found." };
        return {
          id: j.id,
          service: j.service_label ?? j.service_type,
          status: STATUS_LABEL[j.status as JobStatus] ?? j.status,
          scheduled_start: j.scheduled_start,
          customer: j.customer
            ? { id: j.customer.id, name: j.customer.name, phone: j.customer.phone_e164 }
            : null,
          assigned_to: j.assignee?.name ?? null,
          estimated: formatMoney(j.estimated_amount_cents ?? 0),
          final: formatMoney(j.final_amount_cents ?? 0),
          address: [j.job_address, j.job_city, j.job_zip].filter(Boolean).join(", "),
          internal_notes: j.internal_notes,
        };
      }),
  }),

  getJobMaterials: tool({
    description:
      "List the parts/materials a pricebook service typically needs, by service code (e.g. 'H6110'). Use after searchPricebook to answer 'what parts/materials does this job need'.",
    inputSchema: assistantToolSchemas.getJobMaterials,
    execute: ({ serviceCode }) =>
      safe(async () => {
        const materials = await getServiceMaterials(serviceCode);
        if (materials.length === 0) {
          return { results: [], note: "No materials linked to this service (data may not be loaded yet)." };
        }
        return { service_code: serviceCode, materials };
      }),
  }),

  businessKpis: tool({
    description:
      "Get top-line business numbers: revenue this month / last 12 months / lifetime, unpaid balance, customer count, jobs this week, and jobs ready to invoice.",
    inputSchema: assistantToolSchemas.businessKpis,
    execute: () =>
      safe(async () => {
        const k = await getDashboardKpis();
        return {
          revenue_this_month: formatMoney(k.revenueThisMonthCents),
          revenue_last_12mo: formatMoney(k.revenueLast12MoCents),
          lifetime_revenue: formatMoney(k.lifetimeRevenueCents),
          open_balance: formatMoney(k.unpaidBalanceCents),
          unpaid_invoices: k.unpaidInvoiceCount,
          customers: k.customerCount,
          jobs_this_week: k.jobsThisWeek,
          ready_to_invoice: k.jobsReadyToInvoice,
        };
      }),
  }),
};
