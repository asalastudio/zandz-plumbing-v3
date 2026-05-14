import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { listNewLeadNotifications } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ leads: { count: 0, rows: [] } });
  }

  try {
    const leads = await listNewLeadNotifications(3);
    return NextResponse.json({ leads });
  } catch (err) {
    console.error("[admin.notifications]", err);
    return NextResponse.json({ error: "Notification lookup failed" }, { status: 500 });
  }
}
