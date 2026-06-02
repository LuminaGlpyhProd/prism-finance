import { SYNC_PORT } from "./constants";

const DISCOVER_PORT = 9846;

export async function discoverPcHost(subnetPrefix: string): Promise<string | null> {
  const base = subnetPrefix.replace(/\.\d+$/, "");
  const tries = [subnetPrefix, ...Array.from({ length: 24 }, (_, i) => `${base}.${i + 1}`)];

  for (const ip of tries) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 350);
      const res = await fetch(`http://${ip}:${DISCOVER_PORT}/discover`, {
        signal: ctrl.signal,
      });
      clearTimeout(t);
      if (!res.ok) continue;
      const data = (await res.json()) as { ips?: string[] };
      if (data.ips?.[0]) return data.ips[0];
    } catch {
      // not this host
    }
  }
  return null;
}

export function subnetFromIp(ip: string): string | null {
  const parts = ip.trim().split(".");
  if (parts.length !== 4) return null;
  return parts.slice(0, 3).join(".") + ".1";
}

export { DISCOVER_PORT, SYNC_PORT };
