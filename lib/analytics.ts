// Lightweight GA4 event helper.
// No-ops safely when gtag isn't present (e.g. NEXT_PUBLIC_GA_ID unset, or SSR).
// The gtag function is loaded by the inline script in app/layout.tsx.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag === "function") {
    window.gtag("event", name, params);
  } else if (Array.isArray(window.dataLayer)) {
    // Fallback if the gtag shim hasn't initialized yet.
    window.dataLayer.push({ event: name, ...params });
  }
}
