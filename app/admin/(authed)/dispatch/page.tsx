import Link from "next/link";
import { Plus, Phone, MapPin, User, AlertCircle, ChevronRight, Inbox } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  getJobsForDay,
  listCrew,
  listJobs,
  STATUS_LABEL,
  STATUS_COLOR,
  formatDateTime,
  formatPacificDateTime,
  formatReceived,
  isPastOneBusinessDay,
  leadProblem,
  type JobWithRelations,
  type Crew,
} from "@/lib/db";
import { formatPhone } from "@/lib/phone";
import { PACIFIC_TZ, pacificDayFromIsoDate, startOfPacificDay, pacificYmd } from "@/lib/time";
import { DispatchDatePicker } from "../_components/DispatchDatePicker";

/** How many unbooked leads the board lists before pointing at the lead inbox. */
const WAITING_CAP = 15;
/** Phones show fewer, so the day's board isn't pushed far down. */
const WAITING_CAP_MOBILE = 5;

export const dynamic = "force-dynamic";

export default async function DispatchPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  // Interpret ?date=YYYY-MM-DD as a Pacific calendar day (not UTC).
  const day = pacificDayFromIsoDate(params.date) ?? startOfPacificDay(new Date());

  if (!isSupabaseConfigured()) {
    return (
      <div className="border-l-4 border-[#F96302] bg-[#F96302]/10 p-6">
        <p className="text-base text-muted">Connect Supabase to view dispatch.</p>
      </div>
    );
  }

  const [dayJobs, allCrew, waiting] = await Promise.all([
    getJobsForDay(day),
    listCrew(),
    // Leads not booked yet, so the board shows what still needs a slot.
    listJobs({ status: "new", sort: "newest", limit: WAITING_CAP }),
  ]);
  // Cancelled work isn't on the board.
  const jobs = dayJobs.filter((j) => j.status !== "cancelled");
  const crew = allCrew.filter((c) => c.active);
  const inactiveCrew = new Map(allCrew.filter((c) => !c.active).map((c) => [c.id, c]));

  const dayLabel = day.toLocaleDateString("en-US", {
    timeZone: PACIFIC_TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // `day` is a Pacific-midnight instant, so a ±1 day shift keeps the correct
  // YYYY-MM-DD after slicing the ISO string.
  const yesterday = new Date(day.getTime() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(day.getTime() + 24 * 60 * 60 * 1000);
  const isoOf = ({ year, month, day: d }: { year: number; month: number; day: number }) =>
    `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const todayIso = isoOf(pacificYmd(new Date()));
  const dayIso = isoOf(pacificYmd(day));
  const now = new Date();

  // A job assigned to someone who is no longer active (or no longer on the
  // crew list) still needs a person, so it lands in the unassigned lane
  // instead of disappearing with their column.
  const unassigned: JobWithRelations[] = [];
  const byCrew = new Map<number, JobWithRelations[]>();
  for (const c of crew) byCrew.set(c.id, []);
  for (const j of jobs) {
    const list = j.assigned_to ? byCrew.get(j.assigned_to) : undefined;
    if (list) list.push(j);
    else unassigned.push(j);
  }

  return (
    <div className="pb-24 lg:pb-0">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">Dispatch</p>
          <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
            {dayLabel}
          </h1>
          <p className="mt-2 text-base text-muted">
            {jobs.length} job{jobs.length === 1 ? "" : "s"} on the board.
            {unassigned.length > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-[#F96302]">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                {unassigned.length} unassigned
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/dispatch?date=${yesterday.toISOString().slice(0, 10)}`}
            className="inline-flex items-center border border-line px-4 py-2 text-sm font-bold uppercase tracking-wide text-muted hover:border-[#F96302] hover:text-[#F96302]"
          >
            Yesterday
          </Link>
          <Link
            href={`/admin/dispatch?date=${todayIso}`}
            className="inline-flex items-center border border-line px-4 py-2 text-sm font-bold uppercase tracking-wide text-muted hover:border-[#F96302] hover:text-[#F96302]"
          >
            Today
          </Link>
          <Link
            href={`/admin/dispatch?date=${tomorrow.toISOString().slice(0, 10)}`}
            className="inline-flex items-center border border-line px-4 py-2 text-sm font-bold uppercase tracking-wide text-muted hover:border-[#F96302] hover:text-[#F96302]"
          >
            Tomorrow
          </Link>
          <DispatchDatePicker value={dayIso} />
          <Link
            href="/admin/jobs/new"
            className="inline-flex items-center gap-2 bg-[#F96302] px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:-translate-y-0.5 hover:shadow-lg hover:bg-[#e05602] transition-transform duration-150"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New job
          </Link>
        </div>
      </header>

      {waiting.count > 0 && (
        <WaitingPanel rows={waiting.rows} count={waiting.count} now={now} />
      )}

      {/* Unassigned bucket */}
      {unassigned.length > 0 && (
        <section className="mb-8 border-2 border-[#F96302]/40 bg-[#F96302]/5 p-5 md:p-6">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-black uppercase tracking-tight text-ink md:text-2xl">
              Unassigned / inactive
              <span className="ml-3 text-base font-bold text-[#F96302]">({unassigned.length})</span>
            </h2>
          </header>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {unassigned.map((j) => (
              <JobCard
                key={j.id}
                job={j}
                note={
                  j.assigned_to
                    ? `Assigned to ${inactiveCrew.get(j.assigned_to)?.name ?? j.assignee?.name ?? "a former crew member"}, who is inactive. Reassign.`
                    : undefined
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* Per-crew columns */}
      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {crew.map((c) => (
          <CrewColumn key={c.id} crew={c} jobs={byCrew.get(c.id) ?? []} />
        ))}
        {crew.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 border border-dashed border-line bg-raised px-8 py-12 text-center">
            <User className="mx-auto h-8 w-8 text-faint" aria-hidden="true" />
            <p className="mt-3 text-base text-muted">No active crew yet.</p>
            <Link
              href="/admin/crew"
              className="mt-4 inline-flex items-center gap-2 bg-[#F96302] px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-[#e05602]"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add a crew member
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

/**
 * New leads with no appointment, newest first. Each opens the job at its
 * schedule block, the one step between a lead and a slot on this board.
 */
function WaitingPanel({
  rows,
  count,
  now,
}: {
  rows: JobWithRelations[];
  count: number;
  now: Date;
}) {
  return (
    <section className="mb-8 border border-line bg-card p-5 md:p-6">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl font-black uppercase tracking-tight text-ink md:text-2xl">
            <Inbox className="h-5 w-5 text-[#F96302]" aria-hidden="true" />
            Waiting to schedule
            <span className="text-base font-bold text-[#F96302]">({count})</span>
          </h2>
          <p className="mt-1 text-sm text-muted">New leads with no appointment yet, newest first.</p>
        </div>
        <Link
          href="/admin/jobs/?status=new"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-ink hover:text-[#F96302]"
        >
          {count > rows.length ? `See all ${count}` : "See all"}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </header>
      <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((j, i) => {
          const called = Boolean(j.first_contact_at);
          const late = !called && isPastOneBusinessDay(j.created_at, now);
          const place = [j.job_city ?? j.customer?.city, j.job_zip ?? j.customer?.zip]
            .filter(Boolean)
            .join(" · ");
          return (
            <li key={j.id} className={i >= WAITING_CAP_MOBILE ? "hidden md:block" : undefined}>
              <Link
                href={`/admin/jobs/${j.id}#schedule`}
                className={`group flex h-full items-start justify-between gap-3 border bg-surface px-4 py-3 transition-colors duration-150 hover:border-[#F96302] ${
                  late ? "border-red-300" : "border-line"
                }`}
              >
                <span className="min-w-0">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="truncate font-bold text-ink group-hover:text-[#F96302]">
                      {j.customer?.name ?? "New lead"}
                    </span>
                    {called && (
                      <span className="shrink-0 bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                        Called
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-muted">{leadProblem(j, 60)}</span>
                  {place && <span className="mt-0.5 block truncate text-xs text-muted">{place}</span>}
                </span>
                <span
                  title={`Received ${formatPacificDateTime(j.created_at)}`}
                  className={`shrink-0 whitespace-nowrap text-xs font-bold ${late ? "text-red-700" : "text-muted"}`}
                >
                  {formatReceived(j.created_at, { now })}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function CrewColumn({ crew, jobs }: { crew: Crew; jobs: JobWithRelations[] }) {
  return (
    <section className="border border-line bg-raised p-5 md:p-6">
      <header className="mb-4 border-b border-line pb-3">
        <h2 className="font-display text-xl font-black uppercase tracking-tight text-ink md:text-2xl">
          {crew.name}
        </h2>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
          {crew.role.replace(/_/g, " ")} · {jobs.length} job{jobs.length === 1 ? "" : "s"}
        </p>
      </header>
      {jobs.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">No jobs scheduled.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {jobs.map((j) => (
            <JobCard key={j.id} job={j} compact />
          ))}
        </div>
      )}
    </section>
  );
}

function JobCard({
  job,
  compact = false,
  note,
}: {
  job: JobWithRelations;
  compact?: boolean;
  note?: string;
}) {
  return (
    <Link
      href={`/admin/jobs/${job.id}`}
      className="block border border-line bg-surface p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-[#F96302] hover:bg-raised"
    >
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
            {formatDateTime(job.scheduled_start)}
          </p>
          <h3 className={`mt-1 font-display ${compact ? "text-lg" : "text-xl"} font-black uppercase tracking-tight text-ink`}>
            {job.service_label ?? job.service_type}
          </h3>
        </div>
        <span className={`inline-flex flex-shrink-0 items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_COLOR[job.status]}`}>
          {STATUS_LABEL[job.status]}
        </span>
      </header>
      {job.customer && (
        <p className="mb-2 flex items-center gap-2 text-sm text-muted">
          <User className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
          {job.customer.name}
        </p>
      )}
      {job.customer?.phone_e164 && (
        <p className="mb-2 flex items-center gap-2 text-sm text-muted">
          <Phone className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
          {formatPhone(job.customer.phone_e164)}
        </p>
      )}
      {(job.job_address || job.customer?.street_address) && (
        <p className="flex items-start gap-2 text-sm text-muted">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-muted mt-0.5" aria-hidden="true" />
          <span>
            {job.job_address ?? job.customer?.street_address}
            {(job.job_city || job.customer?.city) && (
              <span className="text-muted">, {job.job_city ?? job.customer?.city}</span>
            )}
          </span>
        </p>
      )}
      {note && (
        <p className="mt-2 flex items-start gap-2 text-xs font-bold text-amber-800">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          {note}
        </p>
      )}
      <footer className="mt-3 flex items-center justify-end text-[#F96302]/70 group-hover:text-[#F96302]">
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </footer>
    </Link>
  );
}
