"use client";

import { useState } from "react";
import { Camera, X } from "lucide-react";

interface PhotoUploadFieldProps {
  fileName?: string;
  onChange: (file: File | null) => void;
  label?: string;
  description?: string;
  variant?: "light" | "dark";
}

// Vercel rejects request bodies over 4.5MB before our code runs, and phone
// photos are often 5-12MB. Anything over this gets resized in the browser.
const RESIZE_ABOVE_BYTES = 3 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_EDGE_PX = 2048;
const JPEG_QUALITY = 0.82;

export function PhotoUploadField({
  fileName,
  onChange,
  label = "Add a photo",
  description = "Take a photo or choose one from your library.",
  variant = "light",
}: PhotoUploadFieldProps) {
  const isDark = variant === "dark";
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | null) => {
    setError(null);
    if (!file) {
      onChange(null);
      return;
    }
    if (file.size <= RESIZE_ABOVE_BYTES) {
      onChange(file);
      return;
    }

    setPreparing(true);
    try {
      const resized = await shrinkImage(file);
      if (resized && resized.size <= MAX_UPLOAD_BYTES) {
        onChange(resized);
      } else if (file.size <= MAX_UPLOAD_BYTES) {
        onChange(file);
      } else {
        onChange(null);
        setError("That photo is too large to send. Try a different one, or skip it and describe the problem.");
      }
    } finally {
      setPreparing(false);
    }
  };

  return (
    <div className="space-y-2">
      <label
        className={[
          "flex min-h-16 cursor-pointer items-center gap-3 border-2 px-4 py-4 transition-colors",
          isDark
            ? "border-white/15 bg-black text-white hover:border-[#F96302]"
            : "rounded-xl border-[#E5E5E5] bg-white text-black hover:border-[#F96302]",
        ].join(" ")}
      >
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => void handleFile(event.target.files?.[0] ?? null)}
        />
        <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#F96302] text-white">
          <Camera className="h-6 w-6" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-black uppercase tracking-[0.08em]">
            {preparing ? "Preparing photo..." : fileName ? "Photo ready" : label}
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

      {error && (
        <p role="alert" className={["text-sm", isDark ? "text-[#F96302]" : "text-[#B42318]"].join(" ")}>
          {error}
        </p>
      )}

      {fileName && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className={[
            "inline-flex min-h-11 items-center gap-1 rounded-xl px-3 text-base font-bold",
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

/**
 * Re-encode a large photo as a JPEG no wider or taller than MAX_EDGE_PX.
 * Returns null when the browser can't decode the format (some HEIC files),
 * in which case the caller falls back to the original.
 */
async function shrinkImage(file: File): Promise<File | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE_PX / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob) return null;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${baseName}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    return null;
  }
}
