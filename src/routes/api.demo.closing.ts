import { createFileRoute } from "@tanstack/react-router";
import { recordDemoSheetClosingIfExpired } from "@/server/demo-token-service";

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Après expiration détectée côté client, enregistre la date « Closing » dans Google Sheet.
 * Pas d’auth : le hash seul ne permet pas de prolonger une démo ; le serveur recalcule l’expiration.
 */
export const Route = createFileRoute("/api/demo/closing")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return json(400, { ok: false, code: "BAD_JSON" });
        }
        const tokenHash =
          typeof body === "object" &&
          body !== null &&
          "tokenHash" in body &&
          typeof (body as { tokenHash: unknown }).tokenHash === "string"
            ? (body as { tokenHash: string }).tokenHash.trim()
            : "";

        if (!tokenHash) {
          return json(400, { ok: false, code: "MISSING_HASH" });
        }

        try {
          const r = await recordDemoSheetClosingIfExpired(tokenHash);
          if (!r.ok) {
            const status =
              r.code === "INVALID_HASH" ? 400 : r.code === "NOT_FOUND" ? 404 : 503;
            return json(status, r);
          }
          return json(200, r);
        } catch (e) {
          console.error("[demo] POST /api/demo/closing", e);
          return json(500, { ok: false, code: "SHEETS_ERROR" });
        }
      },
    },
  },
});
