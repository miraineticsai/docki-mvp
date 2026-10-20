"use server";

import { and, eq, gte, inArray } from "drizzle-orm";
import { getAvailableSlotsForDateAction } from "@/actions/schedule";
import { db } from "@/db";
import { appointments } from "@/db/schema";
import { sendConsultationConfirmationEmail } from "@/lib/email/service";
import {
  type AppointmentActionResponse,
  type AppointmentSubmissionInput,
  appointmentSubmissionSchema,
} from "@/lib/validations/appointment";

/**
 * Generates an easily readable clinical reference ID (e.g. APT-20261015-8F3A)
 */
function generateReferenceId(dateStr: string): string {
  const compactDate = dateStr.replace(/-/g, "");
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `APT-${compactDate}-${randomSuffix}`;
}

/**
 * Server Action: Process and save new patient appointment requests.
 * Runs strictly on the server with double-booking prevention via DB transactions
 * and PostgreSQL unique partial constraints.
 */
export async function createAppointmentAction(
  data: AppointmentSubmissionInput,
): Promise<AppointmentActionResponse> {
  // 1. Validate incoming data with Zod
  const validation = appointmentSubmissionSchema.safeParse(data);

  if (!validation.success) {
    const fieldErrors: Record<string, string> = {};
    for (const error of validation.error.issues) {
      if (error.path[0]) {
        fieldErrors[error.path[0].toString()] = error.message;
      }
    }
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      fieldErrors,
    };
  }

  const {
    patientName,
    patientPhone,
    patientEmail,
    visitType,
    preferredDate,
    preferredTimeSlot,
    notes,
  } = validation.data;

  // Clean phone number (strip whitespace and common separators)
  const cleanedPhone = patientPhone.replace(/[\s\-()]/g, "");

  // 2. Fallback check for unconfigured DATABASE_URL in fresh clones
  if (!process.env.DATABASE_URL) {
    console.warn(
      "[Clinic MVP Warning] DATABASE_URL is not set. Simulating appointment persistence for demonstration.",
    );
    const mockReferenceId = generateReferenceId(preferredDate);
    return {
      success: true,
      referenceId: mockReferenceId,
      message:
        "Demo mode: Request received! (Configure DATABASE_URL to persist to Neon DB).",
    };
  }

  try {
    // 3. Duplicate Request Prevention: Check if same phone requested this date in last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    const existingRecent = await db
      .select({ id: appointments.id, referenceId: appointments.referenceId })
      .from(appointments)
      .where(
        and(
          eq(appointments.patientPhone, cleanedPhone),
          eq(appointments.preferredDate, preferredDate),
          gte(appointments.createdAt, fifteenMinutesAgo),
        ),
      )
      .limit(1);

    if (existingRecent.length > 0) {
      return {
        success: false,
        isDuplicate: true,
        referenceId: existingRecent[0].referenceId,
        message:
          "An appointment request with this mobile number for this date was already submitted recently. Our clinic reception is reviewing it!",
      };
    }

    // 4. Server-Side Slot & Schedule Revalidation
    const availabilityRes = await getAvailableSlotsForDateAction(preferredDate);
    if (!availabilityRes.success || !availabilityRes.availability) {
      return {
        success: false,
        message: "Unable to verify clinic schedule for this date.",
      };
    }

    const { availability } = availabilityRes;
    if (!availability.isWorkingDay || availability.isUnavailableDate) {
      return {
        success: false,
        message:
          availability.reason ||
          "Clinic is closed on the selected date. Please pick another date.",
      };
    }

    const allSlots = [
      ...availability.morningSlots,
      ...availability.eveningSlots,
    ];

    const inputSlotClean = preferredTimeSlot.trim().toUpperCase();
    const matchedSlot = allSlots.find(
      (s) =>
        s.slot.toUpperCase() === inputSlotClean ||
        s.startTime.toUpperCase() === inputSlotClean ||
        s.slot.toUpperCase().startsWith(inputSlotClean),
    );

    if (allSlots.length > 0) {
      if (!matchedSlot) {
        return {
          success: false,
          message:
            "The requested time slot is not valid for this clinic day. Please select a listed slot.",
        };
      }
      if (!matchedSlot.isAvailable) {
        return {
          success: false,
          message:
            "This time slot was just booked or is unavailable. Please choose another available slot.",
        };
      }
    }

    const canonicalSlot = matchedSlot ? matchedSlot.slot : preferredTimeSlot;

    // 5. Atomic Database Transaction with Re-check & Insert
    const txResult = await db.transaction(async (tx) => {
      // Re-verify that no active appointment exists on this slot
      const slotOccupied = await tx
        .select({ id: appointments.id })
        .from(appointments)
        .where(
          and(
            eq(appointments.preferredDate, preferredDate),
            eq(appointments.preferredTimeSlot, canonicalSlot),
            inArray(appointments.status, ["pending", "confirmed"]),
          ),
        )
        .limit(1);

      if (slotOccupied.length > 0) {
        return {
          success: false,
          message:
            "Sorry, this time slot was just booked by another patient. Please choose an alternate slot.",
        };
      }

      // Generate unique reference ID
      const referenceId = generateReferenceId(preferredDate);

      // Insert into Neon PostgreSQL
      await tx.insert(appointments).values({
        referenceId,
        patientName,
        patientPhone: cleanedPhone,
        patientEmail,
        visitType,
        preferredDate,
        preferredTimeSlot: canonicalSlot,
        notes: notes || null,
        status: "pending",
        source: "website",
        metadata: {
          submittedAt: new Date().toISOString(),
          clientLanguage: "en_IN",
          slotPeriod: matchedSlot?.period || "general",
        },
      });

      return {
        success: true,
        referenceId,
        message:
          "Your appointment request has been logged successfully with pending status.",
      };
    });

    // 6. Send Consultation Confirmation Email strictly AFTER database commit
    if (txResult.success && txResult.referenceId) {
      try {
        await sendConsultationConfirmationEmail({
          appointment: {
            referenceId: txResult.referenceId,
            patientName,
            patientPhone: cleanedPhone,
            patientEmail,
            preferredDate,
            preferredTimeSlot: canonicalSlot,
            visitType,
            notes: notes || null,
          },
        });
      } catch (emailError) {
        console.error(
          "[actions/appointments] Non-blocking email dispatch error:",
          emailError,
        );
      }
    }

    return txResult;
  } catch (error: unknown) {
    console.error("[Appointment Submission Error]:", error);

    // Check for PostgreSQL unique constraint violation (code 23505)
    const errObj = error as { code?: string; message?: string };
    if (
      errObj?.code === "23505" ||
      errObj?.message?.includes("appointments_active_slot_idx")
    ) {
      return {
        success: false,
        message:
          "This exact time slot was just taken by another patient. Please select an alternate slot.",
      };
    }

    return {
      success: false,
      message:
        "Unable to record appointment request at this time. Please call or WhatsApp our clinic directly.",
    };
  }
}
