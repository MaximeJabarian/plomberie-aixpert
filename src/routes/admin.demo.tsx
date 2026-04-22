import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

type MintResponse =
  | {
      ok: true;
      token: string;
      recipientLabel: string;
      accessWindowMs: number;
      demoUrl: string;
      path: string;
    }
  | { ok: false; error?: string };

export const Route = createFileRoute("/admin/demo")({
  component: AdminDemoPage,
});

function AdminDemoPage() {
  const [secret, setSecret] = useState("");
  const [recipientLabel, setRecipientLabel] = useState("Prospect");
  const [accessWindowSeconds, setAccessWindowSeconds] = useState(300);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoUrl, setDemoUrl] = useState<string | null>(null);
  const [lastWindowMs, setLastWindowMs] = useState<number | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "ok" | "error">("idle");

  const durationLabel = useMemo(() => {
    const sec = Math.max(30, accessWindowSeconds);
    if (sec < 60) return `${sec} seconde${sec > 1 ? "s" : ""}`;
    const min = sec / 60;
    if (Number.isInteger(min)) return `${min} minute${min > 1 ? "s" : ""}`;
    return `${min.toFixed(1)} minutes`;
  }, [accessWindowSeconds]);

  async function onGenerate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDemoUrl(null);
    setCopyState("idle");

    try {
      const res = await fetch("/api/demo/tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({
          recipientLabel: recipientLabel.trim() || "Prospect",
          accessWindowSeconds,
        }),
      });

      const data = (await res.json()) as MintResponse;
      if (!res.ok || !data.ok) {
        if (res.status === 401) {
          setError(
            "Secret refusé : le champ doit être exactement le même que DEMO_ADMIN_SECRET dans .env (casse, espaces).",
          );
          return;
        }
        setError(
          data && "error" in data && data.error
            ? data.error
            : "Impossible de générer le lien. Vérifie le secret admin.",
        );
        return;
      }

      setDemoUrl(data.demoUrl);
      setLastWindowMs(data.accessWindowMs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!demoUrl) return;
    try {
      await navigator.clipboard.writeText(demoUrl);
      setCopyState("ok");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("error");
      window.setTimeout(() => setCopyState("idle"), 2200);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:py-20">
      <h1 className="font-display text-3xl font-bold text-foreground">Admin — Liens démo</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Génère un lien sécurisé avec une durée d’accès personnalisée. Sans secret admin valide, la création échoue.
      </p>

      <form onSubmit={onGenerate} className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="admin-secret">
            Secret admin
          </label>
          <input
            id="admin-secret"
            type="password"
            autoComplete="off"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none ring-accent/30 focus:ring"
            placeholder="DEMO_ADMIN_SECRET"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="recipient">
            Prospect / destinataire
          </label>
          <input
            id="recipient"
            type="text"
            value={recipientLabel}
            onChange={(e) => setRecipientLabel(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none ring-accent/30 focus:ring"
            placeholder="Nom du prospect"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="duration">
            Limite de temps (secondes)
          </label>
          <input
            id="duration"
            type="number"
            min={30}
            max={86400}
            step={30}
            value={accessWindowSeconds}
            onChange={(e) => setAccessWindowSeconds(Number(e.target.value))}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none ring-accent/30 focus:ring"
            required
          />
          <p className="text-xs text-muted-foreground">Minimum: 30 secondes. Fenêtre actuelle: {durationLabel}</p>
        </div>

        <button
          type="submit"
          disabled={loading || !secret.trim()}
          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {loading ? "Génération..." : "Générer le lien sécurisé"}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {demoUrl && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-6">
          <p className="text-sm font-medium text-foreground">Lien généré</p>
          <p className="mt-2 break-all text-sm text-muted-foreground">{demoUrl}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Durée configurée:{" "}
            {lastWindowMs ? `${Math.round((lastWindowMs / 60_000) * 100) / 100} minute(s)` : "n/a"}
          </p>
          <button
            type="button"
            onClick={copyLink}
            className={[
              "mt-4 inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              copyState === "ok"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
                : copyState === "error"
                  ? "border-destructive/40 bg-destructive/10 text-destructive"
                  : "border-border text-foreground hover:bg-secondary",
            ].join(" ")}
          >
            {copyState === "ok" ? "Copié !" : copyState === "error" ? "Échec copie" : "Copier le lien"}
          </button>
          {copyState === "ok" && (
            <p className="mt-2 text-xs text-emerald-700 animate-pulse">Lien copié dans le presse-papiers.</p>
          )}
        </div>
      )}
    </div>
  );
}
