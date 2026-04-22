import { useCallback, useEffect, useLayoutEffect } from "react";
import {
  Outlet,
  Link,
  createRootRoute,
  HeadContent,
  Scripts,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MobileCallBar } from "@/components/MobileCallBar";
import { isDemoSiteGateStrict } from "@/lib/demo-constants";
import { readDemoAccessExpiresAt } from "@/lib/demo-access-storage";
import { requestDemoSheetClosingSyncIfNeeded } from "@/lib/demo-sheet-closing-client";
import { SITE } from "@/lib/site";

import appCss from "../styles.css?url";

/** Évite deux logs identiques (ex. React Strict Mode qui rejoue l’effet au montage). */
let lastDemoNavHintPath = "";
let lastDemoNavHintAt = 0;
const DEMO_NAV_HINT_DEDUP_MS = 750;

function isGuardBypassedPath(pathname: string): boolean {
  return pathname === "/demo" || pathname.startsWith("/demo/") || pathname.startsWith("/admin/");
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: SITE.shortName },
      { name: "description", content: `${SITE.shortName} — intervention plomberie rapide à ${SITE.city}.` },
      { name: "author", content: SITE.shortName },
      { property: "og:title", content: SITE.shortName },
      { property: "og:description", content: `${SITE.shortName} — intervention plomberie rapide à ${SITE.city}.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: SITE.shortName },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

/** En `vite dev`, ping le serveur à chaque navigation pour journaliser dans le terminal où l’écriture Sheet est (ou non) concernée. */
function DemoNavTerminalLogger() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const now = Date.now();
    if (
      pathname === lastDemoNavHintPath &&
      now - lastDemoNavHintAt < DEMO_NAV_HINT_DEDUP_MS
    ) {
      return;
    }
    lastDemoNavHintPath = pathname;
    lastDemoNavHintAt = now;
    void fetch(`/api/demo/nav-hint?path=${encodeURIComponent(pathname)}`, { method: "GET" });
  }, [pathname]);
  return null;
}

/**
 * Garde d’accès démo : en mode strict (défaut), tout le site hors `/demo/*` et `/admin/*` exige une session
 * locale encore valide. Sinon renvoie vers `/demo/required` ou `/demo/expired`.
 */
function DemoAccessExpiryGuard() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  const runExpiryCheck = useCallback(
    (path: string) => {
      if (isGuardBypassedPath(path)) return;

      const expiresAt = readDemoAccessExpiresAt();

      if (!isDemoSiteGateStrict()) {
        if (expiresAt === null) return;
        if (Date.now() <= expiresAt) return;
        requestDemoSheetClosingSyncIfNeeded();
        void navigate({ to: "/demo/expired", replace: true });
        return;
      }

      if (expiresAt === null) {
        void navigate({ to: "/demo/required", replace: true });
        return;
      }
      if (Date.now() <= expiresAt) return;

      requestDemoSheetClosingSyncIfNeeded();
      void navigate({ to: "/demo/expired", replace: true });
    },
    [navigate],
  );

  useLayoutEffect(() => {
    runExpiryCheck(pathname);
  }, [pathname, runExpiryCheck]);

  useEffect(() => {
    const id = window.setInterval(() => {
      runExpiryCheck(window.location.pathname);
    }, 1000);
    return () => window.clearInterval(id);
  }, [runExpiryCheck]);

  return null;
}

function RootComponent() {
  return (
    <div className="flex min-h-screen flex-col pb-24 md:pb-0">
      <DemoNavTerminalLogger />
      <DemoAccessExpiryGuard />
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <MobileCallBar />
    </div>
  );
}
