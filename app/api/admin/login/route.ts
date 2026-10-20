import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  verifyAdminCredentials,
} from "@/lib/auth/jwt";
import { adminLoginSchema } from "@/lib/validations/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const validation = adminLoginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.issues[0]?.message || "Invalid input.",
        },
        { status: 400 },
      );
    }

    const { email, password } = validation.data;
    const isMatch = await verifyAdminCredentials(email, password);

    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Incorrect email or password. Please try again.",
        },
        { status: 401 },
      );
    }

    // Generate JWT token
    const token = await createSessionToken(email);

    // Set cookie in Next.js header context and on response
    const cookieStore = await cookies();
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: SESSION_DURATION_SECONDS,
    };

    cookieStore.set(SESSION_COOKIE_NAME, token, cookieOptions);

    // Build success response with HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: "Welcome back, Doctor. Login successful.",
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, cookieOptions);

    return response;
  } catch (error) {
    console.error("[POST /api/admin/login Error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred during login.",
      },
      { status: 500 },
    );
  }
}
