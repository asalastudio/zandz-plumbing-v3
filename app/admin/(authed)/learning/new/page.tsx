import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { LEARNING_CATEGORIES } from "@/lib/db";
import { LearningResourceForm } from "../_form";

export const metadata = { title: "New learning resource · Z and Z OS" };

export default function NewLearningResourcePage() {
  return (
    <div className="pb-24 lg:pb-0">
      <Link
        href="/admin/learning"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted hover:text-[#F96302]"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back to learning
      </Link>

      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">New resource</p>
        <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
          Add Video or Image
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted">
          Paste a YouTube link for videos or a direct image URL. Save as draft to preview, publish
          when ready.
        </p>
      </header>

      <LearningResourceForm
        action="/api/admin/learning"
        categories={LEARNING_CATEGORIES}
        submitLabel="Save resource"
      />
    </div>
  );
}
