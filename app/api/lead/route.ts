import { NextRequest, NextResponse } from "next/server";
import { ingestLead, type LeadInput } from "@/lib/leads";
import { HONEYPOT_FIELD } from "@/lib/honeypot";
import { isUploadablePhoto, saveJobPhoto } from "@/lib/job-photos";

export const runtime = "nodejs";

// Generous caps. They exist to stop junk payloads, not to trim real requests.
const FIELD_LIMITS: Partial<Record<keyof LeadInput, number>> = {
  firstName: 80,
  lastName: 80,
  email: 254,
  phone: 32,
  zip: 10,
  jobAddress: 200,
  jobCity: 80,
  serviceInterest: 80,
  serviceLabel: 120,
  preferredCallbackTime: 80,
  briefDescription: 2000,
  sourcePage: 200,
  serviceAreaSlug: 80,
};

export async function POST(req: NextRequest) {
  let body: Partial<LeadInput>;
  let photo: File | null = null;
  let honeypot = "";

  try {
    if (req.headers.get("content-type")?.includes("multipart/form-data")) {
      const form = await req.formData();
      body = leadInputFromForm(form);
      honeypot = stringOrUndefined(form, HONEYPOT_FIELD) ?? "";
      const photoValue = form.get("photo");
      photo = photoValue instanceof File ? photoValue : null;
    } else {
      const json = await req.json();
      honeypot = typeof json?.[HONEYPOT_FIELD] === "string" ? json[HONEYPOT_FIELD].trim() : "";
      body = json;
    }
  } catch {
    return NextResponse.json({ error: "Invalid lead request" }, { status: 400 });
  }

  if (honeypot) {
    console.warn("[lead] honeypot tripped, dropping submission");
    return NextResponse.json({ ok: true });
  }

  body = capFieldLengths(body);

  const { firstName, lastName, email, phone, serviceInterest } = body;

  if (!firstName || !lastName || !email || !phone || !serviceInterest) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const result = await ingestLead(body as LeadInput);

  let photoOutcome = "none";
  if (result.ok && result.supabaseJobId && isUploadablePhoto(photo)) {
    try {
      await saveJobPhoto({
        jobId: result.supabaseJobId,
        file: photo,
        category: "before",
        caption: "Customer uploaded with web lead",
      });
      photoOutcome = "ok";
    } catch (err) {
      // Logged in full below; the customer only learns that it failed.
      photoOutcome = "failed";
      console.error("[lead] photo upload failed", err);
    }
  }

  // Log every outcome so failures surface in Vercel logs without blocking the
  // customer-facing response. The customer only needs to know the lead landed
  // somewhere durable (Supabase if configured, HubSpot Forms otherwise).
  console.log("[lead] outcomes", {
    supabaseJobId: result.supabaseJobId,
    photo: photoOutcome,
    outcomes: Object.fromEntries(
      Object.entries(result.outcomes).map(([k, v]) => [k, v.ok ? (v.skipped ? "skipped" : "ok") : `err: ${v.detail}`])
    ),
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: "We couldn't save your request. Please call us directly." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, jobId: result.supabaseJobId, photo: photoOutcome });
}

function leadInputFromForm(form: FormData): Partial<LeadInput> {
  return {
    firstName: stringOrUndefined(form, "firstName"),
    lastName: stringOrUndefined(form, "lastName"),
    email: stringOrUndefined(form, "email"),
    phone: stringOrUndefined(form, "phone"),
    zip: stringOrUndefined(form, "zip"),
    jobAddress: stringOrUndefined(form, "jobAddress"),
    jobCity: stringOrUndefined(form, "jobCity"),
    serviceInterest: stringOrUndefined(form, "serviceInterest"),
    serviceLabel: stringOrUndefined(form, "serviceLabel"),
    preferredCallbackTime: stringOrUndefined(form, "preferredCallbackTime"),
    briefDescription: stringOrUndefined(form, "briefDescription"),
    sourcePage: stringOrUndefined(form, "sourcePage"),
    serviceAreaSlug: stringOrUndefined(form, "serviceAreaSlug"),
    // Absent means the form never asked, which must not overwrite an earlier
    // answer in the consent ledger.
    smsConsent: form.has("smsConsent") ? booleanFromForm(form, "smsConsent") : undefined,
    outOfArea: booleanFromForm(form, "outOfArea"),
  };
}

function capFieldLengths(body: Partial<LeadInput>): Partial<LeadInput> {
  const capped: Partial<LeadInput> = { ...body };
  for (const [key, limit] of Object.entries(FIELD_LIMITS) as [keyof LeadInput, number][]) {
    const value = capped[key];
    if (typeof value === "string" && value.length > limit) {
      (capped as Record<string, unknown>)[key] = value.slice(0, limit);
    }
  }
  // JSON callers can send anything; only a real boolean counts as consent.
  if (capped.smsConsent !== undefined && typeof capped.smsConsent !== "boolean") {
    capped.smsConsent = (capped.smsConsent as unknown) === "true";
  }
  return capped;
}

function stringOrUndefined(form: FormData, key: string): string | undefined {
  const value = form.get(key);
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function booleanFromForm(form: FormData, key: string): boolean {
  const value = form.get(key);
  return value === "true" || value === "1" || value === "on";
}
