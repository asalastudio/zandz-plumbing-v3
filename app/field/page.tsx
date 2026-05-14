import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Camera, CheckCircle2, Pause, Phone, Play, Wrench } from "lucide-react";
import { isAuthenticated } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  listJobs,
  STATUS_COLOR,
  STATUS_LABEL,
  formatDateTime,
  type JobStatus,
  type JobWithRelations,
} from "@/lib/db";
import { Logo } from "@/components/Logo";

export const dynamic = "force-dynamic";

const FIELD_STATUSES: JobStatus[] = ["scheduled", "en_route", "on_site", "paused"];

export default async function FieldPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string; photo?: string }>;
}) {
  const authed = await isAuthenticated();
  if (!authed) redirect("/admin/login?next=/field");

  const params = await searchParams;

  if (!isSupabaseConfigured()) {
    return (
      <FieldShell>
        <div className="border-l-4 border-[#F96302] bg-[#F96302]/10 p-5 text-white">
          Connect Supabase to use field mode.
        </div>
      </FieldShell>
    );
  }

  const { rows } = await listJobs({ status: "open", limit: 100 });
  const jobs = rows.filter((job) => FIELD_STATUSES.includes(job.status));

  return (
    <FieldShell>
      <header className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">
          Field mode
        </p>
        <h1 className="mt-2 font-display text-4xl font-black uppercase leading-none tracking-tight text-white">
          Today&apos;s work
        </h1>
        <p className="mt-3 text-base leading-relaxed text-white/65">
          Big buttons only. Start the job, pause it if needed, mark it complete when done.
        </p>
      </header>

      {params.updated === "1" && (
        <div className="mb-4 border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-bold uppercase tracking-wide text-emerald-200">
          Job updated.
        </div>
      )}

      {params.photo === "1" && (
        <div className="mb-4 border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-bold uppercase tracking-wide text-emerald-200">
          Photo saved.
        </div>
      )}

      {(params.photo === "missing" || params.photo === "error") && (
        <div className="mb-4 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold uppercase tracking-wide text-red-200">
          Photo did not save. Use an image under 8MB.
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="border border-dashed border-white/15 bg-white/[0.03] px-6 py-14 text-center">
          <Wrench className="mx-auto h-8 w-8 text-white/30" aria-hidden="true" />
          <p className="mt-3 text-base text-white/60">No active field jobs right now.</p>
          <Link href="/admin/leads" className="mt-5 inline-flex bg-[#F96302] px-5 py-3 text-sm font-bold text-white">
            View leads
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <FieldJobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </FieldShell>
  );
}

function FieldShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-8 text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <Logo linkWrapper={false} className="h-9" />
          <Link href="/admin" className="text-xs font-bold uppercase tracking-wide text-white/55 hover:text-[#F96302]">
            Admin
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-xl px-4 py-5">{children}</main>
    </div>
  );
}

function FieldJobCard({ job }: { job: JobWithRelations }) {
  const primary = primaryAction(job.status);
  const secondary = secondaryAction(job.status);

  return (
    <article className="border border-white/10 bg-white/[0.04] p-4 shadow-xl shadow-black/20">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#F96302]">
            {formatDateTime(job.scheduled_start)}
          </p>
          <h2 className="mt-2 font-display text-3xl font-black uppercase leading-none tracking-tight text-white">
            {job.service_label ?? job.service_type}
          </h2>
          <p className="mt-2 text-base text-white/70">
            {job.customer?.name ?? "Customer"}
          </p>
        </div>
        <span className={`shrink-0 px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${STATUS_COLOR[job.status]}`}>
          {STATUS_LABEL[job.status]}
        </span>
      </div>

      {job.customer?.phone_e164 && (
        <a
          href={`tel:${job.customer.phone_e164}`}
          className="mb-3 flex w-full items-center justify-center gap-2 border border-white/15 bg-black px-4 py-4 text-base font-bold text-white"
        >
          <Phone className="h-5 w-5 text-[#F96302]" aria-hidden="true" />
          Call customer
        </a>
      )}

      {primary && (
        <StatusButton jobId={job.id} status={primary.status} label={primary.label} primary icon={primary.icon} />
      )}

      <div className="mt-3 grid grid-cols-2 gap-3">
        {secondary && (
          <StatusButton jobId={job.id} status={secondary.status} label={secondary.label} icon={secondary.icon} />
        )}
        <Link
          href={`/admin/jobs/${job.id}`}
          className="inline-flex items-center justify-center gap-2 border border-white/15 px-4 py-4 text-sm font-bold text-white/70"
        >
          Details
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <form
        action={`/api/admin/jobs/${job.id}/photos`}
        method="POST"
        encType="multipart/form-data"
        className="mt-4 border-t border-white/10 pt-4"
      >
        <input type="hidden" name="category" value={job.status === "complete" ? "after" : "before"} />
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white/60">
            <Camera className="h-4 w-4 text-[#F96302]" aria-hidden="true" />
            Job photo
          </span>
          <input
            name="photo"
            type="file"
            accept="image/*"
            capture="environment"
            className="w-full border border-white/15 bg-black px-3 py-3 text-sm text-white file:mr-3 file:border-0 file:bg-[#F96302] file:px-3 file:py-2 file:text-sm file:font-bold file:text-white"
          />
        </label>
        <button
          type="submit"
          className="mt-3 w-full bg-[#F96302] px-4 py-4 text-base font-bold text-white"
        >
          Save photo
        </button>
      </form>
    </article>
  );
}

function StatusButton({
  jobId,
  status,
  label,
  primary = false,
  icon: Icon,
}: {
  jobId: number;
  status: JobStatus;
  label: string;
  primary?: boolean;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  return (
    <form action={`/api/admin/jobs/${jobId}/status`} method="POST" className={primary ? "w-full" : ""}>
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        className={[
          "inline-flex w-full items-center justify-center gap-2 px-4 font-bold",
          primary
            ? "bg-[#F96302] py-5 text-lg text-white"
            : "border border-white/15 bg-black py-4 text-sm text-white/75",
        ].join(" ")}
      >
        <Icon className={primary ? "h-6 w-6" : "h-4 w-4"} aria-hidden={true} />
        {label}
      </button>
    </form>
  );
}

function primaryAction(status: JobStatus): { label: string; status: JobStatus; icon: typeof Play } | null {
  switch (status) {
    case "scheduled":
    case "en_route":
    case "paused":
      return { label: "Start job", status: "on_site", icon: Play };
    case "on_site":
      return { label: "Mark complete", status: "complete", icon: CheckCircle2 };
    default:
      return null;
  }
}

function secondaryAction(status: JobStatus): { label: string; status: JobStatus; icon: typeof Play } | null {
  switch (status) {
    case "scheduled":
      return { label: "On the way", status: "en_route", icon: Play };
    case "on_site":
      return { label: "Pause", status: "paused", icon: Pause };
    default:
      return null;
  }
}
