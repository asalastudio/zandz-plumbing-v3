import Link from "next/link";
import { MessageSquare, User, Send, ArrowLeft } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { listThreads, getThread } from "@/lib/sms-inbox";
import { formatPhone } from "@/lib/phone";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messages · Z and Z OS" };

function fmtTime(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string; sent?: string; error?: string }>;
}) {
  if (!isSupabaseConfigured()) {
    return <p className="text-sm text-muted">Supabase is not configured.</p>;
  }

  const { to, sent, error } = await searchParams;
  const threads = await listThreads(100);
  const active = to ? await getThread(to) : null;

  return (
    <div className="pb-24 lg:pb-0">
      <header className="mb-6">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">
          <MessageSquare className="h-5 w-5" aria-hidden="true" />
          Messages
        </p>
        <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight md:text-4xl">
          Text conversations
        </h1>
      </header>

      {threads.length === 0 && (
        <div className="border border-line bg-card p-8 text-center">
          <p className="font-display text-xl font-black uppercase tracking-tight text-ink">
            No messages yet
          </p>
          <p className="mt-2 text-sm text-muted">
            Inbound and outbound texts appear here once Twilio is live.
          </p>
        </div>
      )}

      {threads.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          {/* Thread list */}
          <aside className={`space-y-1 ${active ? "hidden lg:block" : ""}`}>
            {threads.map((t) => (
              <Link
                key={t.phoneE164}
                href={`/admin/messages?to=${encodeURIComponent(t.phoneE164)}`}
                className={`block border px-4 py-3 ${
                  active?.phoneE164 === t.phoneE164
                    ? "border-[#F96302] bg-[#F96302]/5"
                    : "border-line bg-card hover:border-[#F96302]/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-bold text-ink">
                    {t.customerName ?? formatPhone(t.phoneE164)}
                  </span>
                  <span className="shrink-0 text-[10px] text-faint">{fmtTime(t.lastAt)}</span>
                </div>
                <p className="mt-0.5 truncate text-sm text-muted">
                  {t.lastDirection === "outbound" ? "You: " : ""}
                  {t.lastBody}
                </p>
              </Link>
            ))}
          </aside>

          {/* Conversation */}
          <section className="border border-line bg-card">
            {!active ? (
              <div className="flex h-full min-h-[300px] items-center justify-center p-8 text-center text-sm text-muted">
                Pick a conversation to read it.
              </div>
            ) : (
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href="/admin/messages" className="lg:hidden">
                      <ArrowLeft className="h-5 w-5 text-muted" aria-hidden="true" />
                    </Link>
                    <div>
                      <p className="font-bold text-ink">
                        {active.customerName ?? formatPhone(active.phoneE164)}
                      </p>
                      <p className="text-xs text-muted">{formatPhone(active.phoneE164)}</p>
                    </div>
                  </div>
                  {active.customerId && (
                    <Link
                      href={`/admin/customers/${active.customerId}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#F96302] hover:underline"
                    >
                      <User className="h-3.5 w-3.5" aria-hidden="true" />
                      Customer
                    </Link>
                  )}
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto p-4">
                  {active.messages.map((m) => (
                    <div
                      key={m.id}
                      className={m.direction === "outbound" ? "flex justify-end" : "flex justify-start"}
                    >
                      <div
                        className={`max-w-[80%] px-3 py-2 text-sm ${
                          m.direction === "outbound"
                            ? "bg-[#F96302] text-white"
                            : "bg-raised text-ink"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.body}</p>
                        <p className={`mt-1 text-[10px] ${m.direction === "outbound" ? "text-white/70" : "text-faint"}`}>
                          {fmtTime(m.createdAt)}
                          {m.status === "failed" ? " · failed" : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {sent && (
                  <p className="border-t border-line px-4 py-2 text-xs text-emerald-600">Sent.</p>
                )}
                {error && (
                  <p className="border-t border-line px-4 py-2 text-xs text-red-600">
                    {decodeURIComponent(error)}
                  </p>
                )}

                <form
                  action="/api/admin/messages/reply"
                  method="POST"
                  className="flex items-end gap-2 border-t border-line p-3"
                >
                  <input type="hidden" name="to" value={active.phoneE164} />
                  <textarea
                    name="body"
                    rows={1}
                    required
                    placeholder="Type a reply…"
                    className="max-h-32 min-h-[2.5rem] flex-1 resize-none border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-[#F96302]"
                  />
                  <button
                    type="submit"
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center bg-[#F96302] text-white hover:bg-[#e05602]"
                    aria-label="Send reply"
                  >
                    <Send className="h-5 w-5" aria-hidden="true" />
                  </button>
                </form>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
