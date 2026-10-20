"use client";

import { useRef } from "react";

/**
 * Jump the dispatch board to any day. A plain GET form, so it works without
 * JavaScript via the Go button; with it, picking a date navigates at once.
 */
export function DispatchDatePicker({ value }: { value: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action="/admin/dispatch/" method="GET" className="flex items-center gap-1">
      <label className="sr-only" htmlFor="dispatch-date">
        Go to date
      </label>
      <input
        id="dispatch-date"
        type="date"
        name="date"
        defaultValue={value}
        onChange={(event) => {
          // Typing a year fires change on every digit ("0002", "0020"...), so
          // only navigate once the date is a plausible one.
          const v = event.target.value;
          if (/^\d{4}-\d{2}-\d{2}$/.test(v) && Number(v.slice(0, 4)) >= 2000) {
            formRef.current?.requestSubmit();
          }
        }}
        className="h-10 border border-line bg-card px-3 text-sm font-bold text-ink outline-none focus:border-[#F96302]"
      />
      <button
        type="submit"
        className="inline-flex h-10 items-center border border-line px-3 text-sm font-bold uppercase tracking-wide text-muted hover:border-[#F96302] hover:text-[#F96302]"
      >
        Go
      </button>
    </form>
  );
}
