import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type ReviewRequest = {
  id: number;
  customer_name: string;
  customer_phone_e164: string;
  service_performed: string | null;
  scheduled_send_at: string;
  sent_at: string | null;
  link_clicked_at: string | null;
  click_count: number;
  opted_out_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  hubspot_deal_id: string;
};

function maskPhone(phone: string): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return phone;
  return `+•••••${digits.slice(-4)}`;
}

function fmt(date: string | null): string {
  if (!date) return "·";
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

async function loadData() {
  if (!isSupabaseConfigured()) {
    return { configured: false, pending: [], sent: [], opted: [] };
  }
  const sb = supabase();

  const [{ data: pending }, { data: sent }, { data: opted }] = await Promise.all([
    sb
      .from("review_requests")
      .select("*")
      .is("sent_at", null)
      .is("cancelled_at", null)
      .order("scheduled_send_at", { ascending: true })
      .limit(100),
    sb
      .from("review_requests")
      .select("*")
      .not("sent_at", "is", null)
      .order("sent_at", { ascending: false })
      .limit(100),
    sb
      .from("review_requests")
      .select("*")
      .not("opted_out_at", "is", null)
      .order("opted_out_at", { ascending: false })
      .limit(100),
  ]);

  return {
    configured: true,
    pending: (pending ?? []) as ReviewRequest[],
    sent: (sent ?? []) as ReviewRequest[],
    opted: (opted ?? []) as ReviewRequest[],
  };
}

export default async function AdminReviewsPage() {
  const data = await loadData();

  return (
    <div className="pb-24 lg:pb-0">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">
          Review engine
        </p>
        <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
          Review SMS Pipeline
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted md:text-lg">
          Customers who said yes to SMS get a review-request text 48 hours after their job is
          marked Won in HubSpot. Pipeline, sends, and opt-outs all live here.
        </p>
      </header>

      {!data.configured && (
        <div className="border-l-4 border-[#F96302] bg-[#F96302]/10 p-6">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#F96302]">
            Database not connected
          </p>
          <p className="mt-2 text-base text-muted md:text-lg">
            Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment, then re-run the
            migrations. WIRING.md has the steps.
          </p>
        </div>
      )}

      {data.configured && (
        <div className="flex flex-col gap-10">
          <Section
            title="Pending"
            description="Scheduled but not yet sent. Cron sends them at the scheduled time."
            rows={data.pending}
            renderTime={(r) => fmt(r.scheduled_send_at)}
            renderTimeLabel="Send at"
          />
          <Section
            title="Sent"
            description="Already delivered. Click column shows whether the customer tapped the review link."
            rows={data.sent}
            renderTime={(r) => fmt(r.sent_at)}
            renderTimeLabel="Sent at"
            showClicks
          />
          <Section
            title="Opted out"
            description="Customer replied STOP or was excluded. We will not text them again."
            rows={data.opted}
            renderTime={(r) => fmt(r.opted_out_at)}
            renderTimeLabel="Opted at"
            showReason
          />
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  description,
  rows,
  renderTime,
  renderTimeLabel,
  showClicks = false,
  showReason = false,
}: {
  title: string;
  description: string;
  rows: ReviewRequest[];
  renderTime: (r: ReviewRequest) => string;
  renderTimeLabel: string;
  showClicks?: boolean;
  showReason?: boolean;
}) {
  return (
    <section>
      <header className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-black uppercase tracking-tight md:text-3xl">
            {title}
            <span className="ml-3 text-base font-bold text-muted">({rows.length})</span>
          </h2>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
      </header>
      {rows.length === 0 ? (
        <div className="border border-line bg-card px-6 py-8 text-base text-muted">
          Nothing here yet.
        </div>
      ) : (
        <div className="overflow-hidden border border-line">
          <table className="w-full text-left">
            <thead className="bg-card">
              <tr>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  Customer
                </th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  Phone
                </th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  Service
                </th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  {renderTimeLabel}
                </th>
                {showClicks && (
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                    Clicks
                  </th>
                )}
                {showReason && (
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                    Reason
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-line text-base">
                  <td className="px-5 py-4 text-ink">{r.customer_name}</td>
                  <td className="px-5 py-4 text-muted">{maskPhone(r.customer_phone_e164)}</td>
                  <td className="px-5 py-4 text-muted">{r.service_performed ?? "·"}</td>
                  <td className="px-5 py-4 text-muted">{renderTime(r)}</td>
                  {showClicks && (
                    <td className="px-5 py-4 text-muted">
                      {r.link_clicked_at ? (
                        <span className="inline-flex items-center bg-[#F96302]/20 px-2 py-0.5 text-sm font-bold text-[#F96302]">
                          {r.click_count}× clicked
                        </span>
                      ) : (
                        <span className="text-muted">·</span>
                      )}
                    </td>
                  )}
                  {showReason && (
                    <td className="px-5 py-4 text-muted">{r.cancellation_reason ?? "·"}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
