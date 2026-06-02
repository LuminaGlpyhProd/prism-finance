"use client";

import { useState, useEffect } from "react";
import { Wifi } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useFinanceStore } from "@/store/finance-store";
import { hashSyncPassword, getDefaultAuthToken } from "@/lib/sync/auth";
import { SYNC_PORT } from "@/lib/sync/constants";

export function SyncSettings() {
  const settings = useFinanceStore((s) => s.settings);
  const updateSyncSettings = useFinanceStore((s) => s.updateSyncSettings);
  const [password, setPassword] = useState("");
  const [hostIp, setHostIp] = useState(settings.syncHostIp);
  const [lanIps, setLanIps] = useState<string[]>([]);

  const isElectronHost =
    typeof window !== "undefined" && window.electronAPI?.isElectron;

  useEffect(() => {
    setHostIp(settings.syncHostIp);
  }, [settings.syncHostIp]);

  useEffect(() => {
    if (isElectronHost && settings.syncEnabled && settings.syncRole === "host") {
      window.electronAPI?.getLanAddresses().then(setLanIps);
      const t = setInterval(() => {
        window.electronAPI?.getLanAddresses().then(setLanIps);
      }, 5000);
      return () => clearInterval(t);
    }
  }, [isElectronHost, settings.syncEnabled, settings.syncRole]);

  const savePassword = async () => {
    const token = await hashSyncPassword(password || "126225169");
    updateSyncSettings({ syncAuthToken: token });
    setPassword("");
  };

  const useDefaultPassword = async () => {
    const token = await getDefaultAuthToken();
    updateSyncSettings({ syncAuthToken: token });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-white/50">
        Real-time sync only on the <strong>same Wi‑Fi</strong>. Your password
        must match on phone and PC. Off Wi‑Fi, each device keeps its own local
        data.
      </p>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={settings.syncEnabled}
          onChange={(e) => updateSyncSettings({ syncEnabled: e.target.checked })}
        />
        Enable Wi‑Fi sync (Phone Link style)
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={settings.syncAutoConnect !== false}
          onChange={(e) =>
            updateSyncSettings({ syncAutoConnect: e.target.checked })
          }
        />
        Auto-connect when app opens (same Wi‑Fi)
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={settings.autoUpdate !== false}
          onChange={(e) => updateSyncSettings({ autoUpdate: e.target.checked })}
        />
        Auto-check for app updates
      </label>

      {isElectronHost && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.startAtLogin !== false}
            onChange={(e) =>
              updateSyncSettings({ startAtLogin: e.target.checked })
            }
          />
          Start Prism when Windows starts
        </label>
      )}

      {!isElectronHost && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.startAtBoot !== false}
            onChange={(e) =>
              updateSyncSettings({ startAtBoot: e.target.checked })
            }
          />
          Open app after phone restart (when allowed by your phone)
        </label>
      )}

      {settings.syncEnabled && (
        <>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => updateSyncSettings({ syncRole: "host" })}
              className={`flex-1 py-2 rounded-xl text-sm ${
                settings.syncRole === "host" ? "glass-strong" : "glass"
              }`}
            >
              This device is PC (host)
            </button>
            <button
              type="button"
              onClick={() => updateSyncSettings({ syncRole: "join" })}
              className={`flex-1 py-2 rounded-xl text-sm ${
                settings.syncRole === "join" ? "glass-strong" : "glass"
              }`}
            >
              This device is phone
            </button>
          </div>

          {settings.syncRole === "host" && (
            <div className="glass rounded-xl p-3 text-sm space-y-2">
              <p className="flex items-center gap-2 text-cyan-300/90">
                <Wifi size={16} />
                PC must run the <strong>Windows .exe</strong> app
              </p>
              {lanIps.length > 0 ? (
                <p className="text-white/70">
                  Phone connects to:{" "}
                  <code className="text-cyan-200">
                    {lanIps[0]}:{SYNC_PORT}
                  </code>
                </p>
              ) : (
                <p className="text-white/40 text-xs">
                  Open the desktop app to see your LAN IP here.
                </p>
              )}
            </div>
          )}

          {settings.syncRole === "join" && (
            <div>
              <label className="text-xs text-white/50 block mb-1">
                PC address (from desktop app)
              </label>
              <input
                className="w-full glass rounded-xl px-3 py-2 bg-white/5 text-sm"
                placeholder="e.g. 192.168.1.12"
                value={hostIp}
                onChange={(e) => setHostIp(e.target.value)}
                onBlur={() => updateSyncSettings({ syncHostIp: hostIp.trim() })}
              />
            </div>
          )}

          <div>
            <label className="text-xs text-white/50 block mb-1">
              Sync password (same on both devices)
            </label>
            <input
              type="password"
              className="w-full glass rounded-xl px-3 py-2 bg-white/5 text-sm mb-2"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="ghost" onClick={savePassword}>
                Save password
              </Button>
              <Button size="sm" variant="outline" onClick={useDefaultPassword}>
                Use my default
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
