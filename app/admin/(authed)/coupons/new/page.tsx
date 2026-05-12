import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CouponForm } from "../_form";

export const metadata = { title: "New coupon · Z and Z OS" };

export default function NewCouponPage() {
  return (
    <div className="pb-24 lg:pb-0">
      <Link
        href="/admin/coupons"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white/60 hover:text-[#F96302]"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back to coupons
      </Link>

      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F96302]">New coupon</p>
        <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
          Create Special Deal
        </h1>
        <p className="mt-3 max-w-2xl text-base text-white/70">
          Save as draft to preview, publish when ready. Max 3 coupons go live at once.
        </p>
      </header>

      <CouponForm action="/api/admin/coupons" submitLabel="Save coupon" />
    </div>
  );
}
