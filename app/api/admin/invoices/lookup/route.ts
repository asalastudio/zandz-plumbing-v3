import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { getCustomerJobs, listCustomers, STATUS_LABEL, type JobStatus } from "@/lib/db";
import { toE164 } from "@/lib/twilio";

export const runtime = "nodejs";

/**
 * Read-only helper for the customer-aware invoice builder.
 *
 *   ?q=<text>            → { customers: [...] }  searchable picker results
 *   ?customerId=<id>     → { jobs: [...] }       link-to-a-job options
 *   ?phone=&email=       → { match: {...}|null } duplicate-customer guard
 *
 * Everything is scoped to the auth-gated admin and returns small payloads so
 * the picker can call it on every keystroke without straining the page.
 */
export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const customerId = searchParams.get("customerId");
  const phoneRaw = searchParams.get("phone")?.trim();
  const emailRaw = searchParams.get("email")?.trim();
  const serviceQ = searchParams.get("service");

  try {
    // Pricebook service search (the line-item description picker).
    if (serviceQ != null) {
      const term = serviceQ.trim();
      if (term.length < 1) return NextResponse.json({ services: [] });
      const like = `%${term}%`;
      const { data, error } = await supabase()
        .from("service_catalog")
        .select("id, code, name, description, category, price_cents")
        .eq("active", true)
        .or(`code.ilike.${like},name.ilike.${like},category.ilike.${like}`)
        .order("name", { ascending: true })
        .limit(12);
      if (error) throw new Error(error.message);
      return NextResponse.json({ services: data ?? [] });
    }

    // Jobs for a chosen customer (the optional "link to a job" dropdown).
    if (customerId) {
      const id = parseInt(customerId, 10);
      if (!id || Number.isNaN(id)) return NextResponse.json({ jobs: [] });
      const jobs = await getCustomerJobs(id, 30);
      return NextResponse.json({
        jobs: jobs.map((j) => ({
          id: j.id,
          label: j.service_label ?? j.service_type,
          status: j.status,
          statusLabel: STATUS_LABEL[j.status as JobStatus] ?? j.status,
        })),
      });
    }

    // Duplicate guard for the "new customer" path. Matches the same upsert
    // logic the create route uses (phone first, then email) so the warning
    // mirrors what would actually happen on submit.
    if (phoneRaw || emailRaw) {
      const sb = supabase();
      const phoneE164 = phoneRaw ? toE164(phoneRaw) : null;
      const email = emailRaw || null;
      type CustomerMatch = {
        id: number;
        name: string;
        phone_e164: string | null;
        email: string | null;
      };
      let match: CustomerMatch | null = null;

      if (phoneE164) {
        const { data } = await sb
          .from("customers")
          .select("id, name, phone_e164, email")
          .eq("phone_e164", phoneE164)
          .limit(1)
          .maybeSingle();
        if (data) match = data as CustomerMatch;
      }
      if (!match && email) {
        const { data } = await sb
          .from("customers")
          .select("id, name, phone_e164, email")
          .ilike("email", email)
          .limit(1)
          .maybeSingle();
        if (data) match = data as CustomerMatch;
      }

      return NextResponse.json({ match });
    }

    // Searchable picker results.
    if (q && q.length >= 1) {
      const { rows } = await listCustomers({ search: q, limit: 15, sort: "name" });
      return NextResponse.json({
        customers: rows.map((c) => ({
          id: c.id,
          name: c.name,
          phone_e164: c.phone_e164,
          email: c.email,
          city: c.city,
        })),
      });
    }

    return NextResponse.json({ customers: [] });
  } catch (err) {
    console.error("[invoices.lookup]", err);
    return NextResponse.json({ error: "lookup_failed" }, { status: 500 });
  }
}
