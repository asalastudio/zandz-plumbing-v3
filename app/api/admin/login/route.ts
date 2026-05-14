import { NextRequest, NextResponse } from "next/server";
import { login, verifyAdminPassword } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const password = (formData.get("password") as string | null)?.trim() ?? "";
  const next = (formData.get("next") as string | null) ?? "/admin";

  // Safety: only redirect into the authenticated OS surfaces.
  const safeNext = next.startsWith("/admin") || next.startsWith("/field") ? next : "/admin";

  if (!process.env.ADMIN_PASSWORD_HASH || !process.env.SESSION_SECRET) {
    return NextResponse.redirect(new URL("/admin/login?error=not-configured", req.url), 303);
  }

  if (!password) {
    return NextResponse.redirect(new URL("/admin/login?error=missing", req.url), 303);
  }

  const ok = await verifyAdminPassword(password);
  if (!ok) {
    return NextResponse.redirect(new URL("/admin/login?error=invalid", req.url), 303);
  }

  await login();
  return NextResponse.redirect(new URL(safeNext, req.url), 303);
}
