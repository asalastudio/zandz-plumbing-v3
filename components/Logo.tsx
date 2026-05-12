import Link from "next/link";
import { cn } from "@/lib/cn";

interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
  linkWrapper?: boolean;
}

interface FaucetMarkProps {
  size?: number;
  className?: string;
}

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
      {/* Orange-bordered square frame, transparent interior so it sits on any background */}
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
      {/* Faucet silhouette in orange */}
      <g fill="#F96302">
        {/* Top vertical nub on the cross handle */}
        <rect x="31" y="14" width="6" height="6" />
        {/* Horizontal handle bar */}
        <rect x="22" y="20" width="24" height="6" />
        {/* Stem from handle down to body */}
        <rect x="31" y="26" width="6" height="12" />
        {/* Main body */}
        <rect x="18" y="38" width="30" height="14" />
        {/* Spout extending right */}
        <rect x="48" y="42" width="14" height="6" />
      </g>
    </svg>
  );
}

export function Logo({ variant = "dark", className, linkWrapper = true }: LogoProps) {
  const wordmarkColor = variant === "light" ? "text-white" : "text-black";

  const mark = (
    <div className={cn("flex items-center gap-3", className)}>
      <FaucetMark size={44} />
      <span
        className={cn(
          "font-display font-black uppercase text-xl leading-none tracking-tight",
          wordmarkColor
        )}
      >
        Z AND Z PLUMBING
      </span>
    </div>
  );

  if (!linkWrapper) return mark;

  return (
    <Link href="/" aria-label="Z and Z Plumbing, Home" className="inline-flex">
      {mark}
    </Link>
  );
}
