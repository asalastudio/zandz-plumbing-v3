import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  approveDescription,
  keepOriginalDescription,
  regenerateDescription,
} from "@/lib/pricebook-descriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // regenerate makes one model call

/**
 * One endpoint for the three review decisions on a pricebook description.
 * Body: { action: "approve", description } | { action: "keep" } | { action: "regenerate" }
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id: idStr } = await ctx.params;
  const id = parseInt(idStr, 10);
  if (!id || Number.isNaN(id)) {
    return NextResponse.json({ error: "bad_id" }, { status: 400 });
  }

  let body: { action?: string; description?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    switch (body.action) {
      case "approve":
        await approveDescription(id, body.description ?? "");
        return NextResponse.json({ ok: true, status: "approved" });
      case "keep":
        await keepOriginalDescription(id);
        return NextResponse.json({ ok: true, status: "approved" });
      case "regenerate":
        await regenerateDescription(id);
        return NextResponse.json({ ok: true, status: "pending" });
      default:
        return NextResponse.json({ error: "unknown_action" }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
