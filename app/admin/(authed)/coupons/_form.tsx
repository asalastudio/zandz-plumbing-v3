import Link from "next/link";
import type { Coupon } from "@/lib/db";

interface Props {
  action: string;
  coupon?: Coupon | null;
  submitLabel: string;
}

function toDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

export function CouponForm({ action, coupon, submitLabel }: Props) {
  return (
    <form action={action} method="POST" className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Field label="Headline *" full>
        <input
          name="headline"
          type="text"
          required
          defaultValue={coupon?.headline ?? ""}
          placeholder='e.g. "$50 OFF Any Drain Cleaning"'
          className="w-full border border-white/15 bg-black px-4 py-3 text-lg font-display font-black uppercase tracking-tight text-white outline-none focus:border-[#F96302]"
        />
        <p className="mt-2 text-xs text-white/50">
          The big text on the card. Keep it short and punchy.
        </p>
      </Field>

      <Field label="Subheadline" full>
        <input
          name="subheadline"
          type="text"
          defaultValue={coupon?.subheadline ?? ""}
          placeholder="e.g. Drain cleaning, sewer lateral, or hydrojetting"
          className="w-full border border-white/15 bg-black px-4 py-3 text-base text-white outline-none focus:border-[#F96302]"
        />
      </Field>

      <Field label="Promo code (optional)">
        <input
          name="code"
          type="text"
          defaultValue={coupon?.code ?? ""}
          placeholder="e.g. SAVE50"
          className="w-full border border-white/15 bg-black px-4 py-3 font-mono text-base uppercase tracking-wider text-white outline-none focus:border-[#F96302]"
        />
        <p className="mt-2 text-xs text-white/50">
          If set, customers can mention this code on the phone.
        </p>
      </Field>

      <Field label="Display order (lower = first)">
        <input
          name="display_order"
          type="number"
          step="1"
          defaultValue={coupon?.display_order ?? 0}
          className="w-full border border-white/15 bg-black px-4 py-3 text-base text-white outline-none focus:border-[#F96302]"
        />
      </Field>

      <Field label="Valid from (optional)">
        <input
          name="valid_from"
          type="date"
          defaultValue={toDateInput(coupon?.valid_from)}
          className="w-full border border-white/15 bg-black px-4 py-3 text-base text-white outline-none focus:border-[#F96302]"
        />
      </Field>

      <Field label="Valid until (optional)">
        <input
          name="valid_until"
          type="date"
          defaultValue={toDateInput(coupon?.valid_until)}
          className="w-full border border-white/15 bg-black px-4 py-3 text-base text-white outline-none focus:border-[#F96302]"
        />
      </Field>

      <Field label="Card image URL (optional)" full>
        <input
          name="image_url"
          type="url"
          defaultValue={coupon?.image_url ?? ""}
          placeholder="https://.../coupon-image.jpg"
          className="w-full border border-white/15 bg-black px-4 py-3 text-base text-white outline-none focus:border-[#F96302]"
        />
      </Field>

      <Field label="Terms / restrictions" full>
        <textarea
          name="terms"
          rows={4}
          defaultValue={coupon?.terms ?? ""}
          placeholder="e.g. One per household. Cannot be combined with other offers. Mention at time of booking."
          className="w-full border border-white/15 bg-black px-4 py-3 text-base text-white outline-none focus:border-[#F96302]"
        />
      </Field>

      <Field label="Publish?" full>
        <label className="inline-flex items-center gap-3 border border-white/15 bg-black px-4 py-3">
          <input
            type="checkbox"
            name="published"
            value="true"
            defaultChecked={coupon?.published ?? false}
            className="h-5 w-5 accent-[#F96302]"
          />
          <span className="text-base text-white">
            Show on /coupons/ (max 3 live at once)
          </span>
        </label>
      </Field>

      <div className="md:col-span-2 flex justify-end gap-3">
        <Link
          href="/admin/coupons"
          className="inline-flex items-center bg-transparent border border-white/15 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white/70 hover:border-[#F96302] hover:text-[#F96302]"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="inline-flex items-center bg-[#F96302] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:bg-[#e05602]"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  full = false,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-sm font-bold uppercase tracking-[0.12em] text-white/60 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
