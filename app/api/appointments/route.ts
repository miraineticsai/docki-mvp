import { type NextRequest, NextResponse } from "next/server";
import { createAppointmentAction } from "@/actions/appointments";
import { db } from "@/db";
import { appointments } from "@/db/schema";
import { appointmentSubmissionSchema } from "@/lib/validations/appointment";

/**
 * POST /api/appointments
 * API endpoint ready for chatbot integration, n8n automations, and third-party webhooks.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = appointmentSubmissionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.format(),
        },
        { status: 400 },
      );
    }

    const result = await createAppointmentAction(validation.data);

    if (!result.success) {
      return NextResponse.json(result, {
        status: result.isDuplicate ? 409 : 500,
      });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[POST /api/appointments error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error while processing appointment request.",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/appointments
 * Healthcheck / status check endpoint.
 * In Phase 3, this can be guarded with an admin session or secret API key for n8n/admin polling.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const adminSecret = process.env.ADMIN_API_SECRET;

  // If secret is set, require authorization
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
