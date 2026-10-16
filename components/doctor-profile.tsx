import {
  Award01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Hospital01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { AppointmentDialog } from "@/components/appointment-dialog";
import { clinicConfig } from "@/config/clinic";

export function DoctorProfile() {
  const { doctor, contact } = clinicConfig;

  return (
    <section
      id="doctor"
      className="scroll-mt-20 bg-slate-50/60 py-16 lg:py-24 border-y border-slate-200/60"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-100/80 px-3 py-1 text-xs font-semibold text-teal-800 mb-3">
            <HugeiconsIcon
              icon={Award01Icon}
              className="size-3.5"
              strokeWidth={2}
            />
            <span>About Your Physician</span>
          </div>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {doctor.name}, {doctor.credentials}
          </h2>
          <p className="mt-2 text-base font-medium text-teal-800 sm:text-lg">
            {doctor.hospitalAffiliation.designation} at{" "}
            {doctor.hospitalAffiliation.hospitalName}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-mono">
            {doctor.registrationNumber}
          </p>
        </div>

        {/* Profile Content Grid */}
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10 items-start">
          {/* Left Column: Doctor Portrait & Key Credentials Card (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="overflow-hidden rounded-3xl border border-teal-100 bg-white p-3 shadow-lg shadow-teal-950/5">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-slate-100">
                <Image
                  src={doctor.imageUrl}
                  alt={doctor.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-sm font-semibold">{doctor.name}</p>
                  <p className="text-xs text-teal-200">
                    Senior Doctor • Bharati Vidyapeeth Hospital
                  </p>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Languages: {doctor.languages.join(", ")}
                  </p>
                </div>
              </div>

              {/* Quick credential facts */}
              <div className="grid grid-cols-2 gap-2 p-3 mt-1 text-center">
                <div className="rounded-xl bg-teal-50/70 p-2.5">
                  <p className="font-heading text-lg font-bold text-teal-900">
                    {doctor.experienceYears}+ Years
                  </p>
                  <p className="text-[11px] font-medium text-teal-700">
                    Clinical Care
                  </p>
                </div>
                <div className="rounded-xl bg-teal-50/70 p-2.5">
                  <p className="font-heading text-lg font-bold text-teal-900">
                    MBBS, CCEBDM
                  </p>
                  <p className="text-[11px] font-medium text-teal-700">
                    General & Diabetes
                  </p>
                </div>
              </div>
            </div>

            {/* Dual Practice Schedule Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <HugeiconsIcon
                  icon={Clock01Icon}
                  className="size-4 text-teal-700"
                  strokeWidth={2}
                />
                <span>Daily Practice Schedule</span>
              </div>

              <div className="rounded-xl bg-teal-50/60 p-3 text-xs text-slate-700 border border-teal-100/60">
                <p className="font-semibold text-teal-900">
                  🏥 Bharati Vidyapeeth Hospital
                </p>
                <p className="text-slate-600 mt-0.5">
                  General Medicine OPD: Mon – Sat (12:00 PM – 5:00 PM)
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50/60 p-3 text-xs text-slate-700 border border-emerald-100/60">
                <p className="font-semibold text-emerald-900">
                  🩺 Personal Clinic (Dhankawadi, Pune)
                </p>
                <p className="text-slate-600 mt-0.5">
                  Morning OPD: 9:00 AM – 11:30 AM
                </p>
                <p className="text-slate-600">
                  Evening OPD: 6:00 PM – 9:30 PM (Mon – Sat)
                </p>
              </div>
            </div>

            {/* Professional Affiliations */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-2">
                <HugeiconsIcon
                  icon={Hospital01Icon}
                  className="size-4 text-teal-700"
                  strokeWidth={2}
                />
                <span>Professional Memberships</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 pl-6 list-disc">
                {doctor.affiliations.map((aff) => (
                  <li key={aff}>{aff}</li>
                ))}
              </ul>
            </div>

            {/* Regulatory & Pre-Publication Verification Alert */}
            <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-4 text-xs text-amber-950 flex items-start gap-3 shadow-xs">
              <HugeiconsIcon
                icon={InformationCircleIcon}
                className="size-5 text-amber-700 shrink-0 mt-0.5"
                strokeWidth={2}
              />
              <div className="space-y-1">
                <p className="font-bold text-amber-900">
                  Pre-Publication Verification Notice
                </p>
                <p className="leading-relaxed text-amber-900/90">
                  {doctor.verificationNotice}
                </p>
                <p className="text-[11px] font-mono text-amber-800 pt-0.5">
                  Status: Demo Profile • Subject to Document Verification
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Bio, Philosophy & Qualifications (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Philosophy Callout Card */}
            <div className="relative rounded-3xl border border-teal-200/80 bg-gradient-to-br from-teal-50/70 to-emerald-50/40 p-6 sm:p-8 shadow-sm">
              <span className="text-4xl leading-none font-serif text-teal-600 select-none">
                “
              </span>
              <p className="mt-1 text-base sm:text-lg font-medium text-teal-950 italic leading-relaxed">
                {doctor.philosophy}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-teal-200/60 pt-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
                  Clinical Care Philosophy
                </span>
                <span className="text-xs text-teal-700 font-medium">
                  {doctor.name}, MBBS
                </span>
              </div>
            </div>

            {/* Concise Bio Paragraphs */}
            <div className="space-y-3.5 text-slate-700 text-sm sm:text-base leading-relaxed">
              {doctor.bio.map((paragraph, idx) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Static bio paragraphs
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Education & Qualifications */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <HugeiconsIcon
                    icon={Award01Icon}
                    className="size-5 text-teal-700"
                    strokeWidth={2}
                  />
                  Medical Qualifications & Training
                </h3>
                <span className="text-[11px] font-medium text-slate-500 rounded-md bg-slate-100 px-2 py-0.5">
                  Demo Placeholder
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {doctor.qualifications.map((qual) => (
                  <div
                    key={qual.degree}
                    className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs hover:border-teal-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-sm">
                        {qual.degree}
                      </span>
                      {qual.year && (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          {qual.year}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-600">
                      {qual.institution}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical Focus Areas */}
            <div className="pt-2">
              <h3 className="font-heading text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  className="size-5 text-teal-700"
                  strokeWidth={2}
                />
                Clinical Focus & Areas of Specialization
              </h3>

              <div className="flex flex-wrap gap-2">
                {doctor.specialties.map((spec) => (
                  <span
                    key={spec}
                    className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50/60 px-3.5 py-1 text-xs font-medium text-teal-900"
                  >
                    <span className="size-1.5 rounded-full bg-teal-600" />
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Direct Consultation Action */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
              <AppointmentDialog
                triggerButtonText={`Request Token with ${doctor.name}`}
                triggerVariant="default"
                className="w-full sm:w-auto h-11 px-5 text-sm font-semibold rounded-xl"
              />
              <a
                href={contact.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
              >
                <span>WhatsApp Appointment</span>
              </a>
              <p className="text-xs text-slate-500">
                Walk-in OPD tokens available during clinic hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
