import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * Updates editable fields on a customer record.
 * Currently supports: notes, neighborhood.
 *
 * Why a separate update route instead of overloading the create route:
 * keeps the create flow simple and the editable surface explicit.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.redirect(new URL("/admin/login", req.url), 303);
  }

  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (!id || Number.isNaN(id)) {
    return NextResponse.redirect(new URL("/admin/customers", req.url), 303);
  }

  const formData = await req.formData();
  const notes = (formData.get("notes") as string | null)?.trim() ?? null;
  const neighborhood = (formData.get("neighborhood") as string | null)?.trim() ?? null;

  const update: Record<string, string | null> = {};
  // Empty string → store null. Trimmed value → store as-is.
  update.notes = notes && notes.length > 0 ? notes : null;
  update.neighborhood = neighborhood && neighborhood.length > 0 ? neighborhood : null;

  const { error } = await supabase().from("customers").update(update).eq("id", id);

  if (error) {
    console.error("[customer.update]", error);
    return NextResponse.redirect(
      new URL(`/admin/customers/${id}?error=update`, req.url),
      303
    );
  }

  return NextResponse.redirect(new URL(`/admin/customers/${id}?saved=1`, req.url), 303);
}
