import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FaucetMark } from "@/components/Logo";
import { isAuthenticated } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in · Z and Z OS",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const authed = await isAuthenticated();
  const safeNext =
    params.next?.startsWith("/admin") || params.next?.startsWith("/field")
      ? params.next
      : "/admin";
  if (authed) redirect(safeNext);

  const errorMessage =
    params.error === "invalid"
      ? "That password did not match. Try again."
      : params.error === "missing"
        ? "Enter the admin password."
        : params.error === "not-configured"
          ? "Admin password is not configured yet. Set ADMIN_PASSWORD_HASH in environment."
          : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <FaucetMark size={56} />
          <h1 className="mt-6 font-display text-3xl font-black uppercase tracking-tight text-white">
            Z and Z OS
          </h1>
          <p className="mt-2 text-sm font-bold uppercase tracking-[0.18em] text-[#F96302]">
            Crew sign-in
          </p>
        </div>

        <form
          action="/api/admin/login"
          method="POST"
          className="rounded-2xl border border-white/10 bg-white/5 p-8"
        >
          {errorMessage && (
            <div className="mb-6 border-l-4 border-[#F96302] bg-[#F96302]/10 px-4 py-3 text-sm text-white">
              {errorMessage}
            </div>
          )}

          <label className="block text-sm font-bold uppercase tracking-[0.12em] text-white/60 mb-3">
            Password
          </label>
          <input
            name="password"
            type="password"
            autoFocus
            required
            className="w-full border border-white/15 bg-black px-4 py-4 text-lg text-white outline-none focus:border-[#F96302]"
          />

          <input type="hidden" name="next" value={safeNext} />

          <button
            type="submit"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-[#F96302] px-6 py-4 text-base font-bold uppercase tracking-wide text-white transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:bg-[#e05602]"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/40">
          Authorized crew only. All access logged.
        </p>
      </div>
    </div>
  );
}
