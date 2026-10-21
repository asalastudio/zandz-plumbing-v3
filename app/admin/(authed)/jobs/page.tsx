import Link from "next/link";
import { Plus, ChevronRight, Search, Phone, MapPin } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  listJobs,
  getNeverCalledLeadStats,
  STATUS_LABEL,
  STATUS_COLOR,
  formatDateTime,
  formatMoney,
  formatPacificDateTime,
  formatReceived,
  isGenericLeadService,
  isPastOneBusinessDay,
  leadProblem,
  serviceName,
  textSnippet,
  type JobStatus,
  type JobWithRelations,
} from "@/lib/db";
import { formatPhone } from "@/lib/phone";
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
  { label: "Cancelled", status: "cancelled" },
  { label: "All", status: "all" },
];

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; deleted?: string; error?: string; spam?: string }>;
}) {
  const params = await searchParams;
  const requestedStatus = params.status as JobStatus | "open" | "all" | undefined;
  const validStatuses = new Set(FILTERS.map((f) => f.status));
  const status = requestedStatus && validStatuses.has(requestedStatus) ? requestedStatus : "open";
  const q = params.q?.trim() ?? "";
  const spamId = params.spam ? parseInt(params.spam, 10) : NaN;

  if (!isSupabaseConfigured()) {
    return (
      <div className="border-l-4 border-[#F96302] bg-[#F96302]/10 p-6">
        <p className="text-base text-muted">Connect Supabase to view jobs.</p>
      </div>
    );
  }

  // The lead inbox reads newest first and has no schedule, crew, or amount to
  // show yet, so it drops those columns.
  const leadView = status === "new";
  const [{ rows, count }, neverCalled] = await Promise.all([
    listJobs({
      status,
      search: q || undefined,
      sort: leadView ? "newest" : undefined,
    }),
    leadView && !q ? getNeverCalledLeadStats() : Promise.resolve(null),
  ]);
  const now = new Date();

  return (
    <div className="pb-24 lg:pb-0">
      <header className="mb-5 md:mb-6">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">Jobs</p>
            <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight md:mt-2 md:text-5xl">
              {leadView ? "Lead Inbox" : "All Jobs"}
            </h1>
          </div>
          <Link
            href="/admin/jobs/new"
            className="inline-flex shrink-0 items-center gap-2 bg-[#F96302] px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:bg-[#e05602] md:px-5 md:py-3"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New job
          </Link>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-muted md:mt-3 md:text-base">
          {leadView
            ? `${count.toLocaleString()} new ${count === 1 ? "lead" : "leads"} waiting for follow-up.`
            : `${count.toLocaleString()} ${
                status === "all"
                  ? "total"
                  : status === "open"
                    ? "open"
                    : STATUS_LABEL[status as JobStatus].toLowerCase()
              }.`}
          {neverCalled && neverCalled.count > 0 && (
            <span className="ml-1 font-bold text-ink">
              {neverCalled.count.toLocaleString()} never called.
            </span>
          )}
          {q && <span className="ml-1">Matching &ldquo;{q}&rdquo;.</span>}
        </p>
      </header>

      {params.deleted === "1" && (
        <div className="mb-6 border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold uppercase tracking-wide text-emerald-700">
          Job deleted.
        </div>
      )}

      {Number.isFinite(spamId) && spamId > 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold uppercase tracking-wide text-emerald-700">
          <span>Lead marked as spam and moved to Cancelled.</span>
          <Link href={`/admin/jobs/${spamId}`} className="underline hover:text-emerald-900">
            View job #{spamId}
          </Link>
        </div>
      )}

      {params.error && (
        <div className="mb-6 border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold uppercase tracking-wide text-red-700">
          We could not complete that job action.
        </div>
      )}

      {/* Search (keeps the current status filter) */}
      <form action="/admin/jobs" method="GET" className="mb-4 flex max-w-xl gap-2">
        <input type="hidden" name="status" value={status} />
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Customer, service, or address"
            aria-label="Search jobs"
            className="w-full border border-line bg-card py-2.5 pl-9 pr-3 text-base text-ink outline-none placeholder:text-faint focus:border-[#F96302]"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center border border-line px-4 py-2 text-sm font-bold uppercase tracking-wide text-muted hover:border-[#F96302] hover:text-[#F96302]"
        >
          Search
        </button>
        {q && (
          <Link
            href={`/admin/jobs?${new URLSearchParams({ status })}`}
            className="inline-flex items-center px-2 text-sm font-bold uppercase tracking-wide text-muted hover:text-[#F96302]"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Status filter pills. One swipeable row on phones so the first job
          stays above the fold; they wrap on wider screens. */}
      <nav
        aria-label="Filter by status"
        className="-mx-6 mb-6 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0"
      >
        {FILTERS.map((f) => {
          const active = (status as string) === f.status;
          return (
            <Link
              key={f.status}
              href={`/admin/jobs?${new URLSearchParams(q ? { status: f.status, q } : { status: f.status })}`}
              aria-current={active ? "page" : undefined}
              className={`inline-flex shrink-0 items-center whitespace-nowrap border px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors duration-150 ${
                active
                  ? "border-[#F96302] bg-[#F96302] text-white"
                  : "border-line text-muted hover:border-[#F96302] hover:text-[#F96302]"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      {rows.length === 0 ? (
        <div className="border border-dashed border-line bg-raised px-8 py-16 text-center">
          <p className="text-base text-muted">
            {q ? "No jobs match that search." : "No jobs in this view."}
          </p>
        </div>
      ) : (
        <>
          {/* Phones: stacked cards with a Call button, no sideways scrolling. */}
          <ul className="space-y-3 md:hidden">
            {rows.map((j) => (
              <JobCard key={j.id} job={j} now={now} />
            ))}
          </ul>

          <div className="hidden overflow-x-auto border border-line md:block">
            <table className="w-full text-left">
              <thead className="bg-card">
                <tr>
                  <Th>Received</Th>
                  <Th>Job</Th>
                  <Th>Customer</Th>
                  {!leadView && <Th>Scheduled</Th>}
                  {!leadView && <Th>Assigned</Th>}
                  <Th>Status</Th>
                  {!leadView && <Th>Amount</Th>}
                  <Th>
                    <span className="sr-only">Actions</span>
                  </Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((j) => {
                  const info = rowInfo(j, now);
                  return (
                    <tr key={j.id} className="border-t border-line align-top transition-colors duration-150 hover:bg-raised">
                      <td className={`px-5 py-4 ${info.late ? "border-l-4 border-l-red-500" : ""}`}>
                        <span
                          title={`Received ${formatPacificDateTime(j.created_at)}`}
                          className={`block whitespace-nowrap text-sm font-bold ${info.late ? "text-red-700" : "text-muted"}`}
                        >
                          {formatReceived(j.created_at, { now })}
                        </span>
                        {info.late && (
                          <span
                            title="Not called after a full business day"
                            className="mt-1 block text-[10px] font-bold uppercase tracking-wide text-red-700"
                          >
                            Overdue
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/jobs/${j.id}`}
                          className="font-display text-lg font-black uppercase tracking-tight text-ink hover:text-[#F96302]"
                        >
                          {serviceName(j)}
                        </Link>
                        {info.generic && (
                          <p className={`mt-1 max-w-md text-sm leading-snug ${info.snippet ? "text-muted" : "text-faint"}`}>
                            {info.snippet ?? "No message left."}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="block text-base text-ink">
                          {j.customer?.name ?? <span className="text-muted">·</span>}
                        </span>
                        {info.phone && (
                          <a
                            href={`tel:${info.phone}`}
                            className="mt-0.5 inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-bold text-[#F96302] hover:underline"
                          >
                            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                            {formatPhone(info.phone)}
                          </a>
                        )}
                        {info.place && <span className="mt-0.5 block text-sm text-muted">{info.place}</span>}
                      </td>
                      {!leadView && (
                        <td className="px-5 py-4 text-base text-muted">{formatDateTime(j.scheduled_start)}</td>
                      )}
                      {!leadView && (
                        <td className="px-5 py-4 text-base text-muted">
                          {j.assignee?.name ?? <span className="text-muted">·</span>}
                        </td>
                      )}
                      <td className="px-5 py-4">
                        <StatusBadges job={j} called={info.called} />
                      </td>
                      {!leadView && (
                        <td className="px-5 py-4 text-base text-muted">
                          {formatMoney(j.final_amount_cents ?? j.estimated_amount_cents)}
                        </td>
                      )}
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/jobs/${j.id}`}
                            aria-label="Open job"
                            className="inline-flex h-9 w-9 items-center justify-center text-muted hover:text-[#F96302]"
                          >
                            <ChevronRight className="h-5 w-5" aria-hidden="true" />
                          </Link>
                          <DeleteJobButton jobId={j.id} label="Delete job" subtle />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/** What a row needs beyond the raw job: contact, place, and lead flags. */
function rowInfo(j: JobWithRelations, now: Date) {
  const phone = j.customer?.phone_e164 ?? null;
  const city = j.job_city ?? j.customer?.city ?? null;
  const zip = j.job_zip ?? j.customer?.zip ?? null;
  const generic = isGenericLeadService(j);
  const called = j.status === "new" && Boolean(j.first_contact_at);
  return {
    phone,
    place: [city, zip].filter(Boolean).join(" · ") || null,
    generic,
    snippet: generic ? textSnippet(j.customer_notes) : null,
    called,
    // Late means nobody has called yet. A called lead waiting on the customer
    // shows "Called" instead.
    late: j.status === "new" && !called && isPastOneBusinessDay(j.created_at, now),
  };
}

function JobCard({ job: j, now }: { job: JobWithRelations; now: Date }) {
  const info = rowInfo(j, now);
  const received = formatReceived(j.created_at, { ago: true, now });
  return (
    <li
      className={`border bg-card ${info.late ? "border-red-300 border-l-4 border-l-red-500" : "border-line"}`}
    >
      <Link href={`/admin/jobs/${j.id}`} className="block px-4 pb-3 pt-4">
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 truncate text-base font-bold text-ink">
            {j.customer?.name ?? serviceName(j)}
          </p>
          <StatusBadges job={j} called={info.called} />
        </div>
        <p className="mt-1 line-clamp-2 text-sm leading-snug text-ink">{leadProblem(j)}</p>
        {j.status !== "new" && j.scheduled_start && (
          <p className="mt-1 text-sm text-muted">
            Scheduled {formatDateTime(j.scheduled_start)}
            {j.assignee?.name ? ` · ${j.assignee.name}` : ""}
          </p>
        )}
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          {info.place && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {info.place}
            </span>
          )}
          <span className={info.late ? "font-bold text-red-700" : ""}>
            {received === "Just now" ? "Received just now" : `Received ${received}`}
            {info.late ? " · Overdue" : ""}
          </span>
        </p>
      </Link>
      {info.phone && (
        <div className="border-t border-line px-4 py-3">
          <a
            href={`tel:${info.phone}`}
            className={`flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-wide ${
              j.status === "new"
                ? "bg-[#F96302] text-white hover:bg-[#e05602]"
                : "border border-line text-ink hover:border-[#F96302] hover:text-[#F96302]"
            }`}
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            Call {formatPhone(info.phone)}
          </a>
        </div>
      )}
    </li>
  );
}

function StatusBadges({ job, called }: { job: JobWithRelations; called: boolean }) {
  return (
    <span className="inline-flex shrink-0 flex-wrap items-center gap-1.5">
      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${STATUS_COLOR[job.status]}`}>
        {STATUS_LABEL[job.status]}
      </span>
      {called && (
        <span
          title={job.first_contact_at ? `Called ${formatPacificDateTime(job.first_contact_at)}` : undefined}
          className="inline-flex items-center bg-emerald-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700"
        >
          Called
        </span>
      )}
    </span>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-muted">
      {children}
    </th>
  );
}
