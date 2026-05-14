"use client";

import { Trash2 } from "lucide-react";

export function DeleteJobButton({
  jobId,
  label = "Delete job",
  compact = false,
}: {
  jobId: number;
  label?: string;
  compact?: boolean;
}) {
  return (
    <form
      action={`/api/admin/jobs/${jobId}/delete`}
      method="POST"
      onSubmit={(event) => {
        const ok = window.confirm(
          "Delete this job from Z and Z OS? This cannot be undone."
        );
        if (!ok) event.preventDefault();
      }}
    >
      <button
        type="submit"
        className={
          compact
            ? "inline-flex items-center gap-1.5 text-sm font-bold text-red-300 hover:text-red-200"
            : "inline-flex items-center gap-2 border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-200 transition-colors duration-150 hover:bg-red-500/20"
        }
      >
        <Trash2 className={compact ? "h-4 w-4" : "h-5 w-5"} aria-hidden="true" />
        {label}
      </button>
    </form>
  );
}
