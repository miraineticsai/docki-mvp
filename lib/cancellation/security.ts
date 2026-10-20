import crypto from "node:crypto";

const OTP_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.RESEND_API_KEY ||
  "aura-clinic-otp-secure-key-2026";

/**
 * Generates a cryptographically secure 6-digit numeric OTP.
 */
export function generateSecureOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Computes an HMAC-SHA256 hash of the plain OTP using a server secret.
 */
export function hashOtp(otp: string): string {
  return crypto.createHmac("sha256", OTP_SECRET).update(otp).digest("hex");
}

/**
 * Constant-time verification of an input OTP against the stored hash.
 */
export function verifyOtpHash(otp: string, expectedHash: string): boolean {
  try {
    const computedHash = hashOtp(otp);
    const computedBuf = Buffer.from(computedHash, "hex");
    const expectedBuf = Buffer.from(expectedHash, "hex");

    if (computedBuf.length !== expectedBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(computedBuf, expectedBuf);
  } catch {
    return false;
  }
}

/**
 * Generates an unguessable 64-character hex session token for multi-step cancellation authorization.
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Masks an email address to protect privacy (e.g., "amit.patil@gmail.com" -> "a***l@gmail.com").
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "***@***.***";
  const [localPart, domain] = email.split("@");

  if (localPart.length <= 2) {
    return `${localPart[0]}*@${domain}`;
  }

  const firstChar = localPart[0];
  const lastChar = localPart[localPart.length - 1];
  return `${firstChar}***${lastChar}@${domain}`;
}
