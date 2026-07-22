import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sendSms, isTwilioConfigured } from "@/lib/twilio";
import { dispatchPhones } from "@/lib/lead-sms";
import { sendEmail, renderEmailLayout, escapeHtml } from "@/lib/email";
import { isBusinessHours, businessOpeningFor } from "@/lib/time";
import { siteOrigin } from "@/lib/url";

/**
 * Cron: chase leads that nobody has touched yet.
 *
 * Speed-to-lead is the whole point of this system — a plumbing lead that sits
 * for an hour is usually a lead that called someone else. A single "new lead"
 * text is easy to miss when you're under a sink, so this walks an escalation
 * ladder until somebody actually opens the job.
 *
 * Rungs (minutes in status=new, from LEAD_ESCALATION_MINUTES, default 5/15/30):
 *   1. Re-text every dispatcher
 *   2. Re-text + email the dispatch inbox
 *   3. Email + flag the job as an SLA breach on the dashboard
 *
 * Idempotent via jobs.sla_alert_level, so a job never gets the same rung twice
 * no matter how often this runs.
 *
 * Quiet hours: routine leads only escalate during staffed hours (Mon-Fri
 * 7am-5pm Pacific) and their clock starts at opening if they arrived
 * overnight. Emergency leads escalate around the clock, because that is the
 * service Z and Z advertises.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DEFAULT_RUNGS = [5, 15, 30];
const MAX_PER_RUN = 25;

function authorize(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // Fail closed in production, same as the review cron. An unauthenticated
    // endpoint that sends texts is not something to leave open.
    return process.env.NODE_ENV !== "production";
  }
  return auth === `Bearer ${secret}`;
}

function rungThresholds(): number[] {
  const raw = process.env.LEAD_ESCALATION_MINUTES;
  if (!raw) return DEFAULT_RUNGS;

  const parsed = raw
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);

  if (parsed.length === 0) return DEFAULT_RUNGS;
  return parsed.sort((a, b) => a - b);
}

function isEmergency(job: { service_type?: string | null; service_label?: string | null }): boolean {
  const haystack = `${job.service_type ?? ""} ${job.service_label ?? ""}`.toLowerCase();
  return haystack.includes("emergency") || haystack.includes("urgent");
}

export async function GET(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (process.env.LEAD_ESCALATION_ENABLED === "off") {
    return NextResponse.json({ ok: true, skipped: "disabled" });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const rungs = rungThresholds();
  const now = new Date();
  const openHours = isBusinessHours(now);
  const sb = supabase();

  // Anything still sitting in 'new' past the first rung is a candidate. The
  // partial index jobs_awaiting_contact covers exactly this query.
  const oldest = new Date(now.getTime() - rungs[0] * 60 * 1000).toISOString();

  const { data: waiting, error } = await sb
    .from("jobs")
    .select(
      "id, created_at, service_type, service_label, job_city, job_zip, sla_alert_level, customers(name, phone_e164)"
    )
    .eq("status", "new")
    .is("first_contact_at", null)
    .lte("created_at", oldest)
    .order("created_at", { ascending: true })
    .limit(MAX_PER_RUN);

  if (error) {
    console.error("[escalation] fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!waiting?.length) {
    return NextResponse.json({ ok: true, escalated: 0, message: "Nothing waiting" });
  }

  const escalations: Array<{ jobId: number; rung: number; actions: string[] }> = [];

  for (const job of waiting) {
    const emergency = isEmergency(job);

    // Routine leads rest outside office hours; emergencies never do.
    if (!emergency && !openHours) continue;

    const createdAt = new Date(job.created_at as string);

    // A lead that landed overnight shouldn't arrive Monday already three rungs
    // deep. Start its clock at opening instead of at submission.
    const clockStart =
      emergency || isBusinessHours(createdAt)
        ? createdAt
        : new Date(Math.max(createdAt.getTime(), businessOpeningFor(now).getTime()));

    const waitingMinutes = Math.floor((now.getTime() - clockStart.getTime()) / 60000);
    if (waitingMinutes < rungs[0]) continue;

    const targetRung = rungs.filter((m) => waitingMinutes >= m).length;
    const currentRung = (job.sla_alert_level as number) ?? 0;
    if (targetRung <= currentRung) continue;

    const customer = Array.isArray(job.customers) ? job.customers[0] : job.customers;
    const actions = await fireRung({
      rung: targetRung,
      jobId: job.id as number,
      customerName: customer?.name ?? "Unknown",
      customerPhone: customer?.phone_e164 ?? "no phone",
      serviceLabel: job.service_label ?? job.service_type ?? "Service request",
      city: job.job_city ?? job.job_zip ?? "",
      waitingMinutes,
      emergency,
    });

    await sb
      .from("jobs")
      .update({
        sla_alert_level: targetRung,
        last_sla_alert_at: now.toISOString(),
      })
      .eq("id", job.id);

    escalations.push({ jobId: job.id as number, rung: targetRung, actions });
  }

  if (escalations.length) {
    console.log("[escalation] fired", escalations);
  }

  return NextResponse.json({
    ok: true,
    escalated: escalations.length,
    considered: waiting.length,
    openHours,
    escalations,
  });
}

interface RungInput {
  rung: number;
  jobId: number;
  customerName: string;
  customerPhone: string;
  serviceLabel: string;
  city: string;
  waitingMinutes: number;
  emergency: boolean;
}

async function fireRung(input: RungInput): Promise<string[]> {
  const actions: string[] = [];
  const jobUrl = `${siteOrigin()}/admin/jobs/${input.jobId}`;
  const flag = input.emergency ? "🚨 EMERGENCY" : "⏰";
  const headline =
    `${flag} Lead waiting ${input.waitingMinutes} min: ${input.customerName} — ` +
    `${input.serviceLabel}${input.city ? ` — ${input.city}` : ""}. ` +
    `Call ${input.customerPhone}.`;

  // Rungs 1 and 2 both re-text. Nobody has picked this up, so the text is the
  // fastest thing that will reach a plumber in a crawlspace.
  if (input.rung <= 2 && isTwilioConfigured()) {
    const { valid } = dispatchPhones();
    if (valid.length) {
      await Promise.all(
        valid.map((to) => sendSms({ to, body: `${headline} ${jobUrl}` }))
      );
      actions.push(`sms:${valid.length}`);
    }
  }

  // Rung 2 and up also emails, so there's a durable record beyond a text that
  // scrolled away.
  if (input.rung >= 2) {
    const to = process.env.DISPATCH_EMAIL;
    if (to) {
      const breached = input.rung >= 3;
      const html = renderEmailLayout({
        eyebrow: breached ? "SLA breach" : "Lead still waiting",
        heading: `${input.waitingMinutes} minutes, no contact`,
        headingSub: `${escapeHtml(input.customerName)} — ${escapeHtml(input.serviceLabel)}`,
        preheader: headline,
        bodyHtml: `
          <p style="margin:0 0 16px 0;">
            This lead came in ${input.waitingMinutes} minutes ago and still has
            no first contact recorded.
          </p>
          <p style="margin:0 0 8px 0;"><strong>Customer:</strong> ${escapeHtml(input.customerName)}</p>
          <p style="margin:0 0 8px 0;"><strong>Phone:</strong> ${escapeHtml(input.customerPhone)}</p>
          <p style="margin:0 0 8px 0;"><strong>Service:</strong> ${escapeHtml(input.serviceLabel)}</p>
          ${input.city ? `<p style="margin:0 0 8px 0;"><strong>Where:</strong> ${escapeHtml(input.city)}</p>` : ""}
          <p style="margin:16px 0 0 0;"><a href="${jobUrl}">Open the job</a></p>
        `,
      });

      await sendEmail({
        to: to.split(",").map((s) => s.trim()).filter(Boolean),
        subject: breached
          ? `SLA BREACH: ${input.customerName} waiting ${input.waitingMinutes} min`
          : `Still waiting: ${input.customerName} — ${input.serviceLabel}`,
        html,
        text: `${headline}\n\n${jobUrl}`,
      });
      actions.push("email");
    }
  }

  if (input.rung >= 3) actions.push("sla_breach_flag");

  return actions;
}

export const POST = GET;
