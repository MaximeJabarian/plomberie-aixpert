import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;
let didLogInit = false;

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Client Supabase **réservé au serveur** (service role).
 * Ne jamais importer ce module dans du code client.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!didLogInit) {
    didLogInit = true;
    const payload = decodeJwtPayload(key);
    const role = typeof payload?.role === "string" ? payload.role : "unknown";
    const host = (() => {
      try {
        return new URL(url).host;
      } catch {
        return "invalid-url";
      }
    })();
    console.log(`[demo] Supabase init — host=${host} role=${role}`);
    if (role !== "service_role") {
      console.warn(
        "[demo] SUPABASE_SERVICE_ROLE_KEY ne semble pas être une clé service_role (runtime). Vérifie les variables chargées par le process.",
      );
    }
  }
  if (!cached) {
    cached = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
