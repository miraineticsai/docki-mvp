"use client";

import {
  Calendar01Icon,
  Call02Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  Mail01Icon,
  Tick02Icon,
  User02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createAppointmentAction } from "@/actions/appointments";
import { getAvailableSlotsForDateAction } from "@/actions/schedule";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  DateAvailabilityResult,
  TimeSlotInfo,
} from "@/lib/schedule/types";
import { cn } from "@/lib/utils";
import { appointmentSubmissionSchema } from "@/lib/validations/appointment";

interface AppointmentFormProps {
  onSuccess?: () => void;
  isCompact?: boolean;
}

const VISIT_TYPES = [
  "General Health & Seasonal Fever Consultation",
  "Diabetes (Sugar) & BP Routine Review",
  "Full Body Preventive Health Checkup",
  "Pediatric / Elderly Family Consultation",
  "Wound Dressing / Nebulization / Minor Care",
  "Teleconsultation (WhatsApp / Video Call)",
];

export function AppointmentForm({
  onSuccess,
  isCompact = false,
}: AppointmentFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [visitType, setVisitType] = useState(VISIT_TYPES[0]);
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [notes, setNotes] = useState("");

  // Slot availability states
  const [availability, setAvailability] =
    useState<DateAvailabilityResult | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Submission & Validation States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [minDate, setMinDate] = useState<string | undefined>(undefined);
  const [maxDate, setMaxDate] = useState<string | undefined>(undefined);

  // Set default min & max date in useEffect to satisfy Next.js 16 prerender purity
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDateStr = tomorrow.toISOString().split("T")[0];
    setMinDate(minDateStr);

    const maxFuture = new Date();
    maxFuture.setDate(maxFuture.getDate() + 21); // up to 3 weeks in advance
    setMaxDate(maxFuture.toISOString().split("T")[0]);

    if (!preferredDate) {
      setPreferredDate(minDateStr);
    }
  }, [preferredDate]);

  // Fetch slots whenever preferredDate changes
  const loadSlotsForDate = useCallback(async (dateStr: string) => {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return;

    try {
      setIsLoadingSlots(true);
      const res = await getAvailableSlotsForDateAction(dateStr);

      if (res.success && res.availability) {
        setAvailability(res.availability);

        // Auto-select first available slot if currently selected slot is invalid
        const allSlots = [
          ...res.availability.morningSlots,
          ...res.availability.eveningSlots,
        ];
        const firstAvailable = allSlots.find((s) => s.isAvailable);

        setPreferredTime((prev) => {
          const stillValid = allSlots.some(
            (s) => s.slot === prev && s.isAvailable,
          );
          if (stillValid) return prev;
          return firstAvailable ? firstAvailable.slot : "";
        });
      } else {
        setAvailability(null);
      }
    } catch (err) {
      console.error("[loadSlotsForDate error]:", err);
      setAvailability(null);
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (preferredDate) {
      loadSlotsForDate(preferredDate);
    }
  }, [preferredDate, loadSlotsForDate]);

  const validateForm = () => {
    const result = appointmentSubmissionSchema.safeParse({
      patientName: name,
      patientPhone: phone,
      patientEmail: email,
      visitType,
      preferredDate,
      preferredTimeSlot: preferredTime,
      notes,
    });

    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const err of result.error.issues) {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      }
      setFieldErrors(errors);
      return false;
    }

    if (!preferredTime) {
      setFieldErrors((prev) => ({
        ...prev,
        preferredTimeSlot: "Please choose an available appointment time slot.",
      }));
      return false;
    }

    setFieldErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setDuplicateWarning(null);

    // Client-side pre-validation
    if (!validateForm()) {
      toast.error("Please fill in all required fields accurately.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createAppointmentAction({
        patientName: name,
        patientPhone: phone,
        patientEmail: email,
        visitType,
        preferredDate,
        preferredTimeSlot: preferredTime,
        notes,
      });

      if (response.success) {
        setIsSubmitted(true);
        setReferenceId(response.referenceId || "APT-PENDING");
        toast.success(
          "Appointment request logged! Our clinic desk will contact you to verify.",
        );
        if (onSuccess) {
          setTimeout(() => onSuccess(), 2500);
        }
      } else {
        if (response.isDuplicate) {
          setDuplicateWarning(response.message);
          toast.warning("Duplicate Request", {
            description: response.message,
          });
        } else if (response.fieldErrors) {
          setFieldErrors(response.fieldErrors);
          toast.error("Please check the form for errors.");
        } else {
          // If slot was taken concurrently, refresh slots immediately
          toast.error(response.message || "Failed to submit request.");
          loadSlotsForDate(preferredDate);
        }
      }
    } catch {
      toast.error("Unable to submit appointment. Please check connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyReference = () => {
    if (referenceId) {
      navigator.clipboard.writeText(referenceId);
      setCopied(true);
      toast.success("Reference ID copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setReferenceId(null);
    setName("");
    setPhone("");
    setEmail("");
    setNotes("");
    setFieldErrors({});
    setDuplicateWarning(null);
    if (minDate) {
      setPreferredDate(minDate);
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in-95 duration-200 w-full max-w-full overflow-hidden">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 shadow-sm mb-3">
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            className="size-7"
            strokeWidth={2}
          />
        </div>

        <h3 className="text-lg font-bold tracking-tight text-slate-900">
          Request Logged
        </h3>

        <p className="mt-1.5 text-xs text-slate-600 max-w-xs break-words">
          Thank you, <strong className="text-slate-800">{name}</strong>. Enquiry
          booked for <strong className="text-slate-800">{preferredDate}</strong>{" "}
          ({preferredTime}).
        </p>

        {/* Copyable Reference ID */}
        {referenceId && (
          <div className="mt-3 flex flex-col items-center gap-1 w-full max-w-xs">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Reference ID
            </span>
            <div className="flex items-center justify-between w-full rounded-xl border border-teal-200 bg-teal-50/70 px-3 py-2">
              <span className="font-mono text-xs font-bold text-teal-900 tracking-wide truncate">
                {referenceId}
              </span>
              <button
                type="button"
                onClick={handleCopyReference}
                className="flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-900 transition-colors p-1 shrink-0 cursor-pointer"
                title="Copy reference code"
              >
                <HugeiconsIcon
                  icon={copied ? Tick02Icon : Copy01Icon}
                  className="size-3.5"
                />
                <span className="text-[11px]">
                  {copied ? "Copied" : "Copy"}
                </span>
              </button>
            </div>
          </div>
        )}

        <p className="mt-3 text-[11px] text-slate-500">
          Our clinic reception will call or WhatsApp you to confirm your token.
        </p>

        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="mt-4 text-xs font-medium border-teal-200 text-teal-800 hover:bg-teal-50"
        >
          Book Another
        </Button>
      </div>
    );
  }

  // ACTIVE BOOKING FORM
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 w-full max-w-full overflow-x-hidden min-w-0"
    >
      {/* Duplicate Submission Warning Alert */}
      {duplicateWarning && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-2.5 text-xs text-amber-900 animate-in fade-in-50">
          <strong>Notice:</strong> {duplicateWarning}
        </div>
      )}

      {/* Patient Name */}
      <div className="space-y-1.5 min-w-0">
        <Label
          htmlFor="patient-name"
          className="text-xs font-semibold uppercase tracking-wider text-slate-700"
        >
          Full Name <span className="text-teal-600">*</span>
        </Label>
        <div className="relative">
          <HugeiconsIcon
            icon={User02Icon}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none"
            strokeWidth={2}
          />
          <Input
            id="patient-name"
            type="text"
            required
            disabled={isSubmitting}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (fieldErrors.patientName) {
                setFieldErrors((prev) => ({ ...prev, patientName: "" }));
              }
            }}
            placeholder="e.g. Amit Patil"
            className={`pl-10 h-10 sm:h-11 bg-white text-sm rounded-xl transition-all ${
              fieldErrors.patientName
                ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                : "border-slate-200 focus:border-teal-600 focus:ring-teal-500/20"
            }`}
          />
        </div>
        {fieldErrors.patientName && (
          <p className="text-[11px] text-red-600 font-medium">
            {fieldErrors.patientName}
          </p>
        )}
      </div>

      {/* Contact Grid: Phone & Email */}
      <div
        className={`grid gap-3 ${isCompact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"} min-w-0`}
      >
        <div className="space-y-1.5 min-w-0">
          <Label
            htmlFor="patient-phone"
            className="text-xs font-semibold uppercase tracking-wider text-slate-700"
          >
            Phone Number <span className="text-teal-600">*</span>
          </Label>
          <div className="relative">
            <HugeiconsIcon
              icon={Call02Icon}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none"
              strokeWidth={2}
            />
            <Input
              id="patient-phone"
              type="tel"
              required
              disabled={isSubmitting}
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (fieldErrors.patientPhone) {
                  setFieldErrors((prev) => ({ ...prev, patientPhone: "" }));
                }
              }}
              placeholder="e.g. 98220 12345"
              className={`pl-10 h-10 sm:h-11 bg-white text-sm rounded-xl transition-all ${
                fieldErrors.patientPhone
                  ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                  : "border-slate-200 focus:border-teal-600 focus:ring-teal-500/20"
              }`}
            />
          </div>
          {fieldErrors.patientPhone && (
            <p className="text-[11px] text-red-600 font-medium">
              {fieldErrors.patientPhone}
            </p>
          )}
        </div>

        <div className="space-y-1.5 min-w-0">
          <Label
            htmlFor="patient-email"
            className="text-xs font-semibold uppercase tracking-wider text-slate-700"
          >
            Email Address <span className="text-teal-600">*</span>
          </Label>
          <div className="relative">
            <HugeiconsIcon
              icon={Mail01Icon}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none"
              strokeWidth={2}
            />
            <Input
              id="patient-email"
              type="email"
              required
              disabled={isSubmitting}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.patientEmail) {
                  setFieldErrors((prev) => ({ ...prev, patientEmail: "" }));
                }
              }}
              placeholder="e.g. name@example.com"
              className={`pl-10 h-10 sm:h-11 bg-white text-sm rounded-xl transition-all ${
                fieldErrors.patientEmail
                  ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                  : "border-slate-200 focus:border-teal-600 focus:ring-teal-500/20"
              }`}
            />
          </div>
          {fieldErrors.patientEmail && (
            <p className="text-[11px] text-red-600 font-medium">
              {fieldErrors.patientEmail}
            </p>
          )}
        </div>
      </div>

      {/* Visit Type */}
      <div className="space-y-1.5 min-w-0">
        <Label
          htmlFor="visit-type"
          className="text-xs font-semibold uppercase tracking-wider text-slate-700"
        >
          Reason for Visit
        </Label>
        <select
          id="visit-type"
          disabled={isSubmitting}
          value={visitType}
          onChange={(e) => setVisitType(e.target.value)}
          className="w-full h-10 sm:h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50 truncate"
        >
          {VISIT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Date Selection */}
      <div className="space-y-1.5 min-w-0">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="preferred-date"
            className="text-xs font-semibold uppercase tracking-wider text-slate-700"
          >
            Appointment Date <span className="text-teal-600">*</span>
          </Label>
          {availability && (
            <span className="text-[11px] text-slate-500 font-medium truncate">
              {availability.formattedDate}
            </span>
          )}
        </div>
        <div className="relative">
          <HugeiconsIcon
            icon={Calendar01Icon}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none"
            strokeWidth={2}
          />
          <Input
            id="preferred-date"
            type="date"
            min={minDate}
            max={maxDate}
            disabled={isSubmitting}
            value={preferredDate}
            onChange={(e) => {
              setPreferredDate(e.target.value);
              if (fieldErrors.preferredDate) {
                setFieldErrors((prev) => ({ ...prev, preferredDate: "" }));
              }
            }}
            className={`pl-10 h-10 sm:h-11 bg-white text-sm rounded-xl transition-all ${
              fieldErrors.preferredDate
                ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                : "border-slate-200 focus:border-teal-600 focus:ring-teal-500/20"
            }`}
          />
        </div>
        {fieldErrors.preferredDate && (
          <p className="text-[11px] text-red-600 font-medium">
            {fieldErrors.preferredDate}
          </p>
        )}
      </div>

      {/* Dynamic Available Time Slots Picker */}
      <div className="space-y-2 pt-1 min-w-0">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Available Slots <span className="text-teal-600">*</span>
          </Label>
          {availability?.isWorkingDay && !availability.isUnavailableDate && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0",
                availability.availableCount > 0
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200",
              )}
            >
              {availability.availableCount} Available
            </span>
          )}
        </div>

        {isLoadingSlots ? (
          /* Skeletons while loading */
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2">
            <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
            <div className="grid grid-cols-2 gap-2">
              {["sk-slot-1", "sk-slot-2", "sk-slot-3", "sk-slot-4"].map(
                (skKey) => (
                  <div
                    key={skKey}
                    className="h-9 bg-slate-200 rounded-lg animate-pulse"
                  />
                ),
              )}
            </div>
          </div>
        ) : availability &&
          (!availability.isWorkingDay || availability.isUnavailableDate) ? (
          /* Closed / Unavailable Day Alert */
          <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-center">
            <p className="text-xs font-semibold text-rose-800">
              {availability.reason || "Doctor unavailable on this date."}
            </p>
            <p className="text-[11px] text-rose-600 mt-0.5">
              Please choose another future date.
            </p>
          </div>
        ) : availability && availability.availableCount === 0 ? (
          /* Fully Booked Alert */
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-center">
            <p className="text-xs font-semibold text-amber-800">
              All appointments for this date are fully booked.
            </p>
            <p className="text-[11px] text-amber-600 mt-0.5">
              Please choose another date or contact reception for emergency
              walk-ins.
            </p>
          </div>
        ) : (
          /* Available Slots Chips grouped by Morning & Evening */
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 sm:p-3 space-y-2.5 min-w-0">
            {/* Morning Shift */}
            {availability && availability.morningSlots.length > 0 && (
              <div className="space-y-1.5 min-w-0">
                <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  Morning Clinic
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 min-w-0">
                  {availability.morningSlots.map((s: TimeSlotInfo) => {
                    const isSelected = preferredTime === s.slot;
                    return (
                      <button
                        key={s.slot}
                        type="button"
                        disabled={!s.isAvailable || isSubmitting}
                        onClick={() => {
                          setPreferredTime(s.slot);
                          if (fieldErrors.preferredTimeSlot) {
                            setFieldErrors((prev) => ({
                              ...prev,
                              preferredTimeSlot: "",
                            }));
                          }
                        }}
                        className={cn(
                          "flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-all text-left border min-w-0 cursor-pointer",
                          !s.isAvailable
                            ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60"
                            : isSelected
                              ? "bg-teal-700 text-white border-teal-800 shadow-sm"
                              : "bg-white text-slate-800 border-slate-200 hover:border-teal-400 hover:bg-teal-50/40",
                        )}
                      >
                        <span className="truncate min-w-0">{s.slot}</span>
                        {!s.isAvailable ? (
                          <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 ml-1">
                            Booked
                          </span>
                        ) : isSelected ? (
                          <HugeiconsIcon
                            icon={Tick02Icon}
                            className="size-3.5 text-white shrink-0 ml-1"
                          />
                        ) : (
                          <span className="size-2 rounded-full bg-emerald-500 shrink-0 ml-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Evening Shift */}
            {availability && availability.eveningSlots.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-200/60 min-w-0">
                <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-teal-600" />
                  Evening Clinic
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 min-w-0">
                  {availability.eveningSlots.map((s: TimeSlotInfo) => {
                    const isSelected = preferredTime === s.slot;
                    return (
                      <button
                        key={s.slot}
                        type="button"
                        disabled={!s.isAvailable || isSubmitting}
                        onClick={() => {
                          setPreferredTime(s.slot);
                          if (fieldErrors.preferredTimeSlot) {
                            setFieldErrors((prev) => ({
                              ...prev,
                              preferredTimeSlot: "",
                            }));
                          }
                        }}
                        className={cn(
                          "flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-all text-left border min-w-0 cursor-pointer",
                          !s.isAvailable
                            ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60"
                            : isSelected
                              ? "bg-teal-700 text-white border-teal-800 shadow-sm"
                              : "bg-white text-slate-800 border-slate-200 hover:border-teal-400 hover:bg-teal-50/40",
                        )}
                      >
                        <span className="truncate min-w-0">{s.slot}</span>
                        {!s.isAvailable ? (
                          <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 ml-1">
                            Booked
                          </span>
                        ) : isSelected ? (
                          <HugeiconsIcon
                            icon={Tick02Icon}
                            className="size-3.5 text-white shrink-0 ml-1"
                          />
                        ) : (
                          <span className="size-2 rounded-full bg-emerald-500 shrink-0 ml-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {fieldErrors.preferredTimeSlot && (
          <p className="text-[11px] text-red-600 font-medium">
            {fieldErrors.preferredTimeSlot}
          </p>
        )}
      </div>

      {/* Optional Patient Symptoms / Notes */}
      <div className="space-y-1.5 min-w-0">
        <Label
          htmlFor="patient-notes"
          className="text-xs font-semibold uppercase tracking-wider text-slate-700"
        >
          Symptoms or Notes{" "}
          <span className="text-[11px] font-normal text-slate-400">
            (Optional)
          </span>
        </Label>
        <Textarea
          id="patient-notes"
          rows={2}
          disabled={isSubmitting}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Fever, routine follow-up (optional)"
          className="bg-white text-sm rounded-xl border-slate-200 focus:border-teal-600 focus:ring-teal-500/20"
        />
      </div>

      {/* Concise Notice */}
      <p className="text-[11px] text-slate-500 text-center leading-normal">
        Reception will confirm via call/WhatsApp. For emergencies, dial 108.
      </p>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={
          isSubmitting ||
          isLoadingSlots ||
          (availability !== null &&
            (!availability.isWorkingDay ||
              availability.isUnavailableDate ||
              availability.availableCount === 0))
        }
        className="w-full bg-teal-700 hover:bg-teal-800 text-white font-medium text-sm h-11 rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Booking...</span>
          </div>
        ) : (
          "Confirm Appointment"
        )}
      </Button>
    </form>
  );
}
