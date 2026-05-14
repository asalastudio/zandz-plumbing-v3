import twilio, { type Twilio } from "twilio";
import { siteSettings } from "@/content/site-settings";
import { digitsOnly, normalizeNanpToE164 } from "@/lib/phone";

/**
 * Twilio client + sending helper.
 *
 * SMS is sent through a Messaging Service (not a bare phone number) so we get
 * A2P 10DLC compliance, failover across phone pools, and per-environment
 * sender selection. The Messaging Service SID is the one piece of Twilio
 * config that has to be set up in the Twilio console.
 */

let cached: Twilio | null = null;

export function twilioClient(): Twilio {
  if (cached) return cached;

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  if (!sid || !token) {
    throw new Error(
      "Twilio env missing. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN before sending SMS."
    );
  }

  cached = twilio(sid, token);
  return cached;
}

export function isTwilioConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_MESSAGING_SERVICE_SID
  );
}

export interface SendSmsArgs {
  to: string;             // E.164 format, e.g. "+15105551234"
  body: string;           // SMS body, must include "Reply STOP to opt out"
  statusCallback?: string; // optional webhook URL for delivery status
}

export interface SendSmsResult {
  ok: boolean;
  sid?: string;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Send an SMS through the configured Messaging Service.
 * Falls back to TWILIO_PHONE_NUMBER if no Messaging Service SID is set (dev/test).
 */
export async function sendSms({ to, body, statusCallback }: SendSmsArgs): Promise<SendSmsResult> {
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!messagingServiceSid && !fromNumber) {
    return {
      ok: false,
      errorMessage:
        "Neither TWILIO_MESSAGING_SERVICE_SID nor TWILIO_PHONE_NUMBER is set.",
    };
  }

  try {
    const client = twilioClient();
    const message = await client.messages.create({
      to,
      body,
      ...(messagingServiceSid
        ? { messagingServiceSid }
        : { from: fromNumber as string }),
      ...(statusCallback ? { statusCallback } : {}),
    });

    return { ok: true, sid: message.sid };
  } catch (err) {
    const error = err as { code?: string; message?: string };
    return {
      ok: false,
      errorCode: error.code,
      errorMessage: error.message ?? "Unknown Twilio error",
    };
  }
}

/**
 * Validate an inbound webhook request from Twilio.
 * Twilio signs each request with X-Twilio-Signature header.
 */
export function validateTwilioSignature(
  signature: string | null,
  url: string,
  params: Record<string, string>
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken || !signature) return false;

  return twilio.validateRequest(authToken, signature, url, params);
}

/**
 * Normalize a US-only phone number to E.164.
 * Best-effort. For non-US numbers, callers should pass already-normalized E.164.
 */
export function toE164(rawPhone: string): string | null {
  if (!rawPhone) return null;
  const normalizedNanp = normalizeNanpToE164(rawPhone);
  if (normalizedNanp) return normalizedNanp;

  const digits = digitsOnly(rawPhone);

  if (rawPhone.trim().startsWith("+") && !digits.startsWith("1") && digits.length >= 10 && digits.length <= 15) {
    return `+${digits}`;
  }

  return null;
}

/**
 * Build the review-request SMS body.
 * Includes the personalization, the click-through link, and the legally
 * required STOP-opt-out instruction.
 */
export function buildReviewRequestBody(args: {
  customerFirstName: string;
  serviceLabel?: string;
  reviewLink: string;
}): string {
  const greeting = `Hi ${args.customerFirstName.split(" ")[0]}, this is Seif at ${siteSettings.name}.`;
  const thanks = args.serviceLabel
    ? `Thanks for having us out for ${args.serviceLabel}.`
    : `Thanks for having us out.`;
  const ask = `If we did right by you, would you leave us a quick Google review? It really helps the crew.`;
  const link = args.reviewLink;
  const optOut = `Reply STOP to opt out.`;

  return `${greeting} ${thanks} ${ask}\n\n${link}\n\n${optOut}`;
}
