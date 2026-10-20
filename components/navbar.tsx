"use client";

import {
  Call02Icon,
  Cancel01Icon,
  Clock01Icon,
  Menu01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { AppointmentDialog } from "@/components/appointment-dialog";
import { CancellationDialog } from "@/components/cancellation-dialog";
import { ClinicLogo } from "@/components/clinic-logo";
import { Button } from "@/components/ui/button";
import { clinicConfig } from "@/config/clinic";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full transition-all">
      {/* Top Notification / Clinic Hours Bar */}
      <div className="hidden border-b border-teal-100 bg-teal-50/70 px-4 py-1.5 text-xs text-teal-900 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <HugeiconsIcon
                icon={Clock01Icon}
                className="size-3.5 text-teal-700"
                strokeWidth={2}
              />
              <span>
                Clinic: 9:00–11:30 AM & 6:00–9:30 PM | Bharati Hospital:
                12:00–5:00 PM
              </span>
            </div>
            <span className="hidden xl:inline-flex items-center gap-1.5 rounded-full bg-teal-100/80 px-2.5 py-0.5 font-medium text-teal-800">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Senior Doctor @ Bharati Hospital & Aura Clinic
            </span>
          </div>

          <div className="flex items-center gap-4 font-medium">
            <a
              href={clinicConfig.contact.phoneHref}
              className="flex items-center gap-1.5 text-teal-800 hover:text-teal-950 transition-colors"
            >
              <HugeiconsIcon
                icon={Call02Icon}
                className="size-3.5 text-teal-700"
                strokeWidth={2}
              />
              <span>{clinicConfig.contact.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <ClinicLogo />

          {/* Desktop Navigation Links */}
          <nav
            className="hidden items-center gap-4 lg:gap-6 xl:gap-7 md:flex"
            aria-label="Main Navigation"
          >
            {clinicConfig.navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-xs lg:text-sm font-medium text-slate-700 transition-colors hover:text-teal-700"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop Right CTA */}
          <div className="hidden items-center gap-2 lg:gap-2.5 xl:gap-3 md:flex">
            <a
              href={clinicConfig.contact.phoneHref}
              className="hidden xl:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-teal-300 hover:bg-teal-50/50 hover:text-teal-800"
            >
              <HugeiconsIcon
                icon={Call02Icon}
                className="size-3.5 text-teal-600"
                strokeWidth={2}
              />
              <span>Call Clinic</span>
            </a>

            <CancellationDialog
              triggerText="Cancel Booking"
              triggerVariant="outline"
              className="h-9 px-2.5 lg:px-3 text-xs font-medium rounded-xl border-slate-200 text-slate-700 hover:text-rose-700 hover:border-rose-200"
            />

            <AppointmentDialog
              triggerButtonText="Book Appointment"
              triggerVariant="default"
              className="h-9 px-3 lg:px-4 text-xs font-semibold rounded-xl shadow-xs"
            />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <a
              href={clinicConfig.contact.phoneHref}
              className="flex size-9 items-center justify-center rounded-xl border border-teal-200 bg-teal-50 text-teal-800"
              aria-label="Call clinic directly"
            >
              <HugeiconsIcon
                icon={Call02Icon}
                className="size-4"
                strokeWidth={2}
              />
            </a>

            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl border-slate-200 text-slate-700"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              <HugeiconsIcon
                icon={mobileMenuOpen ? Cancel01Icon : Menu01Icon}
                className="size-5"
                strokeWidth={2}
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-teal-100 bg-white px-5 py-6 shadow-xl md:hidden animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-3">
            {clinicConfig.navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-base font-medium text-slate-800 hover:bg-teal-50 hover:text-teal-800 transition-colors"
              >
                {item.label}
              </a>
            ))}

            <div className="mt-4 flex flex-col gap-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-500 px-3">
                <span>Direct Line:</span>
                <a
                  href={clinicConfig.contact.phoneHref}
                  className="font-semibold text-teal-800"
                >
                  {clinicConfig.contact.phone}
                </a>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 px-3">
                <span>Location:</span>
                <span className="font-medium text-slate-700">
                  Dhankawadi, Pune (Near Bharati Vidyapeeth)
                </span>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <AppointmentDialog
                  triggerButtonText="Schedule an Appointment"
                  triggerVariant="default"
                  className="w-full h-12 text-sm font-semibold rounded-xl"
                />

                <CancellationDialog
                  triggerText="Cancel Pending Appointment"
                  triggerVariant="outline"
                  className="w-full h-11 text-xs font-medium rounded-xl border-slate-200 text-slate-700 hover:text-rose-700"
                />
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
