import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
  invert?: boolean;
  emitSchema?: boolean;
  className?: string;
}

export function FaqAccordion({
  items,
  invert = false,
  emitSchema = true,
  className,
}: FaqAccordionProps) {
  if (items.length === 0) return null;

  const surface = invert
    ? "border-white/10 bg-white/5"
    : "border-[#E5E5E5] bg-white";
  const questionColor = invert ? "text-white" : "text-black";
  const answerColor = invert ? "text-white/70" : "text-[#333333]";
  const iconColor = invert ? "text-white/60" : "text-[#666666]";

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {emitSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      {items.map((item, i) => (
        <details
          key={`${i}-${item.question}`}
          className={cn(
            "group border transition-colors duration-200 hover:border-[#F96302]",
            surface
          )}
        >
          <summary
            className={cn(
              "flex cursor-pointer items-start justify-between gap-4 p-6 md:p-7",
              "list-none [&::-webkit-details-marker]:hidden"
            )}
          >
            <span
              className={cn(
                "font-display text-2xl font-black uppercase leading-tight tracking-tight md:text-3xl",
                questionColor
              )}
            >
              {item.question}
            </span>
            <span
              className={cn(
                "mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center transition-transform duration-200 group-open:rotate-45",
                iconColor
              )}
              aria-hidden={true}
            >
              <Plus className="h-6 w-6" strokeWidth={2} />
            </span>
          </summary>
          <div
            className={cn(
              "border-t px-6 pb-6 pt-5 text-lg leading-relaxed md:px-7 md:pb-7",
              invert ? "border-white/10" : "border-[#E5E5E5]",
              answerColor
            )}
          >
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
