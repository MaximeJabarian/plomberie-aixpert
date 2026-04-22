import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, ShieldCheck, Heart, Sparkles, Phone } from "lucide-react";
import { SITE } from "@/lib/site";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `À propos — ${SITE.shortName} | Artisan plombier de confiance` },
      { name: "description", content: `Artisan plombier à ${SITE.city} depuis plus de 15 ans. Travail soigné, devis transparent, garantie décennale.` },
      { property: "og:title", content: `À propos — ${SITE.shortName}` },
      { property: "og:description", content: "Artisan plombier expérimenté, certifié, à votre service depuis plus de 15 ans." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 md:px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
        <Reveal direction="left">
          <p className="text-sm font-medium uppercase tracking-wider text-accent">Notre histoire</p>
          <h1 className="mt-3 font-display text-4xl md:text-6xl font-bold leading-tight text-foreground">
            L'artisanat <span className="text-accent">à votre service.</span>
          </h1>
          <p className="mt-6 text-lg text-foreground/80 leading-relaxed">
            Depuis plus de 15 ans, nous intervenons à {SITE.city} et dans toute la région. Notre engagement :
            un travail soigné, un devis clair, et la satisfaction de chaque client.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Plombier indépendant, nous mettons un point d'honneur à proposer des prix justes
            et des solutions durables. Pas de surprise, pas de surfacturation.
          </p>
        </Reveal>
        <div className="grid grid-cols-2 gap-4">
          {[
            { n: "15+", l: "années d'expérience" },
            { n: "2 000+", l: "clients satisfaits" },
            { n: "24/7", l: "disponibilité" },
            { n: "100%", l: "garantie travaux" },
          ].map((s, idx) => (
            <Reveal key={s.l} direction="scale" delay={idx * 100}>
              <div className="card-lift rounded-2xl border border-border bg-card p-6">
                <div className="font-display text-4xl font-bold text-accent">{s.n}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.l}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-secondary/40 border-y border-border">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-20">
          <Reveal direction="left">
            <h2 className="font-display text-3xl md:text-4xl font-bold max-w-2xl text-foreground">Nos engagements</h2>
          </Reveal>
          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {[
              { i: Award, t: "Certifié", d: "Artisan qualifié RGE et garantie décennale." },
              { i: ShieldCheck, t: "Assuré", d: "Responsabilité civile pro pour votre tranquillité." },
              { i: Heart, t: "Humain", d: "Écoute, conseil, transparence à chaque étape." },
              { i: Sparkles, t: "Soigné", d: "Travail propre, finitions impeccables." },
            ].map(({ i: Icon, t, d }, idx) => (
              <Reveal key={t} delay={idx * 100}>
                <Icon className="h-7 w-7 text-accent" />
                <h3 className="mt-3 font-display text-lg font-semibold text-foreground">{t}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 md:px-6 py-20 text-center">
        <Reveal direction="scale">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Faisons connaissance.</h2>
          <p className="mt-3 text-muted-foreground">Une question, un projet, une urgence ?</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href={`tel:${SITE.phone}`} className="btn-press inline-flex items-center gap-2 rounded-full bg-[var(--gradient-copper)] px-6 py-3.5 text-base font-semibold text-black shadow-[var(--shadow-copper)]">
              <Phone className="h-5 w-5" /> {SITE.phoneDisplay}
            </a>
            <Link to="/contact" className="btn-press inline-flex items-center gap-2 rounded-full border border-border px-6 py-3.5 text-base font-medium text-foreground hover:bg-secondary">
              Nous contacter
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
