import { and, eq, gt, isNotNull, isNull, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { appointments, cancellationRequests } from "@/db/schema";
import { sendUserCancellationConfirmedEmail } from "@/lib/email/service";

/**
 * POST /api/appointments/cancel/confirm
 * Step 3: Validates the single-use sessionToken and atomically updates the appointment status
 * to 'cancelled' with strict 'WHERE status = pending' concurrency locking.
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
    const sessionToken = String(body.sessionToken || "").trim();
    const reason = body.reason ? String(body.reason).trim() : undefined;

    if (!referenceId || !sessionToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Reference ID and valid session token are required.",
        },
        { status: 400 },
      );
    }

    const now = new Date();

    // 1. Validate session token authorization
    const validSession = await db.query.cancellationRequests.findFirst({
      where: and(
        eq(cancellationRequests.referenceId, referenceId),
        eq(cancellationRequests.sessionToken, sessionToken),
        isNotNull(cancellationRequests.verifiedAt),
        isNull(cancellationRequests.usedAt),
        gt(cancellationRequests.expiresAt, now),
      ),
    });

    if (!validSession) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid or expired cancellation session. Please start the verification process again.",
        },
        { status: 401 },
      );
    }

    // 2. Atomic Cancellation in Database with 'status = pending' check
    const updated = await db
      .update(appointments)
      .set({
        status: "cancelled",
        updatedAt: now,
        metadata: sql`jsonb_set(
          jsonb_set(
            coalesce(${appointments.metadata}, '{}'::jsonb),
            '{cancelledByUser}',
            'true'::jsonb
          ),
          '{userCancellationReason}',
          to_jsonb(${reason || "Self-service cancellation"}::text)
        )`,
      })
      .where(
        and(
          eq(appointments.referenceId, referenceId),
          eq(appointments.status, "pending"), // Strict atomic concurrency protection
        ),
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This appointment cannot be cancelled because its status was already confirmed, completed, or updated.",
        },
        { status: 409 },
      );
    }

    const cancelledAppointment = updated[0];

    // 3. Mark the sessionToken as used so it cannot be re-used
    await db
      .update(cancellationRequests)
      .set({ usedAt: now })
      .where(eq(cancellationRequests.id, validSession.id));

    // 4. Send cancellation confirmation email (non-blocking)
    try {
      await sendUserCancellationConfirmedEmail({
        appointment: {
          referenceId: cancelledAppointment.referenceId,
          patientName: cancelledAppointment.patientName,
          patientPhone: cancelledAppointment.patientPhone,
          patientEmail: cancelledAppointment.patientEmail,
          preferredDate: cancelledAppointment.preferredDate,
          preferredTimeSlot: cancelledAppointment.preferredTimeSlot,
          visitType: cancelledAppointment.visitType,
        },
        reason,
      });
    } catch (emailErr) {
      console.error(
        `[POST /api/appointments/cancel/confirm] Email error for ${referenceId}:`,
        emailErr,
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your appointment has been successfully cancelled.",
      referenceId,
    });
  } catch (error) {
    console.error("[POST /api/appointments/cancel/confirm Error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while confirming cancellation.",
      },
      { status: 500 },
    );
  }
}
