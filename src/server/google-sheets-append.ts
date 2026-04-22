import { JWT } from "google-auth-library";
import { demoVerbose } from "@/server/demo-debug-log";
import { logDemoEvent } from "@/server/demo-terminal-log";

type ServiceAccountCreds = {
  client_email: string;
  private_key: string;
};

const SHEETS_TIME_ZONE = "America/New_York";

/** Format datetime lisible par Sheets/colonnes Table: `YYYY-MM-DD HH:mm:ss` (NYC). */
function toSheetsDateTimeText(input: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SHEETS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(input);

  const get = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((p) => p.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
}

/** Ordre des colonnes après « First opening » (D). Défaut = en-tête Date|…|First opening|Closing|Hash|Duration */
type SheetsDemoAppendLayout = "closing_hash_duration" | "hash_duration_closing";

function getSheetsDemoAppendLayout(): SheetsDemoAppendLayout {
  const raw = process.env.GOOGLE_SHEETS_APPEND_LAYOUT?.trim().toLowerCase();
  if (raw === "hash_duration_closing") return "hash_duration_closing";
  return "closing_hash_duration";
}

function defaultHashColumnForLayout(layout: SheetsDemoAppendLayout): string {
  return layout === "hash_duration_closing" ? "E" : "F";
}

function defaultClosingColumnForLayout(layout: SheetsDemoAppendLayout): string {
  return layout === "hash_duration_closing" ? "G" : "E";
}

function formatDurationForSheet(accessWindowMs: unknown): string {
  const ms = typeof accessWindowMs === "number" && Number.isFinite(accessWindowMs) ? accessWindowMs : NaN;
  if (!Number.isFinite(ms) || ms <= 0) return "";
  const totalSec = Math.round(ms / 1000);
  if (totalSec < 60) return `${totalSec}s`;
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (sec === 0) return `${min}m`;
  return `${min}m ${sec}s`;
}

function parseSheetTabFromAppendRange(appendRange: string): string | null {
  const raw = appendRange.trim();
  if (!raw) return null;
  const bang = raw.indexOf("!");
  if (bang === -1) return null;
  let tab = raw.slice(0, bang).trim();
  if (tab.startsWith("'") && tab.endsWith("'") && tab.length >= 2) {
    tab = tab.slice(1, -1).replace(/''/g, "'");
  }
  return tab || null;
}

async function getSheetsAccessToken(creds: ServiceAccountCreds): Promise<string> {
  const jwt = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const tokenResponse = await jwt.getAccessToken();
  const accessToken =
    typeof tokenResponse === "string" ? tokenResponse : tokenResponse?.token ?? null;
  if (!accessToken) {
    throw new Error("Google Sheets: jeton d’accès indisponible");
  }
  return accessToken;
}

function normalizePrivateKey(raw: string): string {
  let v = raw.trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  v = v.replace(/\\n/g, "\n").replace(/\r\n/g, "\n");
  return v;
}

function getServiceAccountCreds(): ServiceAccountCreds | null {
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64?.trim();
  if (b64) {
    try {
      const json = JSON.parse(Buffer.from(b64, "base64").toString("utf8")) as Record<string, unknown>;
      const client_email = json.client_email;
      const private_key = json.private_key;
      if (typeof client_email === "string" && typeof private_key === "string") {
        demoVerbose("[sheets] Identifiants : JSON base64 OK, client_email =", client_email);
        return { client_email, private_key };
      }
      demoVerbose("[sheets] JSON base64 parsé mais client_email / private_key manquants ou invalides");
      return null;
    } catch (e) {
      demoVerbose("[sheets] Impossible de parser GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 :", e);
      return null;
    }
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const keyRaw = process.env.GOOGLE_PRIVATE_KEY?.trim();
  if (email && keyRaw) {
    demoVerbose("[sheets] Identifiants : GOOGLE_SERVICE_ACCOUNT_EMAIL + PRIVATE_KEY");
    const privateKey = normalizePrivateKey(keyRaw);
    if (!privateKey.includes("BEGIN PRIVATE KEY") || !privateKey.includes("END PRIVATE KEY")) {
      console.warn(
        "[demo:sheets] GOOGLE_PRIVATE_KEY semble invalide (en-têtes PEM absents). Préfère GOOGLE_SERVICE_ACCOUNT_JSON_BASE64.",
      );
    }
    return { client_email: email, private_key: privateKey };
  }

  demoVerbose("[sheets] Aucun identifiant : ni JSON base64 valide, ni EMAIL+PRIVATE_KEY complets", {
    hasJsonB64: !!b64,
    hasEmail: !!email,
    hasPrivateKey: !!keyRaw,
  });
  return null;
}

/**
 * Ajoute une ligne dans un Google Sheet à la première ouverture d’un lien démo.
 *
 * Prérequis côté Google :
 * 1. Projet Google Cloud → activer l’API **Google Sheets**.
 * 2. Compte de service → télécharger la clé JSON (ou copier e-mail + clé privée).
 * 3. Ouvrir ton classeur Sheets → **Partager** → ajouter l’e-mail du compte de service avec le rôle **Éditeur**.
 *
 * Variables : voir `.env.example`.
 */
export async function appendDemoOpenToGoogleSheet(
  payload: Record<string, unknown>,
): Promise<"skipped" | void> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim();
  /** Plage d’append (ex. `Feuille 1!A1` ou `Activités!A1`). Voir API Sheets « values.append ». */
  const appendRange = process.env.GOOGLE_SHEETS_APPEND_RANGE?.trim() || "Sheet1!A1";
  demoVerbose("[sheets] appendDemoOpenToGoogleSheet — début", {
    spreadsheetId: spreadsheetId ?? "(absent)",
    appendRange,
  });

  const creds = getServiceAccountCreds();
  if (!spreadsheetId) {
    console.warn("[demo:sheets] Append ignoré : GOOGLE_SHEETS_SPREADSHEET_ID manquant.");
    logDemoEvent("Google Sheet : append non lancé — GOOGLE_SHEETS_SPREADSHEET_ID manquant.");
    return "skipped";
  }
  if (!creds) {
    console.warn(
      "[demo:sheets] Append ignoré : identifiants compte de service manquants ou JSON base64 invalide (voir logs [demo:verbose]).",
    );
    logDemoEvent(
      "Google Sheet : append non lancé — identifiants compte de service manquants ou invalides (JSON base64 ou EMAIL+PRIVATE_KEY).",
    );
    return "skipped";
  }

  const accessToken = await getSheetsAccessToken(creds);
  demoVerbose("[sheets] Jeton OAuth Google obtenu, envoi append…");
  logDemoEvent(
    "Google Sheet : envoi append API → plage",
    appendRange,
    "| spreadsheet",
    `${spreadsheetId.slice(0, 8)}…`,
  );

  const openedAtCandidate = String(payload.firstOpenedAt ?? "").trim();
  const openedAtDate = openedAtCandidate ? new Date(openedAtCandidate) : null;
  const openedAtText =
    openedAtDate && Number.isFinite(openedAtDate.getTime())
      ? toSheetsDateTimeText(openedAtDate)
      : openedAtCandidate;

  const layout = getSheetsDemoAppendLayout();
  const row =
    layout === "hash_duration_closing"
      ? [
          toSheetsDateTimeText(new Date()),
          String(payload.event ?? ""),
          String(payload.recipientLabel ?? ""),
          openedAtText,
          String(payload.tokenHash ?? ""),
          formatDurationForSheet(payload.accessWindowMs),
          "",
        ]
      : [
          toSheetsDateTimeText(new Date()),
          String(payload.event ?? ""),
          String(payload.recipientLabel ?? ""),
          openedAtText,
          "",
          String(payload.tokenHash ?? ""),
          formatDurationForSheet(payload.accessWindowMs),
        ];

  const path = `/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(appendRange)}:append`;
  const url = new URL(`https://sheets.googleapis.com${path}`);
  url.searchParams.set("valueInputOption", "USER_ENTERED");
  url.searchParams.set("insertDataOption", "INSERT_ROWS");

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [row] }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    const msg = `Google Sheets HTTP ${res.status}: ${err.slice(0, 400)}`;
    console.error("[demo:sheets]", msg);
    throw new Error(msg);
  }

  demoVerbose("[sheets] Ligne écrite avec succès.", { colonnes: row.length });
  console.log("[demo:sheets] OK — ligne ajoutée dans le classeur (append).");
}

/**
 * Met à jour la colonne **Closing** sur la ligne dont la colonne **Hash** correspond au `tokenHash`.
 * Défauts alignés sur `GOOGLE_SHEETS_APPEND_LAYOUT` (voir `.env.example`), ou surcharge via
 * `GOOGLE_SHEETS_HASH_COLUMN` / `GOOGLE_SHEETS_CLOSING_COLUMN`.
 */
export async function updateDemoClosingInGoogleSheet(params: {
  tokenHash: string;
  /** Horodatage réel de fin d’accès (ms epoch). */
  closedAtMs: number;
}): Promise<"skipped" | void> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim();
  const appendRange = process.env.GOOGLE_SHEETS_APPEND_RANGE?.trim() || "Sheet1!A1";
  const sheetTab = parseSheetTabFromAppendRange(appendRange);
  const layout = getSheetsDemoAppendLayout();
  const envHash = process.env.GOOGLE_SHEETS_HASH_COLUMN?.trim().toUpperCase();
  const envClosing = process.env.GOOGLE_SHEETS_CLOSING_COLUMN?.trim().toUpperCase();
  const hashCol = envHash || defaultHashColumnForLayout(layout);
  const closingCol = envClosing || defaultClosingColumnForLayout(layout);
  const startRow = Math.max(2, Number(process.env.GOOGLE_SHEETS_DATA_START_ROW ?? "2") || 2);
  const endRow = Math.max(startRow, Number(process.env.GOOGLE_SHEETS_DATA_END_ROW ?? "5000") || 5000);

  if (!spreadsheetId || !sheetTab) {
    console.warn("[demo:sheets] Closing ignoré : GOOGLE_SHEETS_SPREADSHEET_ID ou appendRange invalide.");
    return "skipped";
  }

  const creds = getServiceAccountCreds();
  if (!creds) {
    console.warn("[demo:sheets] Closing ignoré : identifiants compte de service manquants.");
    return "skipped";
  }

  const accessToken = await getSheetsAccessToken(creds);
  const hashRange = `${sheetTab}!${hashCol}${startRow}:${hashCol}${endRow}`;
  const getUrl = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(hashRange)}`,
  );

  const getRes = await fetch(getUrl.toString(), {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!getRes.ok) {
    const err = await getRes.text().catch(() => "");
    console.error("[demo:sheets] Closing — lecture colonne Hash échouée", getRes.status, err.slice(0, 300));
    throw new Error(`Google Sheets GET ${getRes.status}`);
  }

  const body = (await getRes.json()) as { values?: string[][] };
  const colValues = body.values ?? [];
  let matchRow: number | null = null;
  for (let i = 0; i < colValues.length; i++) {
    const cell = String(colValues[i]?.[0] ?? "").trim();
    if (cell === params.tokenHash) {
      matchRow = startRow + i;
    }
  }

  if (matchRow === null) {
    console.warn(
      "[demo:sheets] Closing — aucune ligne trouvée pour ce tokenHash dans",
      hashRange,
      "(vérifie la colonne Hash ou la plage de recherche).",
    );
    return "skipped";
  }

  const closingText = toSheetsDateTimeText(new Date(params.closedAtMs));
  const closingA1 = `${sheetTab}!${closingCol}${matchRow}`;
  const putUrl = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(closingA1)}`,
  );
  putUrl.searchParams.set("valueInputOption", "USER_ENTERED");

  logDemoEvent("Google Sheet : mise à jour Closing →", closingA1, "|", closingText);

  const putRes = await fetch(putUrl.toString(), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [[closingText]] }),
  });

  if (!putRes.ok) {
    const err = await putRes.text().catch(() => "");
    const msg = `Google Sheets HTTP ${putRes.status}: ${err.slice(0, 400)}`;
    console.error("[demo:sheets] Closing", msg);
    throw new Error(msg);
  }

  demoVerbose("[sheets] Closing mis à jour avec succès.", { row: matchRow });
  console.log("[demo:sheets] OK — colonne Closing mise à jour.");
}
