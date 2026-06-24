"use client";

import { Trash2 } from "lucide-react";

/**
 * Delete an invoice (with confirm). `next` is where to return after delete —
 * the job page passes its own path so the operator lands back on the job.
 */
export function DeleteInvoiceButton({
  invoiceId,
  next,
  label = "Delete",
  compact = false,
}: {
  invoiceId: number;
  next?: string;
  label?: string;
  compact?: boolean;
}) {
  return (
    <form
      action={`/api/admin/invoices/${invoiceId}/delete`}
      method="POST"
      onSubmit={(event) => {
        const ok = window.confirm(
          `Delete invoice #${invoiceId}? This permanently removes it and cannot be undone.`
        );
        if (!ok) event.preventDefault();
      }}
    >
      {next && <input type="hidden" name="next" value={next} />}
      <button
        type="submit"
        className={
          compact
            ? "inline-flex items-center gap-1.5 text-sm font-bold text-red-700 hover:text-red-800"
            : "inline-flex items-center gap-2 border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold uppercase tracking-wide text-red-700 transition-colors duration-150 hover:bg-red-100"
        }
      >
        <Trash2 className={compact ? "h-4 w-4" : "h-4 w-4"} aria-hidden="true" />
        {label}
      </button>
    </form>
  );
}
