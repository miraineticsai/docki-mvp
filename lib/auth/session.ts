import { cookies } from "next/headers";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  verifyAdminToken,
} from "./jwt";

/**
 * Returns current admin session status from incoming request cookies.
 */
export async function getAdminSession(): Promise<{
  authenticated: boolean;
  email?: string;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return { authenticated: false };
  }

  const { valid, email } = await verifyAdminToken(token);
  if (!valid || !email) {
    return { authenticated: false };
  }

  return { authenticated: true, email };
}

/**
 * Guard helper: throws or returns error if session is invalid.
 */
export async function requireAdminSession(): Promise<string> {
  const session = await getAdminSession();
  if (!session.authenticated || !session.email) {
    throw new Error("Unauthorized: Admin authentication required.");
  }
  return session.email;
}

/**
 * Sets the admin session HTTP-only cookie.
 */
export async function setAdminSessionCookie(email: string): Promise<void> {
  const token = await createSessionToken(email);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

/**
 * Clears the admin session cookie on logout.
 */
export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
