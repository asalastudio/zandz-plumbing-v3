import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export const runtime = "nodejs";

const LIST = "/admin/assistant/knowledge";

/** Create / update / delete a knowledge doc (form-posted from the admin UI). */
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.redirect(new URL("/admin/login", req.url), 303);
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const form = await req.formData();
  const action = str(form.get("_action"));
  const idRaw = str(form.get("id"));
  const id = idRaw ? parseInt(idRaw, 10) : null;
  const sb = supabase();

  if (action === "delete" && id) {
    await sb.from("knowledge_docs").delete().eq("id", id);
    return NextResponse.redirect(new URL(`${LIST}?status=deleted`, req.url), 303);
  }

  const title = str(form.get("title"));
  const body = str(form.get("body"));
  const category = str(form.get("category")) || null;
  const active = form.get("active") === "on";

  if (!title || !body) {
    const back = id ? `${LIST}/${id}?error=missing` : `${LIST}?error=missing`;
    return NextResponse.redirect(new URL(back, req.url), 303);
  }

  const data = { title, body, category, active, updated_at: new Date().toISOString() };
  const { error } = id
    ? await sb.from("knowledge_docs").update(data).eq("id", id)
    : await sb.from("knowledge_docs").insert(data);

  if (error) {
    console.error("[knowledge]", error);
    const back = id ? `${LIST}/${id}?error=db` : `${LIST}?error=db`;
    return NextResponse.redirect(new URL(back, req.url), 303);
  }

  return NextResponse.redirect(new URL(`${LIST}?status=saved`, req.url), 303);
}

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}
