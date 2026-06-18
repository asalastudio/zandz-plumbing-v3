import Link from "next/link";
import { Plus, Phone, MapPin, User, AlertCircle, ChevronRight } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  getJobsForDay,
  listCrew,
  STATUS_LABEL,
  STATUS_COLOR,
  formatDateTime,
  type JobWithRelations,
  type Crew,
} from "@/lib/db";
import { PACIFIC_TZ, pacificDayFromIsoDate, startOfPacificDay, pacificYmd } from "@/lib/time";

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
        <p className="text-base text-white/80">Connect Supabase to view dispatch.</p>
      </div>
    );
  }

  const [jobs, crew] = await Promise.all([
    getJobsForDay(day),
    listCrew({ activeOnly: true }),
  ]);

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
  const ymdNow = pacificYmd(new Date());
  const todayIso = `${ymdNow.year}-${String(ymdNow.month).padStart(2, "0")}-${String(ymdNow.day).padStart(2, "0")}`;

  const unassigned = jobs.filter((j) => !j.assigned_to);
  const byCrew = new Map<number, JobWithRelations[]>();
  for (const c of crew) byCrew.set(c.id, []);
  for (const j of jobs) {
    if (j.assigned_to) {
      const list = byCrew.get(j.assigned_to);
      if (list) list.push(j);
    }
  }

  return (
    <div className="pb-24 lg:pb-0">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">Dispatch</p>
          <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
            {dayLabel}
          </h1>
          <p className="mt-2 text-base text-white/70">
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
            className="inline-flex items-center border border-white/15 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white/70 hover:border-[#F96302] hover:text-[#F96302]"
          >
            Yesterday
          </Link>
          <Link
            href={`/admin/dispatch?date=${todayIso}`}
            className="inline-flex items-center border border-white/15 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white/70 hover:border-[#F96302] hover:text-[#F96302]"
          >
            Today
          </Link>
          <Link
            href={`/admin/dispatch?date=${tomorrow.toISOString().slice(0, 10)}`}
            className="inline-flex items-center border border-white/15 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white/70 hover:border-[#F96302] hover:text-[#F96302]"
          >
            Tomorrow
          </Link>
          <Link
            href="/admin/jobs/new"
            className="inline-flex items-center gap-2 bg-[#F96302] px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:-translate-y-0.5 hover:shadow-lg hover:bg-[#e05602] transition-transform duration-150"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New job
          </Link>
        </div>
      </header>

      {/* Unassigned bucket */}
      {unassigned.length > 0 && (
        <section className="mb-8 border-2 border-[#F96302]/40 bg-[#F96302]/5 p-5 md:p-6">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-black uppercase tracking-tight text-white md:text-2xl">
              Unassigned
              <span className="ml-3 text-base font-bold text-[#F96302]">({unassigned.length})</span>
            </h2>
          </header>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {unassigned.map((j) => (
              <JobCard key={j.id} job={j} />
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
          <div className="md:col-span-2 lg:col-span-3 border border-dashed border-white/15 bg-white/[0.02] px-8 py-12 text-center">
            <User className="mx-auto h-8 w-8 text-white/30" aria-hidden="true" />
            <p className="mt-3 text-base text-white/60">No active crew yet.</p>
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

function CrewColumn({ crew, jobs }: { crew: Crew; jobs: JobWithRelations[] }) {
  return (
    <section className="border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <header className="mb-4 border-b border-white/10 pb-3">
        <h2 className="font-display text-xl font-black uppercase tracking-tight text-white md:text-2xl">
          {crew.name}
        </h2>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/50">
          {crew.role.replace(/_/g, " ")} · {jobs.length} job{jobs.length === 1 ? "" : "s"}
        </p>
      </header>
      {jobs.length === 0 ? (
        <p className="py-6 text-center text-sm text-white/40">No jobs scheduled.</p>
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

function JobCard({ job, compact = false }: { job: JobWithRelations; compact?: boolean }) {
  return (
    <Link
      href={`/admin/jobs/${job.id}`}
      className="block border border-white/10 bg-black/40 p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-[#F96302] hover:bg-white/5"
    >
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/50">
            {formatDateTime(job.scheduled_start)}
          </p>
          <h3 className={`mt-1 font-display ${compact ? "text-lg" : "text-xl"} font-black uppercase tracking-tight text-white`}>
            {job.service_label ?? job.service_type}
          </h3>
        </div>
        <span className={`inline-flex flex-shrink-0 items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_COLOR[job.status]}`}>
          {STATUS_LABEL[job.status]}
        </span>
      </header>
      {job.customer && (
        <p className="mb-2 flex items-center gap-2 text-sm text-white/80">
          <User className="h-3.5 w-3.5 text-white/40" aria-hidden="true" />
          {job.customer.name}
        </p>
      )}
      {job.customer?.phone_e164 && (
        <p className="mb-2 flex items-center gap-2 text-sm text-white/70">
          <Phone className="h-3.5 w-3.5 text-white/40" aria-hidden="true" />
          {job.customer.phone_e164}
        </p>
      )}
      {(job.job_address || job.customer?.street_address) && (
        <p className="flex items-start gap-2 text-sm text-white/60">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-white/40 mt-0.5" aria-hidden="true" />
          <span>
            {job.job_address ?? job.customer?.street_address}
            {(job.job_city || job.customer?.city) && (
              <span className="text-white/40">, {job.job_city ?? job.customer?.city}</span>
            )}
          </span>
        </p>
      )}
      <footer className="mt-3 flex items-center justify-end text-[#F96302]/70 group-hover:text-[#F96302]">
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </footer>
    </Link>
  );
}
