"use client";

import {
  Call02Icon,
  Clock01Icon,
  Location01Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { CancellationDialog } from "@/components/cancellation-dialog";
import { clinicConfig } from "@/config/clinic";

export function Footer() {
  const { doctor, contact, navigation, services } = clinicConfig;

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Top Footer Grid */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Col 1 & 2: Clinic Branding & Physician Intro */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm ring-1 ring-teal-500/30">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-5"
                  aria-hidden="true"
                >
                  <path d="M12 4v16" />
                  <path d="M4 12h16" />
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    strokeWidth="1.5"
                    strokeOpacity="0.4"
                  />
                </svg>
              </div>
              <div>
                <span className="font-heading text-lg font-bold tracking-tight text-white">
                  {clinicConfig.name}
                </span>
                <p className="text-xs text-teal-400 font-medium">
                  {doctor.name}, {doctor.credentials}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              General medicine and family primary care. Consultations by Senior
              Doctor at Bharati Vidyapeeth Hospital and independent practitioner
              at Aura Clinic, Dhankawadi, Pune.
            </p>

            <div className="rounded-xl bg-slate-800/80 border border-slate-700/60 p-3 text-[11px] text-slate-400 max-w-sm">
              <span className="font-semibold text-slate-200">
                Demonstration Practice:
              </span>{" "}
              Doctor identity, MMC registration number, and clinical timeline
              are demonstration placeholders for layout and evaluation.
            </div>
          </div>

          {/* Col 3: Navigation Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              {navigation.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-slate-400 hover:text-teal-300 transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#appointment"
                  className="text-slate-400 hover:text-teal-300 transition-colors"
                >
                  Book Clinic Appointment
                </a>
              </li>
              <li>
                <a
                  href={contact.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                >
                  WhatsApp Appointment
                </a>
              </li>
              <li>
                <CancellationDialog
                  trigger={
                    <button
                      type="button"
                      className="text-amber-400 hover:text-amber-300 transition-colors font-medium text-left"
                    >
                      Cancel Appointment
                    </button>
                  }
                />
              </li>
            </ul>
          </div>

          {/* Col 4: Clinical Services */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">
              Specialties & Care
            </h4>
            <ul className="space-y-2 text-xs">
              {services.slice(0, 5).map((service) => (
                <li key={service.id}>
                  <a
                    href="#services"
                    className="text-slate-400 hover:text-teal-300 transition-colors"
                  >
                    {service.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Contact & Operating Hours */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">
              Clinic & Hospital
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <HugeiconsIcon
                  icon={Location01Icon}
                  className="size-4 shrink-0 text-teal-400 mt-0.5"
                  strokeWidth={2}
                />
                <span>
                  {contact.clinicAddress.shop}, {contact.clinicAddress.building}
                  , {contact.clinicAddress.area}, {contact.clinicAddress.city} –{" "}
                  {contact.clinicAddress.pincode}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={Call02Icon}
                  className="size-4 shrink-0 text-teal-400"
                  strokeWidth={2}
                />
                <a
                  href={contact.phoneHref}
                  className="hover:text-teal-300 transition-colors font-medium"
                >
                  {contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={Mail01Icon}
                  className="size-4 shrink-0 text-teal-400"
                  strokeWidth={2}
                />
                <a
                  href={`mailto:${contact.email}`}
                  className="hover:text-teal-300 transition-colors break-all"
                >
                  {contact.email}
                </a>
              </li>
              <li className="flex items-start gap-2 pt-1 border-t border-slate-800">
                <HugeiconsIcon
                  icon={Clock01Icon}
                  className="size-4 shrink-0 text-teal-400 mt-0.5"
                  strokeWidth={2}
                />
                <span>Clinic: 9–11:30 AM & 6–9:30 PM | Hospital: 12–5 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Emergency Advisory Bar */}
        <div className="mt-12 rounded-2xl border border-red-900/40 bg-red-950/20 p-4 text-xs text-red-300/90 text-center">
          <strong>Medical Emergency Notice:</strong> If you are experiencing a
          life-threatening medical emergency or severe trauma, please visit
          Bharati Vidyapeeth Hospital Emergency Casualty Department (Open 24/7
          on Pune-Satara Road, Dhankawadi) or call <strong>108 / 112</strong>{" "}
          immediately.
        </div>
      </div>

      {/* Bottom Sub-Footer */}
      <div className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p>© 2026 {clinicConfig.name}. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-6 text-[11px]">
            <Link
              href="#contact"
              className="hover:text-teal-300 transition-colors"
            >
              Patient Rights
            </Link>
            <Link
              href="#contact"
              className="hover:text-teal-300 transition-colors"
            >
              Medical Ethics
            </Link>
            <Link
              href="#contact"
              className="hover:text-teal-300 transition-colors"
            >
              Accessibility
            </Link>
            <CancellationDialog
              trigger={
                <button
                  type="button"
                  className="text-amber-400/90 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Cancel Appointment
                </button>
              }
            />
            <Link
              href="/admin"
              className="text-slate-300 hover:text-teal-300 transition-colors flex items-center gap-1 font-medium"
            >
              <span className="size-1.5 rounded-full bg-teal-400" />
              Doctor Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
