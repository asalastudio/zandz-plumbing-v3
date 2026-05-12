import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { fetchContact, fetchDeal, validateHubSpotSignature } from "@/lib/hubspot";
import { toE164 } from "@/lib/twilio";
import { randomToken } from "@/lib/url";

/**
 * HubSpot Workflow webhook.
 *
 * Triggered by a HubSpot Workflow when a deal moves to the "Won" stage.
 * For each event we:
 *   1. Validate the HubSpot signature
 *   2. Fetch the deal + primary contact via the CRM API
 *   3. Check the contact's sms_consent flag and opt-out list
 *   4. Schedule a review-request SMS for +48h, between 11am–6pm local
 *   5. Insert into review_requests table
 *
 * HubSpot Workflow payload shape (one or many events):
 *   [
 *     { eventId, subscriptionId, portalId, occurredAt, objectId, propertyName, propertyValue, ... }
 *   ]
 * where objectId is the deal id and propertyValue is the new dealstage id.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ──────────────────────────────────────────────────────────────────────────
// Scheduling: pick a send time +48h, clamped to a 11am–6pm Pacific window
// ──────────────────────────────────────────────────────────────────────────

function scheduleSendAt(jobCompletedAt: Date): Date {
  // 48h after job completed
  const target = new Date(jobCompletedAt.getTime() + 48 * 60 * 60 * 1000);

  // Clamp into the 11am–6pm Pacific window for friendlier delivery.
  // We use the Pacific timezone offset; DST handling is best-effort and
  // assumed-good for this customer base (all East Bay).
  const pacificOffsetMinutes = -7 * 60; // PDT default; PST = -8. Close enough.
  const targetPacific = new Date(target.getTime() + pacificOffsetMinutes * 60 * 1000);
  const hour = targetPacific.getUTCHours();

  if (hour < 11) {
    targetPacific.setUTCHours(11, 0, 0, 0);
  } else if (hour >= 18) {
    targetPacific.setUTCDate(targetPacific.getUTCDate() + 1);
    targetPacific.setUTCHours(11, 0, 0, 0);
  }

  return new Date(targetPacific.getTime() - pacificOffsetMinutes * 60 * 1000);
}

// ──────────────────────────────────────────────────────────────────────────
// Process one HubSpot event
// ──────────────────────────────────────────────────────────────────────────

interface HubSpotEvent {
  eventId?: number;
  objectId: number;
  propertyName?: string;
  propertyValue?: string;
  occurredAt?: number;
}

async function processEvent(event: HubSpotEvent): Promise<{ ok: boolean; reason?: string }> {
  const sb = supabase();

  // Fetch the deal
  const deal = await fetchDeal(String(event.objectId));
  if (!deal) return { ok: false, reason: "deal_not_found" };

  // Skip if not Won (defensive. HubSpot workflow should already filter)
  // Workflow stage ids look like "closedwon" or a numeric id depending on pipeline.
  // We accept the literal "closedwon" or anything that contains "won".
  const stage = (deal.dealstage ?? "").toLowerCase();
  if (!stage.includes("won")) return { ok: true, reason: "skipped_not_won" };

  // Already queued or sent?
  const { data: existing } = await sb
    .from("review_requests")
    .select("id")
    .eq("hubspot_deal_id", deal.id)
    .maybeSingle();

  if (existing) return { ok: true, reason: "already_queued" };

  if (!deal.primaryContactId) return { ok: false, reason: "no_primary_contact" };

  // Fetch the primary contact
  const contact = await fetchContact(deal.primaryContactId);
  if (!contact) return { ok: false, reason: "contact_not_found" };

  if (contact.sms_consent !== true) return { ok: true, reason: "no_consent" };

  if (!contact.phone) return { ok: true, reason: "no_phone" };
  const phoneE164 = toE164(contact.phone);
  if (!phoneE164) return { ok: true, reason: "invalid_phone" };

  // Check global opt-out list
  const { data: optedOut } = await sb
    .from("sms_opt_outs")
    .select("phone_e164")
    .eq("phone_e164", phoneE164)
    .maybeSingle();
  if (optedOut) return { ok: true, reason: "opted_out" };

  // Throttle: max 1 review request per phone per 90 days
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recent } = await sb
    .from("review_requests")
    .select("id")
    .eq("customer_phone_e164", phoneE164)
    .gte("created_at", ninetyDaysAgo)
    .limit(1);
  if (recent && recent.length > 0) return { ok: true, reason: "throttled_90_day" };

  // Schedule
  const customerName = [contact.firstname, contact.lastname]
    .filter(Boolean)
    .join(" ")
    .trim() || "there";

  const jobCompletedAt = event.occurredAt
    ? new Date(event.occurredAt)
    : deal.closedate
      ? new Date(deal.closedate)
      : new Date();

  const scheduledSendAt = scheduleSendAt(jobCompletedAt);
  const clickToken = randomToken();

  const { error } = await sb.from("review_requests").insert({
    hubspot_deal_id: deal.id,
    hubspot_contact_id: contact.id,
    customer_phone_e164: phoneE164,
    customer_name: customerName,
    service_performed: deal.service_interest ?? deal.dealname ?? null,
    job_completed_at: jobCompletedAt.toISOString(),
    scheduled_send_at: scheduledSendAt.toISOString(),
    click_token: clickToken,
  });

  if (error) {
    console.error("[review-request] insert error:", error);
    return { ok: false, reason: error.message };
  }

  return { ok: true, reason: "scheduled" };
}

// ──────────────────────────────────────────────────────────────────────────
// Route handler
// ──────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature =
    req.headers.get("x-hubspot-signature-v3") ?? req.headers.get("x-hubspot-signature");
  const timestamp = req.headers.get("x-hubspot-request-timestamp");
  const url = req.nextUrl.toString();

  // Allow disabling signature check during local dev only (no secret set)
  if (process.env.HUBSPOT_WEBHOOK_SECRET) {
    const valid = validateHubSpotSignature({
      signature,
      body: rawBody,
      timestamp,
      method: "POST",
      url,
    });
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let events: HubSpotEvent[];
  try {
    const parsed = JSON.parse(rawBody);
    events = Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const results = [];
  for (const event of events) {
    if (!event?.objectId) continue;
    try {
      results.push(await processEvent(event));
    } catch (err) {
      console.error("[hubspot-webhook] event error:", err);
      results.push({ ok: false, reason: (err as Error).message });
    }
  }

  return NextResponse.json({ ok: true, processed: results.length, results });
}
