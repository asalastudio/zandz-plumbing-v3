import { Award, ShieldCheck, Calendar, Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { siteSettings } from "@/content/site-settings";

interface TrustStripProps {
  invert?: boolean;
  compact?: boolean;
  className?: string;
}

interface TrustItem {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>;
  label: string;
  detail: string;
  star?: boolean;
}

const items: TrustItem[] = [
  {
    icon: ShieldCheck,
    label: siteSettings.cslb,
    detail: "C-36 + A General Engineering",
  },
  {
    icon: Calendar,
    label: `Since ${siteSettings.foundedYear}`,
    detail: "East Bay owned and operated",
  },
  {
    icon: Star,
    label: "4.6 on Google",
    detail: "19 verified reviews",
    star: true,
  },
  {
    icon: Star,
    label: "4.5 on Yelp",
    detail: "238 verified reviews",
    star: true,
  },
  {
    icon: Award,
    label: "24/7 Emergency",
    detail: "Same-day response",
  },
];

export function TrustStrip({ invert = false, compact = false, className }: TrustStripProps) {
  const borderClass = invert ? "border-white/10" : "border-[#E5E5E5]";
  const labelClass = invert ? "text-white" : "text-black";
  const detailClass = invert ? "text-white/70" : "text-[#4A4A4A]";
  const iconWrapClass = invert ? "bg-white/10" : "bg-[#F5F5F5]";

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5",
        className
      )}
      role="list"
      aria-label="Z and Z Plumbing credentials"
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            role="listitem"
            className={cn(
              "flex items-start gap-4 border bg-white p-5 md:p-6",
              borderClass,
              invert && "bg-white/5",
              compact && "p-3 md:p-4"
            )}
          >
            <div
              className={cn(
                "flex h-12 w-12 flex-shrink-0 items-center justify-center",
                iconWrapClass
              )}
            >
              <Icon
                className={cn(
                  "h-6 w-6 text-[#F96302]",
                  item.star && "fill-[#F96302]"
                )}
                strokeWidth={1.5}
                aria-hidden={true}
              />
            </div>
            <div className="min-w-0">
              <p
                className={cn(
                  "font-sans text-lg font-extrabold leading-tight md:text-xl",
                  labelClass
                )}
              >
                {item.label}
              </p>
              <p className={cn("mt-2 text-base leading-relaxed md:text-lg", detailClass)}>
                {item.detail}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
