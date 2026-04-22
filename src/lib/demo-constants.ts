/** Durée serveur d’accès après la première ouverture (ms). Modifier ici pour changer la fenêtre (ex. 30 s). */
export const DEMO_ACCESS_WINDOW_MS = 30 * 1000;

/**
 * Si `true`, tout le site (hors `/demo/*` et `/admin/*`) exige une session démo encore valide dans le navigateur.
 * Désactiver uniquement pour du dev SEO / marketing local : `.env` → `VITE_DEMO_PUBLIC_BROWSING=1`.
 */
export function isDemoSiteGateStrict(): boolean {
  try {
    return import.meta.env.VITE_DEMO_PUBLIC_BROWSING !== "1";
  } catch {
    return true;
  }
}

/** Libellé pour les textes UI (message d’expiration, etc.). */
export function describeDemoAccessWindowFr(): string {
  const ms = DEMO_ACCESS_WINDOW_MS;
  if (ms < 60_000) {
    const s = Math.round(ms / 1000);
    return `${s} seconde${s > 1 ? "s" : ""}`;
  }
  const m = ms / 60_000;
  if (Number.isInteger(m)) {
    return `${m} minute${m > 1 ? "s" : ""}`;
  }
  const min = Math.floor(ms / 60_000);
  const sec = Math.round((ms % 60_000) / 1000);
  return `${min} min ${sec} s`;
}
