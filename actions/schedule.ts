"use server";

import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { appointments, clinicSettings } from "@/db/schema";
import { requireAdminSession } from "@/lib/auth/session";
import { DEFAULT_SCHEDULE_CONFIG } from "@/lib/schedule/defaults";
import {
  calculateDateAvailability,
  getTodayDateInIST,
} from "@/lib/schedule/slots";
import {
  type ClinicScheduleConfig,
  clinicScheduleConfigSchema,
  type DateAvailabilityResult,
} from "@/lib/schedule/types";

const SCHEDULE_SETTINGS_KEY = "schedule_config";

/**
 * Server Action: Retrieve clinic schedule configuration.
 */
export async function getScheduleConfigAction(): Promise<{
  success: boolean;
  config: ClinicScheduleConfig;
}> {
  try {
    if (!process.env.DATABASE_URL) {
      return { success: true, config: DEFAULT_SCHEDULE_CONFIG };
    }

    const setting = await db.query.clinicSettings.findFirst({
      where: eq(clinicSettings.key, SCHEDULE_SETTINGS_KEY),
    });

    if (!setting) {
      return { success: true, config: DEFAULT_SCHEDULE_CONFIG };
    }

    const validation = clinicScheduleConfigSchema.safeParse(setting.value);
    if (!validation.success) {
      console.warn(
        "[Schedule Config Parse Warning]: using defaults",
        validation.error.issues,
      );
      return { success: true, config: DEFAULT_SCHEDULE_CONFIG };
    }

    return { success: true, config: validation.data };
  } catch (error) {
    console.error("[getScheduleConfigAction Error]:", error);
    return { success: true, config: DEFAULT_SCHEDULE_CONFIG };
  }
}

/**
 * Server Action: Update clinic schedule configuration.
 * Protected by admin authentication.
 */
export async function updateScheduleConfigAction(
  newConfig: ClinicScheduleConfig,
) {
  try {
    await requireAdminSession();

    const validation = clinicScheduleConfigSchema.safeParse(newConfig);
    if (!validation.success) {
      return {
        success: false,
        message:
          validation.error.issues[0]?.message || "Invalid schedule data.",
      };
    }

    const validatedConfig = validation.data;

    // Upsert into clinic_settings table
    const existing = await db.query.clinicSettings.findFirst({
      where: eq(clinicSettings.key, SCHEDULE_SETTINGS_KEY),
    });

    if (existing) {
      await db
        .update(clinicSettings)
        .set({
          value: validatedConfig,
          updatedAt: new Date(),
        })
        .where(eq(clinicSettings.key, SCHEDULE_SETTINGS_KEY));
    } else {
      await db.insert(clinicSettings).values({
        key: SCHEDULE_SETTINGS_KEY,
        value: validatedConfig,
        description:
          "Clinic working hours, slot duration, and unavailable leave dates",
      });
    }

    return {
      success: true,
      message: "Clinic schedule and slot rules updated successfully.",
      config: validatedConfig,
    };
  } catch (error) {
    console.error("[updateScheduleConfigAction Error]:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update schedule.",
    };
  }
}

/**
 * Server Action: Calculate slot availability for a specified date.
 * Public action used by the patient appointment form and doctor schedule view.
 */
export async function getAvailableSlotsForDateAction(
  dateString: string,
): Promise<{
  success: boolean;
  availability: DateAvailabilityResult | null;
  message?: string;
}> {
  try {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return {
        success: false,
        availability: null,
        message: "Invalid date format. Expected YYYY-MM-DD.",
      };
    }

    const { config } = await getScheduleConfigAction();

    // Query active appointments on that date in Neon PostgreSQL
    let bookedSlotsSet = new Set<string>();

    if (process.env.DATABASE_URL) {
      const activeBookings = await db
        .select({
          preferredTimeSlot: appointments.preferredTimeSlot,
        })
        .from(appointments)
        .where(
          and(
            eq(appointments.preferredDate, dateString),
            inArray(appointments.status, ["pending", "confirmed"]),
          ),
        );

      bookedSlotsSet = new Set(
        activeBookings.map((b) => b.preferredTimeSlot.trim()),
      );
    }

    const availability = calculateDateAvailability(
      dateString,
      config,
      bookedSlotsSet,
    );

    return {
      success: true,
      availability,
    };
  } catch (error) {
    console.error("[getAvailableSlotsForDateAction Error]:", error);
    return {
      success: false,
      availability: null,
      message: "Unable to calculate availability at this time.",
    };
  }
}

/**
 * Server Action: Get high-level availability overview for upcoming days.
 * Used by booking calendar to disable non-working days or full days.
 */
export async function getUpcomingDaysAvailabilityAction(): Promise<{
  success: boolean;
  days: Array<{
    date: string;
    isWorkingDay: boolean;
    isUnavailable: boolean;
    isPast: boolean;
  }>;
}> {
  try {
    const { config } = await getScheduleConfigAction();
    const todayStr = getTodayDateInIST();

    const result = [];
    const baseDate = new Date();

    for (let i = 0; i < config.advanceBookingDays; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);

      const dateStr = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(d);

      const dayOfWeek = d.getDay();
      const dayConfig = config.days.find(
        (item) => item.dayOfWeek === dayOfWeek,
      );
      const isWorkingDay = dayConfig?.isWorkingDay ?? false;
      const isUnavailable = config.unavailableDates.includes(dateStr);

      result.push({
        date: dateStr,
        isWorkingDay,
        isUnavailable,
        isPast: dateStr < todayStr,
      });
    }

    return {
      success: true,
      days: result,
    };
  } catch (error) {
    console.error("[getUpcomingDaysAvailabilityAction Error]:", error);
    return {
      success: false,
      days: [],
    };
  }
}
