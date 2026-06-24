import Link from "next/link";
import { Plus, Eye, EyeOff, Video, Image as ImageIcon, ChevronRight } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  listLearningResources,
  LEARNING_CATEGORIES,
  extractYouTubeId,
  youtubeThumbnailUrl,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function LearningAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const params = await searchParams;

  if (!isSupabaseConfigured()) {
    return (
      <div className="border-l-4 border-[#F96302] bg-[#F96302]/10 p-6">
        <p className="text-base text-muted">Connect Supabase to manage learning content.</p>
      </div>
    );
  }

  const resources = await listLearningResources();
  const publishedCount = resources.filter((r) => r.published).length;

  return (
    <div className="pb-24 lg:pb-0">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">Learning</p>
          <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
            Videos & Images
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted">
            Pushes to <Link href="/videos/" className="text-[#F96302] underline">zandzplumbing.com/videos</Link>.
            {publishedCount} published · {resources.length - publishedCount} draft.
          </p>
        </div>
        <Link
          href="/admin/learning/new"
          className="inline-flex items-center gap-2 bg-[#F96302] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:bg-[#e05602]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add resource
        </Link>
      </header>

      {(params.saved || params.deleted) && (
        <div className="mb-6 border-l-4 border-emerald-500 bg-emerald-50 p-4 text-sm font-bold uppercase tracking-wide text-emerald-700">
          {params.saved && "Saved."}
          {params.deleted && "Deleted."}
        </div>
      )}

      {resources.length === 0 ? (
        <div className="border border-dashed border-line bg-raised px-8 py-16 text-center">
          <Video className="mx-auto h-8 w-8 text-faint" aria-hidden="true" />
          <p className="mt-3 text-base text-muted">No learning content yet.</p>
          <Link
            href="/admin/learning/new"
            className="mt-4 inline-flex items-center gap-2 bg-[#F96302] px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-[#e05602]"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add the first
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => {
            const ytId = r.media_type === "video" ? extractYouTubeId(r.url) : null;
            const thumb = r.thumbnail_url ?? (ytId ? youtubeThumbnailUrl(ytId) : r.url);
            const categoryLabel =
              LEARNING_CATEGORIES.find((c) => c.value === r.category)?.label ?? r.category;

            return (
              <article
                key={r.id}
                className={`group flex flex-col overflow-hidden border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-[#F96302] ${
                  r.published ? "border-line" : "border-line opacity-70"
                }`}
              >
                <Link href={`/admin/learning/${r.id}`} className="block">
                  <div className="relative aspect-video bg-ink">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumb}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        {r.media_type === "video" ? (
                          <Video className="h-12 w-12 text-faint" aria-hidden="true" />
                        ) : (
                          <ImageIcon className="h-12 w-12 text-faint" aria-hidden="true" />
                        )}
                      </div>
                    )}
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 bg-black/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                      {r.media_type === "video" ? (
                        <Video className="h-3 w-3" aria-hidden="true" />
                      ) : (
                        <ImageIcon className="h-3 w-3" aria-hidden="true" />
                      )}
                      {r.media_type}
                    </span>
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 bg-[#F96302]/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                      {categoryLabel}
                    </span>
                  </div>
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <Link href={`/admin/learning/${r.id}`} className="block">
                    <h3 className="font-display text-lg font-black uppercase leading-tight tracking-tight text-ink md:text-xl">
                      {r.title}
                    </h3>
                  </Link>
                  {r.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted">{r.description}</p>
                  )}
                  <footer className="mt-auto flex items-center justify-between border-t border-line pt-4">
                    <form
                      action={`/api/admin/learning/${r.id}/toggle`}
                      method="POST"
                    >
                      <button
                        type="submit"
                        className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide transition-colors duration-150 ${
                          r.published
                            ? "text-emerald-700 hover:text-emerald-700"
                            : "text-muted hover:text-[#F96302]"
                        }`}
                      >
                        {r.published ? (
                          <>
                            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                            Published
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
                      href={`/admin/learning/${r.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-muted hover:text-[#F96302]"
                    >
                      Edit
                      <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </footer>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
