import { clinicConfig } from "@/config/clinic";

export interface ConsultationConfirmationData {
  patientName: string;
  referenceId: string;
  preferredDate: string;
  preferredTimeSlot: string;
  visitType: string;
  notes?: string | null;
}

export function generateConsultationConfirmationEmail(
  data: ConsultationConfirmationData,
): { subject: string; html: string; text: string } {
  const {
    patientName,
    referenceId,
    preferredDate,
    preferredTimeSlot,
    visitType,
    notes,
  } = data;

  const subject = `Consultation Request Received - ${referenceId} | ${clinicConfig.name}`;

  const text = `
Dear ${patientName},

Thank you for choosing ${clinicConfig.name}. Your consultation request has been successfully recorded.

BOOKING DETAILS:
- Reference ID: ${referenceId}
- Doctor: ${clinicConfig.doctor.name}, ${clinicConfig.doctor.credentials}
- Date: ${preferredDate}
- Time Slot: ${preferredTimeSlot}
- Consultation Type: ${visitType}
${notes ? `- Symptoms/Notes: ${notes}\n` : ""}
- Current Status: Pending Reception Confirmation

NEXT STEPS:
Our clinic reception will verify doctor availability and contact you via phone or WhatsApp to confirm your appointment and issue your OPD token.

CLINIC LOCATION & CONTACT:
${clinicConfig.name}
${clinicConfig.contact.clinicAddress.full}
Phone: ${clinicConfig.contact.phone}
WhatsApp: ${clinicConfig.contact.whatsappNumber}

For emergency assistance, please call 108 or proceed to the nearest emergency center immediately.
`.trim();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.5;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0f766e; padding: 28px 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">
                ${clinicConfig.name}
              </h1>
              <p style="margin: 4px 0 0 0; color: #ccfbf1; font-size: 13px; font-weight: 500;">
                ${clinicConfig.tagline} • ${clinicConfig.doctor.name}, ${clinicConfig.doctor.credentials}
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 28px 24px;">
              <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 18px; font-weight: 600;">
                Consultation Request Received
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569;">
                Dear <strong>${patientName}</strong>, thank you for reaching out to us. We have received your consultation booking request.
              </p>

              <!-- Status Badge -->
              <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px;">
                <span style="display: block; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #b45309; letter-spacing: 0.5px;">Status</span>
                <span style="font-size: 14px; font-weight: 600; color: #92400e;">Pending Reception Confirmation</span>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #b45309;">
                  Our reception team will call or message you to confirm doctor availability and issue your OPD token.
                </p>
              </div>

              <!-- Appointment Details Card -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 14px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; font-weight: 700;">
                  Consultation Details
                </h3>

                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px;">
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; width: 140px;">Reference ID:</td>
                    <td style="padding: 6px 0; color: #0f766e; font-weight: 700; font-family: monospace; font-size: 14px;">${referenceId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">Consultant:</td>
                    <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${clinicConfig.doctor.name} (${clinicConfig.doctor.credentials})</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">Preferred Date:</td>
                    <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${preferredDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">Time Slot:</td>
                    <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${preferredTimeSlot}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">Reason / Visit Type:</td>
                    <td style="padding: 6px 0; color: #0f172a;">${visitType}</td>
                  </tr>
                  ${
                    notes
                      ? `
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; vertical-align: top;">Notes:</td>
                    <td style="padding: 6px 0; color: #334155; font-style: italic;">"${notes}"</td>
                  </tr>
                  `
                      : ""
                  }
                </table>
              </div>

              <!-- Clinic Contact Box -->
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
                <h4 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #166534;">
                  Clinic Location & Helpdesk
                </h4>
                <p style="margin: 0 0 6px 0; font-size: 12px; color: #15803d; line-height: 1.4;">
                  <strong>Address:</strong> ${clinicConfig.contact.clinicAddress.full}
                </p>
                <p style="margin: 0; font-size: 12px; color: #15803d;">
                  <strong>Reception Call:</strong> <a href="${clinicConfig.contact.phoneHref}" style="color: #0f766e; text-decoration: none; font-weight: 600;">${clinicConfig.contact.phone}</a> &nbsp;|&nbsp; 
                  <strong>WhatsApp:</strong> <a href="${clinicConfig.contact.whatsappHref}" style="color: #16a34a; text-decoration: none; font-weight: 600;">Message Us</a>
                </p>
              </div>

              <!-- Urgent Notice -->
              <p style="margin: 0; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.4;">
                This portal is for scheduled OPD visits only. For chest pain, acute shortness of breath, or trauma, please dial <strong>108 / 112</strong> immediately.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 11px; color: #94a3b8;">
              <p style="margin: 0 0 4px 0;">
                © ${new Date().getFullYear()} ${clinicConfig.name}. All rights reserved.
              </p>
              <p style="margin: 0;">
                This is an automated notification regarding your appointment request ${referenceId}.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  return { subject, html, text };
}
