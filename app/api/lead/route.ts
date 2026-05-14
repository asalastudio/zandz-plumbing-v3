import { NextRequest, NextResponse } from "next/server";
import { ingestLead, type LeadInput } from "@/lib/leads";
import { isUploadablePhoto, saveJobPhoto } from "@/lib/job-photos";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: Partial<LeadInput>;
  let photo: File | null = null;

  try {
    if (req.headers.get("content-type")?.includes("multipart/form-data")) {
      const form = await req.formData();
      body = leadInputFromForm(form);
      const photoValue = form.get("photo");
      photo = photoValue instanceof File ? photoValue : null;
    } else {
      body = await req.json();
    }
  } catch {
    return NextResponse.json({ error: "Invalid lead request" }, { status: 400 });
  }

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
      photoOutcome = `err: ${(err as Error).message}`;
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
    smsConsent: booleanFromForm(form, "smsConsent"),
    outOfArea: booleanFromForm(form, "outOfArea"),
  };
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
