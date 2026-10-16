import { type NextRequest, NextResponse } from "next/server";
import { createAppointmentAction } from "@/actions/appointments";
import { db } from "@/db";
import { appointments } from "@/db/schema";
import { appointmentSubmissionSchema } from "@/lib/validations/appointment";

/**
 * POST /api/appointments
 * Simple, n8n-friendly endpoint for creating appointments via AI chat, WhatsApp, or webhooks.
 *
 * Accepts either simple shorthand:
 *   { "name": "...", "phone": "...", "date": "YYYY-MM-DD", "slot": "10:00 AM", "reason": "Fever" }
 * Or full website form format:
 *   { "patientName": "...", "patientPhone": "...", "patientEmail": "...", "preferredDate": "...", "preferredTimeSlot": "..." }
 */
export async function POST(request: NextRequest) {
  try {
    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON in request body." },
        { status: 400 },
      );
    }

    // Normalize shorthand fields (name -> patientName, phone -> patientPhone, etc.)
    const normalizedData = {
      patientName: String(body.name || body.patientName || "").trim(),
      patientPhone: String(body.phone || body.patientPhone || "").trim(),
      patientEmail: String(
        body.email || body.patientEmail || "patient@auraclinic.com",
      ).trim(),
      visitType: String(
        body.reason || body.visitType || "General Consultation",
      ).trim(),
      preferredDate: String(body.date || body.preferredDate || "").trim(),
      preferredTimeSlot: String(
        body.slot || body.time || body.preferredTimeSlot || "",
      ).trim(),
      notes:
        body.notes || body.symptoms
          ? String(body.notes || body.symptoms).trim()
          : undefined,
    };

    const validation = appointmentSubmissionSchema.safeParse(normalizedData);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            validation.error.issues[0]?.message ||
            "Validation failed. Please check name, phone, date, and slot.",
        },
        { status: 400 },
      );
    }

    const result = await createAppointmentAction(validation.data);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Failed to book appointment.",
        },
        { status: result.isDuplicate ? 409 : 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        bookingId: result.referenceId,
        referenceId: result.referenceId,
        message: result.message || "Appointment booked successfully.",
        date: normalizedData.preferredDate,
        slot: normalizedData.preferredTimeSlot,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/appointments error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error while processing appointment request.",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/appointments
 * Status check endpoint for n8n and administrators.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const adminSecret = process.env.ADMIN_API_SECRET;

  if (adminSecret && authHeader !== `Bearer ${adminSecret}`) {
    return NextResponse.json(
      { success: false, error: "Unauthorized access" },
      { status: 401 },
    );
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      status: "ready",
      database: "unconfigured",
      message: "Set DATABASE_URL to connect to Neon PostgreSQL.",
    });
  }

  try {
    const recent = await db
      .select({
        referenceId: appointments.referenceId,
        status: appointments.status,
        preferredDate: appointments.preferredDate,
        createdAt: appointments.createdAt,
      })
      .from(appointments)
      .limit(5);

    return NextResponse.json({
      status: "connected",
      database: "Neon PostgreSQL via Drizzle ORM",
      sampleCount: recent.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Database query failed",
      },
      { status: 500 },
    );
  }
}
