"use client";

import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Mail01Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AppointmentPreview {
  referenceId: string;
  patientName: string;
  preferredDate: string;
  preferredTimeSlot: string;
  visitType: string;
}

interface CancellationDialogProps {
  trigger?: React.ReactElement;
  triggerText?: string;
  triggerVariant?: "default" | "outline" | "ghost" | "link";
  triggerSize?: "default" | "sm" | "lg";
  className?: string;
  defaultReferenceId?: string;
}

export function CancellationDialog({
  trigger,
  triggerText = "Cancel Appointment",
  triggerVariant = "outline",
  triggerSize = "sm",
  className = "",
  defaultReferenceId = "",
}: CancellationDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<
    "enter-id" | "verify-otp" | "confirm" | "success"
  >("enter-id");

  // Form states
  const [referenceId, setReferenceId] = useState(defaultReferenceId);
  const [otp, setOtp] = useState("");
  const [reason, setReason] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [sessionToken, setSessionToken] = useState("");
  const [appointment, setAppointment] = useState<AppointmentPreview | null>(
    null,
  );

  // Status & loading
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const resetDialog = () => {
    setStep("enter-id");
    setReferenceId(defaultReferenceId);
    setOtp("");
    setReason("");
    setMaskedEmail("");
    setSessionToken("");
    setAppointment(null);
    setErrorMessage(null);
    setIsLoading(false);
    setResendCooldown(0);
  };

  const startCooldownTimer = (seconds: number) => {
    setResendCooldown(seconds);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRef = referenceId.trim().toUpperCase();

    if (!cleanRef) {
      setErrorMessage("Please enter your appointment Reference ID.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const res = await fetch("/api/appointments/cancel/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referenceId: cleanRef }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Failed to request verification code.");
        if (data.retryAfterSeconds) {
          startCooldownTimer(data.retryAfterSeconds);
        }
        return;
      }

      setMaskedEmail(data.maskedEmail || "your registered email");
      setReferenceId(cleanRef);
      setStep("verify-otp");
      startCooldownTimer(data.cooldownSeconds || 60);
      toast.success("Verification code sent to your email!");
    } catch {
      setErrorMessage(
        "Network error. Please check your connection and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim();

    if (!cleanOtp || cleanOtp.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const res = await fetch("/api/appointments/cancel/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceId,
          otp: cleanOtp,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(
          data.message || "Verification failed. Please try again.",
        );
        return;
      }

      setSessionToken(data.sessionToken);
      setAppointment(data.appointment);
      setStep("confirm");
      toast.success("Identity verified! Please confirm cancellation.");
    } catch {
      setErrorMessage("Network error during verification. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Confirm Cancellation
  const handleConfirmCancellation = async () => {
    if (!sessionToken || !referenceId) {
      setErrorMessage("Invalid cancellation session. Please start over.");
      setStep("enter-id");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const res = await fetch("/api/appointments/cancel/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceId,
          sessionToken,
          reason: reason.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(
          data.message || "Unable to cancel appointment at this time.",
        );
        return;
      }

      setStep("success");
      toast.success("Appointment cancelled successfully.");
    } catch {
      setErrorMessage("Network error while cancelling appointment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setTimeout(resetDialog, 300);
        }
      }}
    >
      {trigger ? (
        <DialogTrigger render={trigger} />
      ) : (
        <DialogTrigger
          render={
            <Button
              variant={triggerVariant}
              size={triggerSize}
              className={`cursor-pointer ${className}`}
            />
          }
        >
          <HugeiconsIcon
            icon={Cancel01Icon}
            className="size-3.5 mr-1 text-slate-500"
            strokeWidth={2}
          />
          {triggerText}
        </DialogTrigger>
      )}

      <DialogContent className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-md max-h-[90vh] overflow-x-hidden overflow-y-auto p-4 sm:p-6 bg-white border border-slate-200 rounded-2xl shadow-xl">
        {/* STEP 1: ENTER REFERENCE ID */}
        {step === "enter-id" && (
          <div>
            <DialogHeader className="mb-4 text-left">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 uppercase tracking-wider">
                <HugeiconsIcon icon={Shield01Icon} className="size-3.5" />
                Self-Service Security
              </div>
              <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight mt-1">
                Cancel Pending Appointment
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-600">
                Enter your Reference ID (from your confirmation email) to
                receive a secure cancellation code.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="cancellation-ref"
                  className="text-xs font-semibold uppercase tracking-wider text-slate-700"
                >
                  Appointment Reference ID{" "}
                  <span className="text-rose-600">*</span>
                </Label>
                <Input
                  id="cancellation-ref"
                  type="text"
                  required
                  disabled={isLoading}
                  value={referenceId}
                  onChange={(e) => {
                    setReferenceId(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="e.g. APT-20261025-ABCD"
                  className="h-10 text-sm font-mono uppercase bg-white rounded-xl border-slate-200 focus:border-teal-600"
                />
              </div>

              {errorMessage && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-800">
                  {errorMessage}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || !referenceId.trim()}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs h-10 rounded-xl cursor-pointer"
              >
                {isLoading
                  ? "Validating & Sending Code..."
                  : "Send Verification Code"}
              </Button>

              <p className="text-[11px] text-slate-500 text-center">
                Note: Only pending consultation requests can be cancelled
                online. Confirmed visits require reception notice.
              </p>
            </form>
          </div>
        )}

        {/* STEP 2: VERIFY OTP */}
        {step === "verify-otp" && (
          <div>
            <DialogHeader className="mb-4 text-left">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 uppercase tracking-wider">
                <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                Email Verification
              </div>
              <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight mt-1">
                Enter 6-Digit Code
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-600">
                We sent a one-time code to{" "}
                <strong className="text-slate-800">{maskedEmail}</strong>.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="cancellation-otp"
                  className="text-xs font-semibold uppercase tracking-wider text-slate-700"
                >
                  Verification Code (OTP)
                </Label>
                <Input
                  id="cancellation-otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  disabled={isLoading}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ""));
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="• • • • • •"
                  className="h-12 text-center text-xl font-mono tracking-widest bg-white rounded-xl border-slate-200 focus:border-teal-600"
                />
              </div>

              {errorMessage && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-800">
                  {errorMessage}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-medium text-xs h-10 rounded-xl cursor-pointer"
              >
                {isLoading ? "Verifying..." : "Verify & Continue"}
              </Button>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isLoading || resendCooldown > 0}
                  onClick={handleRequestOtp}
                  className="text-teal-700 hover:underline font-medium disabled:opacity-50 disabled:no-underline cursor-pointer"
                >
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : "Resend Code"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("enter-id");
                    setOtp("");
                    setErrorMessage(null);
                  }}
                  className="text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Change Reference ID
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: CONFIRM CANCELLATION */}
        {step === "confirm" && appointment && (
          <div>
            <DialogHeader className="mb-3 text-left">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 uppercase tracking-wider">
                <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
                Final Confirmation
              </div>
              <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight mt-1">
                Confirm Cancellation
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-600">
                Review your appointment details below before confirming
                cancellation.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5">
              {/* Appointment summary box */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Reference:</span>
                  <span className="font-mono font-bold text-teal-900">
                    {appointment.referenceId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient:</span>
                  <span className="font-semibold text-slate-900">
                    {appointment.patientName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Slot:</span>
                  <span className="font-semibold text-slate-900">
                    {appointment.preferredDate} ({appointment.preferredTimeSlot}
                    )
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Consultation:</span>
                  <span className="text-slate-900 truncate max-w-[200px]">
                    {appointment.visitType}
                  </span>
                </div>
              </div>

              {/* Reason for cancellation with quick chips */}
              <div className="space-y-2">
                <Label
                  htmlFor="cancel-reason"
                  className="text-xs font-medium text-slate-700"
                >
                  Reason for cancellation{" "}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </Label>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Schedule conflict / Busy",
                    "Feeling better / Recovered",
                    "Consulted another doctor",
                    "Booked by mistake",
                  ].map((quickReason) => (
                    <button
                      key={quickReason}
                      type="button"
                      disabled={isLoading}
                      onClick={() => setReason(quickReason)}
                      className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                        reason === quickReason
                          ? "bg-teal-50 border-teal-500 text-teal-800 font-semibold"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {quickReason}
                    </button>
                  ))}
                </div>

                <Input
                  id="cancel-reason"
                  disabled={isLoading}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Or type custom reason (e.g. Schedule clash, feeling better...)"
                  className="h-9 text-xs bg-white rounded-lg border-slate-200"
                />
              </div>

              {/* Warning note */}
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-900">
                <strong>Warning:</strong> Cancelling releases your reserved time
                slot. This action cannot be reversed.
              </div>

              {errorMessage && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-800">
                  {errorMessage}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => setOpen(false)}
                  className="flex-1 text-xs h-10 rounded-xl"
                >
                  Keep Appointment
                </Button>
                <Button
                  type="button"
                  disabled={isLoading}
                  onClick={handleConfirmCancellation}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs h-10 rounded-xl cursor-pointer"
                >
                  {isLoading ? "Cancelling..." : "Yes, Cancel Slot"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS CONFIRMATION */}
        {step === "success" && (
          <div className="flex flex-col items-center justify-center py-4 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm mb-3">
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                className="size-7"
                strokeWidth={2}
              />
            </div>

            <h3 className="text-lg font-bold tracking-tight text-slate-900">
              Appointment Cancelled
            </h3>

            <p className="mt-1.5 text-xs text-slate-600 max-w-xs">
              Your appointment{" "}
              <strong className="font-mono text-slate-800">
                {referenceId}
              </strong>{" "}
              has been cancelled. A confirmation email was sent to your
              registered address.
            </p>

            <Button
              type="button"
              onClick={() => {
                setOpen(false);
                resetDialog();
              }}
              className="mt-5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 h-9"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
