import { createFileRoute } from "@tanstack/react-router";
import { shouldLogNavHintOnce } from "@/server/demo-nav-hint-dedupe";

/**
 * En développement, le layout appelle cette route à chaque changement de chemin
 * pour afficher dans le terminal où l’écriture Google Sheet est déclenchée (ou non).
 */
export const Route = createFileRoute("/api/demo/nav-hint")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const noisy =
          process.env.NODE_ENV === "development" || process.env.DEMO_DEBUG === "1";
        if (!noisy) {
          return new Response(null, { status: 204 });
        }

        const url = new URL(request.url);
        const path = url.searchParams.get("path")?.trim() || "/";

        if (!shouldLogNavHintOnce(path)) {
          return new Response(null, { status: 204 });
        }

        if (path === "/" || path === "") {
          console.log(
            "[demo] Navigation → accueil (/) — sans session démo valide, la garde renvoie vers /demo/required (sauf si VITE_DEMO_PUBLIC_BROWSING=1). " +
              "Append Google Sheet à la 1ʳᵉ ouverture /demo/<token>.",
          );
        } else if (path === "/demo/expired") {
          console.log(
            "[demo] Navigation → /demo/expired — page de fin de session (pas de loader /demo/<token> ici). " +
              "La colonne Sheet « Closing » est mise à jour côté serveur via POST /api/demo/closing quand la garde client " +
              "détecte l’expiration, ou via GET /api/demo/session/… quand le lien est rouvert en état EXPIRED.",
          );
        } else if (path === "/demo/required") {
          console.log(
            "[demo] Navigation → /demo/required — pas de session démo locale : le visiteur doit passer par un lien /demo/<token> pour parcourir le site.",
          );
        } else if (path.startsWith("/demo/")) {
          const tokenPart = path.slice("/demo/".length);
          if (!tokenPart || tokenPart === "<token>") {
            console.log(
              "[demo] Navigation → /demo/<token> détecté littéralement. Remplace <token> par une vraie valeur générée via POST /api/demo/tokens.",
            );
            return new Response(null, { status: 204 });
          }
          console.log(
            `[demo] Navigation → ${path} — vérif jeton + éventuelle écriture Sheet côté serveur au chargement (loader ou GET /api/demo/session/…).`,
          );
        } else {
          console.log(
            `[demo] Navigation → ${path} — pas d’écriture Google Sheet sur cette page (réservé à la 1ʳᵉ visite /demo/<token>).`,
          );
        }

        return new Response(null, { status: 204 });
      },
    },
  },
});
