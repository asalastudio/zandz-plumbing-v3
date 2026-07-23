import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { sendReply } from "@/lib/sms-inbox";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.redirect(new URL("/admin/login", req.url), 303);
  }

  const form = await req.formData();
  const to = String(form.get("to") ?? "").trim();
  const body = String(form.get("body") ?? "").trim();
  if (!to) return NextResponse.redirect(new URL("/admin/messages", req.url), 303);

  const result = await sendReply(to, body);
  const dest = `/admin/messages?to=${encodeURIComponent(to)}${
    result.ok ? "&sent=1" : `&error=${encodeURIComponent(result.error ?? "send failed")}`
  }`;
  return NextResponse.redirect(new URL(dest, req.url), 303);
}
