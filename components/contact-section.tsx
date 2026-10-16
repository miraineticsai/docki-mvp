import {
  ArrowRight01Icon,
  Call02Icon,
  Clock01Icon,
  Hospital01Icon,
  Location01Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { clinicConfig } from "@/config/clinic";

export function ContactSection() {
  const { contact } = clinicConfig;

  return (
    <section
      id="contact"
      className="scroll-mt-20 bg-slate-50/70 py-16 lg:py-24 border-t border-slate-200/60"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-100/80 px-3 py-1 text-xs font-semibold text-teal-800 mb-3">
            <HugeiconsIcon
              icon={Location01Icon}
              className="size-3.5"
              strokeWidth={2}
            />
            <span>Clinic & Hospital Locations</span>
          </div>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Visit Us in Dhankawadi, Pune
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Consult Dr. Rajesh Kulkarni at his personal clinic (morning &
            evening) or at Bharati Vidyapeeth Hospital (afternoon OPD).
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Address, Phone, Email & Hours (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Contact Info Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Personal Clinic Address */}
              <div className="rounded-2xl border border-teal-200/80 bg-white p-5 shadow-xs">
                <div className="flex size-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 mb-3">
                  <HugeiconsIcon
                    icon={Location01Icon}
                    className="size-5"
                    strokeWidth={2}
                  />
                </div>
                <div className="inline-block rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800 uppercase tracking-wider mb-1">
                  Personal Clinic
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1">
                  {contact.clinicAddress.building}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {contact.clinicAddress.shop}, {contact.clinicAddress.landmark}
                  <br />
                  {contact.clinicAddress.area}, {contact.clinicAddress.city} –{" "}
                  {contact.clinicAddress.pincode}
                </p>
                <a
                  href={contact.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900"
                >
                  <span>Open Directions in Maps</span>
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    className="size-3.5"
                    strokeWidth={2}
                  />
                </a>
              </div>

              {/* Hospital Affiliation Location */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                <div className="flex size-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 mb-3">
                  <HugeiconsIcon
                    icon={Hospital01Icon}
                    className="size-5"
                    strokeWidth={2}
                  />
                </div>
                <div className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Hospital Duties
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1">
                  {contact.hospitalAddress.name}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {contact.hospitalAddress.department}
                  <br />
                  {contact.hospitalAddress.location},{" "}
                  {contact.hospitalAddress.city} –{" "}
                  {contact.hospitalAddress.pincode}
                </p>
                <span className="text-xs font-medium text-slate-500">
                  OPD Hours: 12:00 PM – 5:00 PM (Mon–Sat)
                </span>
              </div>

              {/* Direct Phone & WhatsApp */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                <div className="flex size-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 mb-3">
                  <HugeiconsIcon
                    icon={Call02Icon}
                    className="size-5"
                    strokeWidth={2}
                  />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1">
                  Telephone & WhatsApp
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-2">
                  For token booking, reports, and inquiries:
                </p>
                <a
                  href={contact.phoneHref}
                  className="font-heading text-base font-bold text-teal-800 hover:underline block"
                >
                  {contact.phone}
                </a>
                <a
                  href={contact.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                >
                  <span>WhatsApp Message</span>
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    className="size-3"
                    strokeWidth={2}
                  />
                </a>
              </div>

              {/* Direct Email */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                <div className="flex size-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 mb-3">
                  <HugeiconsIcon
                    icon={Mail01Icon}
                    className="size-5"
                    strokeWidth={2}
                  />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1">
                  Clinic Email
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  For medical report sharing and administrative communications:
                </p>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-xs font-semibold text-teal-800 hover:underline break-all"
                >
                  {contact.email}
                </a>
              </div>
            </div>

            {/* Timings Table */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex size-8 items-center justify-center rounded-lg bg-teal-100 text-teal-800">
                  <HugeiconsIcon
                    icon={Clock01Icon}
                    className="size-4"
                    strokeWidth={2}
                  />
                </div>
                <h3 className="font-heading text-base font-semibold text-slate-900">
                  Consultation Timings (Personal Clinic & Hospital)
                </h3>
              </div>

              <div className="divide-y divide-slate-100">
                {contact.clinicTimings.map((time) => (
                  <div
                    key={time.days}
                    className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 text-xs"
                  >
                    <span className="font-medium text-slate-800">
                      {time.days}
                    </span>
                    <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-0">
                      <span className="text-slate-600 font-mono">
                        {time.hours}
                      </span>
                      {time.status && (
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {time.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {contact.hospitalTimings.map((time) => (
                  <div
                    key={time.days}
                    className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 text-xs bg-slate-50/60 px-2 rounded-lg"
                  >
                    <span className="font-medium text-slate-800">
                      {time.days}
                    </span>
                    <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-0">
                      <span className="text-slate-600 font-mono">
                        {time.hours}
                      </span>
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-teal-50 text-teal-700 border border-teal-200">
                        {time.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Visual Map Card & Arrival Details (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="overflow-hidden rounded-3xl border border-teal-200/80 bg-white shadow-lg shadow-teal-950/5">
              {/* Stylized Clinic Map Graphic */}
              <div className="relative h-64 w-full bg-slate-100 overflow-hidden">
                <svg
                  className="absolute inset-0 size-full opacity-40"
                  xmlns="http://www.w3.org/2000/svg"
                  width="100%"
                  height="100%"
                  aria-hidden="true"
                >
                  <defs>
                    <pattern
                      id="map-grid-pune"
                      width="40"
                      height="40"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke="#cbd5e1"
                        strokeWidth="1"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#map-grid-pune)" />
                  <path
                    d="M0,80 Q200,90 400,60 T800,120"
                    fill="none"
                    stroke="#0d9488"
                    strokeWidth="3"
                    strokeOpacity="0.3"
                  />
                  <path
                    d="M120,0 L120,300"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="4"
                    strokeOpacity="0.4"
                  />
                  <path
                    d="M280,0 L280,300"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="3"
                    strokeOpacity="0.4"
                  />
                </svg>

                {/* Pin Marker */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="relative inline-flex items-center justify-center">
                    <span className="absolute size-12 rounded-full bg-teal-500/30 animate-ping" />
                    <div className="relative flex size-12 items-center justify-center rounded-full bg-teal-700 text-white shadow-xl ring-4 ring-white">
                      <HugeiconsIcon
                        icon={Hospital01Icon}
                        className="size-6"
                        strokeWidth={2}
                      />
                    </div>
                  </div>
                  <div className="mt-2 rounded-xl bg-white/95 backdrop-blur-xs px-3 py-1 shadow-md border border-slate-200 text-xs font-bold text-slate-900">
                    Aura Clinic (Near Bharati Vidyapeeth)
                  </div>
                </div>
              </div>

              {/* Map Details & Action */}
              <div className="p-6 bg-white space-y-4">
                <div>
                  <h3 className="font-heading text-base font-semibold text-slate-900">
                    Dhankawadi – Pune-Satara Road Area
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Close to Bharati Vidyapeeth Back Gate & Katraj Dairy, South
                    Pune.
                  </p>
                </div>

                <div className="rounded-2xl bg-teal-50/70 p-4 border border-teal-100 text-xs text-teal-900 space-y-1.5">
                  <p className="font-semibold">Locality & Transit Access:</p>
                  <p className="text-teal-800">
                    • Near Bharati Vidyapeeth Deemed University Back Gate.
                  </p>
                  <p className="text-teal-800">
                    • 5 mins from Katraj Bus Stand & PMT Stop on Pune-Satara
                    Road.
                  </p>
                  <p className="text-teal-800">
                    • Ample two-wheeler & car parking in front of Sai Heritage.
                  </p>
                </div>

                <a
                  href={contact.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 transition-colors shadow-xs"
                >
                  <HugeiconsIcon
                    icon={Location01Icon}
                    className="size-4"
                    strokeWidth={2}
                  />
                  <span>Open Directions in Google Maps</span>
                </a>
              </div>
            </div>

            {/* Emergency Disclaimer Alert */}
            <div className="rounded-2xl border border-red-200 bg-red-50/70 p-4 text-xs text-red-900">
              <strong className="font-semibold">Emergency Advisory:</strong> For
              acute emergency conditions, severe chest pain, acute respiratory
              distress, or trauma, visit Bharati Vidyapeeth Hospital Emergency /
              Casualty Department (Open 24/7 on Pune-Satara Road) or call{" "}
              <strong>108 / 112</strong> immediately.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
