const DEMO_ACCESS_EXPIRES_AT_KEY = "demo_access_expires_at";
const DEMO_TOKEN_HASH_KEY = "demo_token_hash";

export function storeDemoAccessExpiresAt(expiresAt: number, tokenHash?: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_ACCESS_EXPIRES_AT_KEY, String(expiresAt));
  if (typeof tokenHash === "string" && tokenHash.length > 0) {
    window.localStorage.setItem(DEMO_TOKEN_HASH_KEY, tokenHash);
  }
}

export function readDemoTokenHash(): string | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(DEMO_TOKEN_HASH_KEY)?.trim();
  if (!raw) return null;
  return raw;
}

export function readDemoAccessExpiresAt(): number | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(DEMO_ACCESS_EXPIRES_AT_KEY);
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    window.localStorage.removeItem(DEMO_ACCESS_EXPIRES_AT_KEY);
    return null;
  }
  return parsed;
}

export function clearDemoAccessExpiresAt(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DEMO_ACCESS_EXPIRES_AT_KEY);
  window.localStorage.removeItem(DEMO_TOKEN_HASH_KEY);
}
