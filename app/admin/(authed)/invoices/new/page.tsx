import Link from "next/link";
import { ChevronLeft, Send } from "lucide-react";

export const metadata = { title: "New Invoice · Z and Z OS" };

const ERRORS: Record<string, string> = {
  name_required: "Enter the customer's name.",
  bad_phone: "That phone number is not a valid US number.",
  contact_required: "Add an email or phone so the invoice can be delivered.",
  invalid_items: "Add at least one line item with a description and price.",
  bad_request: "Something went wrong reading the form. Try again.",
  error: "Could not create the invoice. Try again.",
};

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorMsg = error ? ERRORS[error] ?? "Could not create the invoice." : null;

  const inputCls =
    "w-full border border-white/15 bg-black px-3 py-3 text-base text-white outline-none placeholder:text-white/25 focus:border-[#F96302]";
  const labelCls = "mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-white/50";

  return (
    <div className="pb-24 lg:pb-0">
      <Link
        href="/admin/invoices"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white/60 hover:text-[#F96302]"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back to invoices
      </Link>

      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">New invoice</p>
        <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
          Custom Invoice
        </h1>
        <p className="mt-3 max-w-2xl text-base text-white/70">
          Bill any customer. We reuse an existing customer if the email or phone matches, otherwise
          a new record is created.
        </p>
      </header>

      {errorMsg && (
        <div className="mb-6 border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {errorMsg}
        </div>
      )}

      <form action="/api/admin/invoices" method="POST" className="max-w-3xl space-y-8">
        {/* Customer */}
        <section className="border border-white/10 bg-black/30 p-4 md:p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.12em] text-white/70">
            Customer
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className={labelCls}>Full name *</span>
              <input name="customer_name" required placeholder="Maria Lopez" className={inputCls} />
            </label>
            <label className="block">
              <span className={labelCls}>Email</span>
              <input
                name="customer_email"
                type="email"
                placeholder="maria@example.com"
                className={inputCls}
              />
            </label>
            <label className="block">
              <span className={labelCls}>Phone</span>
              <input
                name="customer_phone"
                type="tel"
                placeholder="(510) 555-0100"
                className={inputCls}
              />
            </label>
          </div>
          <p className="mt-3 text-xs text-white/40">
            Add at least one of email or phone, matching the channel you want to send on.
          </p>
        </section>

        {/* Line items */}
        <section className="border border-white/10 bg-black/30 p-4 md:p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.12em] text-white/70">
            Line items
          </h2>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_110px_150px]"
              >
                <label className="block">
                  <span className={labelCls}>{index === 0 ? "Description *" : "Item"}</span>
                  <input
                    name="description"
                    placeholder={index === 0 ? "Water heater replacement" : "Optional item"}
                    className={inputCls}
                  />
                </label>
                <label className="block">
                  <span className={labelCls}>Qty</span>
                  <input
                    name="quantity"
                    defaultValue={index === 0 ? "1" : ""}
                    inputMode="decimal"
                    placeholder="1"
                    className={inputCls}
                  />
                </label>
                <label className="block">
                  <span className={labelCls}>Price</span>
                  <input
                    name="unit_price"
                    inputMode="decimal"
                    placeholder="0.00"
                    className={inputCls}
                  />
                </label>
              </div>
            ))}
          </div>

          <label className="mt-4 block">
            <span className={labelCls}>Notes for customer</span>
            <textarea
              name="notes"
              rows={3}
              placeholder="Optional payment notes, warranty details, or thank-you message"
              className={`${inputCls} resize-none`}
            />
          </label>
        </section>

        {/* Delivery */}
        <section className="border border-white/10 bg-black/30 p-4 md:p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.12em] text-white/70">
            Send
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm text-white/80">
              <input
                type="checkbox"
                name="send_now"
                defaultChecked
                className="h-5 w-5 accent-[#F96302]"
              />
              Send now (uncheck to save as a draft)
            </label>
            <label className="flex items-center gap-3 text-sm text-white/80">
              <input
                type="checkbox"
                name="channel_email"
                defaultChecked
                className="h-5 w-5 accent-[#F96302]"
              />
              Email the invoice
            </label>
            <label className="flex items-center gap-3 text-sm text-white/80">
              <input type="checkbox" name="channel_text" className="h-5 w-5 accent-[#F96302]" />
              Text the invoice
              <span className="text-xs text-white/40">(activates once Twilio is live)</span>
            </label>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/invoices"
            className="inline-flex items-center bg-transparent border border-white/15 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white/70 hover:border-[#F96302] hover:text-[#F96302]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-[#F96302] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-transform duration-150 hover:-translate-y-0.5 hover:bg-[#e05602] hover:shadow-lg"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            Create invoice
          </button>
        </div>
      </form>
    </div>
  );
}
