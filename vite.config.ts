// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
//
// Vercel: builds set VERCEL=1 — we disable the Cloudflare worker output and emit a Nitro
// bundle so SSR and /api/* server routes resolve (otherwise static hosting → 404).
// Dynamic import avoids a Vite ↔ Nitro require cycle on config load.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const deployVercel = process.env.VERCEL === "1";
const nitroPlugins = deployVercel ? [(await import("nitro/vite")).nitro()] : [];

export default defineConfig({
  cloudflare: deployVercel ? false : undefined,
  tanstackStart: deployVercel
    ? {
        prerender: {
          enabled: false,
        },
      }
    : undefined,
  plugins: nitroPlugins,
});
