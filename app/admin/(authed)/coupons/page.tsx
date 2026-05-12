import Link from "next/link";
import { Plus, Eye, EyeOff, Tag, ChevronRight, AlertCircle } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { listCoupons, MAX_PUBLISHED_COUPONS, formatDate } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CouponsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string }>;
}) {
  const params = await searchParams;

  if (!isSupabaseConfigured()) {
    return (
      <div className="border-l-4 border-[#F96302] bg-[#F96302]/10 p-6">
        <p className="text-base text-white/80">Connect Supabase to manage coupons.</p>
      </div>
    );
  }

  const all = await listCoupons();
  const published = all.filter((c) => c.published);

  return (
    <div className="pb-24 lg:pb-0">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">Coupons</p>
          <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
            Special Deals
          </h1>
          <p className="mt-3 max-w-2xl text-base text-white/70">
            Pushes to <Link href="/coupons/" className="text-[#F96302] underline">zandzplumbing.com/coupons</Link>.
            Max <span className="text-white">{MAX_PUBLISHED_COUPONS}</span> can be published at once.
            Currently <span className={published.length >= MAX_PUBLISHED_COUPONS ? "text-[#F96302]" : "text-white"}>
              {published.length}/{MAX_PUBLISHED_COUPONS}
            </span> live.
          </p>
        </div>
        <Link
          href="/admin/coupons/new"
          className="inline-flex items-center gap-2 bg-[#F96302] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:bg-[#e05602]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New coupon
        </Link>
      </header>

      {(params.saved || params.deleted) && (
        <div className="mb-6 border-l-4 border-emerald-500 bg-emerald-500/10 p-4 text-sm font-bold uppercase tracking-wide text-emerald-300">
          {params.saved && "Saved."}
          {params.deleted && "Deleted."}
        </div>
      )}

      {params.error === "limit" && (
        <div className="mb-6 flex items-start gap-3 border-l-4 border-[#F96302] bg-[#F96302]/10 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-[#F96302] mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#F96302]">
              Max {MAX_PUBLISHED_COUPONS} coupons can be live at once.
            </p>
            <p className="mt-1 text-sm text-white/70">
              Unpublish one to make room for another.
            </p>
          </div>
        </div>
      )}

      {all.length === 0 ? (
        <div className="border border-dashed border-white/15 bg-white/[0.02] px-8 py-16 text-center">
          <Tag className="mx-auto h-8 w-8 text-white/30" aria-hidden="true" />
          <p className="mt-3 text-base text-white/60">No coupons yet.</p>
          <Link
            href="/admin/coupons/new"
            className="mt-4 inline-flex items-center gap-2 bg-[#F96302] px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-[#e05602]"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create the first
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {all.map((c) => (
            <article
              key={c.id}
              className={`flex flex-col border bg-white/5 transition-all duration-200 hover:-translate-y-1 hover:border-[#F96302] ${
                c.published ? "border-white/10" : "border-white/5 opacity-70"
              }`}
            >
              <Link href={`/admin/coupons/${c.id}`} className="block flex-1 p-6 md:p-7">
                <div className="mb-3 flex items-center justify-between">
                  <Tag className="h-5 w-5 text-[#F96302]" aria-hidden="true" />
                  {c.published && (
                    <span className="inline-flex items-center bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
                      Live
                    </span>
                  )}
                </div>
                <h3 className="font-display text-2xl font-black uppercase leading-tight tracking-tight text-white md:text-3xl">
                  {c.headline}
                </h3>
                {c.subheadline && (
                  <p className="mt-2 text-sm text-white/70">{c.subheadline}</p>
                )}
                {c.code && (
                  <p className="mt-4 inline-flex items-center bg-white/10 px-3 py-1.5 font-mono text-sm font-bold uppercase tracking-wider text-white">
                    {c.code}
                  </p>
                )}
                {(c.valid_from || c.valid_until) && (
                  <p className="mt-3 text-xs text-white/50">
                    {c.valid_from ? formatDate(c.valid_from) : "Now"} →{" "}
                    {c.valid_until ? formatDate(c.valid_until) : "no end date"}
                  </p>
                )}
              </Link>
              <footer className="flex items-center justify-between border-t border-white/5 px-6 py-4">
                <form action={`/api/admin/coupons/${c.id}/toggle`} method="POST">
                  <button
                    type="submit"
                    className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide transition-colors duration-150 ${
                      c.published
                        ? "text-emerald-300 hover:text-emerald-200"
                        : "text-white/40 hover:text-[#F96302]"
                    }`}
                  >
                    {c.published ? (
                      <>
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        Live
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                        Draft
                      </>
                    )}
                  </button>
                </form>
                <Link
                  href={`/admin/coupons/${c.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-white/60 hover:text-[#F96302]"
                >
                  Edit
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </footer>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
