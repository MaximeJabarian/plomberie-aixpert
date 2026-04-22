import { createHash, randomBytes } from "node:crypto";
import { DEMO_ACCESS_WINDOW_MS } from "@/lib/demo-constants";
import type { DemoSessionResult } from "@/lib/demo-types";
import { demoVerbose } from "@/server/demo-debug-log";
import { logDemoEvent } from "@/server/demo-terminal-log";
import { appendDemoOpenToGoogleSheet, updateDemoClosingInGoogleSheet } from "@/server/google-sheets-append";
import { getSupabaseAdmin } from "@/server/supabase-admin";

export type { DemoSessionErr, DemoSessionOk, DemoSessionResult } from "@/lib/demo-types";

/** Ligne normalisée (mémoire ou lecture Postgres). */
type DemoRow = {
  recipientLabel: string;
  createdAt: string;
  firstOpenedAt?: string;
  accessWindowMs?: number;
};

const memoryStore = new Map<string, DemoRow>();

function canFallbackToMemoryOnSupabaseError(): boolean {
  return process.env.NODE_ENV === "development";
}

function hasSupabase(): boolean {
  return !!getSupabaseAdmin();
}

function hashToken(raw: string): string {
  return createHash("sha256").update(raw, "utf8").digest("hex");
}

function isMissingAccessWindowColumnError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: unknown; message?: unknown; details?: unknown };
  const code = typeof e.code === "string" ? e.code : "";
  const message = typeof e.message === "string" ? e.message : "";
  const details = typeof e.details === "string" ? e.details : "";
  const blob = `${message} ${details}`.toLowerCase();
  // Supabase/PostgREST can return different codes depending on query path.
  return (
    code === "42703" ||
    code === "PGRST204" ||
    blob.includes("access_window_ms") ||
    blob.includes("column") && blob.includes("does not exist")
  );
}

function rowFromMemory(tokenHash: string): DemoRow | null {
  return memoryStore.get(tokenHash) ?? null;
}

async function readRow(tokenHash: string): Promise<DemoRow | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return rowFromMemory(tokenHash);
  }

  let data: {
    recipient_label: string | null;
    created_at: string | null;
    first_opened_at: string | null;
    access_window_ms: number | null;
  } | null = null;
  try {
    const result = await supabase
      .from("demo_tokens")
      .select("recipient_label, created_at, first_opened_at, access_window_ms")
      .eq("token_hash", tokenHash)
      .maybeSingle();
    if (result.error) throw result.error;
    data = result.data;
  } catch (error) {
    if (isMissingAccessWindowColumnError(error)) {
      const legacy = await supabase
        .from("demo_tokens")
        .select("recipient_label, created_at, first_opened_at")
        .eq("token_hash", tokenHash)
        .maybeSingle();
      if (legacy.error) throw legacy.error;
      data = legacy.data
        ? {
            recipient_label: legacy.data.recipient_label,
            created_at: legacy.data.created_at,
            first_opened_at: legacy.data.first_opened_at,
            access_window_ms: null,
          }
        : null;
    } else if (canFallbackToMemoryOnSupabaseError()) {
      logDemoEvent("Supabase readRow en échec en dev → fallback mémoire.", error);
      return rowFromMemory(tokenHash);
    } else {
      throw error;
    }
  }

  if (!data?.created_at) {
    // En dev, si Supabase est accessible mais l'insert a échoué (ex. RLS),
    // on peut quand même continuer le test local avec le fallback mémoire.
    if (canFallbackToMemoryOnSupabaseError()) {
      return rowFromMemory(tokenHash);
    }
    return null;
  }

  return {
    recipientLabel: data.recipient_label ?? "",
    createdAt: data.created_at,
    firstOpenedAt: data.first_opened_at
      ? String(new Date(data.first_opened_at).getTime())
      : undefined,
    accessWindowMs:
      typeof data.access_window_ms === "number" && Number.isFinite(data.access_window_ms)
        ? data.access_window_ms
        : undefined,
  };
}

async function writeMint(
  tokenHash: string,
  recipientLabel: string,
  createdAt: string,
  accessWindowMs: number,
): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    memoryStore.set(tokenHash, { recipientLabel, createdAt, accessWindowMs });
    return;
  }

  try {
    const { error } = await supabase.from("demo_tokens").insert({
      token_hash: tokenHash,
      recipient_label: recipientLabel,
      created_at: createdAt,
      access_window_ms: accessWindowMs,
    });
    if (error) throw error;
  } catch (error) {
    if (isMissingAccessWindowColumnError(error)) {
      const legacyInsert = await supabase.from("demo_tokens").insert({
        token_hash: tokenHash,
        recipient_label: recipientLabel,
        created_at: createdAt,
      });
      if (legacyInsert.error) throw legacyInsert.error;
      return;
    } else if (canFallbackToMemoryOnSupabaseError()) {
      logDemoEvent("Supabase writeMint en échec en dev → token stocké en mémoire.", error);
      memoryStore.set(tokenHash, { recipientLabel, createdAt, accessWindowMs });
      return;
    } else {
      throw error;
    }
  }
}

/**
 * Première ouverture : une seule ligne mise à jour si first_opened_at est encore null.
 */
async function touchFirstOpened(tokenHash: string, now: number): Promise<{ firstOpenedAt: number; wasNew: boolean }> {
  const supabase = getSupabaseAdmin();
  const openedIso = new Date(now).toISOString();

  if (!supabase) {
    const row = memoryStore.get(tokenHash);
    if (!row) {
      throw new Error("demo: enregistrement manquant (incohérence store)");
    }
    if (!row.firstOpenedAt) {
      row.firstOpenedAt = String(now);
      memoryStore.set(tokenHash, row);
      return { firstOpenedAt: now, wasNew: true };
    }
    return { firstOpenedAt: Number(row.firstOpenedAt), wasNew: false };
  }

  let updated: { first_opened_at: string | null } | null = null;
  try {
    const result = await supabase
      .from("demo_tokens")
      .update({ first_opened_at: openedIso })
      .eq("token_hash", tokenHash)
      .is("first_opened_at", null)
      .select("first_opened_at")
      .maybeSingle();
    if (result.error) throw result.error;
    updated = result.data;
  } catch (error) {
    if (canFallbackToMemoryOnSupabaseError()) {
      logDemoEvent("Supabase touchFirstOpened en échec en dev → fallback mémoire.", error);
      const row = memoryStore.get(tokenHash);
      if (!row) throw error;
      if (!row.firstOpenedAt) {
        row.firstOpenedAt = String(now);
        memoryStore.set(tokenHash, row);
        return { firstOpenedAt: now, wasNew: true };
      }
      return { firstOpenedAt: Number(row.firstOpenedAt), wasNew: false };
    }
    throw error;
  }

  if (updated?.first_opened_at) {
    return { firstOpenedAt: new Date(updated.first_opened_at).getTime(), wasNew: true };
  }

  let current: { first_opened_at: string | null } | null = null;
  try {
    const result = await supabase
      .from("demo_tokens")
      .select("first_opened_at")
      .eq("token_hash", tokenHash)
      .single();
    if (result.error) throw result.error;
    current = result.data;
  } catch (error) {
    if (canFallbackToMemoryOnSupabaseError()) {
      const row = memoryStore.get(tokenHash);
      if (!row?.firstOpenedAt) throw error;
      return { firstOpenedAt: Number(row.firstOpenedAt), wasNew: false };
    }
    throw error;
  }
  if (!current?.first_opened_at) {
    throw new Error("demo: first_opened_at manquant après mise à jour concurrente");
  }

  return {
    firstOpenedAt: new Date(current.first_opened_at).getTime(),
    wasNew: false,
  };
}

async function sendWebhookNotify(payload: Record<string, unknown>): Promise<void> {
  const url = process.env.DEMO_NOTIFY_WEBHOOK_URL;
  if (!url) return;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/** E-mail via [Resend](https://resend.com) (clé API + domaine « from » vérifié en prod). */
async function sendEmailViaResend(payload: Record<string, unknown>): Promise<"skipped" | void> {
  const apiKey = process.env.RESEND_API_KEY;
  const toRaw = process.env.DEMO_NOTIFY_EMAIL_TO;
  if (!apiKey || !toRaw?.trim()) return "skipped";

  const from =
    process.env.DEMO_NOTIFY_EMAIL_FROM?.trim() || "Basooka Demo <onboarding@resend.dev>";
  const to = toRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (to.length === 0) return "skipped";

  const lines = [
    "Événement : lien démo ouvert (première fois)",
    `Destinataire (label) : ${String(payload.recipientLabel ?? "")}`,
    `Première ouverture (UTC) : ${String(payload.firstOpenedAt ?? "")}`,
    `Token hash : ${String(payload.tokenHash ?? "")}`,
  ];
  const text = lines.join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "Lien démo ouvert",
      text,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${errBody.slice(0, 200)}`);
  }
}

async function sendNotify(payload: Record<string, unknown>): Promise<void> {
  logDemoEvent(
    "Première ouverture du lien démo — exécution des canaux (webhook, Resend, Google Sheet).",
  );
  demoVerbose("[notify] Première ouverture — canaux configurés :", {
    webhook: !!process.env.DEMO_NOTIFY_WEBHOOK_URL,
    resend:
      !!process.env.RESEND_API_KEY?.trim() &&
      !!process.env.DEMO_NOTIFY_EMAIL_TO?.trim(),
    sheets: {
      spreadsheetId: !!process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim(),
      appendRange: process.env.GOOGLE_SHEETS_APPEND_RANGE?.trim() ?? "(défaut Sheet1!A1)",
      jsonB64: !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64?.trim(),
      emailKey:
        !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() &&
        !!process.env.GOOGLE_PRIVATE_KEY?.trim(),
    },
  });

  const channels: [string, Promise<unknown>][] = [
    [
      "webhook",
      process.env.DEMO_NOTIFY_WEBHOOK_URL ? sendWebhookNotify(payload) : Promise.resolve("skipped"),
    ],
    ["resend", sendEmailViaResend(payload)],
    ["sheets", appendDemoOpenToGoogleSheet(payload)],
  ];

  const results = await Promise.allSettled(channels.map(([, p]) => p));
  results.forEach((r, i) => {
    const name = channels[i][0];
    if (r.status === "fulfilled") {
      const v = r.value;
      if (v === "skipped") demoVerbose(`[notify] ${name} : non configuré ou ignoré.`);
      else demoVerbose(`[notify] ${name} : OK.`);
    } else {
      console.error(`[demo:notify] ${name} : échec`, r.reason);
    }
  });
}

/**
 * Vérifie le jeton, enregistre la première ouverture, envoie la notification une seule fois,
 * applique la fenêtre d’accès (DEMO_ACCESS_WINDOW_MS) côté serveur.
 */
export async function resolveDemoSession(rawToken: string): Promise<DemoSessionResult> {
  logDemoEvent("Session démo : vérification du jeton (longueur caractères) =", rawToken.length);
  demoVerbose("[session] resolveDemoSession — jeton (longueur)", rawToken.length);

  if (!rawToken || rawToken.length < 16) {
    logDemoEvent("Session démo : jeton trop court — NOT_FOUND. Aucune écriture Sheet.");
    demoVerbose("[session] refus : jeton trop court ou absent");
    return { ok: false, code: "NOT_FOUND" };
  }

  if (process.env.NODE_ENV === "production" && !hasSupabase()) {
    logDemoEvent("Session démo : stockage indisponible (Supabase requis en prod). Aucune écriture Sheet.");
    console.error("[demo] SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis en production.");
    return { ok: false, code: "STORE_UNAVAILABLE" };
  }

  const tokenHash = hashToken(rawToken);
  demoVerbose("[session] hash (8 premiers car.) =", tokenHash.slice(0, 8), "…");

  const row = await readRow(tokenHash);
  if (!row?.createdAt) {
    logDemoEvent(
      "Session démo : jeton inconnu en base (NOT_FOUND). Aucune écriture Sheet — créer un jeton avec POST /api/demo/tokens puis ouvrir /demo/<token>.",
    );
    demoVerbose(
      "[session] NOT_FOUND : aucune ligne en base pour ce jeton (as-tu bien appelé POST /api/demo/tokens ?).",
    );
    return { ok: false, code: "NOT_FOUND" };
  }

  const now = Date.now();
  const { firstOpenedAt, wasNew } = await touchFirstOpened(tokenHash, now);

  if (wasNew) {
    logDemoEvent(
      "Session démo : 1ʳᵉ ouverture — activation de l’écriture Google Sheet (si configurée) + autres notifications.",
    );
    demoVerbose("[session] Première ouverture → envoi des notifications (webhook / resend / sheets).");
    await sendNotify({
      event: "demo_first_open",
      tokenHash,
      recipientLabel: row.recipientLabel ?? "",
      firstOpenedAt: new Date(firstOpenedAt).toISOString(),
      accessWindowMs: row.accessWindowMs ?? DEMO_ACCESS_WINDOW_MS,
    });
  } else {
    logDemoEvent(
      "Session démo : ouverture suivante — pas de nouvelle ligne Google Sheet (déjà enregistré à la 1ʳᵉ visite).",
    );
    demoVerbose(
      "[session] Pas la première ouverture : pas de nouvelle ligne Sheet / pas de nouvelles notifs (déjà enregistré).",
    );
  }

  const accessWindowMs =
    typeof row.accessWindowMs === "number" && row.accessWindowMs > 0
      ? row.accessWindowMs
      : DEMO_ACCESS_WINDOW_MS;
  const expiresAt = firstOpenedAt + accessWindowMs;
  if (now > expiresAt) {
    logDemoEvent(
      "Session démo : lien expiré (fenêtre dépassée). Mise à jour de la colonne Google Sheet « Closing » (si configurée).",
    );
    demoVerbose("[session] EXPIRED : maintenant > firstOpened + fenêtre");
    try {
      // Important : attendre l’écriture (surtout serverless Vercel) — un `void` peut être gelé avant la fin.
      await updateDemoClosingInGoogleSheet({ tokenHash, closedAtMs: expiresAt });
    } catch (err) {
      console.error("[demo:sheets] Closing — échec (session EXPIRED)", err);
    }
    return { ok: false, code: "EXPIRED" };
  }

  logDemoEvent("Session démo : accès autorisé jusqu’à", new Date(expiresAt).toISOString());
  demoVerbose("[session] Accès OK jusqu’à", new Date(expiresAt).toISOString());
  return {
    ok: true,
    recipientLabel: row.recipientLabel ?? "",
    firstOpenedAt,
    expiresAt,
    accessWindowMs,
    tokenHash,
  };
}

const DEMO_TOKEN_HASH_HEX_RE = /^[a-f0-9]{64}$/i;

/**
 * Si la fenêtre démo est dépassée côté serveur, écrit la colonne Google Sheet « Closing ».
 * Utilisé par `POST /api/demo/closing` quand l’expiration n’a été détectée que côté client (garde navigateur).
 */
export async function recordDemoSheetClosingIfExpired(tokenHash: string): Promise<
  | { ok: true; result: "written" | "skipped_not_opened" | "skipped_not_expired" }
  | { ok: false; code: "INVALID_HASH" | "NOT_FOUND" | "STORE_UNAVAILABLE" }
> {
  if (!DEMO_TOKEN_HASH_HEX_RE.test(tokenHash)) {
    return { ok: false, code: "INVALID_HASH" };
  }
  if (process.env.NODE_ENV === "production" && !hasSupabase()) {
    return { ok: false, code: "STORE_UNAVAILABLE" };
  }

  const row = await readRow(tokenHash);
  if (!row?.createdAt) {
    return { ok: false, code: "NOT_FOUND" };
  }

  const firstOpenedRaw = row.firstOpenedAt;
  if (!firstOpenedRaw) {
    return { ok: true, result: "skipped_not_opened" };
  }
  const firstOpenedAt = Number(firstOpenedRaw);
  if (!Number.isFinite(firstOpenedAt)) {
    return { ok: true, result: "skipped_not_opened" };
  }

  const accessWindowMs =
    typeof row.accessWindowMs === "number" && row.accessWindowMs > 0
      ? row.accessWindowMs
      : DEMO_ACCESS_WINDOW_MS;
  const expiresAt = firstOpenedAt + accessWindowMs;
  if (Date.now() <= expiresAt) {
    return { ok: true, result: "skipped_not_expired" };
  }

  await updateDemoClosingInGoogleSheet({ tokenHash, closedAtMs: expiresAt });
  return { ok: true, result: "written" };
}

export function generateDemoToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function mintDemoToken(
  recipientLabel: string,
  accessWindowMs: number = DEMO_ACCESS_WINDOW_MS,
): Promise<{ token: string; tokenHash: string; accessWindowMs: number }> {
  if (process.env.NODE_ENV === "production" && !hasSupabase()) {
    throw new Error("Demo store unavailable");
  }
  const normalizedAccessWindowMs =
    Number.isFinite(accessWindowMs) && accessWindowMs > 0
      ? Math.floor(accessWindowMs)
      : DEMO_ACCESS_WINDOW_MS;
  const token = generateDemoToken();
  const tokenHash = hashToken(token);
  const createdAt = new Date().toISOString();
  await writeMint(tokenHash, recipientLabel.slice(0, 500), createdAt, normalizedAccessWindowMs);
  return { token, tokenHash, accessWindowMs: normalizedAccessWindowMs };
}
