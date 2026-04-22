import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { SITE } from "@/lib/site";

function buildMeetingRequestMailto(): string {
  const subject = encodeURIComponent(
    `Demande de rendez-vous — suite à la démo ${SITE.shortName}`,
  );
  const body = encodeURIComponent(
    `Bonjour,\n\nMa démo en ligne vient d’expirer. Je souhaiterais échanger avec vous pour un rendez-vous ou la suite de notre projet.\n\nCréneaux qui me conviennent :\n- \n- \n\nCordialement,`,
  );
  return `mailto:${SITE.email}?subject=${subject}&body=${body}`;
}

export const Route = createFileRoute("/demo/expired")({
  component: DemoExpiredPage,
});

function DemoExpiredPage() {
  const meetingMailto = buildMeetingRequestMailto();

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-bold text-foreground">Accès expiré</h1>
      <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
        La période d’essai de ce lien est terminée. Pour aller plus loin, proposons-nous un échange : un court rendez-vous
        téléphonique ou en visio permet de répondre à vos questions et d’avancer concrètement sur votre besoin.
      </p>
      <a
        href={meetingMailto}
        className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
      >
        <Mail className="h-4 w-4 shrink-0" aria-hidden />
        Proposer un rendez-vous par e-mail
      </a>
    </div>
  );
}
