/** Évite des lignes `[demo] Navigation → …` en double pour le même chemin (Strict Mode, double fetch, etc.). */
let lastPath = "";
let lastAt = 0;
const WINDOW_MS = 1200;

export function shouldLogNavHintOnce(path: string, now = Date.now()): boolean {
  if (path === lastPath && now - lastAt < WINDOW_MS) {
    return false;
  }
  lastPath = path;
  lastAt = now;
  return true;
}
