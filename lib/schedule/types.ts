import { z } from "zod";

/**
 * Single shift configuration (e.g. Morning or Evening)
 */
export const shiftTimingSchema = z.object({
  enabled: z.boolean(),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Use HH:MM format" }),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Use HH:MM format" }),
});

export type ShiftTiming = z.infer<typeof shiftTimingSchema>;

/**
 * Schedule settings for a day of week
 */
export const dayScheduleSchema = z.object({
  dayOfWeek: z.number().min(0).max(6), // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  dayName: z.string(),
  isWorkingDay: z.boolean(),
  morningShift: shiftTimingSchema,
  eveningShift: shiftTimingSchema,
});

export type DaySchedule = z.infer<typeof dayScheduleSchema>;

/**
 * Full clinic schedule configuration
 */
export const clinicScheduleConfigSchema = z.object({
  slotDurationMinutes: z.number().min(10).max(120),
  advanceBookingDays: z.number().min(1).max(90),
  unavailableDates: z.array(
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Use YYYY-MM-DD" }),
  ),
  days: z.array(dayScheduleSchema).length(7),
});

export type ClinicScheduleConfig = z.infer<typeof clinicScheduleConfigSchema>;

/**
 * Generated individual slot information
 */
export interface TimeSlotInfo {
  slot: string; // e.g. "09:00 AM – 09:30 AM"
  startTime: string; // "09:00"
  endTime: string; // "09:30"
  period: "morning" | "evening";
  isAvailable: boolean;
  bookedCount?: number;
}

/**
 * Day availability response for patient booking
 */
export interface DateAvailabilityResult {
  date: string; // "YYYY-MM-DD"
  formattedDate: string; // "Mon, 19 Oct 2026"
  isWorkingDay: boolean;
  isUnavailableDate: boolean;
  reason?: string;
  morningSlots: TimeSlotInfo[];
  eveningSlots: TimeSlotInfo[];
  totalSlots: number;
  availableCount: number;
}
