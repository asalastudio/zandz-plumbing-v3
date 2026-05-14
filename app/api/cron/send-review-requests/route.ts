import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sendSms, buildReviewRequestBody, isTwilioConfigured } from "@/lib/twilio";
import { reviewClickUrl, siteOrigin } from "@/lib/url";

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
  // Vercel Cron sets this header automatically when CRON_SECRET is configured
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // dev mode without secret. allow
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
    return NextResponse.json({ ok: true, sent: 0, message: "No due requests" });
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
  return NextResponse.json({ ok: true, sent, total: results.length, results });
}

// Allow POST too in case we want manual trigger from admin UI
export const POST = GET;
