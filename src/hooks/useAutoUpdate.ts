"use client";

import { useEffect, useState } from "react";
import { fetchLatestRelease, hasUpdate } from "@/lib/update/github-releases";
import { useFinanceStore } from "@/store/finance-store";

export function useAutoUpdate() {
  const autoUpdate = useFinanceStore((s) => s.settings.autoUpdate !== false);
  const [updateUrl, setUpdateUrl] = useState<string | null>(null);
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    if (!autoUpdate) return;

    if (window.electronAPI?.isElectron) {
      window.electronAPI.checkForUpdates();
      return;
    }

    const check = async () => {
      const release = await fetchLatestRelease();
      if (!release || !hasUpdate(release.version)) return;

      setVersion(release.version);
      const { Capacitor } = await import("@capacitor/core");
      if (Capacitor.getPlatform() === "android" && release.androidUrl) {
        setUpdateUrl(release.androidUrl);
      } else {
        setUpdateUrl(release.pageUrl);
      }
    };

    check();
    const t = setInterval(check, 60 * 60 * 1000);
    return () => clearInterval(t);
  }, [autoUpdate]);

  return { updateUrl, version };
}
