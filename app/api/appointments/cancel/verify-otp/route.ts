import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { appointments, cancellationRequests } from "@/db/schema";
import {
  generateSessionToken,
  verifyOtpHash,
} from "@/lib/cancellation/security";

/**
 * POST /api/appointments/cancel/verify-otp
 * Step 2: Verifies the 6-digit OTP, checks attempt limits & expiration,
 * and issues a single-use sessionToken for the final confirmation step.
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
    const otp = String(body.otp || "").trim();

    if (!referenceId) {
      return NextResponse.json(
        { success: false, message: "Reference ID is required." },
        { status: 400 },
      );
    }

    if (!otp || !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid 6-digit verification code.",
        },
        { status: 400 },
      );
    }

    const now = new Date();

    // 1. Fetch latest active cancellation request
    const activeRequest = await db.query.cancellationRequests.findFirst({
      where: and(
        eq(cancellationRequests.referenceId, referenceId),
        isNull(cancellationRequests.usedAt),
        gt(cancellationRequests.expiresAt, now),
      ),
      orderBy: desc(cancellationRequests.createdAt),
    });

    if (!activeRequest) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Verification code has expired or was not requested. Please request a new code.",
        },
        { status: 400 },
      );
    }

    // 2. Enforce attempt limits to prevent brute-force attacks
    if (activeRequest.attempts >= activeRequest.maxAttempts) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Too many failed verification attempts. This code is permanently invalidated. Please request a new code.",
        },
        { status: 400 },
      );
    }

    // 3. Timing-safe verification of the OTP hash
    const isMatch = verifyOtpHash(otp, activeRequest.otpHash);

    if (!isMatch) {
      // Increment attempts
      await db
        .update(cancellationRequests)
        .set({
          attempts: sql`${cancellationRequests.attempts} + 1`,
        })
        .where(eq(cancellationRequests.id, activeRequest.id));

      const remaining =
        activeRequest.maxAttempts - (activeRequest.attempts + 1);

      return NextResponse.json(
        {
          success: false,
          message:
            remaining > 0
              ? `Incorrect verification code. ${remaining} attempt(s) remaining.`
              : "Too many failed attempts. Please request a new verification code.",
        },
        { status: 400 },
      );
    }

    // 4. Double-check appointment status
    const appointment = await db.query.appointments.findFirst({
      where: eq(appointments.referenceId, referenceId),
    });

    if (!appointment || appointment.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          message:
            "This appointment can no longer be cancelled as its status is no longer pending.",
        },
        { status: 400 },
      );
    }

    // 5. Generate secure session token and mark verified
    const sessionToken = generateSessionToken();

    await db
      .update(cancellationRequests)
      .set({
        verifiedAt: now,
        sessionToken,
      })
      .where(eq(cancellationRequests.id, activeRequest.id));

    return NextResponse.json({
      success: true,
      message: "Verification successful.",
      sessionToken,
      appointment: {
        referenceId: appointment.referenceId,
        patientName: appointment.patientName,
        preferredDate: appointment.preferredDate,
        preferredTimeSlot: appointment.preferredTimeSlot,
        visitType: appointment.visitType,
      },
    });
  } catch (error) {
    console.error("[POST /api/appointments/cancel/verify-otp Error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred during OTP verification.",
      },
      { status: 500 },
    );
  }
}
