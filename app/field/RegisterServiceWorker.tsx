"use client";

import { useEffect } from "react";

/** Registers the field PWA service worker on the client. No-op if unsupported. */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* registration is best-effort; the app works without it */
      });
    }
  }, []);
  return null;
}
