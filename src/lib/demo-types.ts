export type DemoSessionOk = {
  ok: true;
  recipientLabel: string;
  firstOpenedAt: number;
  expiresAt: number;
  accessWindowMs: number;
  /** SHA-256 hex du jeton (pour sync Google Sheet « Closing » à l’expiration côté client). */
  tokenHash: string;
};

export type DemoSessionErr = {
  ok: false;
  code: "NOT_FOUND" | "EXPIRED" | "STORE_UNAVAILABLE";
};

export type DemoSessionResult = DemoSessionOk | DemoSessionErr;
