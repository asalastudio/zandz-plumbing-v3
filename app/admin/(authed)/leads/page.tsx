import Link from "next/link";
import {
  CalendarCheck,
  Camera,
  ChevronRight,
  Inbox,
  MapPin,
  Phone,
  Wrench,
} from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  listJobs,
  STATUS_COLOR,
  STATUS_LABEL,
  formatDateTime,
  type JobStatus,
  type JobWithRelations,
} from "@/lib/db";

export const dynamic = "force-dynamic";

const PIPELINE: Array<{
  title: string;
  description: string;
  statuses: JobStatus[];
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}> = [
  {
    title: "New leads",
    description: "Call these first. They came from the website and are not scheduled yet.",
    statuses: ["new"],
    icon: Inbox,
  },
  {
    title: "Scheduled",
    description: "The lead has become a job and has a dispatch path.",
    statuses: ["scheduled"],
    icon: CalendarCheck,
  },
  {
    title: "Active work",
    description: "Jobs that are en route, on site, or paused.",
    statuses: ["en_route", "on_site", "paused"],
    icon: Wrench,
  },
];

export default async function LeadsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="border-l-4 border-[#F96302] bg-[#F96302]/10 p-6">
        <p className="text-base text-white/80">Connect Supabase to view leads.</p>
      </div>
    );
  }

  const { rows } = await listJobs({ status: "open", limit: 200 });
  const totalNew = rows.filter((job) => job.status === "new").length;

  return (
    <div className="pb-24 lg:pb-0">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">
            Lead pipeline
          </p>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight md:text-5xl">
            New leads and follow-up
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-white/70 md:text-lg">
            This is the simple sales view for Jay: new website leads first, then scheduled jobs,
            then active work. It reads from the same jobs table, so there is no second system to manage.
          </p>
        </div>
        <Link
          href="/admin/jobs/new"
          className="inline-flex items-center justify-center gap-2 bg-[#F96302] px-5 py-3 text-sm font-bold text-white transition-transform duration-150 hover:-translate-y-0.5 hover:bg-[#e05602] hover:shadow-lg"
        >
          Add manual lead
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </header>

      <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard label="New leads" value={totalNew.toLocaleString()} detail="Need a first call" />
        <SummaryCard
          label="Scheduled"
          value={rows.filter((job) => job.status === "scheduled").length.toLocaleString()}
          detail="Converted to jobs"
        />
        <SummaryCard
          label="Active"
          value={rows
            .filter((job) => ["en_route", "on_site", "paused"].includes(job.status))
            .length.toLocaleString()}
          detail="Being worked now"
        />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {PIPELINE.map((column) => {
          const Icon = column.icon;
          const jobs = rows.filter((job) => column.statuses.includes(job.status));
          return (
            <div key={column.title} className="border border-white/10 bg-white/[0.03]">
              <div className="border-b border-white/10 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-bold text-[#F96302]">
                      <Icon className="h-5 w-5" aria-hidden={true} />
                      {column.title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">{column.description}</p>
                  </div>
                  <span className="inline-flex min-w-9 items-center justify-center bg-black px-3 py-1 text-sm font-bold text-white">
                    {jobs.length}
                  </span>
                </div>
              </div>

              <div className="space-y-3 p-3">
                {jobs.length === 0 ? (
                  <div className="border border-dashed border-white/10 p-6 text-center text-sm text-white/45">
                    Nothing here right now.
                  </div>
                ) : (
                  jobs.map((job) => <LeadCard key={job.id} job={job} />)
                )}
              </div>
            </div>
          );
        })}
      </section>

      <section className="mt-8 border border-white/10 bg-white/5 p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-[#F96302]">
              <Camera className="h-5 w-5" aria-hidden="true" />
              Next upgrade
            </p>
            <p className="mt-2 max-w-3xl text-base leading-relaxed text-white/70">
              Photo upload should come next for leaks, drains, and water heaters. That needs storage,
              file previews, and a safe admin view, so it should be built as its own focused step.
            </p>
          </div>
          <Link
            href="/admin/jobs?status=new"
            className="inline-flex items-center justify-center gap-2 border border-white/15 px-4 py-3 text-sm font-bold text-white/80 hover:border-[#F96302] hover:text-[#F96302]"
          >
            Table view
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function LeadCard({ job }: { job: JobWithRelations }) {
  const customer = job.customer;
  const phone = customer?.phone_e164;
  const location = [job.job_address, job.job_city, job.job_zip].filter(Boolean).join(", ");

  return (
    <article className="border border-white/10 bg-black/35 p-4 transition-colors duration-150 hover:border-[#F96302]/60">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/admin/jobs/${job.id}`}
            className="block truncate font-display text-2xl font-black leading-tight tracking-tight text-white hover:text-[#F96302]"
          >
            {customer?.name ?? "New lead"}
          </Link>
          <p className="mt-1 text-sm leading-relaxed text-white/65">
            {job.service_label ?? job.service_type}
          </p>
        </div>
        <span className={`shrink-0 px-2.5 py-1 text-xs font-bold ${STATUS_COLOR[job.status]}`}>
          {STATUS_LABEL[job.status]}
        </span>
      </div>

      <div className="mt-4 space-y-2 text-sm text-white/65">
        <p>
          Created <span className="text-white">{formatDateTime(job.created_at)}</span>
        </p>
        {job.scheduled_start && (
          <p>
            Scheduled <span className="text-white">{formatDateTime(job.scheduled_start)}</span>
          </p>
        )}
        {location && (
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#F96302]" aria-hidden="true" />
            <span>{location}</span>
          </p>
        )}
        {job.customer_notes && (
          <p className="rounded bg-white/[0.04] p-3 text-white/75">{job.customer_notes}</p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {phone && (
          <a
            href={`tel:${phone}`}
            className="inline-flex items-center gap-2 bg-[#F96302] px-3 py-2 text-sm font-bold text-white hover:bg-[#e05602]"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            Call
          </a>
        )}
        <Link
          href={`/admin/jobs/${job.id}`}
          className="inline-flex items-center gap-2 border border-white/15 px-3 py-2 text-sm font-bold text-white/80 hover:border-[#F96302] hover:text-[#F96302]"
        >
          Open
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

function SummaryCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="border border-white/10 bg-white/5 p-5">
      <p className="text-sm font-semibold text-white/60">{label}</p>
      <p className="mt-2 font-display text-4xl font-black uppercase leading-none tracking-tight text-white">
        {value}
      </p>
      <p className="mt-2 text-sm text-white/50">{detail}</p>
    </div>
  );
}
