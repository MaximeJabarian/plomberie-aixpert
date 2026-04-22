import { Link } from "@tanstack/react-router";
import { Phone, Mail, MapPin, Clock, Droplets } from "lucide-react";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--gradient-copper)]">
              <Droplets className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-semibold">{SITE.name}</span>
          </div>
          <p className="mt-4 text-sm text-primary-foreground/70 max-w-md leading-relaxed">
            Votre plombier de confiance à {SITE.city} et alentours. Intervention rapide,
            travail soigné, devis transparent.
          </p>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-accent">
            Navigation
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
            <li><Link to="/services" className="hover:text-accent">Services</Link></li>
            <li><Link to="/about" className="hover:text-accent">À propos</Link></li>
            <li><Link to="/" hash="avis-clients" className="hover:text-accent">Avis clients</Link></li>
            <li><Link to="/contact" className="hover:text-accent">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-accent">
            Contact
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/80">
            <li className="flex items-start gap-2">
              <Phone className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
              <a href={`tel:${SITE.phone}`} className="hover:text-accent">{SITE.phoneDisplay}</a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
              <a href={`mailto:${SITE.email}`} className="hover:text-accent break-all">{SITE.email}</a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
              <a href={SITE.mapsUrl} target="_blank" rel="noopener" className="hover:text-accent">{SITE.city}</a>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
              <span>{SITE.hours}</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-5 text-xs text-primary-foreground/60 flex flex-wrap items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} {SITE.name}. Tous droits réservés.</p>
          <p>Plomberie Aixpert • Dépannage • Installation • {SITE.city}</p>
        </div>
      </div>
    </footer>
  );
}
