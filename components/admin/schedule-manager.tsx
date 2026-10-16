"use client";

import {
  Calendar01Icon,
  Cancel01Icon,
  Clock01Icon,
  RefreshIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { toast } from "sonner";
import { updateScheduleConfigAction } from "@/actions/schedule";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateShiftSlots } from "@/lib/schedule/slots";
import type { ClinicScheduleConfig, DaySchedule } from "@/lib/schedule/types";

interface ScheduleManagerProps {
  initialConfig: ClinicScheduleConfig;
}

export function ScheduleManager({ initialConfig }: ScheduleManagerProps) {
  const [config, setConfig] = useState<ClinicScheduleConfig>(initialConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [newLeaveDate, setNewLeaveDate] = useState("");

  const handleSlotDurationChange = (minutes: number) => {
    setConfig((prev) => ({ ...prev, slotDurationMinutes: minutes }));
  };

  const handleAdvanceDaysChange = (days: number) => {
    setConfig((prev) => ({ ...prev, advanceBookingDays: days }));
  };

  const handleDayWorkingToggle = (dayIndex: number) => {
    setConfig((prev) => {
      const updatedDays = [...prev.days];
      updatedDays[dayIndex] = {
        ...updatedDays[dayIndex],
        isWorkingDay: !updatedDays[dayIndex].isWorkingDay,
      };
      return { ...prev, days: updatedDays };
    });
  };

  const handleShiftTimingChange = (
    dayIndex: number,
    shift: "morningShift" | "eveningShift",
    field: "enabled" | "startTime" | "endTime",
    value: boolean | string,
  ) => {
    setConfig((prev) => {
      const updatedDays = [...prev.days];
      const targetDay = { ...updatedDays[dayIndex] };
      targetDay[shift] = {
        ...targetDay[shift],
        [field]: value,
      };
      updatedDays[dayIndex] = targetDay;
      return { ...prev, days: updatedDays };
    });
  };

  const handleAddLeaveDate = () => {
    if (!newLeaveDate || !/^\d{4}-\d{2}-\d{2}$/.test(newLeaveDate)) {
      toast.error("Please enter a valid date in YYYY-MM-DD format.");
      return;
    }

    if (config.unavailableDates.includes(newLeaveDate)) {
      toast.warning("This date is already listed as unavailable.");
      return;
    }

    setConfig((prev) => ({
      ...prev,
      unavailableDates: [...prev.unavailableDates, newLeaveDate].sort(),
    }));
    setNewLeaveDate("");
    toast.success(`Date ${newLeaveDate} added to unavailable leaves.`);
  };

  const handleRemoveLeaveDate = (dateToRemove: string) => {
    setConfig((prev) => ({
      ...prev,
      unavailableDates: prev.unavailableDates.filter((d) => d !== dateToRemove),
    }));
    toast.info(`Removed ${dateToRemove} from unavailable dates.`);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await updateScheduleConfigAction(config);

      if (res.success && res.config) {
        toast.success(res.message);
        setConfig(res.config);
      } else {
        toast.error(res.message || "Failed to update schedule settings.");
      }
    } catch {
      toast.error("An error occurred while saving the schedule.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            OPD Hours &amp; Slot Rules
          </h2>
          <p className="text-xs text-slate-500">
            Configure consultation slot durations, working shifts, and clinic
            leave dates.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-teal-700 hover:bg-teal-800 text-white font-medium text-xs h-9 px-5 shadow-xs"
        >
          {isSaving ? (
            <div className="flex items-center gap-1.5">
              <HugeiconsIcon
                icon={RefreshIcon}
                className="size-3.5 animate-spin"
              />
              <span>Saving Rules...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <HugeiconsIcon icon={Tick02Icon} className="size-3.5" />
              <span>Save Schedule</span>
            </div>
          )}
        </Button>
      </div>

      {/* Global Settings Grid: Duration & Advance Booking */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Slot Duration */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HugeiconsIcon
                icon={Clock01Icon}
                className="size-4 text-teal-700"
              />
              <span>Consultation Slot Duration</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Length of each individual patient consultation window
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[15, 20, 30, 45, 60].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => handleSlotDurationChange(dur)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    config.slotDurationMinutes === dur
                      ? "bg-teal-700 text-white border-teal-800 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {dur} Minutes
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Advance Booking Window */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HugeiconsIcon
                icon={Calendar01Icon}
                className="size-4 text-teal-700"
              />
              <span>Advance Booking Window</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              How far in advance patients can request clinic appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[7, 14, 21, 30].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => handleAdvanceDaysChange(days)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    config.advanceBookingDays === days
                      ? "bg-teal-700 text-white border-teal-800 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Working Days & Shift Timings */}
      <Card className="border-slate-200 bg-white">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-sm font-bold text-slate-900">
            Weekly Working Days &amp; Shift Timings
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Manage Morning and Evening clinic consultation windows for each day
            of the week.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-slate-100">
          {config.days.map((day: DaySchedule, index: number) => {
            const morningSlotsCount = day.morningShift.enabled
              ? generateShiftSlots(
                  day.morningShift,
                  config.slotDurationMinutes,
                  "morning",
                ).length
              : 0;

            const eveningSlotsCount = day.eveningShift.enabled
              ? generateShiftSlots(
                  day.eveningShift,
                  config.slotDurationMinutes,
                  "evening",
                ).length
              : 0;

            return (
              <div
                key={day.dayName}
                className={`p-4 transition-colors ${
                  day.isWorkingDay ? "bg-white" : "bg-slate-50/60"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Day Header & Toggle */}
                  <div className="flex items-center gap-3 min-w-[160px]">
                    <button
                      type="button"
                      onClick={() => handleDayWorkingToggle(index)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        day.isWorkingDay ? "bg-teal-600" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block size-5 rounded-full bg-white shadow-md transform ring-0 transition duration-200 ease-in-out ${
                          day.isWorkingDay ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <div>
                      <div className="font-bold text-sm text-slate-900">
                        {day.dayName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {day.isWorkingDay
                          ? `${morningSlotsCount + eveningSlotsCount} Total Slots`
                          : "Clinic Closed"}
                      </div>
                    </div>
                  </div>

                  {/* Shifts Inputs (Only visible if day is working) */}
                  {day.isWorkingDay ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                      {/* Morning Shift */}
                      <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-amber-500" />
                            Morning Clinic ({morningSlotsCount} slots)
                          </span>
                          <input
                            type="checkbox"
                            checked={day.morningShift.enabled}
                            onChange={(e) =>
                              handleShiftTimingChange(
                                index,
                                "morningShift",
                                "enabled",
                                e.target.checked,
                              )
                            }
                            className="size-4 accent-teal-600 rounded"
                          />
                        </div>
                        {day.morningShift.enabled && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <Label className="text-[10px] text-slate-400">
                                Start
                              </Label>
                              <Input
                                type="time"
                                value={day.morningShift.startTime}
                                onChange={(e) =>
                                  handleShiftTimingChange(
                                    index,
                                    "morningShift",
                                    "startTime",
                                    e.target.value,
                                  )
                                }
                                className="h-8 text-xs bg-white"
                              />
                            </div>
                            <span className="text-slate-400 text-xs mt-3">
                              to
                            </span>
                            <div className="flex-1">
                              <Label className="text-[10px] text-slate-400">
                                End
                              </Label>
                              <Input
                                type="time"
                                value={day.morningShift.endTime}
                                onChange={(e) =>
                                  handleShiftTimingChange(
                                    index,
                                    "morningShift",
                                    "endTime",
                                    e.target.value,
                                  )
                                }
                                className="h-8 text-xs bg-white"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Evening Shift */}
                      <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-teal-600" />
                            Evening Clinic ({eveningSlotsCount} slots)
                          </span>
                          <input
                            type="checkbox"
                            checked={day.eveningShift.enabled}
                            onChange={(e) =>
                              handleShiftTimingChange(
                                index,
                                "eveningShift",
                                "enabled",
                                e.target.checked,
                              )
                            }
                            className="size-4 accent-teal-600 rounded"
                          />
                        </div>
                        {day.eveningShift.enabled && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <Label className="text-[10px] text-slate-400">
                                Start
                              </Label>
                              <Input
                                type="time"
                                value={day.eveningShift.startTime}
                                onChange={(e) =>
                                  handleShiftTimingChange(
                                    index,
                                    "eveningShift",
                                    "startTime",
                                    e.target.value,
                                  )
                                }
                                className="h-8 text-xs bg-white"
                              />
                            </div>
                            <span className="text-slate-400 text-xs mt-3">
                              to
                            </span>
                            <div className="flex-1">
                              <Label className="text-[10px] text-slate-400">
                                End
                              </Label>
                              <Input
                                type="time"
                                value={day.eveningShift.endTime}
                                onChange={(e) =>
                                  handleShiftTimingChange(
                                    index,
                                    "eveningShift",
                                    "endTime",
                                    e.target.value,
                                  )
                                }
                                className="h-8 text-xs bg-white"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic">
                      No OPD appointments will be accepted on {day.dayName}s.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Unavailable Dates / Doctor Leaves */}
      <Card className="border-slate-200 bg-white">
        <CardHeader className="pb-4 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900">
            Doctor Unavailable Dates &amp; Leave Calendar
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Mark specific dates when the clinic is closed (holidays, doctor
            leave, hospital emergency duties).
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {/* Add Date Input */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <HugeiconsIcon
                icon={Calendar01Icon}
                className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400"
              />
              <Input
                type="date"
                value={newLeaveDate}
                onChange={(e) => setNewLeaveDate(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddLeaveDate}
              className="text-xs h-9 border-slate-200 hover:bg-slate-100"
            >
              Add Leave Date
            </Button>
          </div>

          {/* List of Marked Dates */}
          {config.unavailableDates.length === 0 ? (
            <div className="p-4 text-center rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
              No leave dates currently scheduled. Clinic will operate according
              to standard weekly hours.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 pt-2">
              {config.unavailableDates.map((leaveDate) => (
                <div
                  key={leaveDate}
                  className="inline-flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-800"
                >
                  <HugeiconsIcon
                    icon={Calendar01Icon}
                    className="size-3.5 text-rose-600"
                  />
                  <span>{leaveDate}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLeaveDate(leaveDate)}
                    className="text-rose-500 hover:text-rose-800 ml-1 p-0.5"
                    title="Remove leave date"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
