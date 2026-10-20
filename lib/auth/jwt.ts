/**
 * Edge-compatible JWT & credential authentication helpers using standard Web Crypto API.
 * Safe to import in both Edge Runtime (middleware) and Node.js (Server Actions / Route Handlers).
 */

export const SESSION_COOKIE_NAME = "admin_session";
export const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 days

export interface AdminSessionPayload {
  sub: string;
  role: "admin";
  iat: number;
  exp: number;
}

function base64UrlEncode(buffer: ArrayBuffer | Uint8Array | string): string {
  if (typeof Buffer !== "undefined") {
    if (typeof buffer === "string") {
      return Buffer.from(buffer, "utf-8").toString("base64url");
    }
    if (buffer instanceof Uint8Array) {
      return Buffer.from(buffer).toString("base64url");
    }
    return Buffer.from(buffer).toString("base64url");
  }

  let bytes: Uint8Array;
  if (typeof buffer === "string") {
    bytes = new TextEncoder().encode(buffer);
  } else if (buffer instanceof Uint8Array) {
    bytes = buffer;
  } else {
    bytes = new Uint8Array(buffer);
  }
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    const buf = Buffer.from(str, "base64url");
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  }

  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function getSessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    "aura-clinic-pune-secure-admin-token-secret-2026-key"
  );
}

// In-memory key cache to avoid re-importing the CryptoKey on every operation
let cachedHmacKey: CryptoKey | null = null;
let cachedHmacSecret: string | null = null;

async function getHmacKey(secret: string): Promise<CryptoKey> {
  if (cachedHmacKey && cachedHmacSecret === secret) {
    return cachedHmacKey;
  }
  const enc = new TextEncoder();
  cachedHmacKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  cachedHmacSecret = secret;
  return cachedHmacKey;
}

/**
 * Creates an HMAC-SHA256 signed JWT token for the admin session.
 */
export async function createSessionToken(email: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminSessionPayload = {
    sub: email.toLowerCase().trim(),
    role: "admin",
    iat: now,
    exp: now + SESSION_DURATION_SECONDS,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const key = await getHmacKey(getSessionSecret());
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(dataToSign),
  );
  const encodedSignature = base64UrlEncode(signatureBuffer);

  return `${dataToSign}.${encodedSignature}`;
}

/**
 * Verifies an HMAC-SHA256 signed JWT token.
 * Returns valid=true and session payload if signature and expiry check pass.
 */
export async function verifyAdminToken(
  token: string | undefined | null,
): Promise<{ valid: boolean; email?: string }> {
  if (!token) return { valid: false };

  const parts = token.split(".");
  if (parts.length !== 3) return { valid: false };

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  try {
    const key = await getHmacKey(getSessionSecret());
    const signatureBytes = base64UrlDecode(encodedSignature);
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes as unknown as BufferSource,
      new TextEncoder().encode(dataToSign),
    );

    if (!isValid) return { valid: false };

    const payloadJson = new TextDecoder().decode(
      base64UrlDecode(encodedPayload),
    );
    const payload = JSON.parse(payloadJson) as AdminSessionPayload;

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now || payload.role !== "admin") {
      return { valid: false };
    }

    return { valid: true, email: payload.sub };
  } catch {
    return { valid: false };
  }
}

// Cache target hashes to avoid recomputing on every login attempt
let cachedTargetEmail: string | null = null;
let cachedTargetEmailHash: Uint8Array | null = null;
let cachedTargetPassword: string | null = null;
let cachedTargetPasswordHash: Uint8Array | null = null;

export async function verifyAdminCredentials(
  emailInput: string,
  passwordInput: string,
): Promise<boolean> {
  const targetEmail = (process.env.ADMIN_EMAIL || "doctor@auraclinic.com")
    .toLowerCase()
    .trim();
  const targetPassword = process.env.ADMIN_PASSWORD || "AuraDoc@2026!";

  const normalizedInputEmail = emailInput.toLowerCase().trim();
  const enc = new TextEncoder();

  if (!cachedTargetEmailHash || cachedTargetEmail !== targetEmail) {
    const hash = await crypto.subtle.digest("SHA-256", enc.encode(targetEmail));
    cachedTargetEmailHash = new Uint8Array(hash);
    cachedTargetEmail = targetEmail;
  }

  if (!cachedTargetPasswordHash || cachedTargetPassword !== targetPassword) {
    const hash = await crypto.subtle.digest(
      "SHA-256",
      enc.encode(targetPassword),
    );
    cachedTargetPasswordHash = new Uint8Array(hash);
    cachedTargetPassword = targetPassword;
  }

  const [hashPassInput, hashEmailInput] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(passwordInput)),
    crypto.subtle.digest("SHA-256", enc.encode(normalizedInputEmail)),
  ]);

  const arrPassInput = new Uint8Array(hashPassInput);
  const arrEmailInput = new Uint8Array(hashEmailInput);

  let passDiff = 0;
  for (let i = 0; i < 32; i++) {
    passDiff |= arrPassInput[i] ^ cachedTargetPasswordHash[i];
  }

  let emailDiff = 0;
  for (let i = 0; i < 32; i++) {
    emailDiff |= arrEmailInput[i] ^ cachedTargetEmailHash[i];
  }

  return passDiff === 0 && emailDiff === 0;
}
