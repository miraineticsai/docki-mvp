"use server";

import { and, desc, eq, gte, ilike, inArray, lt, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { appointments } from "@/db/schema";
import { verifyAdminCredentials } from "@/lib/auth/jwt";
import {
  clearAdminSessionCookie,
  requireAdminSession,
  setAdminSessionCookie,
} from "@/lib/auth/session";
import { sendAdminActionEmail } from "@/lib/email/service";
import {
  adminLoginSchema,
  updateAppointmentStatusSchema,
} from "@/lib/validations/admin";

/**
 * Formats current date in Indian Standard Time (Asia/Kolkata) as YYYY-MM-DD.
 */
function getTodayDateString(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Server Action: Admin Login
 */
export async function loginAdminAction(formData: {
  email: string;
  password: string;
}) {
  const validation = adminLoginSchema.safeParse(formData);

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Invalid input.",
    };
  }

  const { email, password } = validation.data;
  const isMatch = await verifyAdminCredentials(email, password);

  if (!isMatch) {
    return {
      success: false,
      message: "Incorrect email or password. Please try again.",
    };
  }

  await setAdminSessionCookie(email);

  return {
    success: true,
    message: "Welcome back, Doctor. Login successful.",
  };
}

/**
 * Server Action: Admin Logout
 */
export async function logoutAdminAction() {
  await clearAdminSessionCookie();
  return { success: true };
}

/**
 * Server Action: Get Dashboard Overview Metrics
 */
export async function getDashboardStatsAction() {
  try {
    await requireAdminSession();

    if (!process.env.DATABASE_URL) {
      return {
        success: false,
        message: "Database connection is unconfigured.",
        data: null,
      };
    }

    const todayStr = getTodayDateString();

    // Query aggregate counts in 1 single fast query, and fetch recent pending in parallel
    const [countsResult, recentPending] = await Promise.all([
      db.execute(sql`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
          COUNT(*) FILTER (WHERE status = 'confirmed')::int AS confirmed,
          COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
          COUNT(*) FILTER (WHERE status IN ('cancelled', 'rejected'))::int AS cancelled,
          COUNT(*) FILTER (WHERE preferred_date = ${todayStr})::int AS today
        FROM appointments
      `),
      db
        .select()
        .from(appointments)
        .where(eq(appointments.status, "pending"))
        .orderBy(desc(appointments.createdAt))
        .limit(6),
    ]);

    const row = ((countsResult as unknown as Record<string, unknown>[])[0] ||
      {}) as Record<string, number>;

    return {
      success: true,
      data: {
        total: Number(row.total || 0),
        pending: Number(row.pending || 0),
        confirmed: Number(row.confirmed || 0),
        completed: Number(row.completed || 0),
        cancelled: Number(row.cancelled || 0),
        today: Number(row.today || 0),
        todayDate: todayStr,
        recentPending,
      },
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
    console.error("[getDashboardStatsAction Error]:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to load dashboard data.",
      data: null,
    };
  }
}

/**
 * Server Action: Fetch Appointments with search, status, and date filters
 */
export async function getAppointmentsListAction(params?: {
  search?: string;
  status?: string;
  dateFilter?: string;
}) {
  try {
    await requireAdminSession();

    if (!process.env.DATABASE_URL) {
      return { success: false, message: "Database not configured.", data: [] };
    }

    const search = params?.search?.trim();
    const status = params?.status?.trim().toLowerCase();
    const dateFilter = params?.dateFilter?.trim().toLowerCase();
    const todayStr = getTodayDateString();

    const conditions = [];

    // Filter by search query (patient name, phone, reference ID)
    if (search && search.length > 0) {
      conditions.push(
        or(
          ilike(appointments.patientName, `%${search}%`),
          ilike(appointments.patientPhone, `%${search}%`),
          ilike(appointments.referenceId, `%${search}%`),
        ),
      );
    }

    // Filter by status
    if (status && status !== "all") {
      if (status === "cancelled") {
        conditions.push(
          inArray(appointments.status, ["cancelled", "rejected"]),
        );
      } else {
        conditions.push(eq(appointments.status, status));
      }
    }

    // Filter by date range
    if (dateFilter && dateFilter !== "all") {
      if (dateFilter === "today") {
        conditions.push(eq(appointments.preferredDate, todayStr));
      } else if (dateFilter === "upcoming") {
        conditions.push(gte(appointments.preferredDate, todayStr));
      } else if (dateFilter === "past") {
        conditions.push(lt(appointments.preferredDate, todayStr));
      }
    }

    const query = db
      .select()
      .from(appointments)
      .orderBy(desc(appointments.preferredDate), desc(appointments.createdAt));

    const results =
      conditions.length > 0
        ? await query.where(and(...conditions))
        : await query;

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return {
        success: false,
        message: error.message,
        data: [],
      };
    }
    console.error("[getAppointmentsListAction Error]:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to load appointments.",
      data: [],
    };
  }
}

/**
 * Server Action: Update Appointment Status, Token Number, or Clinical Notes
 */
export async function updateAppointmentStatusAction(input: {
  referenceId: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "rejected";
  tokenNumber?: string | null;
  doctorNotes?: string | null;
}) {
  try {
    const adminEmail = await requireAdminSession();

    const validation = updateAppointmentStatusSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        message: validation.error.issues[0]?.message || "Invalid input data.",
      };
    }

    const { referenceId, status, tokenNumber, doctorNotes } = validation.data;

    const existing = await db.query.appointments.findFirst({
      where: eq(appointments.referenceId, referenceId),
    });

    if (!existing) {
      return {
        success: false,
        message: `Appointment request ${referenceId} was not found.`,
      };
    }

    // Preserve metadata and append audit log entry
    const existingMetadata =
      typeof existing.metadata === "object" && existing.metadata !== null
        ? existing.metadata
        : {};

    // Enforce business rule: Once cancelled by user, it cannot be overridden by admin
    if (
      existing.status === "cancelled" &&
      (existingMetadata as Record<string, unknown>)?.cancelledByUser === true
    ) {
      return {
        success: false,
        message:
          "This appointment was cancelled by the patient and cannot be modified or restored.",
      };
    }

    const updated = await db
      .update(appointments)
      .set({
        status,
        tokenNumber:
          tokenNumber !== undefined ? tokenNumber : existing.tokenNumber,
        doctorNotes:
          doctorNotes !== undefined ? doctorNotes : existing.doctorNotes,
        updatedAt: new Date(),
        metadata: {
          ...existingMetadata,
          lastUpdatedBy: adminEmail,
          lastStatusChange: new Date().toISOString(),
        },
      })
      .where(eq(appointments.referenceId, referenceId))
      .returning();

    const updatedAppointment = updated[0];

    // Trigger Admin Action Notification Email strictly AFTER DB update succeeds
    if (updatedAppointment) {
      try {
        await sendAdminActionEmail({
          appointment: updatedAppointment,
          previousStatus: existing.status,
          previousTokenNumber: existing.tokenNumber,
          previousDoctorNotes: existing.doctorNotes,
          adminEmail,
        });
      } catch (emailErr) {
        console.error(
          `[actions/admin] Non-blocking admin action email dispatch error for ${referenceId}:`,
          emailErr,
        );
      }
    }

    return {
      success: true,
      message: `Appointment ${referenceId} updated to ${status}.`,
      appointment: updatedAppointment,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return {
        success: false,
        message: error.message,
      };
    }
    console.error("[updateAppointmentStatusAction Error]:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update appointment.",
    };
  }
}
