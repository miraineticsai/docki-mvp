export interface ClinicService {
  id: string;
  title: string;
  description: string;
  tag: string;
  iconName:
    | "stethoscope"
    | "heart"
    | "shield"
    | "clipboard"
    | "activity"
    | "wellness";
  features: string[];
}

export interface ClinicTiming {
  days: string;
  hours: string;
  status?: string;
}

export interface DoctorQualification {
  degree: string;
  institution: string;
  year?: string;
}

export interface DoctorProfile {
  name: string;
  prefix: string;
  title: string;
  credentials: string;
  registrationNumber: string; // MMC Reg No. (clearly marked placeholder)
  verificationNotice: string;
  hospitalAffiliation: {
    hospitalName: string;
    designation: string;
    campus: string;
    opdHours: string;
  };
  experienceYears: number;
  bio: string[];
  philosophy: string;
  qualifications: DoctorQualification[];
  specialties: string[];
  affiliations: string[];
  languages: string[];
  imageUrl: string;
  imageAlt: string;
}

export interface ClinicConfig {
  name: string;
  tagline: string;
  shortDescription: string;
  fullDescription: string;
  establishedYear: number;
  doctor: DoctorProfile;
  services: ClinicService[];
  whyChooseUs: {
    title: string;
    description: string;
    iconName: "clock" | "user" | "shield" | "sparkles" | "check" | "calendar";
  }[];
  contact: {
    clinicAddress: {
      shop: string;
      building: string;
      landmark: string;
      area: string;
      city: string;
      state: string;
      pincode: string;
      full: string;
    };
    hospitalAddress: {
      name: string;
      department: string;
      location: string;
      city: string;
      pincode: string;
    };
    phone: string;
    phoneHref: string;
    whatsappNumber: string;
    whatsappHref: string;
    emergencyPhone: string;
    emergencyAdvisory: string;
    email: string;
    clinicTimings: ClinicTiming[];
    hospitalTimings: ClinicTiming[];
    googleMapsUrl: string;
    parkingInfo: string;
  };
  navigation: {
    label: string;
    href: string;
  }[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
    siteUrl: string;
    ogImage: string;
  };
}

export const clinicConfig: ClinicConfig = {
  name: "Aura Clinic & Family Healthcare",
  tagline:
    "Ethical family medicine & general healthcare by Dr. Rajesh Kulkarni, MBBS.",
  shortDescription:
    "Primary care & family physician clinic in Dhankawadi, Pune. Consultations by Dr. Rajesh Kulkarni, MBBS (Senior Doctor at Bharati Hospital).",
  fullDescription:
    "Aura Clinic provides patient-first healthcare in Dhankawadi, Pune. Led by Dr. Rajesh Kulkarni, MBBS (Senior Doctor at Bharati Vidyapeeth Hospital), we specialize in seasonal fevers, diabetes, hypertension, and routine family wellness.",
  establishedYear: 2015,

  doctor: {
    name: "Dr. Rajesh Kulkarni",
    prefix: "Dr.",
    title: "Senior MBBS Physician & Family Medicine Specialist",
    credentials: "MBBS, CCEBDM (Diabetology), FCGP",
    registrationNumber:
      "MMC Reg. No.: 2012/04/1829 (Demo Placeholder — Verify Before Production)",
    verificationNotice:
      "Pre-Launch Notice: Doctor identity, Maharashtra Medical Council registration number, degrees, and hospital roles are demo placeholders that must be formally verified against original certificates before live deployment.",
    hospitalAffiliation: {
      hospitalName:
        "Bharati Vidyapeeth (Deemed to be University) Medical College & Hospital",
      designation: "Senior MBBS Doctor / Senior Medical Officer",
      campus: "Pune-Satara Road, Dhankawadi, Pune",
      opdHours: "Mon – Sat: 12:00 PM – 5:00 PM",
    },
    experienceYears: 12,
    imageUrl:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80",
    imageAlt:
      "Dr. Rajesh Kulkarni, MBBS, Senior Physician at Bharati Vidyapeeth & Aura Clinic Pune",
    bio: [
      "Dr. Rajesh Kulkarni is an MBBS physician with over 12 years of experience in general medicine, family health, and acute emergency care. He serves as Senior Medical Officer at Bharati Vidyapeeth Medical College & Hospital, Dhankawadi, Pune.",
      "At his personal clinic in Dhankawadi, Dr. Kulkarni focuses on rational prescriptions without unnecessary antibiotics or redundant tests. He holds certification in Evidence-Based Diabetes Management (CCEBDM) and provides compassionate care across all age groups.",
    ],
    philosophy:
      "Attentive listening, rational prescription, and honest patient counseling form the core of good clinical practice. My priority is clear guidance and reliable recovery for every family.",
    qualifications: [
      {
        degree: "Bachelor of Medicine & Bachelor of Surgery (MBBS)",
        institution:
          "Bharati Vidyapeeth Deemed University Medical College, Pune (Demo Placeholder)",
        year: "2012",
      },
      {
        degree: "Clinical Residency & Internship",
        institution:
          "Bharati Hospital & Research Centre, Pune (Demo Placeholder)",
        year: "2013",
      },
      {
        degree: "Certificate in Diabetes Management (CCEBDM)",
        institution:
          "Public Health Foundation of India - PHFI (Demo Placeholder)",
        year: "2016",
      },
      {
        degree: "Fellowship of College of General Practitioners (FCGP)",
        institution: "IMA CGP (Demo Placeholder)",
        year: "2019",
      },
    ],
    specialties: [
      "Seasonal Fevers & Infections (Dengue, Typhoid, Malaria)",
      "Diabetes Mellitus & Hypertension (BP) Management",
      "Preventive Health Checkups & Report Analysis",
      "Respiratory Care & In-Clinic Nebulization",
      "Pediatric Common Illnesses & Elderly Healthcare",
    ],
    affiliations: [
      "Bharati Vidyapeeth Medical College & Hospital (Senior Doctor)",
      "Indian Medical Association (IMA) Pune Branch (Member)",
      "Maharashtra Medical Council (MMC Registered)",
    ],
    languages: ["English", "Hindi (हिंदी)", "Marathi (मराठी)"],
  },

  services: [
    {
      id: "fever-and-infection",
      title: "Acute Illness & Seasonal Fevers",
      tag: "OPD Care",
      iconName: "stethoscope",
      description:
        "Prompt evaluation and targeted management for viral fevers, Dengue, Malaria, Typhoid, and respiratory infections.",
      features: [
        "Rapid clinical assessment & vital monitoring",
        "Rational antibiotic policy to prevent drug resistance",
        "Targeted blood test (CBC) review & daily follow-up",
      ],
    },
    {
      id: "diabetes-and-bp",
      title: "Diabetes & Hypertension Care",
      tag: "Chronic Care",
      iconName: "heart",
      description:
        "Longitudinal monitoring of blood pressure, blood sugar (HbA1c), and cholesterol with practical Indian dietary planning.",
      features: [
        "HbA1c & Fasting blood sugar tracking protocols",
        "Targeted medication titration to protect heart and kidneys",
        "Culturally adaptable Indian diet & physical activity guidance",
      ],
    },
    {
      id: "preventive-health-checkups",
      title: "Preventive Health Checkups",
      tag: "Wellness",
      iconName: "wellness",
      description:
        "Systemic physical examinations and thorough full-body blood report reviews to identify health risks early.",
      features: [
        "Comprehensive clinical examination and vitals review",
        "Lipid profile, liver, kidney, & sugar report interpretation",
        "Actionable preventive roadmap for working adults and seniors",
      ],
    },
    {
      id: "minor-opd-procedures",
      title: "Minor OPD Procedures & First Aid",
      tag: "In-Clinic",
      iconName: "activity",
      description:
        "Equipped for first-line interventions including nebulization, sterile wound dressing, suture removal, and injections.",
      features: [
        "Ultrasonic nebulization for acute cough & breathlessness",
        "Aseptic wound dressing, minor cuts, & burn first aid",
        "Tetanus Toxoid (TT), adult vaccines, & injection support",
      ],
    },
    {
      id: "pediatric-and-geriatric",
      title: "Family, Child & Senior Care",
      tag: "Family Care",
      iconName: "clipboard",
      description:
        "Comprehensive health support for growing children and gentle chronic management for senior family members.",
      features: [
        "Childhood cough, seasonal allergy, & growth checkups",
        "Senior joint pain, hypertension, & polypharmacy reduction",
        "Comfortable consultations in Marathi, Hindi, & English",
      ],
    },
    {
      id: "hospital-teleconsult",
      title: "Hospital Referrals & Online Follow-Ups",
      tag: "Referrals",
      iconName: "shield",
      description:
        "Direct referral coordination for tertiary care at Bharati Vidyapeeth Hospital, plus convenient WhatsApp report reviews.",
      features: [
        "Direct coordination with Bharati Hospital departments",
        "WhatsApp / Video teleconsultation for follow-up reviews",
        "Prompt second opinion on ongoing hospital prescriptions",
      ],
    },
  ],

  whyChooseUs: [
    {
      title: "Senior Doctor at Bharati Hospital",
      description:
        "Gain the advantage of extensive hospital experience managing acute cases, right at his personal clinic.",
      iconName: "user",
    },
    {
      title: "Rational, Ethical Prescriptions",
      description:
        "Evidence-backed clinical decisions without over-prescription or unnecessary high-end antibiotics.",
      iconName: "shield",
    },
    {
      title: "Marathi, Hindi & English",
      description:
        "Comfortable communication in native languages so elders and children can explain symptoms with ease.",
      iconName: "check",
    },
    {
      title: "Dual Timings (Morning & Evening)",
      description:
        "Convenient clinic hours (9–11:30 AM & 6–9:30 PM) for working families, plus daytime hospital availability.",
      iconName: "clock",
    },
    {
      title: "Direct WhatsApp Follow-Up",
      description:
        "Fast digital access to verify lab reports, share BP readings, and request prescription follow-ups.",
      iconName: "sparkles",
    },
    {
      title: "Direct Hospital Coordination",
      description:
        "Seamless transfer and specialist referrals to Bharati Hospital when admission or imaging is required.",
      iconName: "calendar",
    },
  ],

  contact: {
    clinicAddress: {
      shop: "Shop No. 12, Ground Floor",
      building: "Sai Heritage Commercial Complex",
      landmark: "Near Bharati Vidyapeeth Back Gate",
      area: "Pune-Satara Road, Dhankawadi",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411043",
      full: "Shop 12, Sai Heritage, Near Bharati Vidyapeeth Back Gate, Dhankawadi, Pune, Maharashtra 411043 (Demo Placeholder)",
    },
    hospitalAddress: {
      name: "Bharati Vidyapeeth Medical College & Hospital",
      department: "Department of General Medicine / Outpatient OPD",
      location: "Pune-Satara Road, Dhankawadi",
      city: "Pune",
      pincode: "411043",
    },
    phone: "+91 98220 12345",
    phoneHref: "tel:+919822012345",
    whatsappNumber: "+91 98220 12345",
    whatsappHref:
      "https://wa.me/919822012345?text=Hello%20Dr.%20Rajesh%20Kulkarni,%20I%20would%20like%20to%20request%20an%20OPD%20appointment%20token.",
    emergencyPhone: "108 / 112",
    emergencyAdvisory:
      "For severe emergencies or acute trauma, call 108 (National Ambulance) / 112 (National Emergency Support) or proceed to Bharati Vidyapeeth Hospital Emergency Casualty Department (Open 24/7 on Pune-Satara Road).",
    email: "care@auraclinic-pune.com",
    clinicTimings: [
      {
        days: "Monday – Saturday (Morning OPD)",
        hours: "9:00 AM – 11:30 AM",
        status: "Open (Personal Clinic)",
      },
      {
        days: "Monday – Saturday (Evening OPD)",
        hours: "6:00 PM – 9:30 PM",
        status: "Open (Personal Clinic)",
      },
      {
        days: "Sunday",
        hours: "10:00 AM – 1:00 PM",
        status: "By Appointment / Urgent Walk-in",
      },
    ],
    hospitalTimings: [
      {
        days: "Monday – Saturday (Hospital OPD)",
        hours: "12:00 PM – 5:00 PM",
        status: "Bharati Vidyapeeth Hospital OPD",
      },
    ],
    googleMapsUrl:
      "https://maps.google.com/?q=Bharati+Vidyapeeth+Medical+College+Hospital+Dhankawadi+Pune",
    parkingInfo:
      "Designated two-wheeler and four-wheeler parking in front of Sai Heritage. Ground floor clinic with wheelchair accessible ramp.",
  },

  navigation: [
    { label: "About Doctor", href: "#doctor" },
    { label: "Services", href: "#services" },
    { label: "Why Choose Us", href: "#why-us" },
    { label: "Timings & Contact", href: "#contact" },
  ],

  seo: {
    title:
      "Dr. Rajesh Kulkarni, MBBS | Senior Doctor at Bharati Hospital & Aura Clinic Pune",
    description:
      "Dr. Rajesh Kulkarni is a senior MBBS doctor at Bharati Vidyapeeth Medical College & Hospital and practitioner at Aura Clinic, Dhankawadi, Pune. General medicine, fever care, diabetes, and family health.",
    keywords: [
      "MBBS doctor Pune",
      "Dr Rajesh Kulkarni MBBS",
      "general physician Dhankawadi Pune",
      "Bharati Vidyapeeth hospital doctor",
      "family clinic Pune Satara road",
      "diabetes doctor Katraj Pune",
      "fever clinic Dhankawadi",
      "senior MBBS doctor Pune",
    ],
    siteUrl: "https://auraclinic-pune.example.com",
    ogImage:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1200&q=80",
  },
};
