import { createFileRoute, Link } from "@tanstack/react-router";
import { Droplets, Toilet, Flame, Wrench, ShowerHead, Home, Phone, ArrowRight } from "lucide-react";
import { SITE } from "@/lib/site";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";

import serviceImg1 from "@/assets/service1.jpg";
import serviceImg2 from "@/assets/service2.jpg";
import serviceImg3 from "@/assets/service3.jpg";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: `Services de plomberie à Aix-en-Provence | ${SITE.shortName}` },
      { name: "description", content: "Dépannage urgence, recherche de fuite, débouchage, installation chauffe-eau, rénovation salle de bain à Aix-en-Provence." },
      { property: "og:title", content: "Services — Plomberie Aixpert — Aix-en-Provence" },
      { property: "og:description", content: "Tous nos services de plomberie : urgence, fuite, débouchage, chauffe-eau, rénovation." },
    ],
  }),
  component: ServicesPage,
});

const services = [
  { i: Droplets, t: "Recherche de fuite", d: "Détection sans casse par caméra thermique et acoustique. Devis avant intervention." },
  { i: Toilet, t: "Débouchage canalisations", d: "WC, éviers, douches, baignoires. Furet, hydrocureur, méthodes professionnelles." },
  { i: Flame, t: "Chauffe-eau & ballon", d: "Installation, remplacement, dépannage. Toutes marques : Atlantic, Thermor, De Dietrich." },
  { i: Wrench, t: "Dépannage urgence", d: "Disponible 24h/24 et 7j/7. Intervention en moins d'une heure sur Aix." },
  { i: ShowerHead, t: "Rénovation salle de bain", d: "Conception, plomberie, carrelage. Travaux clés en main avec garantie décennale." },
  { i: Home, t: "Installation sanitaire", d: "Robinetterie, WC, lavabos, douche italienne. Pose soignée et finitions." },
] as const;

const serviceVisualRows: { src: string; alt: string; items: (typeof services)[number][] }[] = [
  { src: serviceImg1, alt: "Intervention plomberie — recherche de fuite et débouchage", items: [services[0], services[1]] },
  { src: serviceImg2, alt: "Installation chauffe-eau et dépannage d’urgence", items: [services[2], services[3]] },
  { src: serviceImg3, alt: "Rénovation salle de bain et installation sanitaire", items: [services[4], services[5]] },
];

function ServicesPage() {
  return (
    <div>
      <section className="bg-primary [background-image:var(--gradient-hero)] text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-20 md:py-28">
          <p className="text-sm font-medium uppercase tracking-wider text-accent">Services</p>
          <h1 className="mt-3 font-display text-4xl md:text-6xl font-bold leading-tight">
            Une expertise complète <br className="hidden md:block" />
            pour votre <span className="text-accent">plomberie</span>.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-primary-foreground/75">
            De l'urgence au gros chantier, nous intervenons rapidement à {SITE.city} avec un savoir-faire artisanal et des
            matériaux de qualité.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 md:px-6 py-16 md:py-24">
        <Reveal direction="up" className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-wider text-accent">Détail des prestations</p>
          <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold text-foreground">
            Découvrez nos domaines d’intervention
          </h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Faites défiler la page : chaque bloc mêle visuel et description pour vous guider pas à pas.
          </p>
        </Reveal>

        <div className="mt-16 md:mt-24 flex flex-col gap-20 md:gap-28">
          {serviceVisualRows.map((row, rowIdx) => (
            <div
              key={row.alt}
              className={cn(
                "flex flex-col gap-10 lg:gap-14 lg:items-center",
                rowIdx % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row",
              )}
            >
              <Reveal
                direction={rowIdx % 2 === 0 ? "left" : "right"}
                delay={80}
                className="w-full shrink-0 lg:w-[46%]"
              >
                <div className="overflow-hidden rounded-2xl border border-border bg-muted shadow-[var(--shadow-elegant)]">
                  <img
                    src={row.src}
                    alt={row.alt}
                    width={1200}
                    height={800}
                    className="aspect-[4/3] w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </Reveal>

              <div className="flex min-w-0 flex-1 flex-col gap-6">
                {row.items.map((svc, i) => {
                  const Icon = svc.i;
                  return (
                    <Reveal key={svc.t} direction="up" delay={160 + i * 120}>
                      <article className="card-lift rounded-2xl border border-border bg-card p-7">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                            <Icon className="h-6 w-6 stroke-[2.3]" />
                          </div>
                          <h3 className="font-display text-xl font-semibold text-foreground">{svc.t}</h3>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{svc.d}</p>
                      </article>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 md:px-6 pb-24 text-center">
        <Reveal direction="scale">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Besoin d'un devis ?</h2>
          <p className="mt-3 text-muted-foreground">Réponse rapide, sans engagement.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={`tel:${SITE.phone}`}
              className="btn-press inline-flex items-center gap-2 rounded-full bg-[var(--gradient-copper)] px-6 py-3.5 text-base font-semibold text-black shadow-[var(--shadow-copper)]"
            >
              <Phone className="h-5 w-5" /> Appeler
            </a>
            <Link
              to="/contact"
              className="btn-press inline-flex items-center gap-2 rounded-full border border-border px-6 py-3.5 text-base font-medium text-foreground hover:bg-secondary"
            >
              Formulaire <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
