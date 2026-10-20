"use client";

import { useState } from "react";
import Link from "next/link";
import { Save, Send } from "lucide-react";

/**
 * Delivery choices plus the submit button for a new invoice.
 *
 * "Send now" is ticked by default, so the button has to say what clicking it
 * will actually do. A plain "Create invoice" label used to email the customer
 * without saying so.
 */
export function InvoiceSendControls({ textingAvailable }: { textingAvailable: boolean }) {
  const [sendNow, setSendNow] = useState(true);
  const [email, setEmail] = useState(true);
  const [text, setText] = useState(false);

  const channels = [email && "email", text && textingAvailable && "text"].filter(Boolean);
  const sending = sendNow && channels.length > 0;
  const submitLabel = sending ? `Create and ${channels.join(" + ")} invoice` : "Save draft";

  return (
    <>
      <section className="border border-line bg-surface p-4 md:p-5">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.12em] text-muted">
          Send
        </h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3 text-sm text-muted">
            <input
              type="checkbox"
              name="send_now"
              checked={sendNow}
              onChange={(e) => setSendNow(e.target.checked)}
              className="h-5 w-5 accent-[#F96302]"
            />
            Send to the customer now (untick to save as a draft)
          </label>
          <label className={`flex items-center gap-3 text-sm text-muted ${sendNow ? "" : "opacity-50"}`}>
            <input
              type="checkbox"
              name="channel_email"
              checked={email}
              disabled={!sendNow}
              onChange={(e) => setEmail(e.target.checked)}
              className="h-5 w-5 accent-[#F96302]"
            />
            Email the invoice
          </label>
          <label
            className={`flex items-center gap-3 text-sm text-muted ${sendNow && textingAvailable ? "" : "opacity-50"}`}
          >
            <input
              type="checkbox"
              name="channel_text"
              checked={text && textingAvailable}
              disabled={!sendNow || !textingAvailable}
              onChange={(e) => setText(e.target.checked)}
              className="h-5 w-5 accent-[#F96302]"
            />
            Text the invoice
            {!textingAvailable && (
              <span className="text-xs text-muted">(available once texting is set up)</span>
            )}
          </label>
          {sendNow && channels.length === 0 && (
            <p className="text-xs text-muted">Pick email or text, or untick sending to save a draft.</p>
          )}
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Link
          href="/admin/invoices"
          className="inline-flex items-center bg-transparent border border-line px-6 py-3 text-sm font-bold uppercase tracking-wide text-muted hover:border-[#F96302] hover:text-[#F96302]"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-[#F96302] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-transform duration-150 hover:-translate-y-0.5 hover:bg-[#e05602] hover:shadow-lg"
        >
          {sending ? <Send className="h-4 w-4" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
          {submitLabel}
        </button>
      </div>
    </>
  );
}
