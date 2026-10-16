"use client";

import {
  Calendar01Icon,
  Call02Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Hospital01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AppointmentForm } from "@/components/appointment-form";
import { clinicConfig } from "@/config/clinic";

export function AppointmentSection() {
  const { doctor, contact } = clinicConfig;

  return (
    <section id="appointment" className="scroll-mt-20 bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-12 items-center">
          {/* Left Column: Context, Guidelines & Direct Phone (5 cols on lg) */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-semibold text-teal-800 mb-3">
              <HugeiconsIcon
                icon={Calendar01Icon}
                className="size-3.5"
                strokeWidth={2}
              />
              <span>Clinic OPD & Appointments</span>
            </div>

            <h2 className="font-heading text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Schedule Your Consultation with {doctor.name}
            </h2>

            <p className="mt-4 text-base text-slate-600 leading-relaxed">
              Dr. Kulkarni consults at his personal clinic in Dhankawadi during
              morning and evening hours, and at Bharati Vidyapeeth Hospital
              during daytime hours.
            </p>

            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-950 leading-relaxed">
              <strong className="font-semibold">⚠️ Request Policy:</strong>{" "}
              Submitting this form sends an appointment request and does{" "}
              <em>not</em> confirm your booking. Our clinic reception will call
              or message via WhatsApp to verify doctor availability and issue
              your confirmed OPD token number.
            </div>

            {/* Checklist of what to expect */}
            <div className="mt-8 space-y-4 rounded-2xl bg-teal-50/50 border border-teal-100 p-5 text-sm text-slate-700">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-teal-900">
                Clinic OPD Patient Guidelines
              </h3>
              <div className="flex items-start gap-3">
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  className="size-4.5 text-teal-700 shrink-0 mt-0.5"
                  strokeWidth={2}
                />
                <p className="text-xs sm:text-sm">
                  <strong className="text-slate-900">
                    Comprehensive Clinical Assessment:
                  </strong>{" "}
                  Detailed vitals, history, and physical examination for every
                  patient.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <HugeiconsIcon
                  icon={Clock01Icon}
                  className="size-4.5 text-teal-700 shrink-0 mt-0.5"
                  strokeWidth={2}
                />
                <p className="text-xs sm:text-sm">
                  <strong className="text-slate-900">
                    Minimal Waiting Period:
                  </strong>{" "}
                  Advance token time allocation to minimize crowded waiting room
                  time.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <HugeiconsIcon
                  icon={Hospital01Icon}
                  className="size-4.5 text-teal-700 shrink-0 mt-0.5"
                  strokeWidth={2}
                />
                <p className="text-xs sm:text-sm">
                  <strong className="text-slate-900">
                    Hospital Referral & Testing:
                  </strong>{" "}
                  Direct coordination with Bharati Vidyapeeth Hospital for
                  advanced diagnostics.
                </p>
              </div>
            </div>

            {/* Phone & WhatsApp Alternative Card */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={contact.phoneHref}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs hover:border-teal-300 transition-colors"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
                  <HugeiconsIcon
                    icon={Call02Icon}
                    className="size-4.5"
                    strokeWidth={2}
                  />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500">
                    Call Reception
                  </p>
                  <p className="text-xs font-semibold text-teal-800">
                    {contact.phone}
                  </p>
                </div>
              </a>

              <a
                href={contact.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 shadow-xs hover:bg-emerald-100 transition-colors"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <span className="text-sm font-bold">WA</span>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-emerald-700">
                    Quick WhatsApp
                  </p>
                  <p className="text-xs font-semibold text-emerald-900">
                    Book Instantly
                  </p>
                </div>
              </a>
            </div>
          </div>

          {/* Right Column: Appointment Form (7 cols on lg) */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-teal-100/90 bg-white p-6 sm:p-10 shadow-xl shadow-teal-950/5">
              <div className="mb-6 border-b border-slate-100 pb-4">
                <h3 className="font-heading text-xl font-semibold text-slate-900">
                  Clinic OPD Appointment Request
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Choose morning or evening clinic slot in Dhankawadi, Pune.
                </p>
              </div>

              <AppointmentForm isCompact={false} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
