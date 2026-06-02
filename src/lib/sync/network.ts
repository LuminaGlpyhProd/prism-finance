/** True when device reports Wi‑Fi (mobile). Desktop host always allowed. */
export async function isOnWifi(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    const { Capacitor } = await import("@capacitor/core");
    if (Capacitor.isNativePlatform()) {
      const { Network } = await import("@capacitor/network");
      const status = await Network.getStatus();
      return status.connected && status.connectionType === "wifi";
    }
  } catch {
    // not native
  }

  if (window.electronAPI?.isElectron) {
    return true;
  }

  const conn = (navigator as Navigator & { connection?: { type?: string } })
    .connection;
  if (conn?.type === "wifi" || conn?.type === "ethernet") return true;

  // Unknown (desktop browser) — allow trying LAN
  return typeof window !== "undefined" && !/mobile/i.test(navigator.userAgent);
}

export function buildSyncUrl(hostIp: string, port: number): string {
  const host = hostIp.replace(/^https?:\/\//, "").split("/")[0];
  return `ws://${host}:${port}`;
}
