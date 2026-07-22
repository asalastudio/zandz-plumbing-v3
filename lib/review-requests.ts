/**
 * Review-request scheduling.
 *
 * Previously this only ever happened inside the HubSpot workflow webhook: a
 * deal moved to "Closed won", HubSpot POSTed us, and we queued a review text.
 * With HubSpot dropped, that trigger is gone and nothing was creating
 * review_requests rows at all — the whole review engine was orphaned.
 *
 * The OS now triggers it directly: when a job reaches a done state, we queue
 * the request here. Everything downstream (the hourly cron, the /r/[token]
 * click tracker, STOP handling) already worked and is untouched.
 *
 * Guards, in order — each one is a reason a customer should not be texted:
 *   1. Job must have a consented phone number
 *   2. Not on the global opt-out list (a STOP reply beats any prior consent)
 *   3. Not already queued for this job
 *   4. Not texted for any job in the last 90 days
 */

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { hasSmsConsent } from "@/lib/sms-consent";
import { randomToken } from "@/lib/url";
import { pacificYmd, pacificHour, pacificWallClock } from "@/lib/time";

/** Job statuses that mean the work is done and a review is fair to ask for. */
export const REVIEW_TRIGGER_STATUSES = ["complete", "invoiced", "paid"] as const;

const DELAY_HOURS = 48;
const WINDOW_OPEN_HOUR = 11; // 11am Pacific
const WINDOW_CLOSE_HOUR = 18; // 6pm Pacific
const THROTTLE_DAYS = 90;

/**
 * Pick a send time: +48h from completion, clamped into an 11am-6pm Pacific
 * window so nobody gets a review request at 3am.
 */
export function scheduleSendAt(jobCompletedAt: Date): Date {
  const target = new Date(jobCompletedAt.getTime() + DELAY_HOURS * 60 * 60 * 1000);
  const hour = pacificHour(target);

  if (hour >= WINDOW_OPEN_HOUR && hour < WINDOW_CLOSE_HOUR) return target;

  const { year, month, day } = pacificYmd(target);

  if (hour < WINDOW_OPEN_HOUR) {
    // Too early — same Pacific day, when the window opens.
    return pacificWallClock(year, month, day, WINDOW_OPEN_HOUR);
  }

  // Too late — roll to the next Pacific day. Do the calendar arithmetic on a
  // UTC date so month and year ends carry correctly.
  const cal = new Date(Date.UTC(year, month - 1, day));
  cal.setUTCDate(cal.getUTCDate() + 1);
  return pacificWallClock(
    cal.getUTCFullYear(),
    cal.getUTCMonth() + 1,
    cal.getUTCDate(),
    WINDOW_OPEN_HOUR
  );
}

export type ScheduleResult =
  | { ok: true; scheduled: true; reviewRequestId: number; sendAt: string }
  | { ok: true; scheduled: false; reason: string }
  | { ok: false; reason: string };

/**
 * Queue a review request for a completed job. Safe to call repeatedly — the
 * per-job guard makes it idempotent, so a job bounced between statuses does
 * not queue twice.
 */
export async function scheduleReviewRequestForJob(
  jobId: number,
  completedAt: Date = new Date()
): Promise<ScheduleResult> {
  if (!isSupabaseConfigured()) {
    return { ok: true, scheduled: false, reason: "supabase_not_configured" };
  }

  const sb = supabase();

  const { data: job, error: jobErr } = await sb
    .from("jobs")
    .select("id, service_label, service_type, customer_id, customers(id, name, phone_e164)")
    .eq("id", jobId)
    .maybeSingle();

  if (jobErr) return { ok: false, reason: `job lookup: ${jobErr.message}` };
  if (!job) return { ok: false, reason: "job_not_found" };

  // Supabase types the embedded relation as an array or object depending on
  // the shape of the join, so normalize before reading it.
  const customer = Array.isArray(job.customers) ? job.customers[0] : job.customers;
  const phoneE164: string | undefined = customer?.phone_e164 ?? undefined;
  if (!phoneE164) return { ok: true, scheduled: false, reason: "no_phone" };

  // 1 + 2. Consent, and no STOP on record.
  if (!(await hasSmsConsent(phoneE164))) {
    return { ok: true, scheduled: false, reason: "no_consent_or_opted_out" };
  }

  // 3. Already queued for this job?
  const { data: existing } = await sb
    .from("review_requests")
    .select("id")
    .eq("job_id", jobId)
    .maybeSingle();
  if (existing) return { ok: true, scheduled: false, reason: "already_queued" };

  // 4. Throttle — at most one review ask per phone per 90 days, across all jobs.
  const cutoff = new Date(
    Date.now() - THROTTLE_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();
  const { data: recent } = await sb
    .from("review_requests")
    .select("id")
    .eq("customer_phone_e164", phoneE164)
    .gte("created_at", cutoff)
    .limit(1);
  if (recent && recent.length > 0) {
    return { ok: true, scheduled: false, reason: "throttled_90_day" };
  }

  const sendAt = scheduleSendAt(completedAt);

  const { data: inserted, error: insErr } = await sb
    .from("review_requests")
    .insert({
      job_id: jobId,
      customer_id: customer?.id ?? job.customer_id ?? null,
      customer_phone_e164: phoneE164,
      customer_name: customer?.name || "there",
      service_performed: job.service_label ?? job.service_type ?? null,
      job_completed_at: completedAt.toISOString(),
      scheduled_send_at: sendAt.toISOString(),
      click_token: randomToken(),
    })
    .select("id")
    .single();

  if (insErr) return { ok: false, reason: `insert: ${insErr.message}` };

  return {
    ok: true,
    scheduled: true,
    reviewRequestId: inserted.id as number,
    sendAt: sendAt.toISOString(),
  };
}
