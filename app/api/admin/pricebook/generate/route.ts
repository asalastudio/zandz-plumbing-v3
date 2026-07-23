import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { draftPendingDescriptions } from "@/lib/pricebook-descriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Many sequential model calls; give it room. The batch cap keeps a single run
// well under this.
export const maxDuration = 300;

export async function POST() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await draftPendingDescriptions(25, 4);
  return NextResponse.json(result);
}
