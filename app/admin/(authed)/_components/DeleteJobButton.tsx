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
            ? "inline-flex items-center gap-1.5 text-sm font-bold text-red-700 hover:text-red-700"
            : "inline-flex items-center gap-2 border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition-colors duration-150 hover:bg-red-100"
        }
      >
        <Trash2 className={compact ? "h-4 w-4" : "h-5 w-5"} aria-hidden="true" />
        {label}
      </button>
    </form>
  );
}
