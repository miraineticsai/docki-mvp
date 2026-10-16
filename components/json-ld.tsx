import { clinicConfig } from "@/config/clinic";

export function JsonLd() {
  const { doctor, contact, services } = clinicConfig;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalClinic",
        "@id": `${clinicConfig.seo.siteUrl}/#clinic`,
        name: clinicConfig.name,
        description: clinicConfig.fullDescription,
        url: clinicConfig.seo.siteUrl,
        telephone: contact.phone,
        email: contact.email,
        address: {
          "@type": "PostalAddress",
          streetAddress: `${contact.clinicAddress.shop}, ${contact.clinicAddress.building}, ${contact.clinicAddress.area}`,
          addressLocality: contact.clinicAddress.city,
          addressRegion: contact.clinicAddress.state,
          postalCode: contact.clinicAddress.pincode,
          addressCountry: "IN",
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ],
            opens: "09:00",
            closes: "11:30",
          },
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ],
            opens: "18:00",
            closes: "21:30",
          },
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Sunday"],
            opens: "10:00",
            closes: "13:00",
          },
        ],
        medicalSpecialty: ["PrimaryCare", "GeneralPractice", "Diabetology"],
        availableService: services.map((service) => ({
          "@type": "MedicalProcedure",
          name: service.title,
          description: service.description,
        })),
      },
      {
        "@type": "Physician",
        "@id": `${clinicConfig.seo.siteUrl}/#doctor`,
        name: doctor.name,
        medicalSpecialty: doctor.specialties,
        jobTitle: doctor.title,
        affiliation: [
          {
            "@type": "Hospital",
            name: doctor.hospitalAffiliation.hospitalName,
          },
          {
            "@type": "MedicalClinic",
            name: clinicConfig.name,
          },
        ],
        alumniOf: doctor.qualifications.map((q) => ({
          "@type": "EducationalOrganization",
          name: q.institution,
        })),
        knowsLanguage: ["English", "Hindi", "Marathi"],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Static schema JSON-LD
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
