import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, ShieldCheck, Clock, Wrench, Star, ArrowRight, CheckCircle2, Droplets, Flame, Toilet } from "lucide-react";
import heroImg from "@/assets/hero-plombier.jpg";
import { Reveal } from "@/components/Reveal";
import { CLIENT_REVIEWS, CLIENT_REVIEWS_RATING_DETAIL, CLIENT_REVIEWS_RATING_SCORE } from "@/lib/client-reviews";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `Plomberie Aixpert — Plombier à Aix-en-Provence, 24/7` },
      { name: "description", content: `Plomberie Aixpert à Aix-en-Provence. Dépannage urgence 24h/24, fuite, débouchage, chauffe-eau. Devis gratuit. Appelez ${SITE.phoneDisplay}.` },
      { property: "og:title", content: `Plomberie Aixpert — Aix-en-Provence, intervention 24/7` },
      { property: "og:description", content: `Plomberie Aixpert : dépannage rapide, installation, chauffe-eau. Devis gratuit à Aix-en-Provence.` },
      { property: "og:image", content: heroImg },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: heroImg },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Plumber",
          name: SITE.name,
          telephone: SITE.phoneDisplay,
          email: SITE.email,
          areaServed: SITE.city,
          address: { "@type": "PostalAddress", addressLocality: SITE.city, addressCountry: "FR" },
          openingHours: "Mo-Su 00:00-23:59",
          url: SITE.url,
        }),
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-primary [background-image:var(--gradient-hero)]" />
        <div className="relative mx-auto max-w-6xl px-4 md:px-6 pt-16 pb-20 md:pt-24 md:pb-32 grid md:grid-cols-2 gap-10 items-center">
          <Reveal direction="left" className="text-primary-foreground">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              Disponible 24h/24 — 7j/7
            </span>
            <h1 className="mt-5 font-display text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight">
              Plombier à <span className="text-accent">Aix-en-Provence</span>.
              <br /> Intervention rapide.
            </h1>
            <p className="mt-5 text-lg text-primary-foreground/80 max-w-xl leading-relaxed">
              Fuite, débouchage, chauffe-eau, installation : un artisan qualifié chez vous en
              moins d'une heure. Devis transparent, travail garanti.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`tel:${SITE.phone}`}
                className="btn-press inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3.5 text-base font-semibold text-white shadow-sm backdrop-blur-sm hover:bg-white/20"
              >
                <Phone className="h-5 w-5 shrink-0" aria-hidden /> {SITE.phoneDisplay}
              </a>
              <Link
                to="/contact"
                className="btn-press inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/5 px-6 py-3.5 text-base font-medium text-primary-foreground hover:bg-primary-foreground/10"
              >
                Demander un devis <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              {[
                { n: "15+", l: "ans d'expérience" },
                { n: "2 000+", l: "interventions" },
                { n: "5,0/5", l: "satisfaction" },
              ].map((s, i) => (
                <Reveal key={s.l} delay={200 + i * 100}>
                  <div className="font-display text-2xl font-bold text-accent">{s.n}</div>
                  <div className="text-xs text-primary-foreground/70 mt-1">{s.l}</div>
                </Reveal>
              ))}
            </div>
          </Reveal>

          <Reveal direction="right" delay={150} className="relative">
            <div className="absolute -inset-4 bg-accent/20 blur-3xl rounded-full" />
            <img
              src={heroImg}
              alt="Plomberie Aixpert — intervention à Aix-en-Provence"
              width={1920}
              height={1080}
              className="relative rounded-2xl shadow-[var(--shadow-elegant)] border border-primary-foreground/10"
            />
          </Reveal>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { i: Clock, t: "Intervention < 1h" },
            { i: ShieldCheck, t: "Artisan assuré" },
            { i: Wrench, t: "Devis gratuit" },
            { i: Star, t: "Garantie travaux" },
          ].map(({ i: Icon, t }, idx) => (
            <Reveal key={t} delay={idx * 80} className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium text-foreground">{t}</span>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 py-20">
        <Reveal direction="left" className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-wider text-accent">Nos services</p>
          <h2 className="mt-2 font-display text-3xl md:text-5xl font-bold text-foreground">
            Une expertise complète, du dépannage à l'installation.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            { i: Droplets, t: "Recherche & réparation de fuite", d: "Détection précise sans casse, intervention rapide pour limiter les dégâts." },
            { i: Toilet, t: "Débouchage canalisations", d: "WC, éviers, douches : matériel professionnel, résultat garanti." },
            { i: Flame, t: "Chauffe-eau & chaudière", d: "Installation, entretien et dépannage toutes marques." },
          ].map(({ i: Icon, t, d }, idx) => (
            <Reveal key={t} direction="scale" delay={idx * 120}>
              <div className="card-lift h-full rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                    <Icon className="h-6 w-6 stroke-[2.3]" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground">{t}</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={300} className="mt-10">
          <Link to="/services" className="story-link inline-flex items-center gap-2 text-sm font-semibold text-accent hover:gap-3 transition-all">
            Voir tous nos services <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </section>

      {/* AVIS CLIENTS — bandeau défilant infini */}
      <section id="avis-clients" className="scroll-mt-28 border-y border-border bg-secondary/30">
        <div className="mx-auto max-w-3xl px-4 md:px-6 pt-16 md:pt-24 text-center">
          <Reveal direction="up" className="text-center">
            <p className="text-sm font-medium uppercase tracking-wider text-accent">Ils nous font confiance</p>
            <div className="mt-4 inline-flex items-center justify-center gap-1" aria-hidden>
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-accent text-accent md:h-7 md:w-7" />
              ))}
            </div>
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold text-foreground">
              <span className="text-accent">{CLIENT_REVIEWS_RATING_SCORE}</span>
            </h2>
            <p className="mt-1 text-base text-muted-foreground md:text-lg">{CLIENT_REVIEWS_RATING_DETAIL}</p>
            <a
              href={SITE.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex text-sm font-semibold text-accent hover:underline"
            >
              Voir sur Google Maps →
            </a>
          </Reveal>
        </div>

        <div className="relative mt-10 pb-16 md:pb-24">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-secondary/90 to-transparent md:w-24"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-secondary/90 to-transparent md:w-24"
            aria-hidden
          />
          <div className="overflow-hidden">
            <div className="home-reviews-marquee">
              {[0, 1].map((dup) => (
                <div key={dup} className="flex shrink-0 gap-5">
                  {CLIENT_REVIEWS.map((r) => (
                    <article
                      key={`${dup}-${r.name}-${r.city}`}
                      className="w-[min(22rem,calc(100vw-2.5rem))] shrink-0 rounded-2xl border border-border bg-card p-6 text-left shadow-sm"
                    >
                      <div className="flex gap-0.5" aria-hidden>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                        ))}
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-foreground/90">&ldquo;{r.text}&rdquo;</p>
                      <div className="mt-4 border-t border-border pt-3">
                        <p className="font-display text-sm font-semibold text-foreground">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.city}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-20">
          <Reveal direction="left" className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-wider text-accent">Notre méthode</p>
            <h2 className="mt-2 font-display text-3xl md:text-5xl font-bold">Simple, rapide, transparent.</h2>
          </Reveal>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { n: "01", t: "Vous appelez", d: "Diagnostic au téléphone et estimation immédiate." },
              { n: "02", t: "On intervient", d: "Artisan chez vous en moins d'une heure sur Aix." },
              { n: "03", t: "Travail garanti", d: "Devis avant travaux, paiement après satisfaction." },
            ].map((s, idx) => (
              <Reveal key={s.n} delay={idx * 120}>
                <div className="font-display text-6xl font-bold text-accent/40">{s.n}</div>
                <h3 className="mt-2 font-display text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-primary-foreground/75 leading-relaxed">{s.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-4xl px-4 md:px-6 py-20 text-center">
        <Reveal direction="scale">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Une urgence ? <span className="text-accent">Appelez maintenant.</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Notre équipe répond 24h/24. Devis gratuit, intervention rapide à {SITE.city} et alentours.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={`tel:${SITE.phone}`} className="btn-press inline-flex items-center gap-2 rounded-full bg-[var(--gradient-copper)] px-6 py-3.5 text-base font-semibold text-black shadow-[var(--shadow-copper)]">
              <Phone className="h-5 w-5" /> {SITE.phoneDisplay}
            </a>
            <Link to="/contact" className="btn-press inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-base font-medium text-foreground hover:bg-secondary">
              Nous écrire <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {["Aix-en-Provence", "Bouc-Bel-Air", "Venelles", "Le Tholonet", "Puyricard"].map((v) => (
              <li key={v} className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-accent" />{v}</li>
            ))}
          </ul>
        </Reveal>
      </section>
    </div>
  );
}
