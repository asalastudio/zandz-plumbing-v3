import crypto from "node:crypto";

/**
 * HubSpot API client + webhook helpers.
 *
 * Two distinct usages:
 *   1. submitLead. posts to the public Forms API for booking-form intake.
 *      Uses HUBSPOT_PORTAL_ID + HUBSPOT_FORM_ID (no auth).
 *   2. fetchContact / fetchDeal. authenticated CRM API access via a
 *      Private App token (HUBSPOT_PRIVATE_APP_TOKEN). Used by the SMS
 *      review-request flow to enrich the deal with the contact's phone +
 *      consent flag.
 */

const HUBSPOT_API_BASE = "https://api.hubapi.com";

function token(): string {
  const t = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
  if (!t) throw new Error("HUBSPOT_PRIVATE_APP_TOKEN is not set.");
  return t;
}

// ──────────────────────────────────────────────────────────────────────────
// Lead submission (booking form → HubSpot Forms API)
// ──────────────────────────────────────────────────────────────────────────

export interface LeadPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  zip: string;
  serviceInterest: string;
  preferredCallbackTime?: string;
  briefDescription?: string;
  sourcePage?: string;
  smsConsent?: boolean;
}

interface HubSpotField {
  name: string;
  value: string;
}

export async function submitLead(
  payload: LeadPayload
): Promise<{ ok: boolean; error?: string }> {
  const portalId = process.env.HUBSPOT_PORTAL_ID;
  const formId = process.env.HUBSPOT_FORM_ID;

  if (!portalId || !formId) {
    console.warn("[HubSpot] Missing HUBSPOT_PORTAL_ID or HUBSPOT_FORM_ID. lead not submitted");
    return { ok: true };
  }

  const fields: HubSpotField[] = [
    { name: "firstname", value: payload.firstName },
    { name: "lastname", value: payload.lastName },
    { name: "email", value: payload.email },
    { name: "phone", value: payload.phone },
    { name: "zip_code", value: payload.zip },
    { name: "service_interest", value: payload.serviceInterest },
    { name: "preferred_callback_time", value: payload.preferredCallbackTime ?? "" },
    { name: "brief_description", value: payload.briefDescription ?? "" },
    { name: "source_page", value: payload.sourcePage ?? "" },
    {
      name: "sms_consent",
      value: payload.smsConsent === true ? "true" : "false",
    },
  ].filter((f) => f.value !== "");

  try {
    const res = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("[HubSpot] Submission error:", text);
      return { ok: false, error: "Submission failed. Please call us directly." };
    }
    return { ok: true };
  } catch (err) {
    console.error("[HubSpot] Network error:", err);
    return { ok: false, error: "Network error. Please call us directly." };
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Webhook signature validation
// ──────────────────────────────────────────────────────────────────────────

export function validateHubSpotSignature(args: {
  signature: string | null;
  body: string;
  timestamp?: string | null;
  method?: string;
  url?: string;
}): boolean {
  const secret = process.env.HUBSPOT_WEBHOOK_SECRET;
  if (!secret || !args.signature) return false;

  // v3 signature: HMAC-SHA-256(secret, method + url + body + timestamp) → base64
  if (args.timestamp && args.method && args.url) {
    const message = `${args.method}${args.url}${args.body}${args.timestamp}`;
    const computed = crypto
      .createHmac("sha256", secret)
      .update(message)
      .digest("base64");
    if (timingSafeEqual(computed, args.signature)) return true;
  }

  // v2 fallback: HMAC of body only → hex
  const v2 = crypto.createHmac("sha256", secret).update(args.body).digest("hex");
  return timingSafeEqual(v2, args.signature);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

// ──────────────────────────────────────────────────────────────────────────
// CRM API: contact + deal fetchers (used by the SMS review request flow)
// ──────────────────────────────────────────────────────────────────────────

export interface HubSpotContact {
  id: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  email?: string;
  sms_consent?: boolean;
}

export async function fetchContact(contactId: string): Promise<HubSpotContact | null> {
  const properties = "firstname,lastname,phone,email,sms_consent";
  const res = await fetch(
    `${HUBSPOT_API_BASE}/crm/v3/objects/contacts/${contactId}?properties=${properties}`,
    { headers: { Authorization: `Bearer ${token()}` } }
  );

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`HubSpot fetchContact failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const props = data.properties ?? {};
  return {
    id: data.id,
    firstname: props.firstname,
    lastname: props.lastname,
    phone: props.phone,
    email: props.email,
    sms_consent: props.sms_consent === "true" || props.sms_consent === true,
  };
}

export interface HubSpotDeal {
  id: string;
  dealname?: string;
  amount?: string;
  dealstage?: string;
  closedate?: string;
  service_interest?: string;
  primaryContactId?: string;
}

export async function fetchDeal(dealId: string): Promise<HubSpotDeal | null> {
  const properties = "dealname,amount,dealstage,closedate,service_interest";
  const res = await fetch(
    `${HUBSPOT_API_BASE}/crm/v3/objects/deals/${dealId}?properties=${properties}&associations=contacts`,
    { headers: { Authorization: `Bearer ${token()}` } }
  );

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`HubSpot fetchDeal failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const props = data.properties ?? {};
  const primaryContactId = data.associations?.contacts?.results?.[0]?.id;

  return {
    id: data.id,
    dealname: props.dealname,
    amount: props.amount,
    dealstage: props.dealstage,
    closedate: props.closedate,
    service_interest: props.service_interest,
    primaryContactId,
  };
}
