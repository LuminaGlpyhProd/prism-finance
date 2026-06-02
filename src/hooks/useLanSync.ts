"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useFinanceStore } from "@/store/finance-store";
import { SYNC_PORT } from "@/lib/sync/constants";
import { buildSyncUrl, isOnWifi } from "@/lib/sync/network";
import { discoverPcHost } from "@/lib/sync/discover";
import type { FinanceSyncSnapshot, SyncConnectionStatus, SyncMessage } from "@/lib/sync/types";

let applyingRemote = false;

export function useLanSync() {
  const settings = useFinanceStore((s) => s.settings);
  const updateSyncSettings = useFinanceStore((s) => s.updateSyncSettings);
  const getSyncSnapshot = useFinanceStore((s) => s.getSyncSnapshot);
  const applySyncSnapshot = useFinanceStore((s) => s.applySyncSnapshot);
  const syncRevision = useFinanceStore((s) => s.syncRevision);

  const [status, setStatus] = useState<SyncConnectionStatus>("off");
  const [hostAddresses, setHostAddresses] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hostCleanupRef = useRef<(() => void) | null>(null);

  const enabled = settings.syncEnabled;
  const autoConnect = settings.syncAutoConnect !== false;
  const role = settings.syncRole;
  const authToken = settings.syncAuthToken;

  const broadcast = useCallback(
    (snap?: FinanceSyncSnapshot) => {
      if (applyingRemote) return;
      const payload = snap ?? getSyncSnapshot();

      if (role === "host" && window.electronAPI?.isElectron) {
        window.electronAPI.pushSyncState(payload);
        return;
      }

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: "state", payload } satisfies SyncMessage)
        );
      }
    },
    [getSyncSnapshot, role]
  );

  const resolveHostIp = useCallback(async (): Promise<string> => {
    if (settings.syncHostIp) return settings.syncHostIp;
    if (settings.lastKnownHostIp) return settings.lastKnownHostIp;

    const seed = settings.lastKnownHostIp || settings.syncHostIp;
    const prefix = seed
      ? `${seed.split(".").slice(0, 3).join(".")}.1`
      : "192.168.1.1";

    const found = await discoverPcHost(prefix);
    if (found) {
      updateSyncSettings({ syncHostIp: found, lastKnownHostIp: found });
      return found;
    }
    return "";
  }, [settings.syncHostIp, settings.lastKnownHostIp, updateSyncSettings]);

  const connectAsClient = useCallback(async () => {
    if (!enabled || role !== "join" || !authToken) {
      setStatus("off");
      return;
    }

    if (!(await isOnWifi())) {
      setStatus("waiting_wifi");
      return;
    }

    let targetIp = settings.syncHostIp || settings.lastKnownHostIp;
    if (!targetIp && autoConnect) {
      setStatus("connecting");
      targetIp = await resolveHostIp();
    }

    if (!targetIp) {
      setStatus("error");
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus("connecting");

    try {
      const ws = new WebSocket(buildSyncUrl(targetIp, SYNC_PORT));
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "auth", token: authToken } satisfies SyncMessage));
      };

      ws.onmessage = (event) => {
        let msg: SyncMessage;
        try {
          msg = JSON.parse(event.data as string);
        } catch {
          return;
        }

        if (msg.type === "auth_ok") {
          setStatus("connected");
          updateSyncSettings({
            lastKnownHostIp: targetIp,
            syncHostIp: settings.syncHostIp || targetIp,
          });
          broadcast();
          return;
        }

        if (msg.type === "auth_fail") {
          setStatus("auth_failed");
          ws.close();
          return;
        }

        if (msg.type === "state" && msg.payload) {
          applyingRemote = true;
          applySyncSnapshot(msg.payload);
          applyingRemote = false;
        }
      };

      ws.onclose = () => {
        setStatus("waiting_wifi");
        wsRef.current = null;
      };

      ws.onerror = () => {
        setStatus("error");
        ws.close();
      };
    } catch {
      setStatus("error");
    }
  }, [
    enabled,
    role,
    authToken,
    autoConnect,
    broadcast,
    applySyncSnapshot,
    updateSyncSettings,
    settings.syncHostIp,
    settings.lastKnownHostIp,
    resolveHostIp,
  ]);

  const startHost = useCallback(async () => {
    if (!enabled || role !== "host" || !authToken || !window.electronAPI) return;

    hostCleanupRef.current?.();
    const info = await window.electronAPI.startSyncHost(authToken);
    setHostAddresses(info.addresses);

    const cleanupRemote = window.electronAPI.onSyncRemoteState((payload) => {
      applyingRemote = true;
      applySyncSnapshot(payload);
      applyingRemote = false;
    });

    const cleanupNeed = window.electronAPI.onSyncNeedState(() => {
      broadcast();
    });

    hostCleanupRef.current = () => {
      cleanupRemote();
      cleanupNeed();
      window.electronAPI?.stopSyncHost();
    };

    setStatus("connected");
    broadcast();
  }, [enabled, role, authToken, applySyncSnapshot, broadcast]);

  const runSync = useCallback(() => {
    if (!enabled) return;
    if (role === "host") startHost();
    else connectAsClient();
  }, [enabled, role, startHost, connectAsClient]);

  useEffect(() => {
    if (!enabled) {
      setStatus("off");
      wsRef.current?.close();
      hostCleanupRef.current?.();
      hostCleanupRef.current = null;
      if (retryRef.current) clearInterval(retryRef.current);
      return;
    }

    runSync();
    retryRef.current = setInterval(runSync, 5000);

    const onVisible = () => {
      if (document.visibilityState === "visible") runSync();
    };
    document.addEventListener("visibilitychange", onVisible);

    let appListener: { remove: () => void } | undefined;
    (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (Capacitor.isNativePlatform()) {
          const { App } = await import("@capacitor/app");
          appListener = await App.addListener("appStateChange", ({ isActive }) => {
            if (isActive) runSync();
          });
        }
      } catch {
        /* optional */
      }
    })();

    return () => {
      wsRef.current?.close();
      hostCleanupRef.current?.();
      if (retryRef.current) clearInterval(retryRef.current);
      document.removeEventListener("visibilitychange", onVisible);
      appListener?.remove();
    };
  }, [enabled, role, authToken, settings.syncHostIp, runSync]);

  useEffect(() => {
    if (!enabled || applyingRemote) return;
    broadcast();
  }, [syncRevision, enabled, broadcast]);

  return { status, hostAddresses, port: SYNC_PORT };
}
