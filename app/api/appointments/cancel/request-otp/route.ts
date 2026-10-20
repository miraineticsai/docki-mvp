import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { appointments, cancellationRequests } from "@/db/schema";
import {
  generateSecureOtp,
  hashOtp,
  maskEmail,
} from "@/lib/cancellation/security";
import { sendCancellationOtpEmail } from "@/lib/email/service";

const GENERIC_NOT_FOUND_OR_INELIGIBLE =
  "Appointment not found or not eligible for cancellation. Only pending appointments can be cancelled online. Please contact the clinic for assistance.";

/**
 * POST /api/appointments/cancel/request-otp
 * Step 1: Validates appointment eligibility and generates a hashed OTP sent to the registered email.
 */
export async function POST(request: NextRequest) {
  try {
    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body." },
        { status: 400 },
      );
    }

    const referenceId = String(body.referenceId || "")
      .trim()
      .toUpperCase();

    if (!referenceId || !/^APT-[\w-]+$/.test(referenceId)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid appointment Reference ID (e.g. APT-20261025-XXXX).",
        },
        { status: 400 },
      );
    }

    // 1. Verify appointment exists and has 'pending' status
    const appointment = await db.query.appointments.findFirst({
      where: eq(appointments.referenceId, referenceId),
    });

    if (!appointment || appointment.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          message: GENERIC_NOT_FOUND_OR_INELIGIBLE,
        },
        { status: 400 },
      );
    }

    // 2. Cooldown check: prevent email spamming within 60s
    const now = new Date();
    const recentRequest = await db.query.cancellationRequests.findFirst({
      where: and(
        eq(cancellationRequests.referenceId, referenceId),
        isNull(cancellationRequests.usedAt),
        gt(cancellationRequests.resendCooldownUntil, now),
      ),
      orderBy: desc(cancellationRequests.createdAt),
    });

    if (recentRequest) {
      const waitSeconds = Math.max(
        1,
        Math.ceil(
          (recentRequest.resendCooldownUntil.getTime() - now.getTime()) / 1000,
        ),
      );
      return NextResponse.json(
        {
          success: false,
          message: `Please wait ${waitSeconds} seconds before requesting a new code.`,
          retryAfterSeconds: waitSeconds,
        },
        { status: 429 },
      );
    }

    // 3. Generate 6-digit OTP and store hash with 10-minute validity
    const otp = generateSecureOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes
    const resendCooldownUntil = new Date(now.getTime() + 60 * 1000); // 60 seconds

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    await db.insert(cancellationRequests).values({
      referenceId,
      otpHash,
      resendCooldownUntil,
      expiresAt,
      ipAddress,
    });

    // 4. Dispatch OTP via Resend
    const emailResult = await sendCancellationOtpEmail({
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail,
      referenceId: appointment.referenceId,
      otp,
      expiresInMinutes: 10,
    });

    if (!emailResult.success) {
      console.warn(
        `[Cancellation OTP] Resend delivery notice for ${referenceId}: ${emailResult.error}`,
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "A 6-digit verification code has been sent to your registered email.",
      maskedEmail: maskEmail(appointment.patientEmail),
      expiresInSeconds: 600,
      cooldownSeconds: 60,
    });
  } catch (error) {
    console.error("[POST /api/appointments/cancel/request-otp Error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}
