import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Phone, MapPin, Calendar, User, FileText, AlertTriangle, Camera, CreditCard, Send, CheckCircle2, Pencil, FileSignature } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  getJob,
  listCrew,
  STATUS_LABEL,
  STATUS_COLOR,
  STATUS_TRANSITIONS,
  formatDateTime,
  formatMoney,
} from "@/lib/db";
import { DeleteJobButton } from "../../_components/DeleteJobButton";
import { DeleteInvoiceButton } from "../../_components/DeleteInvoiceButton";
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
  searchParams: Promise<{ error?: string; photo?: string; updated?: string; invoice?: string }>;
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
  const transitions =
    job.status === "new"
      ? STATUS_TRANSITIONS[job.status].filter((status) => status !== "scheduled")
      : STATUS_TRANSITIONS[job.status];

  return (
    <div className="pb-24 lg:pb-0">
      <Link
        href="/admin/jobs"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted hover:text-[#F96302]"
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
        <div className="flex flex-wrap gap-2 self-start md:self-auto">
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
      </header>

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

      {query.error === "has_invoice" && (
        <div className="mb-8 border border-red-200 bg-red-50 p-5 text-base text-red-800">
          This job has invoice records attached, so it is protected from deletion.
        </div>
      )}

      {query.error && query.error !== "has_invoice" && (
        <div className="mb-8 border border-red-200 bg-red-50 p-5 text-base text-red-800">
          We could not complete that job action. Please try again.
        </div>
      )}

      {query.photo === "1" && (
        <div className="mb-8 border border-emerald-200 bg-emerald-50 p-5 text-base text-emerald-800">
          Photo added.
        </div>
      )}

      {(query.photo === "missing" || query.photo === "error") && (
        <div className="mb-8 border border-red-200 bg-red-50 p-5 text-base text-red-800">
          We could not add that photo. Use an image under 8MB.
        </div>
      )}

      {query.invoice && <InvoiceFlash status={query.invoice} />}

      {job.status === "new" && (
        <section className="mb-8 border-l-4 border-[#F96302] bg-[#F96302]/10 p-5 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-[#F96302]">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                New lead waiting
              </p>
              <p className="mt-2 text-base text-muted">
                Call the customer, then use the schedule block below once it becomes real work.
              </p>
            </div>
            {job.customer?.phone_e164 && (
              <a
                href={`tel:${job.customer.phone_e164}`}
                className="inline-flex items-center justify-center gap-2 bg-[#F96302] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-[#e05602]"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                Call lead
              </a>
            )}
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

      <form action={`/api/admin/jobs/${id}/schedule`} method="POST" className="mb-8">
        <ScheduleTimeFields
          initialStart={job.scheduled_start}
          initialEnd={job.scheduled_end}
          description={
            job.status === "new"
              ? "Pick the appointment window after the first callback. Saving a start time moves this lead to Scheduled."
              : "Update the appointment window without changing the rest of the job."
          }
          scheduledBadge={job.status === "new" ? "Will move to scheduled" : "Schedule selected"}
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

      {/* Top cards */}
      <section className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card icon={User} label="Customer">
          {job.customer ? (
            <Link href={`/admin/customers/${job.customer.id}`} className="text-ink hover:text-[#F96302]">
              {job.customer.name}
              {job.customer.phone_e164 && (
                <span className="block text-sm text-muted mt-1">{job.customer.phone_e164}</span>
              )}
            </Link>
          ) : (
            <span className="text-muted">·</span>
          )}
        </Card>
        <Card icon={Calendar} label="Scheduled">
          <span className="text-ink">{formatDateTime(job.scheduled_start)}</span>
          {job.scheduled_end && (
            <span className="block text-sm text-muted mt-1">to {formatDateTime(job.scheduled_end)}</span>
          )}
        </Card>
        <Card icon={MapPin} label="Address">
          {job.job_address || job.customer?.street_address ? (
            <span className="text-ink">
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
            <span className="text-muted">·</span>
          )}
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

      {/* Money */}
      <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
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

      <InvoiceSection
        jobId={job.id}
        invoices={invoices}
        defaultDescription={`${job.service_label ?? job.service_type} service`}
        defaultAmountCents={job.final_amount_cents ?? job.estimated_amount_cents}
        customerEmail={job.customer?.email ?? null}
        canInvoice={["complete", "invoiced", "paid"].includes(job.status)}
      />

      {/* Notes */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <NotesCard title="Customer-facing notes" body={job.customer_notes} icon={FileText} />
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

function InvoiceFlash({ status }: { status: string }) {
  const isGood = ["created", "sent", "paid", "deleted"].includes(status);
  const message: Record<string, string> = {
    created: "Invoice created. You can send it when the customer is ready.",
    sent: "Invoice sent to the customer.",
    paid: "Invoice marked paid.",
    deleted: "Invoice deleted.",
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
  canInvoice,
}: {
  jobId: number;
  invoices: InvoiceRecord[];
  defaultDescription: string;
  defaultAmountCents: number | null;
  customerEmail: string | null;
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
            Add an email address to the customer profile before sending invoices by email.
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
                      {/* Send is the primary action on an unsent invoice —
                          orange and unmistakable. Becomes a quiet "Resend" once
                          it's already gone out. */}
                      <form action={`/api/admin/invoices/${invoice.id}/send`} method="POST">
                        <button
                          type="submit"
                          className={
                            invoice.sent_at
                              ? "inline-flex items-center gap-2 border border-line bg-card px-4 py-2 text-sm font-bold uppercase tracking-wide text-ink hover:border-[#F96302] hover:text-[#F96302]"
                              : "inline-flex items-center gap-2 bg-[#F96302] px-5 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-[#e05602]"
                          }
                        >
                          <Send className="h-4 w-4" aria-hidden="true" />
                          {invoice.sent_at ? "Resend" : "Email invoice"}
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
                          className="border border-line bg-card px-3 py-2 text-sm text-ink outline-none focus:border-[#F96302]"
                        >
                          <option value="manual">Manual</option>
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
                  <DeleteInvoiceButton invoiceId={invoice.id} next={`/admin/jobs/${jobId}`} compact />
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
    <div className={`border ${highlight ? "border-l-4 border-[#F96302]" : "border-line"} bg-card p-6 md:p-7`}>
      <div className="mb-3 flex items-center gap-3">
        <Icon className="h-5 w-5 text-[#F96302]" strokeWidth={1.75} aria-hidden="true" />
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{title}</span>
      </div>
      {body ? (
        <p className="text-base leading-relaxed text-muted md:text-lg whitespace-pre-line">{body}</p>
      ) : (
        <p className="text-base text-muted">No notes yet.</p>
      )}
    </div>
  );
}
