import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";
import bcrypt from "bcryptjs";

/**
 * Admin session auth.
 *
 * Single shared-password model for Phase 1 (Jay logs in once on his phone).
 * Per-crew accounts land in Phase 2 once the `crew` table is populated.
 *
 * Session is a signed encrypted cookie via iron-session. Expires after 30 days.
 */

export interface AdminSession {
  authenticated: boolean;
  loggedInAt?: number;
}

function sessionPassword(): string {
  const p = process.env.SESSION_SECRET;
  if (!p || p.length < 32) {
    throw new Error(
      "SESSION_SECRET must be set and at least 32 chars long. Generate with: openssl rand -base64 48"
    );
  }
  return p;
}

const sessionOptions: SessionOptions = {
  password: "", // populated lazily via getter
  cookieName: "zz_admin",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};

export async function getSession() {
  // Mutate password at request time so we can lazy-read env
  sessionOptions.password = sessionPassword();
  const cookieStore = await cookies();
  return getIronSession<AdminSession>(cookieStore, sessionOptions);
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await getSession();
    return session.authenticated === true;
  } catch {
    return false;
  }
}

export async function verifyAdminPassword(plainPassword: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) return false;
  try {
    return await bcrypt.compare(plainPassword, hash);
  } catch {
    return false;
  }
}

export async function login() {
  const session = await getSession();
  session.authenticated = true;
  session.loggedInAt = Date.now();
  await session.save();
}

export async function logout() {
  const session = await getSession();
  session.destroy();
}
