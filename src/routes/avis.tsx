import { createFileRoute, redirect } from "@tanstack/react-router";

/** Ancienne URL : les avis sont sur l’accueil (#avis-clients). */
export const Route = createFileRoute("/avis")({
  beforeLoad: () => {
    throw redirect({ to: "/", hash: "avis-clients", replace: true });
  },
});
