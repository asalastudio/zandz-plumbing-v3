import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Trash2 } from "lucide-react";
import { getKnowledgeDoc } from "@/lib/assistant/knowledge";
import { KnowledgeForm } from "../KnowledgeForm";

export const dynamic = "force-dynamic";

export default async function EditKnowledgePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (!id || Number.isNaN(id)) notFound();
  const doc = await getKnowledgeDoc(id);
  if (!doc) notFound();

  return (
    <div className="pb-24 lg:pb-0">
      <Link
        href="/admin/assistant/knowledge"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted hover:text-[#F96302]"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back to knowledge
      </Link>

      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">Edit knowledge</p>
        <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight md:text-4xl">
          {doc.title}
        </h1>
      </header>

      <KnowledgeForm doc={doc} />

      <form action="/api/admin/assistant/knowledge" method="POST" className="mt-4">
        <input type="hidden" name="_action" value="delete" />
        <input type="hidden" name="id" value={doc.id} />
        <button
          type="submit"
          className="inline-flex items-center gap-2 border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-red-700 transition-colors hover:bg-red-100"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Delete doc
        </button>
      </form>
    </div>
  );
}
