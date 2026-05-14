import { isSupabaseConfigured } from "@/lib/supabase";
import { listNewLeadNotifications } from "@/lib/db";
import { AdminLeadTickerClient } from "./AdminLeadTickerClient";

export async function AdminLeadTicker() {
  if (!isSupabaseConfigured()) return null;

  let leads;
  try {
    leads = await listNewLeadNotifications(3);
  } catch (err) {
    console.error("[admin.leadTicker]", err);
    return null;
  }

  return <AdminLeadTickerClient initialLeads={leads} />;
}
