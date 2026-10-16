import { connection, type NextRequest, NextResponse } from "next/server";
import { getAvailableSlotsForDateAction } from "@/actions/schedule";

/**
 * Calculates current date and +30 days lockdown date in Indian Standard Time (Asia/Kolkata).
 */
function getBookingWindowIST() {
  const now = new Date();

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const maxDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const maxBookableDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(maxDate);

  return { today, maxBookableDate };
}

/**
 * GET /api/schedule/slots?date=YYYY-MM-DD
 * (Also available via GET /api/slots?date=YYYY-MM-DD)
 *
 * Super-simple, n8n-friendly endpoint:
 * - date (optional, defaults to today in IST)
 * - automatically locks down to a strict 30-day window from today
 * - returns a flat, simple array of available time slots
 */
export async function GET(request: NextRequest) {
  await connection();

  try {
    const { searchParams } = new URL(request.url);
    const { today, maxBookableDate } = getBookingWindowIST();

    // Default to today if date parameter is omitted
    const date = searchParams.get("date")?.trim() || today;

    // Validate date format YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        {
          success: false,
          isBookable: false,
          message:
            "Invalid date format. Please use YYYY-MM-DD (e.g. 2026-10-25).",
          slots: [],
        },
        { status: 400 },
      );
    }

    // 1. Lockdown check: Past date
    if (date < today) {
      return NextResponse.json({
        success: false,
        date,
        isBookable: false,
        message: "Cannot check or book slots in the past.",
        slots: [],
      });
    }

    // 2. Lockdown check: Beyond 30 days
    if (date > maxBookableDate) {
      return NextResponse.json({
        success: false,
        date,
        isBookable: false,
        message: `Booking window is locked to 30 days in advance (up to ${maxBookableDate}).`,
        slots: [],
      });
    }

    // 3. Fetch availability from schedule engine
    const result = await getAvailableSlotsForDateAction(date);

    if (!result.success || !result.availability) {
      return NextResponse.json(
        {
          success: false,
          date,
          isBookable: false,
          message: result.message || "Failed to calculate slot availability.",
          slots: [],
        },
        { status: 500 },
      );
    }

    const { availability } = result;

    if (!availability.isWorkingDay || availability.isUnavailableDate) {
      return NextResponse.json({
        success: true,
        date,
        isBookable: false,
        message:
          availability.reason ||
          "Clinic is closed or doctor is on leave on this date.",
        slots: [],
      });
    }

    // Flatten all open slots into a simple, clean array
    const openSlots = [
      ...availability.morningSlots,
      ...availability.eveningSlots,
    ].filter((s) => s.isAvailable);

    if (openSlots.length === 0) {
      return NextResponse.json({
        success: true,
        date,
        isBookable: false,
        message:
          availability.reason ||
          "All appointment slots on this date are fully booked.",
        slots: [],
      });
    }

    return NextResponse.json({
      success: true,
      date,
      isBookable: true,
      day: availability.formattedDate,
      totalAvailable: openSlots.length,
      // Simple slot strings ready for n8n or patient display
      slots: openSlots.map((s) => s.slot),
      // Clean start times e.g. ["08:30 AM", "09:00 AM", "05:00 PM"]
      times: openSlots.map((s) => s.startTime),
    });
  } catch (error) {
    console.error("[GET /api/schedule/slots error]:", error);
    return NextResponse.json(
      {
        success: false,
        isBookable: false,
        message: "Internal server error while fetching slot availability.",
        slots: [],
      },
      { status: 500 },
    );
  }
}
