import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, Circle, Phone, MapPin, Calendar, Truck } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { siteSettings } from "@/content/site-settings";
import { FaucetMark } from "@/components/Logo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Job Status · Z and Z Plumbing",
  robots: { index: false, follow: false },
};

const STATUS_TIMELINE = [
  { key: "scheduled", label: "Scheduled", description: "Your appointment is on the books." },
  { key: "en_route", label: "Crew en route", description: "We are on the way." },
  { key: "on_site", label: "On site", description: "The crew has arrived and is working on it." },
  { key: "complete", label: "Complete", description: "Work is done. Thanks for choosing Z and Z." },
] as const;

type Job = {
  id: number;
  status: string;
  service_label: string | null;
  service_type: string;
  scheduled_start: string | null;
  job_address: string | null;
  job_city: string | null;
  job_zip: string | null;
  customer_notes: string | null;
};

type Customer = {
  name: string;
};

type Assignee = {
  name: string;
  role: string;
};

async function loadByToken(token: string): Promise<{
  job: Job;
  customer: Customer | null;
  assignee: Assignee | null;
} | null> {
  if (!isSupabaseConfigured()) return null;

  const sb = supabase();
  const { data: tokenRow } = await sb
    .from("customer_tokens")
    .select("job_id, customer_id, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (!tokenRow) return null;
  if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) return null;

  const { data: job } = await sb
    .from("jobs")
    .select("id, status, service_label, service_type, scheduled_start, job_address, job_city, job_zip, customer_notes, customer_id, assigned_to")
    .eq("id", tokenRow.job_id)
    .maybeSingle();

  if (!job) return null;

  const [customerRes, assigneeRes] = await Promise.all([
    sb.from("customers").select("name").eq("id", job.customer_id).maybeSingle(),
    job.assigned_to
      ? sb.from("crew").select("name, role").eq("id", job.assigned_to).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    job: job as Job,
    customer: customerRes.data as Customer | null,
    assignee: assigneeRes.data as Assignee | null,
  };
}

export default async function TrackingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await loadByToken(token);

  if (!data) notFound();

  const { job, customer, assignee } = data;
  const currentStepIndex = STATUS_TIMELINE.findIndex((s) => s.key === job.status);
  const isCancelled = job.status === "cancelled";

  return (
    <main className="min-h-screen bg-white text-black">
      <header data-marketing="true" className="border-b border-[#E5E5E5] bg-white py-5">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6">
          <img src="/logo.svg" alt="Z and Z Plumbing" width={180} height={48} className="h-10 w-auto md:h-12" />
          <a
            href={`tel:${siteSettings.phoneTel}`}
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#F96302] hover:underline"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {siteSettings.phone}
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#F96302]">
          Job status
        </p>
        <h1 className="mt-2 font-display text-4xl font-black uppercase leading-tight tracking-tight text-black md:text-5xl">
          {job.service_label ?? job.service_type}
        </h1>
        {customer && (
          <p className="mt-3 text-lg text-[#333333] md:text-xl">
            for <span className="font-bold">{customer.name}</span>
          </p>
        )}

        {/* Timeline */}
        {isCancelled ? (
          <div className="mt-10 border-l-4 border-red-500 bg-red-50 p-6">
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-red-700">Cancelled</p>
            <p className="mt-2 text-lg text-[#333333]">
              This job has been cancelled. Call us if this is a mistake or you want to reschedule.
            </p>
          </div>
        ) : (
          <ol className="mt-10 flex flex-col gap-1">
            {STATUS_TIMELINE.map((step, i) => {
              const done = currentStepIndex > i;
              const active = currentStepIndex === i;
              const Icon = done || active ? CheckCircle2 : Circle;

              return (
                <li key={step.key} className="flex items-start gap-5 py-4">
                  <Icon
                    className={`mt-0.5 h-7 w-7 flex-shrink-0 ${
                      done
                        ? "text-emerald-500"
                        : active
                          ? "text-[#F96302]"
                          : "text-[#E5E5E5]"
                    }`}
                    aria-hidden="true"
                  />
                  <div className={active ? "" : done ? "" : "opacity-50"}>
                    <p
                      className={`font-display text-2xl font-black uppercase tracking-tight md:text-3xl ${
                        active ? "text-[#F96302]" : "text-black"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="mt-1 text-lg leading-relaxed text-[#333333] md:text-lg">
                      {step.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {/* Job details */}
        <section className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
          {job.scheduled_start && (
            <DetailCard icon={Calendar} label="Scheduled">
              {new Date(job.scheduled_start).toLocaleString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </DetailCard>
          )}
          {(job.job_address || job.job_city) && (
            <DetailCard icon={MapPin} label="Location">
              {job.job_address}
              {job.job_address && job.job_city ? <br /> : null}
              {job.job_city} {job.job_zip}
            </DetailCard>
          )}
          {assignee && (
            <DetailCard icon={Truck} label="Your crew">
              {assignee.name}
              <br />
              <span className="text-sm text-[#666666]">{assignee.role.replace(/_/g, " ")}</span>
            </DetailCard>
          )}
        </section>

        {job.customer_notes && (
          <section className="mt-8 border-l-4 border-[#F96302] bg-[#F5F5F5] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#666666]">
              Notes from Z and Z
            </p>
            <p className="mt-3 text-lg leading-relaxed text-[#333333] md:text-lg whitespace-pre-line">
              {job.customer_notes}
            </p>
          </section>
        )}

        <section className="mt-12 border-t border-[#E5E5E5] pt-8 text-center">
          <p className="text-base text-[#333333] md:text-lg">
            Questions? Call <span className="font-bold">{siteSettings.phone}</span>.
          </p>
          <a
            href={`tel:${siteSettings.phoneTel}`}
            className="mt-4 inline-flex items-center gap-2 bg-[#F96302] px-6 py-3 text-base font-bold uppercase tracking-wide text-white transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:bg-[#e05602]"
          >
            <Phone className="h-5 w-5" aria-hidden="true" />
            Call Z and Z
          </a>
        </section>
      </div>
    </main>
  );
}

function DetailCard({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[#E5E5E5] bg-white p-5 md:p-6">
      <div className="mb-3 flex items-center gap-3">
        <Icon className="h-5 w-5 text-[#F96302]" strokeWidth={1.75} aria-hidden={true} />
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#666666]">{label}</span>
      </div>
      <div className="text-lg leading-relaxed text-[#333333] md:text-lg">{children}</div>
    </div>
  );
}
