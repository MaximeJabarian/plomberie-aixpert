/**
 * Logs détaillés pour le flux démo (session, Sheets, notifications).
 * Activé si `NODE_ENV === "development"` (ex. `npm run dev`) ou `DEMO_DEBUG=1`.
 */
export function isDemoVerbose(): boolean {
  return process.env.DEMO_DEBUG === "1" || process.env.NODE_ENV === "development";
}

export function demoVerbose(...args: unknown[]): void {
  if (isDemoVerbose()) {
    console.log("[demo:verbose]", ...args);
  }
}
