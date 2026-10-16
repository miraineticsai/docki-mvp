import {
  Activity01Icon,
  CheckmarkCircle02Icon,
  HeartPulseIcon,
  Shield01Icon,
  SparklesIcon,
  Stethoscope02Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AppointmentDialog } from "@/components/appointment-dialog";
import { type ClinicService, clinicConfig } from "@/config/clinic";

function getServiceIcon(iconName: ClinicService["iconName"]) {
  switch (iconName) {
    case "stethoscope":
      return Stethoscope02Icon;
    case "heart":
      return HeartPulseIcon;
    case "shield":
      return Shield01Icon;
    case "wellness":
      return SparklesIcon;
    case "activity":
      return Activity01Icon;
    case "clipboard":
      return CheckmarkCircle02Icon;
    default:
      return Stethoscope02Icon;
  }
}

export function ServicesSection() {
  const { services } = clinicConfig;

  return (
    <section id="services" className="scroll-mt-20 bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-semibold text-teal-800 mb-3">
            <HugeiconsIcon
              icon={Stethoscope02Icon}
              className="size-3.5"
              strokeWidth={2}
            />
            <span>Clinical Specialties</span>
          </div>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Comprehensive Care for Every Stage of Life
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            From proactive wellness screenings to continuous chronic condition
            management, our clinical services are personalized to support your
            long-term vitality.
          </p>
        </div>

        {/* Services 3-column Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const IconComponent = getServiceIcon(service.iconName);

            return (
              <article
                key={service.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-7 shadow-xs transition-all duration-300 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-950/5"
              >
                <div>
                  {/* Top Bar with Icon and Tag */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-200/60 transition-colors group-hover:bg-teal-700 group-hover:text-white">
                      <HugeiconsIcon
                        icon={IconComponent}
                        className="size-6 transition-transform duration-300 group-hover:scale-110"
                        strokeWidth={2}
                      />
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-800 transition-colors">
                      {service.tag}
                    </span>
                  </div>

                  {/* Service Title */}
                  <h3 className="font-heading text-xl font-semibold text-slate-900 group-hover:text-teal-900 transition-colors mb-2.5">
                    {service.title}
                  </h3>

                  {/* Service Description */}
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    {service.description}
                  </p>

                  {/* Key Features Bullet List */}
                  <ul className="space-y-2 border-t border-slate-100 pt-5 text-xs text-slate-700">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <HugeiconsIcon
                          icon={Tick02Icon}
                          className="size-4 shrink-0 text-teal-600 mt-0.5"
                          strokeWidth={2.5}
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Action */}
                <div className="mt-8 pt-4 border-t border-slate-100">
                  <AppointmentDialog
                    triggerButtonText="Schedule This Service"
                    triggerVariant="outline"
                    className="w-full text-xs font-semibold text-teal-800 border-teal-200/80 hover:bg-teal-50 hover:border-teal-300 rounded-xl"
                  />
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom Insurance / Service notice */}
        <div className="mt-12 rounded-2xl bg-slate-50 border border-slate-200/80 p-5 text-center text-xs text-slate-600 max-w-2xl mx-auto">
          <p>
            Looking for a specific diagnostic test or clinical referral? Contact
            our clinic reception at{" "}
            <a
              href={clinicConfig.contact.phoneHref}
              className="font-semibold text-teal-700 hover:underline"
            >
              {clinicConfig.contact.phone}
            </a>{" "}
            to speak with our coordinator.
          </p>
        </div>
      </div>
    </section>
  );
}
