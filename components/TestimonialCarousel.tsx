"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Testimonial } from "@/types/content";
import { TestimonialCard } from "@/components/TestimonialCard";

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  invert?: boolean;
  className?: string;
}

export function TestimonialCarousel({
  testimonials,
  invert = false,
  className,
}: TestimonialCarouselProps) {
  const [index, setIndex] = useState(0);
  const total = testimonials.length;
  if (total === 0) return null;

  const go = (next: number) => setIndex(((next % total) + total) % total);
  const prev = () => go(index - 1);
  const next = () => go(index + 1);

  const arrowSurface = invert
    ? "border-white/20 bg-transparent text-white hover:border-[#F96302] hover:text-[#F96302]"
    : "border-[#E5E5E5] bg-white text-black hover:border-[#F96302] hover:text-[#F96302]";

  return (
    <div className={cn("relative", className)} aria-roledescription="carousel" aria-label="Customer testimonials">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {testimonials.map((t) => (
            <div key={t.id} className="w-full flex-shrink-0 px-1">
              <TestimonialCard testimonial={t} invert={invert} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2" role="tablist" aria-label="Select testimonial">
          {testimonials.map((t, i) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Testimonial ${i + 1} of ${total}`}
              onClick={() => go(i)}
              className={cn(
                "h-2 transition-all duration-200",
                i === index ? "w-8 bg-[#F96302]" : invert ? "w-2 bg-white/30 hover:bg-white/50" : "w-2 bg-[#E5E5E5] hover:bg-[#999]"
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prev}
            className={cn(
              "flex h-11 w-11 items-center justify-center border transition-colors duration-150",
              arrowSurface
            )}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} aria-hidden={true} />
          </button>
          <button
            type="button"
            onClick={next}
            className={cn(
              "flex h-11 w-11 items-center justify-center border transition-colors duration-150",
              arrowSurface
            )}
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.5} aria-hidden={true} />
          </button>
        </div>
      </div>
    </div>
  );
}
