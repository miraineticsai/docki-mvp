"use client";

import { Calendar01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { AppointmentForm } from "@/components/appointment-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { clinicConfig } from "@/config/clinic";

interface AppointmentDialogProps {
  triggerButtonText?: string;
  triggerVariant?: "default" | "outline" | "secondary";
  triggerSize?: "default" | "sm" | "lg";
  className?: string;
}

export function AppointmentDialog({
  triggerButtonText = "Book Appointment",
  triggerVariant = "default",
  triggerSize = "default",
  className = "",
}: AppointmentDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant={triggerVariant}
            size={triggerSize}
            className={`cursor-pointer ${
              triggerVariant === "default"
                ? "bg-teal-700 hover:bg-teal-800 text-white font-medium shadow-sm transition-all"
                : ""
            } ${className}`}
          />
        }
      >
        <HugeiconsIcon
          icon={Calendar01Icon}
          className="size-4"
          strokeWidth={2}
        />
        {triggerButtonText}
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 bg-white border border-teal-100 rounded-3xl shadow-xl">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
            <span className="size-2 rounded-full bg-teal-600 animate-pulse" />
            Direct Clinical Scheduling
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
            Schedule a Consultation with {clinicConfig.doctor.name}, MBBS
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-600">
            Senior Doctor at Bharati Vidyapeeth Hospital & Family Physician at
            Aura Clinic, Dhankawadi, Pune. Note: Submitting registers a request
            only; our reception will contact you to confirm doctor availability
            and issue your OPD token.
          </DialogDescription>
        </DialogHeader>

        <AppointmentForm onSuccess={() => setOpen(false)} isCompact={false} />
      </DialogContent>
    </Dialog>
  );
}
