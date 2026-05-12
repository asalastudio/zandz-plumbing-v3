import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Phone, MapPin, Calendar, User, FileText } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  getJob,
  listCrew,
  STATUS_LABEL,
  STATUS_COLOR,
  STATUS_TRANSITIONS,
  formatDateTime,
  formatMoney,
  type JobStatus,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (!id || Number.isNaN(id)) notFound();

  if (!isSupabaseConfigured()) {
    return (
      <div className="border-l-4 border-[#F96302] bg-[#F96302]/10 p-6">
        <p className="text-base text-white/80">Connect Supabase to view job detail.</p>
      </div>
    );
  }

  const job = await getJob(id);
  if (!job) notFound();

  const crew = await listCrew({ activeOnly: true });
  const transitions = STATUS_TRANSITIONS[job.status];

  return (
    <div className="pb-24 lg:pb-0">
      <Link
        href="/admin/jobs"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white/60 hover:text-[#F96302]"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back to jobs
      </Link>

      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">
            Job #{job.id}
          </p>
          <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
            {job.service_label ?? job.service_type}
          </h1>
          <p className="mt-2">
            <span className={`inline-flex items-center px-3 py-1 text-sm font-bold uppercase tracking-wide ${STATUS_COLOR[job.status]}`}>
              {STATUS_LABEL[job.status]}
            </span>
          </p>
        </div>
      </header>

      {/* Status transitions */}
      {transitions.length > 0 && (
        <section className="mb-8 border border-white/10 bg-white/5 p-5 md:p-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-white/60">
            Move to
          </p>
          <div className="flex flex-wrap gap-2">
            {transitions.map((next) => (
              <form key={next} action={`/api/admin/jobs/${id}/status`} method="POST">
                <input type="hidden" name="status" value={next} />
                <button
                  type="submit"
                  className={`inline-flex items-center px-4 py-2 text-sm font-bold uppercase tracking-wide transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-lg ${
                    next === "cancelled"
                      ? "border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                      : "bg-[#F96302] text-white hover:bg-[#e05602]"
                  }`}
                >
                  {STATUS_LABEL[next]}
                </button>
              </form>
            ))}
          </div>
        </section>
      )}

      {/* Top cards */}
      <section className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card icon={User} label="Customer">
          {job.customer ? (
            <Link href={`/admin/customers/${job.customer.id}`} className="text-white hover:text-[#F96302]">
              {job.customer.name}
              {job.customer.phone_e164 && (
                <span className="block text-sm text-white/60 mt-1">{job.customer.phone_e164}</span>
              )}
            </Link>
          ) : (
            <span className="text-white/40">·</span>
          )}
        </Card>
        <Card icon={Calendar} label="Scheduled">
          <span className="text-white">{formatDateTime(job.scheduled_start)}</span>
          {job.scheduled_end && (
            <span className="block text-sm text-white/60 mt-1">to {formatDateTime(job.scheduled_end)}</span>
          )}
        </Card>
        <Card icon={MapPin} label="Address">
          {job.job_address || job.customer?.street_address ? (
            <span className="text-white">
              {job.job_address ?? job.customer?.street_address}
              {(job.job_city || job.customer?.city) && (
                <>
                  <br />
                  {job.job_city ?? job.customer?.city}
                  {job.job_zip ? ` · ${job.job_zip}` : ""}
                </>
              )}
            </span>
          ) : (
            <span className="text-white/40">·</span>
          )}
        </Card>
      </section>

      {/* Assignment */}
      <section className="mb-8 border border-white/10 bg-white/5 p-5 md:p-6">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-white/60">
          Assigned crew
        </p>
        <form action={`/api/admin/jobs/${id}/assign`} method="POST" className="flex flex-wrap items-center gap-3">
          <select
            name="assigned_to"
            defaultValue={job.assigned_to ?? ""}
            className="border border-white/15 bg-black px-4 py-2.5 text-base text-white outline-none focus:border-[#F96302]"
          >
            <option value="">Unassigned</option>
            {crew.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} · {c.role.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="inline-flex items-center bg-[#F96302] px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-[#e05602]"
          >
            Update
          </button>
          {job.assignee && (
            <span className="text-sm text-white/60">
              Currently: <span className="text-white">{job.assignee.name}</span>
            </span>
          )}
        </form>
      </section>

      {/* Money */}
      <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card label="Estimated">
          <span className="font-display text-3xl font-black tracking-tight text-white">
            {formatMoney(job.estimated_amount_cents)}
          </span>
        </Card>
        <Card label="Final">
          <span className="font-display text-3xl font-black tracking-tight text-white">
            {formatMoney(job.final_amount_cents)}
          </span>
        </Card>
      </section>

      {/* Notes */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <NotesCard title="Customer-facing notes" body={job.customer_notes} icon={FileText} />
        <NotesCard title="Internal notes" body={job.internal_notes} icon={FileText} highlight />
      </section>
    </div>
  );
}

function Card({
  icon: Icon,
  label,
  children,
}: {
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-white/10 bg-white/5 p-5 md:p-6">
      <div className="mb-3 flex items-center gap-3">
        {Icon && <Icon className="h-5 w-5 text-[#F96302]" strokeWidth={1.75} aria-hidden={true} />}
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/60">{label}</span>
      </div>
      <div className="text-base md:text-lg">{children}</div>
    </div>
  );
}

function NotesCard({
  title,
  body,
  icon: Icon,
  highlight = false,
}: {
  title: string;
  body: string | null;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  highlight?: boolean;
}) {
  return (
    <div className={`border ${highlight ? "border-l-4 border-[#F96302]" : "border-white/10"} bg-white/5 p-6 md:p-7`}>
      <div className="mb-3 flex items-center gap-3">
        <Icon className="h-5 w-5 text-[#F96302]" strokeWidth={1.75} aria-hidden="true" />
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/60">{title}</span>
      </div>
      {body ? (
        <p className="text-base leading-relaxed text-white/80 md:text-lg whitespace-pre-line">{body}</p>
      ) : (
        <p className="text-base text-white/40">No notes yet.</p>
      )}
    </div>
  );
}
