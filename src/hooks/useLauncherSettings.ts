"use client";

import { useEffect } from "react";
import { useFinanceStore } from "@/store/finance-store";
import { setAndroidStartAtBoot } from "@/lib/launcher/android-boot";

export function useLauncherSettings() {
  const startAtLogin = useFinanceStore((s) => s.settings.startAtLogin);
  const startAtBoot = useFinanceStore((s) => s.settings.startAtBoot);

  useEffect(() => {
    if (!window.electronAPI?.isElectron) return;
    window.electronAPI.setOpenAtLogin(startAtLogin !== false);
  }, [startAtLogin]);

  useEffect(() => {
    setAndroidStartAtBoot(startAtBoot !== false);
  }, [startAtBoot]);
}
