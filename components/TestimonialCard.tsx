import { Star } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Testimonial } from "@/types/content";

interface TestimonialCardProps {
  testimonial: Testimonial;
  invert?: boolean;
  className?: string;
}

const platformLabel: Record<Testimonial["platform"], string> = {
  google: "Google",
  yelp: "Yelp",
  buildzoom: "Buildzoom",
  other: "Verified",
};

export function TestimonialCard({ testimonial, invert = false, className }: TestimonialCardProps) {
  const surface = invert
    ? "border border-white/10 bg-white/5 text-white"
    : "border border-[#E5E5E5] bg-white text-black";
  const platformMeta = invert ? "text-white/50" : "text-[#666666]";
  const quoteColor = invert ? "text-white/85" : "text-[#333333]";
  const authorColor = invert ? "text-white" : "text-black";
  const serviceColor = invert ? "text-white/55" : "text-[#666666]";

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#F96302] md:p-7",
        surface,
        className
      )}
    >
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4",
                i < testimonial.rating ? "text-[#F96302]" : invert ? "text-white/20" : "text-[#E5E5E5]"
              )}
              fill={i < testimonial.rating ? "#F96302" : "transparent"}
              aria-hidden={true}
            />
          ))}
          <span className="sr-only">{testimonial.rating} out of 5 stars</span>
        </div>
        <span className={cn("text-xs font-bold uppercase tracking-[0.12em]", platformMeta)}>
          {platformLabel[testimonial.platform]}
        </span>
      </header>

      <blockquote className={cn("flex-1 font-sans text-lg leading-relaxed", quoteColor)}>
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>

      <footer className="mt-6 border-t pt-5 text-base" style={{ borderColor: invert ? "rgba(255,255,255,0.08)" : "#E5E5E5" }}>
        <p className={cn("font-display text-lg font-black uppercase tracking-tight", authorColor)}>
          {testimonial.authorFirstName}
          <span className={cn("ml-2 font-sans text-sm font-bold uppercase tracking-[0.12em]", platformMeta)}>
            {testimonial.authorCity}
          </span>
        </p>
        {testimonial.servicePerformed && (
          <p className={cn("mt-1.5 text-sm", serviceColor)}>{testimonial.servicePerformed}</p>
        )}
      </footer>
    </article>
  );
}
