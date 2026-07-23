import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Load the logo off disk once per lambda for the PDF documents.
 *
 * react-pdf's Image only understands raster formats, so the SVGs in public/
 * cannot be used directly. Prefers the full wordmark (what a printed document
 * should carry); until a dark-text wordmark PNG is added at
 * public/email/logo-wordmark.png this falls back to the square faucet icon.
 */
export interface LoadedLogo {
  uri: string;
  /** Wide wordmark vs square icon — they need different widths in the layout. */
  isWordmark: boolean;
}

const CANDIDATES = [
  ["email", "logo-wordmark.png"],
  ["email", "logo-icon.png"],
];

let cached: LoadedLogo | null | undefined;

export async function loadLogo(): Promise<LoadedLogo | undefined> {
  if (cached !== undefined) return cached ?? undefined;
  for (const parts of CANDIDATES) {
    try {
      const buf = await readFile(path.join(process.cwd(), "public", ...parts));
      cached = {
        uri: `data:image/png;base64,${buf.toString("base64")}`,
        isWordmark: parts[1].includes("wordmark"),
      };
      return cached;
    } catch {
      // try next
    }
  }
  cached = null;
  return undefined;
}
