import { APP_VERSION, GITHUB_REPO } from "@/lib/version";

export interface ReleaseInfo {
  version: string;
  name: string;
  body: string;
  windowsUrl: string | null;
  androidUrl: string | null;
  pageUrl: string;
}

function parseVersion(tag: string): string {
  return tag.replace(/^v/, "");
}

function isNewer(latest: string, current: string): boolean {
  const a = latest.split(".").map(Number);
  const b = current.split(".").map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    if (diff !== 0) return diff > 0;
  }
  return false;
}

export async function fetchLatestRelease(): Promise<ReleaseInfo | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
      { headers: { Accept: "application/vnd.github+json" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const version = parseVersion(data.tag_name ?? "0.0.0");
    const assets = (data.assets ?? []) as { name: string; browser_download_url: string }[];

    const windowsUrl =
      assets.find((a) => a.name.endsWith(".exe"))?.browser_download_url ?? null;
    const androidUrl =
      assets.find((a) => a.name.endsWith(".apk"))?.browser_download_url ?? null;

    return {
      version,
      name: data.name ?? version,
      body: data.body ?? "",
      windowsUrl,
      androidUrl,
      pageUrl: data.html_url ?? `https://github.com/${GITHUB_REPO}/releases/latest`,
    };
  } catch {
    return null;
  }
}

export function hasUpdate(latestVersion: string): boolean {
  return isNewer(latestVersion, APP_VERSION);
}
