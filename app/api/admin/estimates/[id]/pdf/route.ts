import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getEstimateForDocument } from "@/lib/estimates";
import { renderEstimatePdf } from "@/lib/documents/estimate-pdf";
import { loadLogo } from "@/lib/documents/logo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.redirect(new URL("/admin/login", req.url), 303);
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const { id: idStr } = await ctx.params;
  const id = parseInt(idStr, 10);
  if (!id || Number.isNaN(id)) {
    return NextResponse.json({ error: "Bad estimate id" }, { status: 400 });
  }

  const data = await getEstimateForDocument(id);
  if (!data) return NextResponse.json({ error: "Estimate not found" }, { status: 404 });

  const logo = await loadLogo();
  const pdf = await renderEstimatePdf(data, logo?.uri, logo?.isWordmark);
  const download = req.nextUrl.searchParams.get("download") === "1";

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="Estimate-${id}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
