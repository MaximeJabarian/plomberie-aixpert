import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  clearDemoAccessExpiresAt,
  readDemoAccessExpiresAt,
  storeDemoAccessExpiresAt,
} from "@/lib/demo-access-storage";
import type { DemoSessionResult } from "@/lib/demo-types";

export const Route = createFileRoute("/demo/$token")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  loader: async ({ params }): Promise<DemoSessionResult> => {
    if (import.meta.env.SSR) {
      const { logDemoEvent } = await import("@/server/demo-terminal-log");
      logDemoEvent(
        "SSR loader /demo/$token — résolution session (longueur jeton =",
        params.token.length,
        ")",
      );
      const { resolveDemoSession } = await import("@/server/demo-token-service");
      return resolveDemoSession(params.token);
    }
    const res = await fetch(`${window.location.origin}/api/demo/session/${params.token}`);
    return (await res.json()) as DemoSessionResult;
  },
  component: DemoGatePage,
});

function DemoGatePage() {
  const data = Route.useLoaderData();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!data.ok) {
      // EXPIRED : conserver une date d’expiration passée pour que la garde root continue de
      // bloquer l’accueil après « Retour » (ne pas vider le stockage, sinon accès public).
      if (data.code === "EXPIRED") {
        const cur = readDemoAccessExpiresAt();
        if (cur === null || cur <= Date.now()) {
          storeDemoAccessExpiresAt(Date.now() - 60_000);
        }
      } else if (data.code === "NOT_FOUND") {
        clearDemoAccessExpiresAt();
      }
      setReady(true);
      return;
    }
    storeDemoAccessExpiresAt(data.expiresAt, data.tokenHash);
    setReady(true);
  }, [data]);

  if (!ready) {
    return <div className="mx-auto max-w-lg px-4 py-20 text-center text-sm text-muted-foreground">Vérification…</div>;
  }

  if (!data.ok) {
    const title =
      data.code === "EXPIRED"
        ? "Lien expiré"
        : data.code === "STORE_UNAVAILABLE"
          ? "Démo indisponible"
          : "Lien invalide";
    const detail =
      data.code === "EXPIRED"
        ? "Ce lien a déjà été ouvert et la fenêtre d’accès est dépassée."
        : data.code === "STORE_UNAVAILABLE"
          ? "La base Supabase (SUPABASE_URL + service role) n’est pas configurée pour cet environnement."
          : "Ce jeton n’existe pas ou a été révoqué.";

    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground">{title}</h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{detail}</p>
        <Link to="/" className="mt-8 inline-flex text-sm font-semibold text-accent hover:underline">
          Retour à l’accueil
        </Link>
      </div>
    );
  }

  // Token valide: on enregistre l’ouverture locale (expiration) puis on envoie vers le vrai site.
  return <Navigate to="/" replace />;
}
