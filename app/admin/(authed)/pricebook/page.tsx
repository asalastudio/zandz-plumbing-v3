import { BookText } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { listReviewQueue, descriptionCounts } from "@/lib/pricebook-descriptions";
import { ReviewQueue } from "./_components/ReviewQueue";

export const dynamic = "force-dynamic";

export default async function PricebookReviewPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="pb-24 lg:pb-0">
        <p className="text-sm text-muted">Supabase is not configured.</p>
      </div>
    );
  }

  // The review-queue columns arrive in migration 013. If this route is reached
  // before that migration is applied, degrade to a clear instruction rather
  // than a 500.
  let queue, counts;
  try {
    [queue, counts] = await Promise.all([listReviewQueue(300), descriptionCounts()]);
  } catch (e) {
    const msg = (e as Error).message;
    if (/description_status|description_draft|column/.test(msg)) {
      return (
        <div className="pb-24 lg:pb-0">
          <h1 className="font-display text-2xl font-black uppercase tracking-tight">Pricebook review</h1>
          <div className="mt-4 border border-amber-300 bg-amber-50 p-5 text-sm text-amber-800">
            <p className="font-bold">One-time setup needed.</p>
            <p className="mt-1">
              Apply migration <code>013_pricebook_descriptions.sql</code> in the Supabase SQL
              editor, then reload this page.
            </p>
          </div>
        </div>
      );
    }
    throw e;
  }

  return (
    <div className="pb-24 lg:pb-0">
      <header className="mb-6">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">
          <BookText className="h-5 w-5" aria-hidden="true" />
          Pricebook
        </p>
        <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight md:text-4xl">
          Scope of work review
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted">
          These descriptions print on customer estimates and invoices. Drafts are
          written by AI from each service&rsquo;s name, price, and materials, but nothing
          reaches a customer until you approve it here. Edit anything that isn&rsquo;t right
          before approving.
        </p>
      </header>

      <ReviewQueue
        initialQueue={queue}
        counts={counts}
      />
    </div>
  );
}
