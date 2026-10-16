import type {
  ClinicScheduleConfig,
  DateAvailabilityResult,
  ShiftTiming,
  TimeSlotInfo,
} from "./types";

/**
 * Converts 24h time "HH:MM" into 12h format e.g. "09:00 AM" or "06:30 PM".
 */
export function formatTime12h(time24: string): string {
  const [hourStr, minStr] = time24.split(":");
  let hour = Number.parseInt(hourStr, 10);
  const minute = minStr || "00";
  const ampm = hour >= 12 ? "PM" : "AM";

  if (hour === 0) {
    hour = 12;
  } else if (hour > 12) {
    hour -= 12;
  }

  const paddedHour = hour < 10 ? `0${hour}` : `${hour}`;
  return `${paddedHour}:${minute} ${ampm}`;
}

/**
 * Generates human-readable slot range label e.g. "09:00 AM – 09:30 AM"
 */
export function formatSlotLabel(
  startTime24: string,
  endTime24: string,
): string {
  return `${formatTime12h(startTime24)} – ${formatTime12h(endTime24)}`;
}

/**
 * Converts "HH:MM" into total minutes from midnight.
 */
function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map((v) => Number.parseInt(v, 10));
  return h * 60 + m;
}

/**
 * Converts total minutes from midnight back to "HH:MM".
 */
function minutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const hh = h < 10 ? `0${h}` : `${h}`;
  const mm = m < 10 ? `0${m}` : `${m}`;
  return `${hh}:${mm}`;
}

/**
 * Generates discrete time slots between shift startTime and endTime.
 */
export function generateShiftSlots(
  shift: ShiftTiming,
  durationMinutes: number,
  period: "morning" | "evening",
): TimeSlotInfo[] {
  if (!shift.enabled) return [];

  const startMin = timeToMinutes(shift.startTime);
  const endMin = timeToMinutes(shift.endTime);

  if (startMin >= endMin) return [];

  const slots: TimeSlotInfo[] = [];

  let current = startMin;
  while (current + durationMinutes <= endMin) {
    const slotStart = minutesToTime(current);
    const slotEnd = minutesToTime(current + durationMinutes);

    slots.push({
      slot: formatSlotLabel(slotStart, slotEnd),
      startTime: slotStart,
      endTime: slotEnd,
      period,
      isAvailable: true,
    });

    current += durationMinutes;
  }

  return slots;
}

/**
 * Gets day of week (0=Sunday ... 6=Saturday) and formatted localized string for YYYY-MM-DD.
 */
export function parseDateInIST(dateString: string): {
  dayOfWeek: number;
  formattedDate: string;
} {
  // Use noon UTC to avoid date shifting across Indian Standard Time (+05:30)
  const dateObj = new Date(`${dateString}T12:00:00Z`);

  const dayOfWeekStr = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
  }).format(dateObj);

  const daysMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const dayOfWeek = daysMap[dayOfWeekStr] ?? 0;

  const formattedDate = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(dateObj);

  return { dayOfWeek, formattedDate };
}

/**
 * Returns current IST date as YYYY-MM-DD.
 */
export function getTodayDateInIST(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Returns current IST time as minutes from midnight.
 */
export function getCurrentMinutesInIST(): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const hour = Number.parseInt(
    parts.find((p) => p.type === "hour")?.value || "0",
    10,
  );
  const minute = Number.parseInt(
    parts.find((p) => p.type === "minute")?.value || "0",
    10,
  );
  return hour * 60 + minute;
}

/**
 * Calculates complete slot availability for a specified date given clinic configuration
 * and set of already booked/occupied slots.
 */
export function calculateDateAvailability(
  dateString: string,
  config: ClinicScheduleConfig,
  bookedSlotsSet: Set<string>,
): DateAvailabilityResult {
  const { dayOfWeek, formattedDate } = parseDateInIST(dateString);
  const todayIST = getTodayDateInIST();

  // 1. Check if date is in the past
  if (dateString < todayIST) {
    return {
      date: dateString,
      formattedDate,
      isWorkingDay: false,
      isUnavailableDate: false,
      reason: "Past dates cannot be selected.",
      morningSlots: [],
      eveningSlots: [],
      totalSlots: 0,
      availableCount: 0,
    };
  }

  // 2. Check if date is beyond advance booking window
  const maxAdvanceDate = new Date();
  maxAdvanceDate.setDate(maxAdvanceDate.getDate() + config.advanceBookingDays);
  const maxAdvanceStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(maxAdvanceDate);

  if (dateString > maxAdvanceStr) {
    return {
      date: dateString,
      formattedDate,
      isWorkingDay: false,
      isUnavailableDate: false,
      reason: `Appointments can only be booked up to ${config.advanceBookingDays} days in advance.`,
      morningSlots: [],
      eveningSlots: [],
      totalSlots: 0,
      availableCount: 0,
    };
  }

  // 3. Check if date is explicitly marked unavailable (Doctor Leave / Holiday)
  const isUnavailable = config.unavailableDates.includes(dateString);
  if (isUnavailable) {
    return {
      date: dateString,
      formattedDate,
      isWorkingDay: false,
      isUnavailableDate: true,
      reason:
        "Doctor is unavailable on this date (Clinic Closed / Official Leave).",
      morningSlots: [],
      eveningSlots: [],
      totalSlots: 0,
      availableCount: 0,
    };
  }

  // 4. Find day schedule
  const daySchedule = config.days.find((d) => d.dayOfWeek === dayOfWeek);
  if (!daySchedule || !daySchedule.isWorkingDay) {
    return {
      date: dateString,
      formattedDate,
      isWorkingDay: false,
      isUnavailableDate: false,
      reason: `Clinic is closed on ${daySchedule?.dayName || "this day"}.`,
      morningSlots: [],
      eveningSlots: [],
      totalSlots: 0,
      availableCount: 0,
    };
  }

  // 5. Generate raw slots
  const morningSlots = generateShiftSlots(
    daySchedule.morningShift,
    config.slotDurationMinutes,
    "morning",
  );
  const eveningSlots = generateShiftSlots(
    daySchedule.eveningShift,
    config.slotDurationMinutes,
    "evening",
  );

  const isToday = dateString === todayIST;
  const currentMinutes = isToday ? getCurrentMinutesInIST() : -1;

  // 6. Check booked status and time expiry for today
  let availableCount = 0;

  const markAvailability = (slotList: TimeSlotInfo[]) => {
    for (const item of slotList) {
      const slotStartMinutes = timeToMinutes(item.startTime);

      // If today, filter out past slots (giving a 15-minute lead buffer)
      if (isToday && slotStartMinutes <= currentMinutes + 15) {
        item.isAvailable = false;
        continue;
      }

      // Check if slot or broad slot range is booked
      const isBooked =
        bookedSlotsSet.has(item.slot) ||
        bookedSlotsSet.has(item.startTime) ||
        bookedSlotsSet.has(formatTime12h(item.startTime));

      if (isBooked) {
        item.isAvailable = false;
      } else {
        item.isAvailable = true;
        availableCount++;
      }
    }
  };

  markAvailability(morningSlots);
  markAvailability(eveningSlots);

  const totalSlots = morningSlots.length + eveningSlots.length;

  return {
    date: dateString,
    formattedDate,
    isWorkingDay: true,
    isUnavailableDate: false,
    reason:
      totalSlots === 0
        ? "No shifts scheduled on this date."
        : availableCount === 0
          ? "All appointment slots on this date are fully booked."
          : undefined,
    morningSlots,
    eveningSlots,
    totalSlots,
    availableCount,
  };
}
