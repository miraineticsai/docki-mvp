import {
  Calendar01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Shield01Icon,
  SparklesIcon,
  User02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AppointmentDialog } from "@/components/appointment-dialog";
import { clinicConfig } from "@/config/clinic";

function getFeatureIcon(iconName: string) {
  switch (iconName) {
    case "clock":
      return Clock01Icon;
    case "user":
      return User02Icon;
    case "shield":
      return Shield01Icon;
    case "sparkles":
      return SparklesIcon;
    case "calendar":
      return Calendar01Icon;
    case "check":
      return CheckmarkCircle02Icon;
    default:
      return CheckmarkCircle02Icon;
  }
}

export function WhyChooseUs() {
  const { whyChooseUs, contact } = clinicConfig;

  return (
    <section
      id="why-us"
      className="scroll-mt-20 bg-gradient-to-b from-slate-50/80 via-teal-50/20 to-white py-16 lg:py-24 border-y border-slate-200/60"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-100/80 px-3 py-1 text-xs font-semibold text-teal-800 mb-3">
            <HugeiconsIcon
              icon={Shield01Icon}
              className="size-3.5"
              strokeWidth={2}
            />
            <span>The Clinical Difference</span>
          </div>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Healthcare Built Around Listening & Scientific Rigor
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Traditional primary care often feels rushed and transactional. We
            maintain dedicated OPD consultation windows to guarantee attentive
            listening, thorough diagnosis, and direct continuity with{" "}
            {clinicConfig.doctor.name}.
          </p>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {whyChooseUs.map((item, index) => {
            const Icon = getFeatureIcon(item.iconName);

            return (
              <div
                key={item.title}
                className="group relative rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs transition-all duration-300 hover:border-teal-300 hover:shadow-lg hover:shadow-teal-950/5"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-200/70 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                    <HugeiconsIcon
                      icon={Icon}
                      className="size-6"
                      strokeWidth={2}
                    />
                  </div>
                  <span className="font-mono text-xs font-semibold text-slate-400 group-hover:text-teal-700 transition-colors">
                    0{index + 1}
                  </span>
                </div>

                <h3 className="font-heading text-lg font-semibold text-slate-900 mb-2 group-hover:text-teal-900 transition-colors">
                  {item.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner Card */}
        <div className="mt-14 overflow-hidden rounded-3xl bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 p-8 sm:p-12 text-white shadow-xl shadow-teal-950/10">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row text-center md:text-left">
            <div className="max-w-xl">
              <span className="inline-block rounded-full bg-white/15 px-3 py-0.5 text-xs font-medium uppercase tracking-wider text-teal-100 mb-2">
                Personalized Care Awaits
              </span>
              <h3 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight">
                Ready for a doctor who takes the time to listen?
              </h3>
              <p className="mt-2 text-sm sm:text-base text-teal-100">
                Book your consultation or routine health checkup with{" "}
                {clinicConfig.doctor.name} at Aura Clinic, Dhankawadi, Pune.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <AppointmentDialog
                triggerButtonText="Schedule Your Visit"
                triggerVariant="default"
                className="w-full sm:w-auto h-12 bg-white text-teal-900 hover:bg-teal-50 font-semibold px-6 rounded-2xl shadow-md"
              />
              <a
                href={contact.phoneHref}
                className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-2xl border border-white/30 px-5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Call {contact.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
