import { cn } from "@/lib/cn";
import { Container } from "@/components/Container";

type SectionBg = "white" | "light-gray" | "black" | "near-black" | "hero-orange";
type SectionSize = "sm" | "md" | "lg";

interface SectionProps {
  children: React.ReactNode;
  bg?: SectionBg;
  size?: SectionSize;
  className?: string;
  containerClassName?: string;
  narrow?: boolean;
  as?: "section" | "div";
  id?: string;
  ariaLabel?: string;
}

const bgClasses: Record<SectionBg, string> = {
  white: "bg-white text-black",
  "light-gray": "bg-[#F5F5F5] text-black",
  black: "bg-black text-white",
  "near-black": "bg-[#111111] text-white",
  "hero-orange": "bg-[#F96302] text-white",
};

const sizeClasses: Record<SectionSize, string> = {
  sm: "py-12 md:py-16",
  md: "py-16 md:py-24",
  lg: "py-20 md:py-32",
};

export function Section({
  children,
  bg = "white",
  size = "md",
  className,
  containerClassName,
  narrow = false,
  as: Tag = "section",
  id,
  ariaLabel,
}: SectionProps) {
  return (
    <Tag
      id={id}
      aria-label={ariaLabel}
      className={cn(bgClasses[bg], sizeClasses[size], className)}
    >
      <Container narrow={narrow} className={containerClassName}>
        {children}
      </Container>
    </Tag>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  invert?: boolean;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  invert = false,
  className,
}: SectionHeadingProps) {
  const titleColor = invert ? "text-white" : "text-black";
  const descColor = invert ? "text-white/70" : "text-[#333333]";
  const alignment = align === "center" ? "text-center mx-auto max-w-3xl" : "";

  return (
    <div className={cn("mb-10 md:mb-12", alignment, className)}>
      {eyebrow && (
        <p className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#F96302] mb-3">
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "font-display text-5xl md:text-6xl font-black uppercase leading-tight",
          titleColor
        )}
      >
        {title}
      </h2>
      {description && (
        <p className={cn("mt-6 font-sans text-2xl md:text-3xl leading-relaxed max-w-3xl", descColor)}>
          {description}
        </p>
      )}
    </div>
  );
}
