import { Link } from "@tanstack/react-router";
import { Phone, Menu, X, Droplets } from "lucide-react";
import { useState } from "react";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Accueil" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "À propos" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary [background-image:var(--gradient-hero)] text-primary-foreground">
            <Droplets className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            Plomberie <span className="text-accent">Aixpert</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${SITE.phone}`}
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-[var(--gradient-copper)] px-4 py-2 text-sm font-semibold text-black shadow-[var(--shadow-copper)] hover:opacity-95 transition"
          >
            <Phone className="h-4 w-4" />
            Appeler
          </a>
          <button
            onClick={() => setOpen((o) => !o)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md border border-border"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "md:hidden overflow-hidden border-t border-border/60 bg-background transition-[max-height] duration-300",
          open ? "max-h-96" : "max-h-0",
        )}
      >
        <nav className="flex flex-col px-4 py-3">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="py-3 text-base font-medium text-foreground/80 border-b border-border/50 last:border-0"
              activeProps={{ className: "text-accent" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
          <a
            href={`tel:${SITE.phone}`}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--gradient-copper)] px-4 py-3 text-sm font-semibold text-black"
          >
            <Phone className="h-4 w-4" /> {SITE.phoneDisplay}
          </a>
        </nav>
      </div>
    </header>
  );
}
