"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (window.location.protocol === "file:") return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // PWA optional — ignore in Electron/Capacitor
    });
  }, []);

  return null;
}
