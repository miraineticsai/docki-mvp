import { clinicConfig } from "@/config/clinic";

export interface CancellationOtpEmailData {
  patientName: string;
  referenceId: string;
  otp: string;
  expiresInMinutes?: number;
}

export function generateCancellationOtpEmail(data: CancellationOtpEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const { patientName, referenceId, otp, expiresInMinutes = 10 } = data;
  const subject = `Your Cancellation Verification Code: ${otp} | ${clinicConfig.name}`;

  const text = `
Dear ${patientName},

You requested to cancel your pending appointment (${referenceId}) at ${clinicConfig.name}.

Your verification code (OTP) is:
${otp}

This code will expire in ${expiresInMinutes} minutes.

If you did not request this cancellation, please disregard this email. Your appointment will remain active.

Clinic Contact:
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
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0f766e; padding: 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">
                ${clinicConfig.name}
              </h1>
              <p style="margin: 4px 0 0 0; color: #ccfbf1; font-size: 12px;">
                Appointment Cancellation Security Verification
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 28px 24px;">
              <h2 style="margin: 0 0 10px 0; color: #0f172a; font-size: 17px; font-weight: 700;">
                Confirm Your Appointment Cancellation
              </h2>
              <p style="margin: 0 0 18px 0; font-size: 14px; color: #475569;">
                Hello <strong>${patientName}</strong>, we received a request to cancel your appointment with reference ID <strong style="font-family: monospace; color: #0f766e;">${referenceId}</strong>.
              </p>

              <!-- OTP Display Box -->
              <div style="background-color: #f8fafc; border: 2px dashed #0f766e; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
                <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 1px;">
                  Your One-Time Verification Code
                </span>
                <div style="font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #0f766e; margin: 8px 0; font-family: monospace;">
                  ${otp}
                </div>
                <span style="font-size: 12px; color: #64748b;">
                  Valid for the next <strong>${expiresInMinutes} minutes</strong>
                </span>
              </div>

              <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 12px; color: #92400e; line-height: 1.4;">
                  <strong>Did not request this?</strong> You can safely ignore this email. Your appointment will not be cancelled unless this code is verified.
                </p>
              </div>

              <p style="margin: 0; font-size: 12px; color: #64748b; text-align: center;">
                Need help? Contact clinic reception at <a href="${clinicConfig.contact.phoneHref}" style="color: #0f766e; font-weight: 600;">${clinicConfig.contact.phone}</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center; font-size: 11px; color: #94a3b8;">
              © ${new Date().getFullYear()} ${clinicConfig.name}. Security verification code for ${referenceId}.
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

export interface UserCancellationConfirmedEmailData {
  patientName: string;
  referenceId: string;
  preferredDate: string;
  preferredTimeSlot: string;
  visitType: string;
}

export function generateUserCancellationConfirmedEmail(
  data: UserCancellationConfirmedEmailData,
): {
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
  } = data;

  const subject = `Appointment Cancelled - ${referenceId} | ${clinicConfig.name}`;

  const text = `
Dear ${patientName},

As requested, your pending consultation appointment has been cancelled successfully.

CANCELLED APPOINTMENT DETAILS:
- Reference ID: ${referenceId}
- Scheduled Date: ${preferredDate}
- Time Slot: ${preferredTimeSlot}
- Consultation: ${visitType}
- Status: CANCELLED (By User)

If you wish to book a consultation for another date in the future, please visit our website or contact our reception.

${clinicConfig.name}
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
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #475569; padding: 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">
                ${clinicConfig.name}
              </h1>
              <p style="margin: 4px 0 0 0; color: #e2e8f0; font-size: 12px;">
                Appointment Cancellation Confirmation
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 28px 24px;">
              <h2 style="margin: 0 0 10px 0; color: #0f172a; font-size: 17px; font-weight: 700;">
                Appointment Successfully Cancelled
              </h2>
              <p style="margin: 0 0 18px 0; font-size: 14px; color: #475569;">
                Dear <strong>${patientName}</strong>, your pending consultation booking has been cancelled as requested.
              </p>

              <!-- Details Card -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px;">
                  <tr>
                    <td style="padding: 5px 0; color: #64748b; width: 130px;">Reference ID:</td>
                    <td style="padding: 5px 0; font-weight: 700; font-family: monospace; color: #0f172a;">${referenceId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #64748b;">Consultation:</td>
                    <td style="padding: 5px 0; color: #0f172a;">${visitType}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #64748b;">Date & Slot:</td>
                    <td style="padding: 5px 0; color: #0f172a; font-weight: 600;">${preferredDate} (${preferredTimeSlot})</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #64748b;">Final Status:</td>
                    <td style="padding: 5px 0; color: #dc2626; font-weight: 700;">Cancelled by Patient</td>
                  </tr>
                </table>
              </div>

              <p style="margin: 0 0 16px 0; font-size: 13px; color: #475569;">
                If your schedule changes or you need clinical attention in the future, you are welcome to schedule a new consultation at any time.
              </p>

              <div style="text-align: center; margin-top: 24px;">
                <a href="${clinicConfig.seo.siteUrl}" style="display: inline-block; background-color: #0f766e; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 10px 20px; border-radius: 8px;">
                  Visit Aura Clinic Website
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center; font-size: 11px; color: #94a3b8;">
              © ${new Date().getFullYear()} ${clinicConfig.name}. Cancellation record for ${referenceId}.
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
