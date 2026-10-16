import {
  ArrowRight01Icon,
  Award01Icon,
  Calendar01Icon,
  Hospital01Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { AppointmentDialog } from "@/components/appointment-dialog";
import { clinicConfig } from "@/config/clinic";

export function HeroSection() {
  const { doctor, contact } = clinicConfig;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/40 via-white to-white pt-10 pb-16 lg:pt-16 lg:pb-24">
      {/* Background Soft Glow Accents */}
      <div
        className="pointer-events-none absolute -top-40 right-1/4 size-96 rounded-full bg-teal-200/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 -left-20 size-80 rounded-full bg-emerald-100/30 blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Headline, Bio Summary & Actions (7 cols on lg) */}
          <div className="lg:col-span-7">
            {/* Trust Pill */}
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-teal-200 bg-teal-50/90 px-3.5 py-1 text-xs font-semibold text-teal-800 shadow-xs mb-6">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Senior Doctor @ Bharati Vidyapeeth Hospital</span>
              <span className="text-teal-400">•</span>
              <span>Personal Clinic in Dhankawadi, Pune</span>
            </div>

            {/* Headline */}
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl lg:leading-[1.12]">
              Compassionate,{" "}
              <span className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                Ethical Healthcare
              </span>{" "}
              for You & Your Family.
            </h1>

            {/* Description */}
            <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600">
              Personalized family medicine and primary care led by{" "}
              <span className="font-semibold text-slate-800">
                {doctor.name}, {doctor.credentials}
              </span>
              . Combining senior hospital experience at{" "}
              <span className="font-medium text-slate-800">
                Bharati Vidyapeeth Medical College & Hospital
              </span>{" "}
              with dedicated, attentive consultations at his private clinic in
              Dhankawadi, Pune.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
              <AppointmentDialog
                triggerButtonText="Request Consultation Slot"
                triggerVariant="default"
                className="h-12 px-6 text-sm font-semibold rounded-2xl shadow-md shadow-teal-900/15"
              />

              <a
                href={contact.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50/80 px-5 text-sm font-semibold text-emerald-800 shadow-xs transition-colors hover:bg-emerald-100 hover:border-emerald-400"
              >
                <span>WhatsApp Appointment</span>
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className="size-4 text-emerald-600"
                  strokeWidth={2}
                />
              </a>

              <a
                href="#services"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-xs transition-colors hover:border-teal-300 hover:bg-teal-50/40 hover:text-teal-800"
              >
                <span>Services</span>
              </a>
            </div>

            {/* Phone quick call help note */}
            <p className="mt-3 text-xs text-slate-500">
              Direct clinic desk:{" "}
              <a
                href={contact.phoneHref}
                className="font-semibold text-teal-700 hover:underline"
              >
                {contact.phone}
              </a>{" "}
              | Languages: English, Hindi (हिंदी), Marathi (मराठी)
            </p>

            {/* Value Highlights Row */}
            <div className="mt-10 grid grid-cols-1 gap-4 border-t border-slate-200/70 pt-8 sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
                  <HugeiconsIcon
                    icon={Hospital01Icon}
                    className="size-4"
                    strokeWidth={2}
                  />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Bharati Hospital
                  </h4>
                  <p className="text-xs text-slate-500">Senior MBBS Doctor</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
                  <HugeiconsIcon
                    icon={Award01Icon}
                    className="size-4"
                    strokeWidth={2}
                  />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    12+ Years Care
                  </h4>
                  <p className="text-xs text-slate-500">
                    MBBS, CCEBDM Diabetology
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
                  <HugeiconsIcon
                    icon={Shield01Icon}
                    className="size-4"
                    strokeWidth={2}
                  />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Rational Medicine
                  </h4>
                  <p className="text-xs text-slate-500">
                    No unnecessary antibiotics
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Doctor Image Card with Floating Badges (5 cols on lg) */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Decorative Background Frame */}
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-teal-500/20 via-emerald-400/10 to-teal-200/20 blur-lg" />

              <div className="relative overflow-hidden rounded-3xl border border-teal-100 bg-white p-2 shadow-2xl shadow-teal-950/10">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-slate-100">
                  <Image
                    src={doctor.imageUrl}
                    alt={doctor.imageAlt}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 500px"
                    className="object-cover object-top transition-transform duration-500 hover:scale-102"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />

                  {/* Caption Overlay on Doctor Photo */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="inline-block rounded-full bg-teal-600/90 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white">
                      Senior Doctor • General Physician
                    </span>
                    <h2 className="mt-1 font-heading text-lg font-semibold leading-tight text-white drop-shadow-xs">
                      {doctor.name}, {doctor.credentials}
                    </h2>
                    <p className="text-xs text-teal-200 drop-shadow-xs">
                      Bharati Vidyapeeth Hospital & Aura Clinic, Pune
                    </p>
                    <p className="text-[11px] text-slate-300 mt-1">
                      {doctor.registrationNumber}
                    </p>
                  </div>
                </div>

                {/* Floating Availability Pill */}
                <div className="absolute top-6 right-6 flex items-center gap-2 rounded-2xl border border-white/80 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-md">
                  <div className="flex size-7 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <HugeiconsIcon
                      icon={Calendar01Icon}
                      className="size-4"
                      strokeWidth={2}
                    />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                      Personal Clinic
                    </p>
                    <p className="text-xs font-semibold text-slate-900">
                      Morning & Evening OPD
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom trust note */}
              <div className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
                <span>⭐ Trusted Family Physician for Dhankawadi & Katraj</span>
                <span>•</span>
                <span>Pune, MH</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
