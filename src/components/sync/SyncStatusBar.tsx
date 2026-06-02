"use client";

import { Wifi, WifiOff, Loader2, ShieldAlert } from "lucide-react";
import { useLanSync } from "@/hooks/useLanSync";
import { useFinanceStore } from "@/store/finance-store";
import { SYNC_PORT } from "@/lib/sync/constants";
import { cn } from "@/lib/utils";

export function SyncStatusBar() {
  const { status, hostAddresses } = useLanSync();
  const enabled = useFinanceStore((s) => s.settings.syncEnabled);
  const role = useFinanceStore((s) => s.settings.syncRole);

  if (!enabled) return null;

  const labels: Record<string, string> = {
    off: "Sync off",
    waiting_wifi: "Same Wi‑Fi required — waiting for Wi‑Fi",
    connecting: "Connecting on local network…",
    connected:
      role === "host"
        ? `Hosting sync · ${hostAddresses[0] ?? "PC"}:${SYNC_PORT}`
        : "Synced in real time (same Wi‑Fi)",
    auth_failed: "Wrong sync password",
    error: "Cannot reach PC — open desktop app on Wi‑Fi",
  };

  const icons = {
    off: WifiOff,
    waiting_wifi: WifiOff,
    connecting: Loader2,
    connected: Wifi,
    auth_failed: ShieldAlert,
    error: WifiOff,
  };

  const Icon = icons[status] ?? WifiOff;

  return (
    <div
      className={cn(
        "fixed top-0 inset-x-0 z-50 px-4 py-2 text-xs flex items-center justify-center gap-2 backdrop-blur-md border-b",
        status === "connected"
          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-200"
          : status === "auth_failed"
            ? "bg-red-500/15 border-red-500/30 text-red-200"
            : "bg-amber-500/10 border-amber-500/20 text-amber-100/90"
      )}
      style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
    >
      <Icon
        size={14}
        className={status === "connecting" ? "animate-spin" : undefined}
      />
      <span>{labels[status] ?? status}</span>
    </div>
  );
}
