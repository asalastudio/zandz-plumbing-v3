import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  Phone,
  PhoneCall,
  Mail,
  MapPin,
  Calendar,
  CalendarClock,
  Clock,
  Globe,
  FileText,
  AlertTriangle,
  Camera,
  CreditCard,
  Send,
  CheckCircle2,
  Pencil,
  FileSignature,
} from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  getJob,
  listCrew,
  STATUS_LABEL,
  STATUS_COLOR,
  STATUS_TRANSITIONS,
  formatDateTime,
  formatMoney,
  formatPacificDateTime,
  formatWait,
  isGenericLeadService,
  isPastOneBusinessDay,
  jobTitle,
  parseLeadIntake,
  secondsSince,
  serviceName,
  type JobWithRelations,
  type LeadIntake,
} from "@/lib/db";
import { formatPhone } from "@/lib/phone";
import { DeleteJobButton } from "../../_components/DeleteJobButton";
import { DeleteInvoiceButton } from "../../_components/DeleteInvoiceButton";
import { MarkSpamButton } from "../../_components/MarkSpamButton";
import InvoiceLineItems from "../../_components/InvoiceLineItems";
import { ScheduleTimeFields } from "../../_components/ScheduleTimeFields";
import { listJobPhotos, type JobPhotoWithUrl } from "@/lib/job-photos";
import { isStripeConfigured } from "@/lib/stripe-checkout";
import { listJobInvoices, type InvoiceRecord } from "@/lib/invoices";
import { listJobEstimates } from "@/lib/estimates";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
    photo?: string;
    updated?: string;
    invoice?: string;
    contact?: string;
  }>;
}) {
  const { id: idStr } = await params;
  const query = await searchParams;
  const id = parseInt(idStr, 10);
  if (!id || Number.isNaN(id)) notFound();

  if (!isSupabaseConfigured()) {
    return (
      <div className="border-l-4 border-[#F96302] bg-[#F96302]/10 p-6">
        <p className="text-base text-muted">Connect Supabase to view job detail.</p>
      </div>
    );
  }

  const job = await getJob(id);
  if (!job) notFound();

  const [crew, photos, invoices, estimates] = await Promise.all([
    listCrew({ activeOnly: true }),
    listJobPhotos(id),
    listJobInvoices(id),
    listJobEstimates(id),
  ]);
  const isLead = job.status === "new";
  // A lead's way to Scheduled is the schedule block (it needs a time), so the
  // lead panel below carries its only other move, Cancelled.
  const transitions = isLead ? [] : STATUS_TRANSITIONS[job.status];
  const calledAt = isLead ? (job.first_contact_at ?? null) : null;
  const phone = job.customer?.phone_e164 ?? null;
  const intake = parseLeadIntake(job.internal_notes);

  return (
    <div className="pb-24 lg:pb-0">
      <Link
        href="/admin/jobs"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted hover:text-[#F96302]"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back to jobs
      </Link>

      {/* Results of the last action, first thing on the page after a redirect. */}
      {query.contact === "logged" && (
        <div className="mb-6 border border-emerald-200 bg-emerald-50 p-5 text-base text-emerald-800">
          Call logged. The lead stays in New Leads until you book it in the schedule block below.
        </div>
      )}

      {query.contact === "already" && (
        <div className="mb-6 border border-line bg-card p-5 text-base text-muted">
          A call was already logged for this lead.
        </div>
      )}

      {query.error === "has_invoice" && (
        <div className="mb-6 border border-red-200 bg-red-50 p-5 text-base text-red-800">
          This job has invoice records attached, so it is protected from deletion.
        </div>
      )}

      {query.error && query.error !== "has_invoice" && (
        <div className="mb-6 border border-red-200 bg-red-50 p-5 text-base text-red-800">
          We could not complete that job action. Please try again.
        </div>
      )}

      {query.photo === "1" && (
        <div className="mb-6 border border-emerald-200 bg-emerald-50 p-5 text-base text-emerald-800">
          Photo added.
        </div>
      )}

      {(query.photo === "missing" || query.photo === "error") && (
        <div className="mb-6 border border-red-200 bg-red-50 p-5 text-base text-red-800">
          We could not add that photo. Use an image under 8MB.
        </div>
      )}

      {query.invoice && <InvoiceFlash status={query.invoice} />}

      {/* Phones stack title, lead summary, then the document buttons. Wider
          screens keep the buttons beside the title, summary underneath. */}
      <div className="mb-8 flex flex-col gap-5 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-6">
        <header className="min-w-0 md:col-start-1 md:row-start-1">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">
            Job #{job.id}
          </p>
          <h1 className="mt-2 break-words font-display text-3xl font-black uppercase tracking-tight sm:text-4xl md:text-5xl">
            {jobTitle(job, job.customer?.name)}
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center px-3 py-1 text-sm font-bold uppercase tracking-wide ${STATUS_COLOR[job.status]}`}>
              {STATUS_LABEL[job.status]}
            </span>
            {calledAt && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-100 px-3 py-1 text-sm font-bold uppercase tracking-wide text-emerald-700">
                <PhoneCall className="h-4 w-4" aria-hidden="true" />
                Called {formatDateTime(calledAt)}
              </span>
            )}
          </p>
        </header>

        <LeadSummaryCard job={job} intake={intake} className="md:col-span-2 md:row-start-2" />

        <div className="flex flex-wrap gap-2 md:col-start-2 md:row-start-1">
          <Link
            href={`/admin/estimates/new?job_id=${job.id}&return_to=${encodeURIComponent(`/admin/jobs/${job.id}`)}`}
            className="inline-flex items-center gap-2 border border-line bg-card px-5 py-3 text-sm font-bold uppercase tracking-wide text-muted transition-colors hover:border-[#F96302] hover:text-[#F96302]"
          >
            <FileSignature className="h-4 w-4" aria-hidden="true" />
            Estimate
          </Link>
          <a
            href="#invoice"
            className="inline-flex items-center gap-2 border border-line bg-card px-5 py-3 text-sm font-bold uppercase tracking-wide text-muted transition-colors hover:border-[#F96302] hover:text-[#F96302]"
          >
            <CreditCard className="h-4 w-4" aria-hidden="true" />
            Create invoice
          </a>
        </div>
      </div>

      {estimates.length > 0 && (
        <section className="mb-8 border border-line bg-card p-5">
          <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-muted">
            <FileSignature className="h-4 w-4" aria-hidden="true" />
            Estimates
          </h2>
          <ul className="space-y-2">
            {estimates.map((est) => (
              <li key={est.id} className="flex items-center justify-between gap-3 border border-line bg-surface px-4 py-3">
                <Link href={`/admin/estimates/${est.id}`} className="group min-w-0">
                  <span className="font-bold text-ink group-hover:text-[#F96302]">
                    Estimate #{est.id}
                  </span>
                  <span className="ml-2 text-sm text-muted">
                    ${(est.amount_cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })} · {est.status}
                  </span>
                </Link>
                <a
                  href={`/api/admin/estimates/${est.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-sm font-semibold text-[#F96302] hover:underline"
                >
                  PDF
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Lead panel: call, log the call, or clear junk, all in one place. */}
      {isLead && (
        <section className="mb-8 border-l-4 border-[#F96302] bg-[#F96302]/10 p-5 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-[#F96302]">
                {calledAt ? (
                  <PhoneCall className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                )}
                {calledAt ? "Called, not booked yet" : "New lead waiting"}
              </p>
              <p className="mt-2 text-base text-muted">
                {calledAt
                  ? `Call logged ${formatDateTime(calledAt)}. Next step: pick the appointment window in the schedule block below.`
                  : "Call the customer, then tap Log call so the alerts stop. Book the visit in the schedule block below once it becomes real work."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {calledAt ? (
                <a
                  href="#schedule"
                  className="inline-flex items-center justify-center gap-2 bg-[#F96302] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-[#e05602]"
                >
                  <CalendarClock className="h-4 w-4" aria-hidden="true" />
                  Schedule visit
                </a>
              ) : (
                phone && (
                  <a
                    href={`tel:${phone}`}
                    className="inline-flex items-center justify-center gap-2 bg-[#F96302] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-[#e05602]"
                  >
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    Call lead
                  </a>
                )
              )}
              {!calledAt && (
                <form action={`/api/admin/jobs/${id}/contact`} method="POST">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 border border-[#F96302] bg-card px-4 py-3 text-sm font-bold uppercase tracking-wide text-[#B24400] transition-colors duration-150 hover:bg-[#F96302]/10"
                  >
                    <PhoneCall className="h-4 w-4" aria-hidden="true" />
                    Log call
                  </button>
                </form>
              )}
              <MarkSpamButton jobId={job.id} />
              {STATUS_TRANSITIONS.new.includes("cancelled") && (
                <form action={`/api/admin/jobs/${id}/status`} method="POST">
                  <input type="hidden" name="status" value="cancelled" />
                  <button
                    type="submit"
                    className="inline-flex items-center border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold uppercase tracking-wide text-red-700 hover:bg-red-100"
                  >
                    Cancel lead
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      )}

      {(job.status === "complete" || job.status === "invoiced") && (
        <section className="mb-8 border-l-4 border-emerald-500 bg-emerald-50 p-5 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-emerald-700">
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                {job.status === "complete" ? "Work complete" : "Invoiced"}
              </p>
              <p className="mt-2 text-base text-muted">
                {job.status === "complete"
                  ? "Send the customer their invoice to collect payment."
                  : "An invoice has been created. Send a reminder or record payment below."}
              </p>
            </div>
            <a
              href="#invoice"
              className="inline-flex items-center justify-center gap-2 bg-[#F96302] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-[#e05602]"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              Go to invoice
            </a>
          </div>
        </section>
      )}

      {/* Status transitions */}
      {transitions.length > 0 && (
        <section className="mb-8 border border-line bg-card p-5 md:p-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-muted">
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
                      ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
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

      <form id="schedule" action={`/api/admin/jobs/${id}/schedule`} method="POST" className="mb-8 scroll-mt-24">
        <ScheduleTimeFields
          initialStart={job.scheduled_start}
          initialEnd={job.scheduled_end}
          description={
            isLead
              ? "Pick the appointment window after the first callback. Saving a start time moves this lead to Scheduled."
              : "Update the appointment window without changing the rest of the job."
          }
          scheduledBadge={isLead ? "Will move to scheduled" : "Schedule selected"}
        />
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center bg-[#F96302] px-5 py-3 text-sm font-bold text-white transition-transform duration-150 hover:-translate-y-0.5 hover:bg-[#e05602] hover:shadow-lg"
          >
            Save schedule
          </button>
        </div>
      </form>

      {/* Schedule and money. Customer and address live in the summary up top. */}
      <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card icon={Calendar} label="Scheduled">
          <span className="text-ink">{formatDateTime(job.scheduled_start)}</span>
          {job.scheduled_end && (
            <span className="block text-sm text-muted mt-1">to {formatDateTime(job.scheduled_end)}</span>
          )}
        </Card>
        <Card label="Estimated">
          <span className="font-display text-3xl font-black tracking-tight text-ink">
            {formatMoney(job.estimated_amount_cents)}
          </span>
        </Card>
        <Card label="Final">
          <span className="font-display text-3xl font-black tracking-tight text-ink">
            {formatMoney(job.final_amount_cents)}
          </span>
        </Card>
      </section>

      {/* Assignment */}
      <section className="mb-8 border border-line bg-card p-5 md:p-6">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-muted">
          Assigned crew
        </p>
        <form action={`/api/admin/jobs/${id}/assign`} method="POST" className="flex flex-wrap items-center gap-3">
          <select
            name="assigned_to"
            defaultValue={job.assigned_to ?? ""}
            className="border border-line bg-card px-4 py-2.5 text-base text-ink outline-none focus:border-[#F96302]"
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
            <span className="text-sm text-muted">
              Currently: <span className="text-ink">{job.assignee.name}</span>
            </span>
          )}
        </form>
      </section>

      <InvoiceSection
        jobId={job.id}
        invoices={invoices}
        defaultDescription={`${isGenericLeadService(job) ? "Plumbing" : serviceName(job)} service`}
        defaultAmountCents={job.final_amount_cents ?? job.estimated_amount_cents}
        customerEmail={job.customer?.email ?? null}
        customerId={job.customer?.id ?? null}
        canInvoice={["complete", "invoiced", "paid"].includes(job.status)}
      />

      {/* Notes */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <NotesCard
          title="Customer's description"
          hint="Shows on the customer's tracking page."
          body={job.customer_notes}
          icon={FileText}
        />
        <NotesCard title="Internal notes" body={job.internal_notes} icon={FileText} highlight />
      </section>

      <PhotosSection jobId={job.id} photos={photos} />

      <section className="mt-8 border border-red-200 bg-red-50 p-5 md:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-red-700">
          Danger zone
        </p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="max-w-2xl text-sm leading-relaxed text-muted">
            Delete test entries or accidental duplicates. Jobs with invoices are protected and will
            not delete from here.
          </p>
          <DeleteJobButton jobId={job.id} />
        </div>
      </section>
    </div>
  );
}

/**
 * Everything needed to call a lead back, in one card: who, how to reach
 * them, where, what they wrote, and how long they've waited.
 */
function LeadSummaryCard({
  job,
  intake,
  className = "",
}: {
  job: JobWithRelations;
  intake: LeadIntake;
  className?: string;
}) {
  const customer = job.customer ?? null;
  const phone = customer?.phone_e164 ?? null;
  const email = customer?.email ?? null;
  const address = job.job_address ?? customer?.street_address ?? null;
  const cityLine = [job.job_city ?? customer?.city, job.job_zip ?? customer?.zip]
    .filter(Boolean)
    .join(" · ");
  // Only a lead nobody has called is "waiting". After that, show how long
  // the first contact took instead.
  const waitingSeconds =
    job.status === "new" && !job.first_contact_at ? secondsSince(job.created_at) : null;
  const late = waitingSeconds !== null && isPastOneBusinessDay(job.created_at);
  const sourceIsPath = intake.sourcePage?.startsWith("/") ?? false;

  return (
    <section aria-label="Lead summary" className={`border border-line bg-card p-5 md:p-6 ${className}`}>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-8">
        <div className="min-w-0 space-y-3">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">Customer</p>
            {customer ? (
              <Link
                href={`/admin/customers/${customer.id}`}
                className="break-words font-display text-2xl font-black uppercase tracking-tight text-ink hover:text-[#F96302]"
              >
                {customer.name}
              </Link>
            ) : (
              <span className="text-base text-muted">No customer linked</span>
            )}
          </div>
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex min-h-11 items-center gap-2 text-lg font-bold text-[#F96302] hover:underline"
            >
              <Phone className="h-5 w-5 shrink-0" aria-hidden="true" />
              {formatPhone(phone)}
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-2 break-all text-base text-ink hover:text-[#F96302]"
            >
              <Mail className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
              {email}
            </a>
          )}
          {(address || cityLine) && (
            <p className="flex items-start gap-2 text-base text-ink">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
              <span>
                {address}
                {address && cityLine && <br />}
                {cityLine}
              </span>
            </p>
          )}
          {intake.outOfArea && (
            <p className="inline-flex items-center gap-2 bg-amber-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-amber-800">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              ZIP is outside the service area
            </p>
          )}
        </div>

        <div className="min-w-0">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-muted">
            Customer&rsquo;s message
          </p>
          {job.customer_notes ? (
            <p className="whitespace-pre-line break-words border-l-4 border-[#F96302] bg-surface px-4 py-3 text-base leading-relaxed text-ink">
              {job.customer_notes}
            </p>
          ) : (
            <p className="text-base text-muted">No message left.</p>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 border-t border-line pt-4 text-sm text-muted md:flex-row md:flex-wrap md:items-center md:gap-x-6">
        <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
          Received {formatPacificDateTime(job.created_at)}
          {waitingSeconds !== null && (
            <span className={`font-bold ${late ? "text-red-700" : "text-ink"}`}>
              · waiting {formatWait(waitingSeconds)}
            </span>
          )}
          {job.first_contact_at && job.first_response_seconds != null && (
            <span>· first contact after {formatWait(job.first_response_seconds)}</span>
          )}
        </span>
        {intake.sourcePage && (
          <span className="inline-flex items-center gap-1.5">
            <Globe className="h-4 w-4 shrink-0" aria-hidden="true" />
            Source:{" "}
            {sourceIsPath ? (
              <a
                href={intake.sourcePage}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-ink hover:text-[#F96302]"
              >
                {intake.sourcePage}
              </a>
            ) : (
              <span className="font-bold text-ink">{intake.sourcePage}</span>
            )}
          </span>
        )}
        {intake.preferredCallback && (
          <span>
            Preferred callback: <span className="font-bold text-ink">{intake.preferredCallback}</span>
          </span>
        )}
      </div>
    </section>
  );
}

function InvoiceFlash({ status }: { status: string }) {
  const isGood = ["created", "sent", "paid", "deleted", "updated", "from_estimate"].includes(status);
  const message: Record<string, string> = {
    created: "Invoice created. You can send it when the customer is ready.",
    sent: "Invoice sent to the customer.",
    paid: "Invoice marked paid.",
    deleted: "Invoice deleted.",
    updated: "Invoice updated. Send it again so the customer has the new total.",
    from_estimate: "Estimate converted to an invoice. Review it below, then send it.",
    paid_locked: "That invoice is marked paid, so it can't be deleted.",
    delete_failed: "We could not delete that invoice. Please try again.",
    invalid: "Add at least one invoice line with a description, quantity, and price.",
    no_customer: "This job needs a customer before an invoice can be created.",
    not_complete: "Mark this job Complete before invoicing it.",
    no_email: "The invoice was created, but this customer does not have an email address.",
    email_skipped: "Invoice created, but email is not configured yet.",
    email_failed: "Invoice created, but the email did not send. Try again from the invoice card.",
    error: "We could not complete that invoice action. Please try again.",
  };

  return (
    <div
      className={`mb-8 border p-5 text-base ${
        isGood
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      {message[status] ?? message.error}
    </div>
  );
}

function InvoiceSection({
  jobId,
  invoices,
  defaultDescription,
  defaultAmountCents,
  customerEmail,
  customerId,
  canInvoice,
}: {
  jobId: number;
  invoices: InvoiceRecord[];
  defaultDescription: string;
  defaultAmountCents: number | null;
  customerEmail: string | null;
  customerId: number | null;
  canInvoice: boolean;
}) {
  const defaultPrice = defaultAmountCents ? (defaultAmountCents / 100).toFixed(2) : "";
  const stripeReady = isStripeConfigured();

  return (
    <section id="invoice" className="mb-8 scroll-mt-6 border border-line bg-card p-5 md:p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#F96302]">
            <CreditCard className="h-5 w-5" aria-hidden="true" />
            Invoices
          </p>
          <h2 className="mt-2 font-display text-3xl font-black uppercase tracking-tight text-ink">
            Send and collect payment
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Create an invoice from this job. If online payments are connected, the email includes
            a secure pay button. Customers can also pay by check, and cash can be recorded when Z and Z
            approves it.
          </p>
        </div>
        <span
          className={`inline-flex px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
            stripeReady ? "bg-emerald-100 text-emerald-700" : "bg-line text-muted"
          }`}
        >
          {stripeReady ? "Online payments ready" : "Online payments not connected"}
        </span>
      </div>

      {canInvoice ? (
      <form action={`/api/admin/jobs/${jobId}/invoice`} method="POST" className="border border-line bg-surface p-4 md:p-5">
        <InvoiceLineItems defaultDescription={defaultDescription} defaultPrice={defaultPrice} />

        <label className="mt-4 block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-muted">
            Notes for customer
          </span>
          <textarea
            name="notes"
            rows={3}
            placeholder="Optional payment notes, check instructions, cash approval notes, or warranty details"
            className="w-full resize-none border border-line bg-card px-3 py-3 text-base text-ink outline-none placeholder:text-faint focus:border-[#F96302]"
          />
        </label>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className={`flex items-center gap-3 text-sm ${customerEmail ? "text-muted" : "text-muted"}`}>
            <input
              type="checkbox"
              name="send_invoice"
              defaultChecked={Boolean(customerEmail)}
              disabled={!customerEmail}
              className="h-5 w-5 accent-[#F96302]"
            />
            Email invoice to customer now
            {customerEmail ? <span className="text-muted">({customerEmail})</span> : null}
          </label>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 bg-[#F96302] px-5 py-3 text-sm font-bold text-white transition-transform duration-150 hover:-translate-y-0.5 hover:bg-[#e05602] hover:shadow-lg"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            Create invoice
          </button>
        </div>
        {!customerEmail && (
          <p className="mt-3 text-sm text-muted">
            Add an email address to the{" "}
            {customerId ? (
              <Link href={`/admin/customers/${customerId}#contact`} className="text-[#F96302] underline">
                customer profile
              </Link>
            ) : (
              "customer profile"
            )}{" "}
            before sending invoices by email.
          </p>
        )}
      </form>
      ) : (
        <div className="border border-dashed border-line bg-surface px-5 py-6 text-sm leading-relaxed text-muted">
          Mark this job <span className="font-bold text-ink">Complete</span> before creating an invoice. Existing invoices stay visible below.
        </div>
      )}

      <div className="mt-5 space-y-3">
        {invoices.length === 0 ? (
          <div className="border border-dashed border-line bg-surface px-6 py-8 text-center text-base text-muted">
            No invoices yet.
          </div>
        ) : (
          invoices.map((invoice) => (
            <article key={invoice.id} className="border border-line bg-surface p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
                    Invoice #{invoice.id}
                  </p>
                  <p className="mt-1 font-display text-3xl font-black tracking-tight text-ink">
                    {formatMoney(invoice.amount_cents)}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {invoice.paid_at
                      ? `Paid ${formatDateTime(invoice.paid_at)}`
                      : invoice.sent_at
                        ? `Sent ${formatDateTime(invoice.sent_at)}`
                        : "Created, not sent"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {invoice.paid_at ? (
                    <span className="inline-flex items-center gap-2 bg-emerald-100 px-4 py-2 text-sm font-bold uppercase tracking-wide text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      Paid
                    </span>
                  ) : (
                    <>
                      <form action={`/api/admin/invoices/${invoice.id}/send`} method="POST">
                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 border border-line bg-card px-4 py-2 text-sm font-bold uppercase tracking-wide text-ink hover:border-[#F96302] hover:text-[#F96302]"
                        >
                          <Send className="h-4 w-4" aria-hidden="true" />
                          Send
                        </button>
                      </form>
                      <Link
                        href={`/admin/invoices/${invoice.id}/edit?return_to=${encodeURIComponent(`/admin/jobs/${jobId}`)}`}
                        className="inline-flex items-center gap-2 border border-line bg-card px-4 py-2 text-sm font-bold uppercase tracking-wide text-ink hover:border-[#F96302] hover:text-[#F96302]"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        Edit
                      </Link>
                      {invoice.stripe_payment_link_url && (
                        <a
                          href={invoice.stripe_payment_link_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 border border-line bg-card px-4 py-2 text-sm font-bold uppercase tracking-wide text-ink hover:border-[#F96302] hover:text-[#F96302]"
                        >
                          <CreditCard className="h-4 w-4" aria-hidden="true" />
                          Pay link
                        </a>
                      )}
                      <form action={`/api/admin/invoices/${invoice.id}/paid`} method="POST" className="flex gap-2">
                        <select
                          name="payment_method"
                          defaultValue="manual"
                          aria-label="How it was paid"
                          className="border border-line bg-card px-3 py-2 text-sm text-ink outline-none focus:border-[#F96302]"
                        >
                          <option value="manual">Paid by: other</option>
                          <option value="card">Card</option>
                          <option value="cash">Cash</option>
                          <option value="check">Check</option>
                          <option value="zelle">Zelle</option>
                        </select>
                        <button
                          type="submit"
                          className="inline-flex items-center bg-emerald-600 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-emerald-500"
                        >
                          Mark paid
                        </button>
                      </form>
                    </>
                  )}
                  {/* Paid invoices are settled money and can't be deleted. */}
                  {!invoice.paid_at && (
                    <DeleteInvoiceButton invoiceId={invoice.id} next={`/admin/jobs/${jobId}`} compact />
                  )}
                </div>
              </div>

              {invoice.line_items.length > 0 && (
                <div className="mt-4 divide-y divide-line border-t border-line">
                  {invoice.line_items.map((item, index) => (
                    <div key={`${invoice.id}-${index}`} className="grid grid-cols-[1fr_auto] gap-4 py-3 text-sm">
                      <div>
                        <p className="whitespace-pre-line font-bold text-ink">{item.description}</p>
                        <p className="text-muted">
                          {item.quantity} x {formatMoney(item.unit_price_cents)}
                        </p>
                      </div>
                      <p className="font-bold text-ink">{formatMoney(item.total_cents)}</p>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function PhotosSection({ jobId, photos }: { jobId: number; photos: JobPhotoWithUrl[] }) {
  return (
    <section className="mt-8 border border-line bg-card p-5 md:p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#F96302]">
            <Camera className="h-5 w-5" aria-hidden="true" />
            Job photos
          </p>
          <h2 className="mt-2 font-display text-3xl font-black uppercase tracking-tight text-ink">
            Photos from the lead and field
          </h2>
        </div>
        <form
          action={`/api/admin/jobs/${jobId}/photos`}
          method="POST"
          encType="multipart/form-data"
          className="flex flex-col gap-2 md:w-[360px]"
        >
          <input type="hidden" name="category" value="other" />
          <input
            name="photo"
            type="file"
            accept="image/*"
            className="w-full border border-line bg-card px-3 py-3 text-sm text-ink file:mr-3 file:border-0 file:bg-[#F96302] file:px-3 file:py-2 file:text-sm file:font-bold file:text-white"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center bg-[#F96302] px-4 py-3 text-sm font-bold text-white hover:bg-[#e05602]"
          >
            Add photo
          </button>
        </form>
      </div>

      {photos.length === 0 ? (
        <div className="border border-dashed border-line bg-surface px-6 py-10 text-center text-base text-muted">
          No photos yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {photos.map((photo) => (
            <figure key={photo.id} className="overflow-hidden border border-line bg-surface">
              {photo.signedUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo.signedUrl}
                  alt={photo.caption || "Job photo"}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center text-sm text-muted">
                  Preview unavailable
                </div>
              )}
              <figcaption className="space-y-1 px-3 py-2 text-xs text-muted">
                <span className="block font-bold uppercase tracking-wide text-[#F96302]">
                  {photo.category ?? "other"}
                </span>
                {photo.caption && <span className="block truncate">{photo.caption}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
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
    <div className="border border-line bg-card p-5 md:p-6">
      <div className="mb-3 flex items-center gap-3">
        {Icon && <Icon className="h-5 w-5 text-[#F96302]" strokeWidth={1.75} aria-hidden={true} />}
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{label}</span>
      </div>
      <div className="text-base md:text-lg">{children}</div>
    </div>
  );
}

function NotesCard({
  title,
  hint,
  body,
  icon: Icon,
  highlight = false,
}: {
  title: string;
  /** One line under the title saying where this text shows up. */
  hint?: string;
  body: string | null;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  highlight?: boolean;
}) {
  return (
    <div className={`border ${highlight ? "border-l-4 border-[#F96302]" : "border-line"} bg-card p-6 md:p-7`}>
      <div className={`${hint ? "mb-1" : "mb-3"} flex items-center gap-3`}>
        <Icon className="h-5 w-5 text-[#F96302]" strokeWidth={1.75} aria-hidden="true" />
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{title}</span>
      </div>
      {hint && <p className="mb-3 text-sm text-muted">{hint}</p>}
      {body ? (
        <p className="text-base leading-relaxed text-muted md:text-lg whitespace-pre-line">{body}</p>
      ) : (
        <p className="text-base text-muted">No notes yet.</p>
      )}
    </div>
  );
}
