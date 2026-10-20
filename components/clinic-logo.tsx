import Link from "next/link";
import { clinicConfig } from "@/config/clinic";

interface ClinicLogoProps {
  className?: string;
  showTagline?: boolean;
}

export function ClinicLogo({
  className = "",
  showTagline = true,
}: ClinicLogoProps) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-3 transition-opacity hover:opacity-90 ${className}`}
      aria-label={`${clinicConfig.name} - Home`}
    >
      <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white shadow-sm ring-1 ring-teal-700/20">
        {/* Modern Medical Cross with Soft Curves */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5 transition-transform duration-300 group-hover:scale-105"
          aria-hidden="true"
        >
          <path d="M12 4v16" />
          <path d="M4 12h16" />
          <circle cx="12" cy="12" r="9" strokeWidth="1.5" strokeOpacity="0.4" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className="font-heading text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
          {clinicConfig.name}
        </span>
        {showTagline && (
          <span className="hidden text-[11px] font-medium text-teal-700 lg:block">
            {clinicConfig.doctor.name},{" "}
            {clinicConfig.doctor.credentials.split(",")[0]}
          </span>
        )}
      </div>
    </Link>
  );
}
