/**
 * SMS inbox.
 *
 * Inbound texts already land in sms_log via the Twilio webhook, but until now
 * nobody could read them — a customer replying to a review request or a
 * dispatch text was texting into a void. This groups sms_log into conversation
 * threads by the counterparty's phone so an operator can read and reply.
 *
 * Read-only lib (listing/reading); replies go through sendReply.
 */

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sendSms, isTwilioConfigured, toE164 } from "@/lib/twilio";

export interface SmsMessage {
  id: number;
  direction: "inbound" | "outbound";
  body: string;
  status: string | null;
  createdAt: string;
}

export interface SmsThreadSummary {
  phoneE164: string;
  customerName: string | null;
  customerId: number | null;
  lastBody: string;
  lastDirection: "inbound" | "outbound";
  lastAt: string;
  messageCount: number;
}

/** The customer's number on a row is `from` when they texted us, else `to`. */
function counterparty(row: { direction: string; from_e164: string; to_e164: string }): string {
  return row.direction === "inbound" ? row.from_e164 : row.to_e164;
}

export async function listThreads(limit = 100): Promise<SmsThreadSummary[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase()
    .from("sms_log")
    .select("id, direction, from_e164, to_e164, body, created_at")
    .order("created_at", { ascending: false })
    .limit(2000);
  if (error || !data) return [];

  const threads = new Map<string, SmsThreadSummary>();
  for (const row of data) {
    const phone = counterparty(row as { direction: string; from_e164: string; to_e164: string });
    const existing = threads.get(phone);
    if (!existing) {
      threads.set(phone, {
        phoneE164: phone,
        customerName: null,
        customerId: null,
        lastBody: String(row.body ?? ""),
        lastDirection: row.direction as "inbound" | "outbound",
        lastAt: String(row.created_at ?? ""),
        messageCount: 1,
      });
    } else {
      existing.messageCount += 1;
    }
  }

  const list = [...threads.values()].slice(0, limit);

  // Resolve customer names in one query.
  const phones = list.map((t) => t.phoneE164);
  if (phones.length) {
    const { data: customers } = await supabase()
      .from("customers")
      .select("id, name, phone_e164")
      .in("phone_e164", phones);
    const byPhone = new Map(
      (customers ?? []).map((c) => [String(c.phone_e164), { id: Number(c.id), name: String(c.name) }])
    );
    for (const t of list) {
      const c = byPhone.get(t.phoneE164);
      if (c) {
        t.customerId = c.id;
        t.customerName = c.name;
      }
    }
  }

  return list;
}

export async function getThread(phoneE164: string): Promise<{
  phoneE164: string;
  customerName: string | null;
  customerId: number | null;
  messages: SmsMessage[];
}> {
  const empty = { phoneE164, customerName: null, customerId: null, messages: [] as SmsMessage[] };
  if (!isSupabaseConfigured()) return empty;

  const { data, error } = await supabase()
    .from("sms_log")
    .select("id, direction, from_e164, to_e164, body, status, created_at")
    .or(`from_e164.eq.${phoneE164},to_e164.eq.${phoneE164}`)
    .order("created_at", { ascending: true })
    .limit(500);
  if (error || !data) return empty;

  const messages: SmsMessage[] = data.map((r) => ({
    id: Number(r.id),
    direction: r.direction as "inbound" | "outbound",
    body: String(r.body ?? ""),
    status: (r.status as string | null) ?? null,
    createdAt: String(r.created_at ?? ""),
  }));

  const { data: customer } = await supabase()
    .from("customers")
    .select("id, name")
    .eq("phone_e164", phoneE164)
    .maybeSingle();

  return {
    phoneE164,
    customerName: customer ? String(customer.name) : null,
    customerId: customer ? Number(customer.id) : null,
    messages,
  };
}

export interface ReplyResult {
  ok: boolean;
  error?: string;
}

/** Send an operator reply to a thread and log it. */
export async function sendReply(phoneE164: string, body: string): Promise<ReplyResult> {
  const to = toE164(phoneE164);
  if (!to) return { ok: false, error: "Invalid phone number." };
  const text = body.trim();
  if (!text) return { ok: false, error: "Message is empty." };

  if (!isTwilioConfigured()) {
    return { ok: false, error: "Twilio is not configured yet, so replies can't send." };
  }

  const res = await sendSms({ to, body: text });

  // Log the outbound either way so the thread reflects the attempt.
  if (isSupabaseConfigured()) {
    const from = process.env.TWILIO_PHONE_NUMBER ?? "";
    await supabase()
      .from("sms_log")
      .insert({
        direction: "outbound",
        from_e164: from,
        to_e164: to,
        body: text,
        twilio_message_sid: res.sid ?? null,
        status: res.ok ? "sent" : "failed",
        error_message: res.errorMessage ?? null,
      })
      .then(undefined, (e) => console.error("[sms-inbox] log failed:", e));
  }

  return { ok: res.ok, error: res.errorMessage };
}
