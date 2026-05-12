import { NextRequest, NextResponse } from "next/server";
import { submitLead, type LeadPayload } from "@/lib/hubspot";

export async function POST(req: NextRequest) {
  let body: Partial<LeadPayload>;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { firstName, lastName, email, phone, zip, serviceInterest } = body;

  if (!firstName || !lastName || !email || !phone || !zip || !serviceInterest) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const result = await submitLead(body as LeadPayload);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
