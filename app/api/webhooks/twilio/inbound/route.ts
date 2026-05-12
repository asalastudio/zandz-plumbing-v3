import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { validateTwilioSignature, toE164 } from "@/lib/twilio";

/**
 * Twilio inbound SMS webhook.
 *
 * Handles every reply to our Twilio number. Two behaviors:
 *   1. STOP keyword → opt the phone out in our DB (Twilio also handles
 *      opt-out at the carrier level. this is our local record)
 *   2. Any other reply → log it so Jay/Seif can see customer responses
 *
 * Twilio expects a 200 response with a TwiML body (optional reply).
 * We return empty TwiML so Twilio's default STOP/START handling continues.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STOP_KEYWORDS = ["stop", "stopall", "unsubscribe", "cancel", "end", "quit"];
const START_KEYWORDS = ["start", "yes", "unstop"];

function emptyTwiML() {
  return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) return emptyTwiML();

  // Twilio sends application/x-www-form-urlencoded
  const formData = await req.formData();
  const params: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (typeof value === "string") params[key] = value;
  });

  // Validate signature
  const signature = req.headers.get("x-twilio-signature");
  const url = req.nextUrl.toString();
  if (process.env.TWILIO_AUTH_TOKEN) {
    const valid = validateTwilioSignature(signature, url, params);
    if (!valid) {
      console.warn("[twilio-inbound] invalid signature");
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  const from = params.From; // E.164 already from Twilio
  const to = params.To;
  const body = (params.Body ?? "").trim();
  const messageSid = params.MessageSid;

  if (!from || !body) return emptyTwiML();

  const sb = supabase();
  const fromE164 = toE164(from) ?? from;

  // Log the inbound message
  await sb.from("sms_log").insert({
    direction: "inbound",
    from_e164: fromE164,
    to_e164: to,
    body,
    twilio_message_sid: messageSid,
    status: "received",
  });

  const normalized = body.toLowerCase().replace(/[^a-z]/g, "");

  if (STOP_KEYWORDS.includes(normalized)) {
    // Opt out
    await sb
      .from("sms_opt_outs")
      .upsert(
        { phone_e164: fromE164, source: "STOP_keyword" },
        { onConflict: "phone_e164" }
      );

    // Cancel any pending review requests for this number
    await sb
      .from("review_requests")
      .update({
        opted_out_at: new Date().toISOString(),
        cancelled_at: new Date().toISOString(),
        cancellation_reason: "STOP_keyword",
      })
      .eq("customer_phone_e164", fromE164)
      .is("sent_at", null);
  } else if (START_KEYWORDS.includes(normalized)) {
    // Opt back in
    await sb.from("sms_opt_outs").delete().eq("phone_e164", fromE164);
  }

  return emptyTwiML();
}
