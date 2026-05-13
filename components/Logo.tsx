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
 * Full brand logo (faucet + wordmark). Renders the supplied SVG from
 * /public/logo.svg at the appropriate size. The SVG already has the brand
 * color treatment built in, so the light/dark variant prop is preserved for
 * API compatibility but has no visual effect on the SVG itself.
 */
export function Logo({ className, linkWrapper = true }: LogoProps) {
  const mark = (
    <img
      src="/logo.svg"
      alt="Z and Z Plumbing"
      width={140}
      height={56}
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
