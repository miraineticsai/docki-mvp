"use client";

import {
  Calendar01Icon,
  Call02Icon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { toast } from "sonner";
import { updateAppointmentStatusAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Appointment } from "@/db/schema";

interface AppointmentDetailDialogProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: (updated: Appointment) => void;
}

export function AppointmentDetailDialog({
  appointment,
  open,
  onOpenChange,
  onUpdated,
}: AppointmentDetailDialogProps) {
  const [status, setStatus] = useState<Appointment["status"]>(
    appointment?.status ?? "pending",
  );
  const [tokenNumber, setTokenNumber] = useState<string>(
    appointment?.tokenNumber ?? "",
  );
  const [doctorNotes, setDoctorNotes] = useState<string>(
    appointment?.doctorNotes ?? "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!appointment) return null;

  // Sync state if appointment prop changes
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && appointment) {
      setStatus(appointment.status);
      setTokenNumber(appointment.tokenNumber || "");
      setDoctorNotes(appointment.doctorNotes || "");
    }
    onOpenChange(newOpen);
  };

  async function handleSave(newStatus?: Appointment["status"]) {
    if (!appointment) return;
    const finalStatus = newStatus || status;
    try {
      setIsSubmitting(true);
      const res = await updateAppointmentStatusAction({
        referenceId: appointment.referenceId,
        status: finalStatus as
          | "pending"
          | "confirmed"
          | "completed"
          | "cancelled"
          | "rejected",
        tokenNumber: tokenNumber.trim() || null,
        doctorNotes: doctorNotes.trim() || null,
      });

      if (res.success && res.appointment) {
        toast.success(res.message);
        setStatus(finalStatus);
        if (onUpdated) {
          onUpdated(res.appointment as Appointment);
        }
        onOpenChange(false);
      } else {
        toast.error(res.message || "Failed to update appointment");
      }
    } catch (_err) {
      toast.error("An error occurred while updating the appointment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Quick Action helpers
  const handleQuickConfirm = () => handleSave("confirmed");
  const handleQuickReject = () => handleSave("cancelled");
  const handleQuickComplete = () => handleSave("completed");

  const isCancelledByUser = Boolean(
    (appointment?.metadata as Record<string, unknown>)?.cancelledByUser,
  );
  const userCancellationReason = (
    appointment?.metadata as Record<string, unknown>
  )?.userCancellationReason as string | undefined;

  const statusBadge = (s: string) => {
    if (isCancelledByUser) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-300 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
          <span className="size-1.5 rounded-full bg-rose-600" />
          Cancelled by Patient (Locked)
        </span>
      );
    }

    switch (s) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending Triage
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
            <span className="size-1.5 rounded-full bg-emerald-600" />
            Confirmed
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
            <span className="size-1.5 rounded-full bg-blue-600" />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
            <span className="size-1.5 rounded-full bg-rose-600" />
            Cancelled / Rejected
          </span>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-2xl max-h-[90vh] overflow-x-hidden overflow-y-auto p-4 sm:p-6 sm:rounded-2xl">
        <DialogHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {appointment.referenceId}
                </span>
                {statusBadge(status)}
              </div>
              <DialogTitle className="mt-2 text-xl font-bold text-slate-900">
                {appointment.patientName}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Submitted on{" "}
                {new Date(appointment.createdAt).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  dateStyle: "medium",
                  timeStyle: "short",
                })}{" "}
                IST via {appointment.source}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Quick Contact & Schedule Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-xl bg-slate-50 p-4 border border-slate-200/80 text-xs">
            <div className="space-y-2">
              <div className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                Patient Contact
              </div>
              <div className="flex items-center gap-2 text-slate-800">
                <HugeiconsIcon
                  icon={Call02Icon}
                  className="size-4 text-teal-700"
                />
                <a
                  href={`tel:${appointment.patientPhone}`}
                  className="font-medium hover:text-teal-700 hover:underline"
                >
                  {appointment.patientPhone}
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-800">
                <HugeiconsIcon
                  icon={Mail01Icon}
                  className="size-4 text-teal-700"
                />
                <a
                  href={`mailto:${appointment.patientEmail}`}
                  className="truncate hover:text-teal-700 hover:underline"
                >
                  {appointment.patientEmail}
                </a>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                Requested Schedule
              </div>
              <div className="flex items-center gap-2 text-slate-800">
                <HugeiconsIcon
                  icon={Calendar01Icon}
                  className="size-4 text-teal-700"
                />
                <span className="font-semibold">
                  {appointment.preferredDate}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-800">
                <HugeiconsIcon
                  icon={Clock01Icon}
                  className="size-4 text-teal-700"
                />
                <span>{appointment.preferredTimeSlot}</span>
              </div>
            </div>

            <div className="col-span-1 sm:col-span-2 pt-2 border-t border-slate-200/60">
              <span className="font-semibold text-slate-500">Visit Type: </span>
              <span className="font-medium text-slate-900">
                {appointment.visitType}
              </span>
            </div>
          </div>

          {/* Patient's Notes */}
          {appointment.notes ? (
            <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-3.5">
              <div className="text-xs font-semibold text-teal-900">
                Patient's Reason / Symptoms:
              </div>
              <p className="mt-1 text-xs text-slate-700 whitespace-pre-wrap break-words">
                "{appointment.notes}"
              </p>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">
              No additional notes provided by patient.
            </div>
          )}

          {/* Clinical Triage & Status Update Form */}
          <div className="space-y-4 rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Doctor Triage & Token Assignment
              </div>
              {isCancelledByUser && (
                <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  Patient Self-Cancelled • Read Only
                </span>
              )}
            </div>

            {isCancelledByUser && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 space-y-1.5">
                <div>
                  <strong>Notice:</strong> This appointment was cancelled by the
                  patient via verified self-service and cannot be restored or
                  modified.
                </div>
                {userCancellationReason && (
                  <div className="pt-1.5 border-t border-rose-200/80 text-[11px] text-rose-900">
                    <span className="font-semibold text-rose-950">
                      Patient's Reason:
                    </span>{" "}
                    "{userCancellationReason}"
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Status Selector */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="status-select"
                  className="text-xs font-medium text-slate-700"
                >
                  Appointment Status
                </Label>
                <select
                  id="status-select"
                  disabled={isSubmitting || isCancelledByUser}
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as Appointment["status"])
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 shadow-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:opacity-50 disabled:bg-slate-100"
                >
                  <option value="pending">Pending Review</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled / Rejected</option>
                </select>
              </div>

              {/* Token Number */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="token-number"
                  className="text-xs font-medium text-slate-700"
                >
                  Assigned OPD Token Number
                </Label>
                <Input
                  id="token-number"
                  disabled={isSubmitting || isCancelledByUser}
                  placeholder="e.g. T-08, Token 12"
                  value={tokenNumber}
                  onChange={(e) => setTokenNumber(e.target.value)}
                  className="h-9 text-xs disabled:opacity-50 disabled:bg-slate-100"
                />
              </div>
            </div>

            {/* Doctor Internal Notes */}
            <div className="space-y-1.5">
              <Label
                htmlFor="doctor-notes"
                className="text-xs font-medium text-slate-700"
              >
                Doctor / Reception Internal Notes (Private)
              </Label>
              <Textarea
                id="doctor-notes"
                disabled={isSubmitting || isCancelledByUser}
                placeholder="Add clinical remarks, patient history notes, or callback instructions..."
                rows={3}
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                className="text-xs disabled:opacity-50 disabled:bg-slate-100"
              />
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleQuickConfirm}
                disabled={isSubmitting || isCancelledByUser}
                className="border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs h-8 disabled:opacity-40"
              >
                <HugeiconsIcon
                  icon={CheckmarkCircle01Icon}
                  className="size-3.5 mr-1"
                />
                Confirm Slot
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleQuickReject}
                disabled={isSubmitting || isCancelledByUser}
                className="border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 text-xs h-8 disabled:opacity-40"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-3.5 mr-1" />
                Reject Request
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleQuickComplete}
                disabled={isSubmitting || isCancelledByUser}
                className="border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100 text-xs h-8 disabled:opacity-40"
              >
                Mark Completed
              </Button>
            </div>

            <Button
              type="button"
              size="sm"
              onClick={() => handleSave()}
              disabled={isSubmitting || isCancelledByUser}
              className="bg-teal-700 hover:bg-teal-800 text-white text-xs h-8 ml-auto disabled:opacity-40"
            >
              {isSubmitting ? "Saving..." : "Save All Details"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
