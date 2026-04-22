import { createFileRoute } from "@tanstack/react-router";
import { resolveDemoSession } from "@/server/demo-token-service";
import { logDemoEvent } from "@/server/demo-terminal-log";

/**
 * Point d’entrée serveur : validation du jeton, première ouverture, fenêtre 10 min.
 * Le navigateur ne fait que consommer la réponse ; toute la logique métier est ici.
 */
export const Route = createFileRoute("/api/demo/session/$token")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        logDemoEvent(
          "API GET /api/demo/session/… — traitement serveur (longueur jeton =",
          params.token.length,
          ")",
        );
        const r = await resolveDemoSession(params.token);
        if (!r.ok) {
          const status =
            r.code === "EXPIRED" ? 403 : r.code === "STORE_UNAVAILABLE" ? 503 : 404;
          return Response.json(r, { status });
        }
        return Response.json(r);
      },
    },
  },
});
