import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  listJobs,
  STATUS_LABEL,
  STATUS_COLOR,
  formatDateTime,
  formatMoney,
  type JobStatus,
} from "@/lib/db";
import { DeleteJobButton } from "../_components/DeleteJobButton";

export const dynamic = "force-dynamic";

const FILTERS: { label: string; status: JobStatus | "open" | "all" }[] = [
  { label: "New Leads", status: "new" },
  { label: "Open", status: "open" },
  { label: "Scheduled", status: "scheduled" },
  { label: "On Site", status: "on_site" },
  { label: "Complete", status: "complete" },
  { label: "Invoiced", status: "invoiced" },
  { label: "Paid", status: "paid" },
  { label: "All", status: "all" },
];

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; deleted?: string; error?: string }>;
}) {
  const params = await searchParams;
  const requestedStatus = params.status as JobStatus | "open" | "all" | undefined;
  const validStatuses = new Set(FILTERS.map((f) => f.status));
  const status = requestedStatus && validStatuses.has(requestedStatus) ? requestedStatus : "open";

  if (!isSupabaseConfigured()) {
    return (
      <div className="border-l-4 border-[#F96302] bg-[#F96302]/10 p-6">
        <p className="text-base text-white/80">Connect Supabase to view jobs.</p>
      </div>
    );
  }

  const { rows, count } = await listJobs({
    status,
    search: params.q?.trim() || undefined,
  });

  return (
    <div className="pb-24 lg:pb-0">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">Jobs</p>
          <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
            {status === "new" ? "Lead Inbox" : "All Jobs"}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-white/70">
            {status === "new"
              ? `${count.toLocaleString()} new ${count === 1 ? "lead" : "leads"} waiting for follow-up.`
              : `${count.toLocaleString()} ${
                  status === "all"
                    ? "total"
                    : status === "open"
                      ? "open"
                      : STATUS_LABEL[status as JobStatus].toLowerCase()
                }.`}
          </p>
        </div>
        <Link
          href="/admin/jobs/new"
          className="inline-flex items-center gap-2 bg-[#F96302] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:bg-[#e05602]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New job
        </Link>
      </header>

      {params.deleted === "1" && (
        <div className="mb-6 border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm font-bold uppercase tracking-wide text-emerald-200">
          Job deleted.
        </div>
      )}

      {params.error && (
        <div className="mb-6 border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm font-bold uppercase tracking-wide text-red-200">
          We could not complete that job action.
        </div>
      )}

      {/* Status filter pills */}
      <nav className="mb-6 flex flex-wrap gap-2 overflow-x-auto">
        {FILTERS.map((f) => {
          const active = (status as string) === f.status;
          return (
            <Link
              key={f.status}
              href={`/admin/jobs?${new URLSearchParams({ status: f.status })}`}
              className={`inline-flex items-center border px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors duration-150 ${
                active
                  ? "border-[#F96302] bg-[#F96302] text-white"
                  : "border-white/15 text-white/70 hover:border-[#F96302] hover:text-[#F96302]"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      {rows.length === 0 ? (
        <div className="border border-dashed border-white/15 bg-white/[0.02] px-8 py-16 text-center">
          <p className="text-base text-white/60">No jobs in this view.</p>
        </div>
      ) : (
        <div className="overflow-hidden border border-white/10">
          <table className="w-full text-left">
            <thead className="bg-white/5">
              <tr>
                <Th>Service</Th>
                <Th>Customer</Th>
                <Th>Scheduled</Th>
                <Th>Assigned</Th>
                <Th>Status</Th>
                <Th>Amount</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((j) => (
                <tr key={j.id} className="border-t border-white/5 transition-colors duration-150 hover:bg-white/5">
                  <td className="px-5 py-4">
                    <Link href={`/admin/jobs/${j.id}`} className="font-display text-lg font-black uppercase tracking-tight text-white hover:text-[#F96302]">
                      {j.service_label ?? j.service_type}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-base text-white/80">
                    {j.customer?.name ?? <span className="text-white/40">·</span>}
                  </td>
                  <td className="px-5 py-4 text-base text-white/70">{formatDateTime(j.scheduled_start)}</td>
                  <td className="px-5 py-4 text-base text-white/70">
                    {j.assignee?.name ?? <span className="text-white/40">·</span>}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${STATUS_COLOR[j.status]}`}>
                      {STATUS_LABEL[j.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-base text-white/70">
                    {formatMoney(j.final_amount_cents ?? j.estimated_amount_cents)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-4">
                      <DeleteJobButton jobId={j.id} label="Delete" compact />
                      <Link href={`/admin/jobs/${j.id}`} className="text-white/40 hover:text-[#F96302]">
                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white/60">
      {children}
    </th>
  );
}
