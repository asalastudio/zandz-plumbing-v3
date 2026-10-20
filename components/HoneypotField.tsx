import type { Ref } from "react";
import { HONEYPOT_FIELD } from "@/lib/honeypot";

/**
 * Off-screen input that people never see, tab to, or autofill. Form bots fill
 * every field they find; /api/lead drops any submission where this has a value.
 * Read it through `inputRef` and send it with the payload.
 */
export function HoneypotField({ inputRef }: { inputRef: Ref<HTMLInputElement> }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Company website
        <input
          ref={inputRef}
          type="text"
          name={HONEYPOT_FIELD}
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </label>
    </div>
  );
}
