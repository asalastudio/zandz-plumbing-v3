import { NextRequest, NextResponse } from "next/server";
import { ingestLead, type LeadInput } from "@/lib/leads";

export async function POST(req: NextRequest) {
  let body: Partial<LeadInput>;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { firstName, lastName, email, phone, serviceInterest } = body;

  if (!firstName || !lastName || !email || !phone || !serviceInterest) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const result = await ingestLead(body as LeadInput);

  // Log every outcome so failures surface in Vercel logs without blocking the
  // customer-facing response. The customer only needs to know the lead landed
  // somewhere durable (Supabase if configured, HubSpot Forms otherwise).
  console.log("[lead] outcomes", {
    supabaseJobId: result.supabaseJobId,
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

  return NextResponse.json({ ok: true, jobId: result.supabaseJobId });
}
