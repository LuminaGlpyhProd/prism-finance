"use client";

import { useEffect } from "react";
import { useFinanceStore } from "@/store/finance-store";
import { useLanSync } from "@/hooks/useLanSync";
import { SyncStatusBar } from "./SyncStatusBar";
import { UpdateBanner } from "@/components/update/UpdateBanner";
import { useLauncherSettings } from "@/hooks/useLauncherSettings";

export function SyncBootstrap() {
  const ensureSyncSetup = useFinanceStore((s) => s.ensureSyncSetup);

  useEffect(() => {
    ensureSyncSetup();
  }, [ensureSyncSetup]);

  useLauncherSettings();
  useLanSync();

  return (
    <>
      <SyncStatusBar />
      <UpdateBanner />
    </>
  );
}
