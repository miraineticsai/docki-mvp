import { Resend } from "resend";

/**
 * Resend Email Client
 * Initialized with server-side API key.
 */
let resendClient: Resend | null = null;

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      "[Resend Email Service] RESEND_API_KEY is not defined in environment variables. Email sending is disabled.",
    );
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

/**
 * Default sender and admin notification addresses.
 * Uses verified Mirainetics company credentials for MVP, overridable via .env.
 */
export const DEFAULT_SENDER_EMAIL =
  process.env.RESEND_FROM_EMAIL ||
  "Mirainetics Support <hello@contact.mirainetics.com>";

export const DEFAULT_ADMIN_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL || "contact@mirainetics.com";

export function getDefaultFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL || DEFAULT_SENDER_EMAIL;
}

export function getAdminNotificationEmail(): string {
  return process.env.ADMIN_NOTIFICATION_EMAIL || DEFAULT_ADMIN_EMAIL;
}
