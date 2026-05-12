import { Droplet } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";

interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
  linkWrapper?: boolean;
}

export function Logo({ variant = "dark", className, linkWrapper = true }: LogoProps) {
  const wordmarkColor = variant === "light" ? "text-white" : "text-black";

  const mark = (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Orange placeholder box — replaced when final SVG ships */}
      <div className="w-10 h-10 bg-[#F96302] flex items-center justify-center flex-shrink-0">
        <Droplet className="h-6 w-6 text-white" strokeWidth={1.75} aria-hidden="true" />
      </div>
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
    <Link href="/" aria-label="Z and Z Plumbing — Home">
      {mark}
    </Link>
  );
}
