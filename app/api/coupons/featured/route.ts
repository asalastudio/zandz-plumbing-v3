import { NextResponse } from "next/server";
import { listCoupons, type Coupon } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type FeaturedCoupon = Pick<
  Coupon,
  "id" | "headline" | "subheadline" | "code" | "valid_from" | "valid_until"
>;

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ coupon: null });
  }

  try {
    const coupons = await listCoupons({ publishedOnly: true });
    const coupon = coupons[0] ?? null;
    const featured: FeaturedCoupon | null = coupon
      ? {
          id: coupon.id,
          headline: coupon.headline,
          subheadline: coupon.subheadline,
          code: coupon.code,
          valid_from: coupon.valid_from,
          valid_until: coupon.valid_until,
        }
      : null;

    return NextResponse.json({ coupon: featured });
  } catch {
    return NextResponse.json({ coupon: null });
  }
}
