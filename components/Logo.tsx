/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { cn } from "@/lib/cn";

interface LogoProps {
  /** kept for compat; supplied SVG already has its own color treatment */
  variant?: "light" | "dark";
  className?: string;
  linkWrapper?: boolean;
}

interface FaucetMarkProps {
  size?: number;
  className?: string;
}

/**
 * Standalone faucet mark in orange. Used by favicons + the Z and Z OS admin
 * chrome where the full wordmark would be too wide. Square aspect, scales
 * cleanly to any size.
 */
export function FaucetMark({ size = 44, className }: FaucetMarkProps) {
  return (
    <svg
      viewBox="0 0 80 80"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("flex-shrink-0", className)}
    >
      <rect
        x="4"
        y="4"
        width="72"
        height="72"
        rx="3"
        fill="none"
        stroke="#F96302"
        strokeWidth="5"
      />
      <g fill="#F96302">
        <rect x="31" y="14" width="6" height="6" />
        <rect x="22" y="20" width="24" height="6" />
        <rect x="31" y="26" width="6" height="12" />
        <rect x="18" y="38" width="30" height="14" />
        <rect x="48" y="42" width="14" height="6" />
      </g>
    </svg>
  );
}

/**
 * Full brand logo (faucet + wordmark). The light variant is the main
 * white/orange brand asset for black header/footer surfaces. The dark variant
 * stays compact for customer-facing white pages where the main mark would lose
 * contrast.
 */
export function Logo({ variant = "light", className, linkWrapper = true }: LogoProps) {
  // The "dark" variant is the dark-text wordmark for light surfaces (admin
  // chrome, field, customer track/invoice/estimate pages). "light" stays the
  // white/orange mark for black header/footer bands on the marketing site.
  const src = variant === "dark" ? "/logo-wordmark.svg" : "/logo.svg";
  const mark = (
    <img
      src={src}
      alt="Z and Z Plumbing"
      width={variant === "dark" ? 260 : 220}
      height={variant === "dark" ? 77 : 80}
      className={cn("h-12 w-auto md:h-14", className)}
    />
  );

  if (!linkWrapper) return mark;

  return (
    <Link href="/" aria-label="Z and Z Plumbing, Home" className="inline-flex items-center">
      {mark}
    </Link>
  );
}
