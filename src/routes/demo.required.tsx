import { createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/demo/required")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  component: DemoRequiredPage,
});

function DemoRequiredPage() {
  const subject = encodeURIComponent("Je souhaiterai en savoir plus sur mon futur site web !");
  const body = encodeURIComponent(
    "Bonjour,\n\nJe souhaiterai en savoir plus sur mon futur site web.\n\nCordialement,",
  );
  const mailto = `mailto:${SITE.email}?subject=${subject}&body=${body}`;

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-foreground">
        <Lock className="h-7 w-7" aria-hidden />
      </div>
      <h1 className="mt-6 font-display text-3xl font-bold text-foreground">Accès sur invitation</h1>
      <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
        Cet espace vous est réservé : utilisez le <strong>lien personnel</strong> que nous vous avons communiqué pour
        poursuivre la visite. Si vous souhaitez le recevoir ou le renouveler, un message suffit.
      </p>
      <a
        href={mailto}
        className="mt-8 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
      >
        Demander un lien par e-mail
      </a>
    </div>
  );
}
