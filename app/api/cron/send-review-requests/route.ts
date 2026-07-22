import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sendSms, buildReviewRequestBody, isTwilioConfigured } from "@/lib/twilio";
import { reviewClickUrl, siteOrigin } from "@/lib/url";
import {
  scheduleReviewRequestForJob,
  REVIEW_TRIGGER_STATUSES,
} from "@/lib/review-requests";

/**
 * Cron: send any review_requests where scheduled_send_at <= now and not yet sent.
 *
 * Triggered hourly by Vercel Cron. The endpoint is protected by a bearer token
 * (Vercel sets `Authorization: Bearer <CRON_SECRET>` automatically on cron runs).
 *
 * Behavior per row:
 *   - Re-checks opt-out list before sending
 *   - Builds the SMS body with the per-row click token
 *   - Sends via Twilio Messaging Service
 *   - Updates review_requests.sent_at + twilio_message_sid
 *   - Logs into sms_log
 *   - On Twilio failure, leaves sent_at NULL so the next cron retries
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_PER_RUN = 50; // hard cap, prevent runaway sends

function authorize(req: NextRequest): boolean {
  // Vercel Cron sets this header automatically when CRON_SECRET is configured.
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // Fail closed in production: a missing secret must block, not allow, so the
    // endpoint is never anonymously callable once deployed. Allowed only in dev.
    return process.env.NODE_ENV !== "production";
  }
  return auth === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }
  if (!isTwilioConfigured()) {
    return NextResponse.json({ error: "Twilio not configured" }, { status: 500 });
  }

  const sb = supabase();
  const now = new Date().toISOString();

  // Sweep for completed jobs that never got queued.
  //
  // The status route queues a review request the moment a dispatcher marks a
  // job done, but job status is also written directly from lib/invoices.ts
  // (mark-paid, invoice sync) and from the field PWA. Rather than scatter
  // scheduling calls across every mutation site, this sweep self-heals: any
  // finished job with no review_request gets picked up within the hour.
  const swept = await sweepUnqueuedJobs(sb);

  // Pull due requests
  const { data: due, error } = await sb
    .from("review_requests")
    .select("*")
    .is("sent_at", null)
    .is("cancelled_at", null)
    .is("opted_out_at", null)
    .lte("scheduled_send_at", now)
    .order("scheduled_send_at", { ascending: true })
    .limit(MAX_PER_RUN);

  if (error) {
    console.error("[cron] fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!due || due.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, swept, message: "No due requests" });
  }

  const results: Array<{ id: number; ok: boolean; reason?: string }> = [];

  for (const r of due) {
    // Re-check opt-out (could have happened after scheduling)
    const { data: opt } = await sb
      .from("sms_opt_outs")
      .select("phone_e164")
      .eq("phone_e164", r.customer_phone_e164)
      .maybeSingle();

    if (opt) {
      await sb
        .from("review_requests")
        .update({
          opted_out_at: new Date().toISOString(),
          cancelled_at: new Date().toISOString(),
          cancellation_reason: "opted_out_before_send",
        })
        .eq("id", r.id);
      results.push({ id: r.id, ok: true, reason: "opted_out_before_send" });
      continue;
    }

    const clickUrl = reviewClickUrl(r.click_token);
    const body = buildReviewRequestBody({
      customerFirstName: r.customer_name,
      serviceLabel: r.service_performed ?? undefined,
      reviewLink: clickUrl,
    });

    const sendResult = await sendSms({
      to: r.customer_phone_e164,
      body,
      statusCallback: `${siteOrigin()}/api/webhooks/twilio/status`,
    });

    // Log every send attempt
    await sb.from("sms_log").insert({
      direction: "outbound",
      from_e164: process.env.TWILIO_PHONE_NUMBER ?? "messaging_service",
      to_e164: r.customer_phone_e164,
      body,
      twilio_message_sid: sendResult.sid ?? null,
      status: sendResult.ok ? "queued" : "failed",
      error_code: sendResult.errorCode ?? null,
      error_message: sendResult.errorMessage ?? null,
      related_review_request_id: r.id,
    });

    if (sendResult.ok) {
      await sb
        .from("review_requests")
        .update({
          sent_at: new Date().toISOString(),
          twilio_message_sid: sendResult.sid,
        })
        .eq("id", r.id);
      results.push({ id: r.id, ok: true });
    } else {
      // Don't mark sent_at. next cron will retry
      console.error(
        `[cron] send failed for review_request ${r.id}:`,
        sendResult.errorCode,
        sendResult.errorMessage
      );
      results.push({ id: r.id, ok: false, reason: sendResult.errorMessage });
    }
  }

  const sent = results.filter((r) => r.ok).length;
  return NextResponse.json({ ok: true, sent, swept, total: results.length, results });
}

/**
 * Queue review requests for finished jobs that don't have one yet.
 *
 * Bounded to jobs finished in the last 7 days so a backlog of historical work
 * can never suddenly text a few hundred old customers on first run.
 */
async function sweepUnqueuedJobs(
  sb: ReturnType<typeof supabase>
): Promise<{ queued: number; considered: number }> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: finished, error } = await sb
    .from("jobs")
    .select("id, updated_at")
    .in("status", REVIEW_TRIGGER_STATUSES as unknown as string[])
    .gte("updated_at", since)
    .limit(MAX_PER_RUN);

  if (error || !finished?.length) {
    if (error) console.error("[cron] sweep fetch error:", error);
    return { queued: 0, considered: 0 };
  }

  let queued = 0;
  for (const job of finished) {
    try {
      const res = await scheduleReviewRequestForJob(
        job.id as number,
        job.updated_at ? new Date(job.updated_at as string) : new Date()
      );
      if (res.ok && "scheduled" in res && res.scheduled) queued++;
    } catch (err) {
      console.error("[cron] sweep failed for job", job.id, err);
    }
  }

  return { queued, considered: finished.length };
}

// Allow POST too in case we want manual trigger from admin UI
export const POST = GET;
