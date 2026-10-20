import { clinicConfig } from "@/config/clinic";

export interface AdminActionEmailData {
  patientName: string;
  referenceId: string;
  preferredDate: string;
  preferredTimeSlot: string;
  visitType: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "rejected";
  tokenNumber?: string | null;
  doctorNotes?: string | null;
  actionSummary?: string;
}

export function generateAdminActionEmail(data: AdminActionEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const {
    patientName,
    referenceId,
    preferredDate,
    preferredTimeSlot,
    visitType,
    status,
    tokenNumber,
    doctorNotes,
    actionSummary,
  } = data;

  // Status-specific themes and messages
  let statusTitle = "Appointment Status Update";
  let statusBadgeBg = "#ccfbf1";
  let statusBadgeText = "#0f766e";
  let statusBorderColor = "#0f766e";
  let statusDescription =
    actionSummary ||
    "Your appointment details have been updated by our clinic team.";

  switch (status) {
    case "confirmed":
      statusTitle = "Appointment Confirmed";
      statusBadgeBg = "#d1fae5";
      statusBadgeText = "#065f46";
      statusBorderColor = "#10b981";
      statusDescription =
        actionSummary ||
        "Great news! Your consultation appointment has been officially confirmed by Dr. Kulkarni's desk.";
      break;

    case "cancelled":
    case "rejected":
      statusTitle = "Appointment Cancelled";
      statusBadgeBg = "#ffe4e6";
      statusBadgeText = "#9f1239";
      statusBorderColor = "#f43f5e";
      statusDescription =
        actionSummary ||
        "Your appointment request has been cancelled or could not be accommodated at this time. Please see details below or contact our clinic to reschedule.";
      break;

    case "completed":
      statusTitle = "Consultation Completed";
      statusBadgeBg = "#dbeafe";
      statusBadgeText = "#1e40af";
      statusBorderColor = "#3b82f6";
      statusDescription =
        actionSummary ||
        "Your consultation at Aura Clinic has been completed. Thank you for visiting us!";
      break;

    default:
      statusTitle = "Appointment In Review";
      statusBadgeBg = "#fef3c7";
      statusBadgeText = "#92400e";
      statusBorderColor = "#f59e0b";
      statusDescription =
        actionSummary ||
        "Your appointment request is currently under review by our medical triage desk.";
      break;
  }

  const subject = `${statusTitle} - ${referenceId} | ${clinicConfig.name}`;

  const text = `
Dear ${patientName},

${statusDescription}

APPOINTMENT SUMMARY:
- Reference ID: ${referenceId}
- Current Status: ${status.toUpperCase()}
${tokenNumber ? `- Assigned Token Number: ${tokenNumber}\n` : ""}- Doctor: ${clinicConfig.doctor.name}, ${clinicConfig.doctor.credentials}
- Date: ${preferredDate}
- Time Slot: ${preferredTimeSlot}
- Consultation Type: ${visitType}
${doctorNotes ? `\nCLINIC / DOCTOR NOTES:\n"${doctorNotes}"\n` : ""}
${
  status === "confirmed"
    ? `IMPORTANT GUIDANCE:
- Please arrive 10-15 minutes prior to your time slot.
- Please bring any previous prescriptions, lab reports, or health history.
`
    : ""
}
CLINIC LOCATION & CONTACT:
${clinicConfig.name}
${clinicConfig.contact.clinicAddress.full}
Phone: ${clinicConfig.contact.phone}
WhatsApp: ${clinicConfig.contact.whatsappNumber}
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
                Clinical Updates • ${clinicConfig.doctor.name}, ${clinicConfig.doctor.credentials}
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 28px 24px;">
              <h2 style="margin: 0 0 8px 0; color: #0f172a; font-size: 18px; font-weight: 700;">
                ${statusTitle}
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569;">
                Dear <strong>${patientName}</strong>,
              </p>

              <!-- Status Notification Box -->
              <div style="background-color: ${statusBadgeBg}; border: 1px solid ${statusBadgeBg}; border-left: 4px solid ${statusBorderColor}; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
                <span style="display: block; font-size: 11px; text-transform: uppercase; font-weight: 700; color: ${statusBadgeText}; letter-spacing: 0.5px;">
                  Current Status
                </span>
                <span style="font-size: 16px; font-weight: 700; color: ${statusBadgeText};">
                  ${status.toUpperCase()}
                </span>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: ${statusBadgeText}; line-height: 1.4;">
                  ${statusDescription}
                </p>
              </div>

              <!-- Token Number Highlight Card (If assigned) -->
              ${
                tokenNumber
                  ? `
              <div style="background-color: #ecfdf5; border: 2px dashed #059669; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
                <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #065f46; letter-spacing: 1px;">
                  Your Assigned OPD Token
                </span>
                <div style="font-size: 28px; font-weight: 800; color: #065f46; margin: 4px 0;">
                  #${tokenNumber}
                </div>
                <span style="font-size: 12px; color: #047857;">
                  Please mention this token number upon arrival at the clinic reception.
                </span>
              </div>
              `
                  : ""
              }

              <!-- Doctor / Clinic Notes (If provided) -->
              ${
                doctorNotes
                  ? `
              <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #475569; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
                  Clinic / Doctor's Note:
                </span>
                <p style="margin: 0; font-size: 13px; color: #1e293b; font-style: italic; line-height: 1.4;">
                  "${doctorNotes}"
                </p>
              </div>
              `
                  : ""
              }

              <!-- Appointment Details Card -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 14px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; font-weight: 700;">
                  Appointment Information
                </h3>

                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px;">
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; width: 140px;">Reference ID:</td>
                    <td style="padding: 6px 0; color: #0f766e; font-weight: 700; font-family: monospace; font-size: 14px;">${referenceId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">Consulting Doctor:</td>
                    <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${clinicConfig.doctor.name} (${clinicConfig.doctor.credentials})</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">Scheduled Date:</td>
                    <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${preferredDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">Time Slot:</td>
                    <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${preferredTimeSlot}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">Consultation Type:</td>
                    <td style="padding: 6px 0; color: #0f172a;">${visitType}</td>
                  </tr>
                </table>
              </div>

              <!-- Helpful Clinic Instructions for Confirmed Visits -->
              ${
                status === "confirmed"
                  ? `
              <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                <h4 style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #1e40af;">
                  Visiting Instructions
                </h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #1d4ed8; line-height: 1.5;">
                  <li>Please arrive 10-15 minutes prior to your allocated slot for vitals recording.</li>
                  <li>Carry your previous medical files, prescription slips, or blood test reports if available.</li>
                  <li>In case of delays or emergencies, please alert the reception beforehand.</li>
                </ul>
              </div>
              `
                  : ""
              }

              <!-- Clinic Contact Box -->
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
                <h4 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #166534;">
                  Clinic Location & Inquiries
                </h4>
                <p style="margin: 0 0 6px 0; font-size: 12px; color: #15803d; line-height: 1.4;">
                  <strong>Address:</strong> ${clinicConfig.contact.clinicAddress.full}
                </p>
                <p style="margin: 0; font-size: 12px; color: #15803d;">
                  <strong>Reception:</strong> <a href="${clinicConfig.contact.phoneHref}" style="color: #0f766e; text-decoration: none; font-weight: 600;">${clinicConfig.contact.phone}</a> &nbsp;|&nbsp; 
                  <strong>WhatsApp:</strong> <a href="${clinicConfig.contact.whatsappHref}" style="color: #16a34a; text-decoration: none; font-weight: 600;">Message Us</a>
                </p>
              </div>

              <p style="margin: 0; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.4;">
                For acute chest pain, trauma, or emergency medical care, call <strong>108 / 112</strong> immediately.
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
                Automated update for reference ${referenceId}.
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
