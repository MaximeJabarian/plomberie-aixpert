import { createFileRoute } from "@tanstack/react-router";
import { Phone, Mail, MapPin, Clock, MessageSquare } from "lucide-react";
import { SITE } from "@/lib/site";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: `Contact — ${SITE.shortName} | Devis gratuit 24/7` },
      { name: "description", content: `Contactez votre plombier à ${SITE.city}. Téléphone ${SITE.phoneDisplay}, email, devis gratuit. Disponible 24h/24.` },
      { property: "og:title", content: `Contact — ${SITE.shortName}` },
      { property: "og:description", content: `Joignez-nous 24h/24 pour un devis ou une urgence à ${SITE.city}.` },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const subject = encodeURIComponent("Demande de devis — Plomberie Aixpert");
  const body = encodeURIComponent(`Bonjour,\n\nJe souhaite obtenir un devis pour :\n- Type d'intervention : \n- Adresse : \n- Urgence : oui / non\n\nMerci.`);
  const mailto = `mailto:${SITE.email}?subject=${subject}&body=${body}`;

  return (
    <div>
      <section className="bg-primary [background-image:var(--gradient-hero)] text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-20 md:py-24">
          <p className="text-sm font-medium uppercase tracking-wider text-accent">Contact</p>
          <h1 className="mt-3 font-display text-4xl md:text-6xl font-bold leading-tight">
            Parlons de <span className="text-accent">votre projet.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-primary-foreground/75">
            Disponible 24h/24, 7j/7. Réponse immédiate au téléphone, ou par email sous 2h.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 md:px-6 py-20 grid gap-6 md:grid-cols-2">
        <Reveal direction="left">
          <a href={`tel:${SITE.phone}`} className="card-lift group block rounded-2xl border border-border bg-card p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--gradient-copper)] text-black">
              <Phone className="h-7 w-7" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-semibold text-foreground">Appel direct</h2>
            <p className="mt-1 text-sm text-muted-foreground">Le plus rapide, recommandé pour les urgences.</p>
            <div className="mt-4 font-display text-2xl font-bold text-black">{SITE.phoneDisplay}</div>
          </a>
        </Reveal>

        <Reveal direction="right" delay={100}>
          <a href={mailto} className="card-lift group block rounded-2xl border border-border bg-card p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Mail className="h-7 w-7" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-semibold text-foreground">Envoyer un email</h2>
            <p className="mt-1 text-sm text-muted-foreground">Pour un devis détaillé ou une demande non urgente.</p>
            <div className="mt-4 text-base font-semibold break-all text-foreground">
              {SITE.email}
            </div>
          </a>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-20 grid gap-6 md:grid-cols-3">
        {[
          { Icon: MapPin, t: "Zone d'intervention", body: <><p className="mt-1 text-sm text-muted-foreground">{SITE.city} et alentours (15 km)</p><a href={SITE.mapsUrl} target="_blank" rel="noopener" className="mt-3 inline-block text-sm font-semibold text-accent hover:underline">Voir sur Google Maps →</a></> },
          { Icon: Clock, t: "Horaires", body: <p className="mt-1 text-sm text-muted-foreground">7j/7 — 24h/24<br/>Urgences toute l'année</p> },
          { Icon: MessageSquare, t: "Devis gratuit", body: <p className="mt-1 text-sm text-muted-foreground">Sans engagement, transparent, détaillé avant travaux.</p> },
        ].map(({ Icon, t, body }, idx) => (
          <Reveal key={t} delay={idx * 100}>
            <div className="card-lift h-full rounded-2xl border border-border bg-card p-6">
              <Icon className="h-6 w-6 text-accent" />
              <h3 className="mt-3 font-display text-lg font-semibold text-foreground">{t}</h3>
              {body}
            </div>
          </Reveal>
        ))}
      </section>

      <section className="border-t border-border">
        <iframe
          title="Carte Plomberie Aixpert — Aix-en-Provence"
          src="https://www.google.com/maps?q=Aix-en-Provence&output=embed"
          width="100%"
          height="400"
          loading="lazy"
          className="block w-full"
        />
      </section>
    </div>
  );
}
