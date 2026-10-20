import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";
import { normalizeNanpToE164 } from "@/lib/phone";

export const runtime = "nodejs";

/**
 * Updates editable fields on a customer record.
 * Supports: name, phone, email, street_address, city, zip (the contact form)
 * and notes, neighborhood (the notes form).
 *
 * Only fields present in the submitted form are touched, so each form on the
 * customer page can post just its own fields without blanking the others.
 *
 * Why a separate update route instead of overloading the create route:
 * keeps the create flow simple and the editable surface explicit.
 */
const EDITABLE = ["name", "phone_e164", "email", "street_address", "city", "zip", "notes", "neighborhood"] as const;

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
  // The contact form says which section it is, so the result shows beside it:
  // contact → ?saved=contact / ?contact_error=…, notes → ?saved=1 / ?error=update.
  const isContact = formData.get("section") === "contact";
  const back = (query: string) =>
    NextResponse.redirect(
      new URL(`/admin/customers/${id}?${query}${isContact ? "#contact" : ""}`, req.url),
      303
    );
  const fail = (code: string) => back(isContact ? `contact_error=${code}` : `error=${code}`);
  const saved = () => back(isContact ? "saved=contact" : "saved=1");

  const update: Record<string, string | null> = {};
  for (const field of EDITABLE) {
    if (!formData.has(field)) continue;
    // Empty string → store null. Trimmed value → store as-is.
    const value = String(formData.get(field) ?? "").trim();
    update[field] = value.length > 0 ? value : null;
  }

  if ("name" in update && !update.name) return fail("missing_name");

  // Phones are stored as E.164 so lookups, dedupe, and texting all match.
  if (update.phone_e164) {
    const normalized = normalizeNanpToE164(update.phone_e164);
    if (!normalized) return fail("bad_phone");
    update.phone_e164 = normalized;
  }

  if (Object.keys(update).length === 0) return saved();

  const { error } = await supabase().from("customers").update(update).eq("id", id);

  if (error) {
    console.error("[customer.update]", error);
    return fail("update");
  }

  return saved();
}
