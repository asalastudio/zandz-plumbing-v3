"use client";

import { useRef, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

/**
 * "Notes for customer" textarea with an AI "Suggest" button. On click it reads
 * the current line items out of the enclosing form, asks the model to draft a
 * short customer-facing summary of the work, and drops it in — fully editable.
 * Submits the same `name="notes"` the invoice routes already parse.
 */
export function InvoiceNotesField({
  serviceLabel,
  customerName,
  placeholder = "Optional payment notes, warranty details, or a short summary of the work",
}: {
  serviceLabel?: string | null;
  customerName?: string | null;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function suggest() {
    const form = ref.current?.closest("form");
    if (!form) return;
    const values = (name: string) =>
      Array.from(
        form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`)
      ).map((el) => el.value.trim());

    const descriptions = values("description");
    const quantities = values("quantity");
    const lineItems = descriptions
      .map((description, i) => ({ description, quantity: quantities[i] ?? "" }))
      .filter((it) => it.description);

    if (lineItems.length === 0) {
      setErr("Add a line item first, then suggest.");
      return;
    }

    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/invoices/suggest-notes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lineItems, serviceLabel, customerName }),
      });
      const data = await res.json();
      if (res.ok && data.text) {
        setValue(data.text);
        ref.current?.focus();
      } else {
        setErr(
          data.error === "ai_failed"
            ? "Couldn't draft a note — check the AI key is configured."
            : "Couldn't draft a note. Try again."
        );
      }
    } catch {
      setErr("Couldn't draft a note. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
          Notes for customer
        </span>
        <button
          type="button"
          onClick={suggest}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#F96302] transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {loading ? "Drafting…" : "Suggest with AI"}
        </button>
      </div>
      <textarea
        ref={ref}
        name="notes"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        placeholder={placeholder}
        className="w-full resize-y border border-line bg-card px-3 py-3 text-base text-ink outline-none placeholder:text-faint focus:border-[#F96302]"
      />
      {err && <p className="mt-1 text-xs text-red-700">{err}</p>}
    </div>
  );
}
