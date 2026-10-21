"use client";

import { Ban } from "lucide-react";

/**
 * Cancels a junk lead and notes it as spam. Asks first: a cancelled job has
 * no way back to 'new' from the job page.
 */
export function MarkSpamButton({ jobId }: { jobId: number }) {
  return (
    <form
      action={`/api/admin/jobs/${jobId}/spam`}
      method="POST"
      onSubmit={(event) => {
        const ok = window.confirm(
          "Mark this lead as spam? It moves to Cancelled and leaves the lead inbox."
        );
        if (!ok) event.preventDefault();
      }}
    >
      <button
        type="submit"
        className="inline-flex items-center gap-2 border border-line bg-card px-4 py-3 text-sm font-bold uppercase tracking-wide text-muted transition-colors duration-150 hover:border-red-300 hover:text-red-700"
      >
        <Ban className="h-4 w-4" aria-hidden="true" />
        Spam
      </button>
    </form>
  );
}
