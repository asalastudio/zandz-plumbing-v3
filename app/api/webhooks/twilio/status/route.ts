import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { validateTwilioSignature } from "@/lib/twilio";

/**
 * Twilio message status callback.
 *
 * The review-request sender passes this URL as `statusCallback`, so Twilio
 * reports delivered / undelivered / failed here and we record it against the
 * matching sms_log row. Without it, a carrier rejection (the usual A2P
 * failure) is invisible.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!process.env.TWILIO_AUTH_TOKEN) {
    console.error("[twilio-status] TWILIO_AUTH_TOKEN is not configured");
    return new NextResponse("Twilio not configured", { status: 503 });
  }

  const formData = await req.formData();
  const params: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (typeof value === "string") params[key] = value;
  });

  const valid = validateTwilioSignature(
    req.headers.get("x-twilio-signature"),
    req.nextUrl.toString(),
    params
  );
  if (!valid) {
    console.warn("[twilio-status] invalid signature");
    return new NextResponse("Forbidden", { status: 403 });
  }

  const messageSid = params.MessageSid;
  const messageStatus = params.MessageStatus;
  if (!messageSid || !messageStatus) {
    return NextResponse.json(
      { error: "MessageSid and MessageStatus are required" },
      { status: 400 }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, stored: false });
  }

  const { error } = await supabase()
    .from("sms_log")
    .update({
      status: messageStatus,
      error_code: params.ErrorCode || null,
      error_message: params.ErrorMessage || null,
    })
    .eq("twilio_message_sid", messageSid);

  if (error) {
    console.error("[twilio-status] database update failed", error);
    return NextResponse.json({ error: "Unable to store message status" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, stored: true });
}
