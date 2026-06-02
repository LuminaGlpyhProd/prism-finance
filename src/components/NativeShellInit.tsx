"use client";

import { useEffect } from "react";

export function NativeShellInit() {
  useEffect(() => {
    const init = async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;

        const { StatusBar, Style } = await import("@capacitor/status-bar");
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: "#05060a" });

        const { App } = await import("@capacitor/app");
        const { useFinanceStore } = await import("@/store/finance-store");
        App.addListener("backButton", () => {
          const { activeView, setActiveView } = useFinanceStore.getState();
          if (activeView !== "dashboard") {
            setActiveView("dashboard");
          } else {
            App.exitApp();
          }
        });
      } catch {
        // Not running in Capacitor
      }
    };
    init();
  }, []);

  return null;
}
