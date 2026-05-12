import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Trash2 } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getLearningResource, LEARNING_CATEGORIES } from "@/lib/db";
import { LearningResourceForm } from "../_form";

export const dynamic = "force-dynamic";

export default async function EditLearningResourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (!id || Number.isNaN(id)) notFound();

  if (!isSupabaseConfigured()) {
    return (
      <div className="border-l-4 border-[#F96302] bg-[#F96302]/10 p-6">
        <p className="text-base text-white/80">Connect Supabase to edit learning content.</p>
      </div>
    );
  }

  const resource = await getLearningResource(id);
  if (!resource) notFound();

  return (
    <div className="pb-24 lg:pb-0">
      <Link
        href="/admin/learning"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white/60 hover:text-[#F96302]"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back to learning
      </Link>

      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">
            Edit resource
          </p>
          <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
            {resource.title}
          </h1>
        </div>
        <form
          action={`/api/admin/learning/${id}/delete`}
          method="POST"
          className="flex-shrink-0"
        >
          <button
            type="submit"
            className="inline-flex items-center gap-2 border border-red-500/40 bg-red-500/10 px-5 py-3 text-sm font-bold uppercase tracking-wide text-red-300 transition-colors duration-150 hover:bg-red-500/20"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete
          </button>
        </form>
      </header>

      <LearningResourceForm
        action={`/api/admin/learning/${id}`}
        categories={LEARNING_CATEGORIES}
        resource={resource}
        submitLabel="Save changes"
      />
    </div>
  );
}
