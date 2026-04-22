/**
 * Logs serveur toujours écrits sur stdout (terminal `npm run dev`, logs Vercel, etc.).
 * Complète `demoVerbose` (dev / DEMO_DEBUG) pour le suivi du flux démo + Google Sheet.
 */
export function logDemoEvent(...args: unknown[]): void {
  if (process.env.DEMO_QUIET === "1") return;
  console.log("[demo]", ...args);
}
