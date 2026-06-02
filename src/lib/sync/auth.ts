import { DEFAULT_SYNC_PASSWORD } from "./constants";

export async function hashSyncPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function getDefaultAuthToken(): Promise<string> {
  return hashSyncPassword(DEFAULT_SYNC_PASSWORD);
}

export async function verifyAuthToken(
  token: string,
  expected: string
): Promise<boolean> {
  return token === expected;
}
