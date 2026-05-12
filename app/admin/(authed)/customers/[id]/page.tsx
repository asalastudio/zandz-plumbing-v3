import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Phone, Mail, MapPin, FileText, Plus } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getCustomer, getCustomerJobs, STATUS_LABEL, STATUS_COLOR, formatDateTime, formatMoney } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
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
        <p className="text-base text-white/80">Connect Supabase to view customer detail.</p>
      </div>
    );
  }

  const customer = await getCustomer(id);
  if (!customer) notFound();

  const jobs = await getCustomerJobs(id);

  return (
    <div className="pb-24 lg:pb-0">
      <Link
        href="/admin/customers"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white/60 hover:text-[#F96302]"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back to customers
      </Link>

      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">Customer</p>
          <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
            {customer.name}
          </h1>
          {customer.hubspot_contact_id && (
            <p className="mt-2 text-sm font-bold uppercase tracking-[0.12em] text-emerald-300">
              HubSpot · {customer.hubspot_contact_id}
            </p>
          )}
        </div>
        <Link
          href={`/admin/jobs/new?customer_id=${id}`}
          className="inline-flex items-center gap-2 bg-[#F96302] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:bg-[#e05602]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New job
        </Link>
      </header>

      {/* Contact details */}
      <section className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card icon={Phone} label="Phone">
          {customer.phone_e164 ? (
            <a href={`tel:${customer.phone_e164}`} className="text-white hover:text-[#F96302]">
              {customer.phone_e164}
            </a>
          ) : (
            <span className="text-white/40">·</span>
          )}
        </Card>
        <Card icon={Mail} label="Email">
          {customer.email ? (
            <a href={`mailto:${customer.email}`} className="text-white hover:text-[#F96302] break-all">
              {customer.email}
            </a>
          ) : (
            <span className="text-white/40">·</span>
          )}
        </Card>
        <Card icon={MapPin} label="Address">
          {customer.street_address ? (
            <span className="text-white">
              {customer.street_address}
              {customer.city ? <><br />{customer.city}, {customer.state} {customer.zip}</> : null}
            </span>
          ) : (
            <span className="text-white/40">·</span>
          )}
        </Card>
      </section>

      {/* Neighborhood + notes */}
      {(customer.neighborhood || customer.notes) && (
        <section className="mb-12 border border-white/10 bg-white/5 p-6 md:p-7">
          {customer.neighborhood && (
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-[#F96302]">
              {customer.neighborhood}
            </p>
          )}
          {customer.notes && (
            <p className="text-base leading-relaxed text-white/80 md:text-lg whitespace-pre-line">
              {customer.notes}
            </p>
          )}
        </section>
      )}

      {/* Jobs */}
      <section>
        <h2 className="mb-4 font-display text-2xl font-black uppercase tracking-tight md:text-3xl">
          Jobs
          <span className="ml-3 text-base font-bold text-white/40">({jobs.length})</span>
        </h2>
        {jobs.length === 0 ? (
          <div className="border border-dashed border-white/15 bg-white/[0.02] px-8 py-12 text-center">
            <FileText className="mx-auto h-8 w-8 text-white/30" aria-hidden="true" />
            <p className="mt-3 text-base text-white/60">No jobs yet for this customer.</p>
            <Link
              href={`/admin/jobs/new?customer_id=${id}`}
              className="mt-4 inline-flex items-center gap-2 bg-[#F96302] px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-[#e05602]"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create the first
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden border border-white/10">
            <table className="w-full text-left">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white/60">Service</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white/60">Scheduled</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white/60">Amount</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white/60">Status</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j.id} className="border-t border-white/5 transition-colors duration-150 hover:bg-white/5">
                    <td className="px-5 py-4">
                      <Link href={`/admin/jobs/${j.id}`} className="font-display text-lg font-black uppercase tracking-tight text-white hover:text-[#F96302]">
                        {j.service_label ?? j.service_type}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-base text-white/70">{formatDateTime(j.scheduled_start)}</td>
                    <td className="px-5 py-4 text-base text-white/70">
                      {formatMoney(j.final_amount_cents ?? j.estimated_amount_cents)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${STATUS_COLOR[j.status]}`}>
                        {STATUS_LABEL[j.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Card({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-white/10 bg-white/5 p-5 md:p-6">
      <div className="mb-3 flex items-center gap-3">
        <Icon className="h-5 w-5 text-[#F96302]" strokeWidth={1.75} aria-hidden={true} />
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/60">{label}</span>
      </div>
      <div className="text-base md:text-lg">{children}</div>
    </div>
  );
}
