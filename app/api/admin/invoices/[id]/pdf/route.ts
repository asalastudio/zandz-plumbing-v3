import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { isAuthenticated } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getInvoiceForDocument } from "@/lib/invoices";
import { renderInvoicePdf } from "@/lib/documents/invoice-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Render one invoice as a PDF.
 *
 * ?download=1 forces a save dialog; without it the browser previews inline,
 * which is what the operator wants when checking a document before sending.
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.redirect(new URL("/admin/login", req.url), 303);
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const { id: idStr } = await ctx.params;
  const id = parseInt(idStr, 10);
  if (!id || Number.isNaN(id)) {
    return NextResponse.json({ error: "Bad invoice id" }, { status: 400 });
  }

  const data = await getInvoiceForDocument(id);
  if (!data) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const logo = await logoDataUri();
  const pdf = await renderInvoicePdf(data, logo?.uri, logo?.isWordmark);
  const download = req.nextUrl.searchParams.get("download") === "1";

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="Invoice-${id}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}

/**
 * Load the logo off disk once per lambda and hand it to react-pdf as a data
 * URI. react-pdf's Image only understands raster formats, so the SVGs in
 * public/ cannot be used directly.
 *
 * Prefers the full wordmark, which is what the printed documents should carry.
 * public/logo.svg is the light-on-dark variant (its wordmark is driven through
 * a luminance mask, so it cannot simply be recoloured), and there is no
 * dark-text raster in the repo yet — so until logo-wordmark.png is added this
 * falls back to the square faucet icon.
 */
const LOGO_CANDIDATES = [
  ["email", "logo-wordmark.png"],
  ["email", "logo-icon.png"],
];

export interface LoadedLogo {
  uri: string;
  /** Wide wordmark vs square icon — they need very different widths. */
  isWordmark: boolean;
}

let cachedLogo: LoadedLogo | null | undefined;

export async function logoDataUri(): Promise<LoadedLogo | undefined> {
  if (cachedLogo !== undefined) return cachedLogo ?? undefined;

  for (const parts of LOGO_CANDIDATES) {
    try {
      const buf = await readFile(path.join(process.cwd(), "public", ...parts));
      cachedLogo = {
        uri: `data:image/png;base64,${buf.toString("base64")}`,
        isWordmark: parts[1].includes("wordmark"),
      };
      return cachedLogo;
    } catch {
      // Try the next candidate.
    }
  }

  // Falls back to the company name set as text. Not fatal.
  cachedLogo = null;
  return undefined;
}
