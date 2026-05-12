import Link from "next/link";
import {
  GitMerge,
  Pipette,
  Thermometer,
  AlertTriangle,
  Wrench,
  Droplet,
  Flame,
  ShowerHead,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { Service } from "@/types/content";

const iconMap: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  GitMerge,
  Pipette,
  Thermometer,
  AlertTriangle,
  Wrench,
  Droplet,
  Flame,
  ShowerHead,
  Trash2,
};

interface ServiceCardProps {
  service: Service;
  className?: string;
  dark?: boolean;
}

export function ServiceCard({ service, className, dark = false }: ServiceCardProps) {
  const Icon = iconMap[service.icon] ?? Wrench;

  return (
    <Link href={`/services/${service.slug}/`} className="group block">
      <article
        className={cn(
          "rounded-2xl border p-6 md:p-8 transition-all duration-200",
          "hover:-translate-y-1 hover:shadow-lg hover:border-[#F96302]",
          dark
            ? "bg-white/5 border-white/10 text-white"
            : "bg-white border-[#E5E5E5] text-black",
          className
        )}
      >
        <div className="mb-4">
          <Icon className="h-8 w-8 text-[#F96302]" strokeWidth={1.5} aria-hidden="true" />
        </div>
        <h3
          className={cn(
            "font-display text-2xl md:text-3xl font-black uppercase tracking-tight mb-2",
            dark ? "text-white" : "text-black"
          )}
        >
          {service.shortTitle}
        </h3>
        <p
          className={cn(
            "text-base leading-relaxed mb-4",
            dark ? "text-white/70" : "text-[#333333]"
          )}
        >
          {service.summary}
        </p>
        <span className="text-sm font-medium text-[#F96302] group-hover:underline">
          Learn more &rarr;
        </span>
      </article>
    </Link>
  );
}
