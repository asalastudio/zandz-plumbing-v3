import Link from "next/link";
import { ChevronLeft, Pencil } from "lucide-react";
import { listKnowledgeDocs } from "@/lib/assistant/knowledge";
import { KnowledgeForm } from "./KnowledgeForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Assistant Knowledge · Z and Z OS" };

export default async function KnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; error?: string }>;
}) {
  const { status, error } = await searchParams;
  const docs = await listKnowledgeDocs();

  return (
    <div className="pb-24 lg:pb-0">
      <Link
        href="/admin/assistant"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted hover:text-[#F96302]"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back to assistant
      </Link>

      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">Assistant</p>
        <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight md:text-4xl">
          Knowledge
        </h1>
        <p className="mt-2 max-w-2xl text-base text-muted">
          Company facts the database doesn&apos;t hold — policies, warranty terms, pricing rules,
          how-we-do-things. The assistant uses every active doc.
        </p>
      </header>

      {status === "saved" && <Banner ok>Saved.</Banner>}
      {status === "deleted" && <Banner ok>Deleted.</Banner>}
      {error && <Banner>Couldn&apos;t save — add a title and content.</Banner>}

      <section className="mb-8">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-muted">Add a doc</h2>
        <KnowledgeForm />
      </section>

      <section>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-muted">
          {docs.length} doc{docs.length === 1 ? "" : "s"}
        </h2>
        {docs.length === 0 ? (
          <div className="border border-dashed border-line bg-card px-6 py-10 text-center text-sm text-muted">
            No knowledge docs yet. (If you just shipped this, run migration{" "}
            <code className="bg-surface px-1">011_knowledge_docs.sql</code> first.)
          </div>
        ) : (
          <ul className="space-y-2">
            {docs.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/admin/assistant/knowledge/${d.id}`}
                  className="flex items-center justify-between gap-3 border border-line bg-card px-4 py-3 transition-colors hover:border-[#F96302]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-bold text-ink">
                      {d.title}
                      {!d.active && <span className="ml-2 text-xs font-normal text-faint">(inactive)</span>}
                    </p>
                    {d.category && <p className="text-xs text-muted">{d.category}</p>}
                  </div>
                  <Pencil className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Banner({ children, ok }: { children: React.ReactNode; ok?: boolean }) {
  return (
    <div
      className={`mb-6 border px-4 py-3 text-sm ${
        ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {children}
    </div>
  );
}
