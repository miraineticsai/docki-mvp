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

      <DialogContent className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-lg max-h-[90vh] overflow-x-hidden overflow-y-auto p-4 sm:p-6 bg-white border border-teal-100 rounded-2xl sm:rounded-3xl shadow-xl">
        <DialogHeader className="mb-3 text-left">
          <DialogTitle className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Schedule Consultation
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-600">
            Select your preferred date and time slot with{" "}
            {clinicConfig.doctor.name}.
          </DialogDescription>
        </DialogHeader>

        <AppointmentForm onSuccess={() => setOpen(false)} isCompact={false} />
      </DialogContent>
    </Dialog>
  );
}
