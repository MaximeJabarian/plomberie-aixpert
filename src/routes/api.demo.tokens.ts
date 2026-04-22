import { createFileRoute } from "@tanstack/react-router";
import { mintDemoToken } from "@/server/demo-token-service";

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function describeUnknownError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const e = error as { message?: unknown; code?: unknown; details?: unknown };
    const message = typeof e.message === "string" ? e.message : "mint_failed";
    const code = typeof e.code === "string" ? e.code : "";
    const details = typeof e.details === "string" ? e.details : "";
    const suffix = [code, details].filter(Boolean).join(" | ");
    return suffix ? `${message} (${suffix})` : message;
  }
  return "mint_failed";
}

function normalizeSiteTag(raw: string | undefined): string {
  const trimmed = raw?.trim();
  if (!trimmed) return "";
  // Keep the tag short/readable for shared Supabase + shared Sheet rows.
  return trimmed.replace(/\s+/g, "-").slice(0, 40);
}

function applySiteTag(recipientLabel: string): string {
  const tag = normalizeSiteTag(process.env.SITE_TAG);
  if (!tag) return recipientLabel;
  const alreadyPrefixed = recipientLabel.startsWith(`[${tag}] `);
  if (alreadyPrefixed) return recipientLabel;
  return `[${tag}] ${recipientLabel}`.slice(0, 500);
}

/**
 * Crée un lien démo unique (usage interne / script).
 * Sécurisé par DEMO_ADMIN_SECRET — à appeler uniquement depuis un backend ou outil admin.
 */
export const Route = createFileRoute("/api/demo/tokens")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.DEMO_ADMIN_SECRET?.trim();
        const auth = request.headers.get("authorization") ?? "";
        const provided = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
        if (!secret || provided !== secret) {
          if (process.env.DEMO_DEBUG === "1") {
            console.warn(
              "[demo:auth] Mint 401 — le Bearer ne correspond pas à DEMO_ADMIN_SECRET (casse, .env, ou secret du formulaire).",
            );
          }
          return json(401, { ok: false, error: "unauthorized" });
        }

        let recipientLabel = "destinataire";
        let accessWindowMinutes = 10;
        let accessWindowSeconds: number | null = null;
        try {
          const body = (await request.json()) as {
            recipientLabel?: unknown;
            accessWindowMinutes?: unknown;
            accessWindowSeconds?: unknown;
          };
          if (typeof body.recipientLabel === "string" && body.recipientLabel.trim()) {
            recipientLabel = body.recipientLabel.trim().slice(0, 500);
          }
          if (typeof body.accessWindowSeconds === "number" && Number.isFinite(body.accessWindowSeconds)) {
            accessWindowSeconds = Math.max(30, Math.min(24 * 60 * 60, body.accessWindowSeconds));
          }
          if (typeof body.accessWindowMinutes === "number" && Number.isFinite(body.accessWindowMinutes)) {
            accessWindowMinutes = Math.max(0.5, Math.min(24 * 60, body.accessWindowMinutes));
          }
        } catch {
          /* corps vide ou JSON invalide : défaut */
        }

        try {
          const taggedRecipientLabel = applySiteTag(recipientLabel);
          const { token, accessWindowMs } = await mintDemoToken(
            taggedRecipientLabel,
            accessWindowSeconds !== null
              ? Math.round(accessWindowSeconds * 1000)
              : Math.round(accessWindowMinutes * 60_000),
          );
          const demoPath = `/demo/${token}`;
          const origin = new URL(request.url).origin;
          return json(200, {
            ok: true,
            token,
            recipientLabel: taggedRecipientLabel,
            accessWindowMs,
            demoUrl: `${origin}${demoPath}`,
            path: demoPath,
          });
        } catch (e) {
          const message = describeUnknownError(e);
          console.error("[demo:mint] token generation failed", e);
          return json(503, { ok: false, error: message });
        }
      },
    },
  },
});
