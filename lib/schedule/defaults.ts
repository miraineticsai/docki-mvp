import type { ClinicScheduleConfig } from "./types";

/**
 * Default schedule configuration for Aura Clinic & Family Healthcare (Dr. Rajesh Kulkarni)
 * Matches clinicConfig timings:
 * - Mon-Sat Morning Clinic: 9:00 AM – 11:30 AM
 * - Mon-Sat Evening Clinic: 6:00 PM – 9:30 PM
 * - Sunday Morning: 10:00 AM – 1:00 PM (Sunday evening closed)
 */
export const DEFAULT_SCHEDULE_CONFIG: ClinicScheduleConfig = {
  slotDurationMinutes: 30,
  advanceBookingDays: 14,
  unavailableDates: [],
  days: [
    {
      dayOfWeek: 0,
      dayName: "Sunday",
      isWorkingDay: true,
      morningShift: {
        enabled: true,
        startTime: "10:00",
        endTime: "13:00",
      },
      eveningShift: {
        enabled: false,
        startTime: "18:00",
        endTime: "21:30",
      },
    },
    {
      dayOfWeek: 1,
      dayName: "Monday",
      isWorkingDay: true,
      morningShift: {
        enabled: true,
        startTime: "09:00",
        endTime: "11:30",
      },
      eveningShift: {
        enabled: true,
        startTime: "18:00",
        endTime: "21:30",
      },
    },
    {
      dayOfWeek: 2,
      dayName: "Tuesday",
      isWorkingDay: true,
      morningShift: {
        enabled: true,
        startTime: "09:00",
        endTime: "11:30",
      },
      eveningShift: {
        enabled: true,
        startTime: "18:00",
        endTime: "21:30",
      },
    },
    {
      dayOfWeek: 3,
      dayName: "Wednesday",
      isWorkingDay: true,
      morningShift: {
        enabled: true,
        startTime: "09:00",
        endTime: "11:30",
      },
      eveningShift: {
        enabled: true,
        startTime: "18:00",
        endTime: "21:30",
      },
    },
    {
      dayOfWeek: 4,
      dayName: "Thursday",
      isWorkingDay: true,
      morningShift: {
        enabled: true,
        startTime: "09:00",
        endTime: "11:30",
      },
      eveningShift: {
        enabled: true,
        startTime: "18:00",
        endTime: "21:30",
      },
    },
    {
      dayOfWeek: 5,
      dayName: "Friday",
      isWorkingDay: true,
      morningShift: {
        enabled: true,
        startTime: "09:00",
        endTime: "11:30",
      },
      eveningShift: {
        enabled: true,
        startTime: "18:00",
        endTime: "21:30",
      },
    },
    {
      dayOfWeek: 6,
      dayName: "Saturday",
      isWorkingDay: true,
      morningShift: {
        enabled: true,
        startTime: "09:00",
        endTime: "11:30",
      },
      eveningShift: {
        enabled: true,
        startTime: "18:00",
        endTime: "21:30",
      },
    },
  ],
};
