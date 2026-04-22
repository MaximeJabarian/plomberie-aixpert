import { readDemoAccessExpiresAt, readDemoTokenHash } from "@/lib/demo-access-storage";

function closingSyncStorageKey(tokenHash: string, expiresAt: number): string {
  return `demo_closing_ok_${tokenHash.slice(0, 24)}_${expiresAt}`;
}

let closingSyncInFlight = false;

/**
 * Quand la garde client détecte l’expiration (sans nouvel appel `/api/demo/session/...`),
 * demande au serveur d’écrire « Closing » dans Google Sheet (idempotent côté Sheet).
 */
export function requestDemoSheetClosingSyncIfNeeded(): void {
  if (typeof window === "undefined") return;
  const expiresAt = readDemoAccessExpiresAt();
  const tokenHash = readDemoTokenHash();
  if (expiresAt === null || !tokenHash) return;
  if (Date.now() <= expiresAt) return;

  const dedupeKey = closingSyncStorageKey(tokenHash, expiresAt);
  try {
    if (window.sessionStorage.getItem(dedupeKey) === "1") return;
  } catch {
    /* private mode */
  }

  if (closingSyncInFlight) return;
  closingSyncInFlight = true;

  void fetch(`${window.location.origin}/api/demo/closing`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tokenHash }),
  })
    .then(async (res) => {
      if (!res.ok) return;
      try {
        window.sessionStorage.setItem(dedupeKey, "1");
      } catch {
        /* ignore */
      }
    })
    .catch(() => {})
    .finally(() => {
      closingSyncInFlight = false;
    });
}
