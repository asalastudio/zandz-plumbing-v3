"use client";

import { Camera, X } from "lucide-react";

interface PhotoUploadFieldProps {
  fileName?: string;
  onChange: (file: File | null) => void;
  label?: string;
  description?: string;
  variant?: "light" | "dark";
}

export function PhotoUploadField({
  fileName,
  onChange,
  label = "Add a photo",
  description = "Optional, but helpful for leaks, drains, water heaters, and access issues.",
  variant = "light",
}: PhotoUploadFieldProps) {
  const isDark = variant === "dark";

  return (
    <div className="space-y-2">
      <label
        className={[
          "flex cursor-pointer items-center gap-3 border-2 px-4 py-4 transition-colors",
          isDark
            ? "border-white/15 bg-black text-white hover:border-[#F96302]"
            : "rounded-xl border-[#E5E5E5] bg-white text-black hover:border-[#F96302]",
        ].join(" ")}
      >
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        />
        <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#F96302] text-white">
          <Camera className="h-6 w-6" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-black uppercase tracking-[0.12em]">
            {fileName ? "Photo ready" : label}
          </span>
          <span
            className={[
              "mt-1 block truncate text-sm leading-relaxed",
              isDark ? "text-white/60" : "text-[#666666]",
            ].join(" ")}
          >
            {fileName || description}
          </span>
        </span>
      </label>

      {fileName && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className={[
            "inline-flex items-center gap-1 text-sm font-bold",
            isDark ? "text-white/55 hover:text-[#F96302]" : "text-[#666666] hover:text-[#F96302]",
          ].join(" ")}
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Remove photo
        </button>
      )}
    </div>
  );
}
