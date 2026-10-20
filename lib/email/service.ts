import type { Appointment } from "@/db/schema";
import {
  getAdminNotificationEmail,
  getDefaultFromEmail,
  getResendClient,
} from "@/lib/email/client";
import {
  type AdminActionEmailData,
  generateAdminActionEmail,
} from "@/lib/email/templates/admin-action";
import {
  generateCancellationOtpEmail,
  generateUserCancellationConfirmedEmail,
} from "@/lib/email/templates/cancellation";
import {
  type ConsultationConfirmationData,
  generateConsultationConfirmationEmail,
} from "@/lib/email/templates/confirmation";

export interface EmailSendResult {
  success: boolean;
  emailId?: string;
  error?: string;
  skipped?: boolean;
}

/**
 * Validates basic email syntax
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * 1. Consultation Confirmation Email Service
 * Sends an email notification to the patient when a consultation request is submitted,
 * and simultaneously sends a new lead/consultation alert to the admin inbox.
 * Designed to execute strictly AFTER database transaction commits.
 */
export async function sendConsultationConfirmationEmail(params: {
  appointment: Pick<
    Appointment,
    | "referenceId"
    | "patientName"
    | "patientPhone"
    | "patientEmail"
    | "preferredDate"
    | "preferredTimeSlot"
    | "visitType"
    | "notes"
  >;
}): Promise<EmailSendResult> {
  const { appointment } = params;

  if (!appointment.patientEmail || !isValidEmail(appointment.patientEmail)) {
    console.warn(
      `[Email Service] Invalid or missing email address for reference ${appointment.referenceId}: "${appointment.patientEmail}"`,
    );
    return {
      success: false,
      error: "Invalid patient email address.",
      skipped: true,
    };
  }

  const resend = getResendClient();
  if (!resend) {
    console.info(
      `[Email Service] RESEND_API_KEY not set. Skipping consultation confirmation email to ${appointment.patientEmail}.`,
    );
    return {
      success: false,
      error: "RESEND_API_KEY is not configured.",
      skipped: true,
    };
  }

  try {
    const confirmationData: ConsultationConfirmationData = {
      patientName: appointment.patientName,
      referenceId: appointment.referenceId,
      preferredDate: appointment.preferredDate,
      preferredTimeSlot: appointment.preferredTimeSlot,
      visitType: appointment.visitType,
      notes: appointment.notes,
    };

    const { subject, html, text } =
      generateConsultationConfirmationEmail(confirmationData);

    const from = getDefaultFromEmail();
    const adminEmail = getAdminNotificationEmail();

    // 1. Patient Consultation Confirmation Task
    const userEmailTask = resend.emails.send({
      from,
      to: [appointment.patientEmail],
      replyTo: adminEmail,
      subject,
      html,
      text,
    });

    // 2. Admin Team Notification Task
    const adminEmailTask = resend.emails.send({
      from,
      to: [adminEmail],
      replyTo: appointment.patientEmail, // Click 'Reply' in inbox to email the patient directly!
      subject: `🚀 New Consultation Request: ${appointment.patientName} (${appointment.visitType})`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 20px; color: #1e293b; line-height: 1.6; max-width: 600px;">
          <h2 style="color: #0f766e; border-bottom: 2px solid #0f766e; padding-bottom: 8px; margin-top: 0;">
            New Consultation Request
          </h2>
          <p>A new consultation has been booked through the website.</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 16px 0;">
            <tr><td style="padding: 6px 0; color: #64748b; width: 140px;">Reference ID:</td><td style="padding: 6px 0; font-weight: bold; font-family: monospace; color: #0f766e;">${appointment.referenceId}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Patient Name:</td><td style="padding: 6px 0; font-weight: 600;">${appointment.patientName}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Mobile:</td><td style="padding: 6px 0;"><a href="tel:${appointment.patientPhone}" style="color: #0f766e; font-weight: 600;">${appointment.patientPhone}</a></td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Email:</td><td style="padding: 6px 0;"><a href="mailto:${appointment.patientEmail}" style="color: #0f766e;">${appointment.patientEmail}</a></td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Requested Date:</td><td style="padding: 6px 0; font-weight: 600;">${appointment.preferredDate}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Time Slot:</td><td style="padding: 6px 0; font-weight: 600;">${appointment.preferredTimeSlot}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Reason / Visit:</td><td style="padding: 6px 0;">${appointment.visitType}</td></tr>
          </table>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 8px; margin-top: 12px;">
            <strong style="color: #334155; font-size: 13px;">Patient Notes:</strong><br/>
            <span style="font-size: 13px; color: #475569; font-style: italic;">${appointment.notes ? appointment.notes.replace(/\n/g, "<br/>") : "None provided"}</span>
          </div>
          <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
            Tip: Click <strong>Reply</strong> in your email client to email the patient directly.
          </p>
        </div>
      `,
      text: `
NEW CONSULTATION REQUEST:
- Reference ID: ${appointment.referenceId}
- Patient: ${appointment.patientName}
- Phone: ${appointment.patientPhone}
- Email: ${appointment.patientEmail}
- Date: ${appointment.preferredDate}
- Slot: ${appointment.preferredTimeSlot}
- Visit Type: ${appointment.visitType}
${appointment.notes ? `- Notes: ${appointment.notes}\n` : ""}
Reply directly to this email to reach the patient.
      `.trim(),
    });

    // Execute both in parallel for optimal responsiveness
    const [userResponse, adminResponse] = await Promise.all([
      userEmailTask,
      adminEmailTask,
    ]);

    if (userResponse.error) {
      console.error(
        `[Email Service] Resend API error sending confirmation to patient ${appointment.patientEmail} (Ref: ${appointment.referenceId}):`,
        userResponse.error,
      );
    }
    if (adminResponse.error) {
      console.error(
        `[Email Service] Resend API error sending lead notification to admin ${adminEmail}:`,
        adminResponse.error,
      );
    }

    console.info(
      `[Email Service] Consultation emails dispatched for ${appointment.referenceId} (Patient Email ID: ${userResponse.data?.id}, Admin Email ID: ${adminResponse.data?.id})`,
    );

    return {
      success: !userResponse.error,
      emailId: userResponse.data?.id,
      error: userResponse.error?.message,
    };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown email sending error";
    console.error(
      `[Email Service] Exception sending consultation confirmation (Ref: ${appointment.referenceId}):`,
      errorMessage,
    );
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 2. Admin Action Email Service
 * Sends an email notification to the patient when an admin alters the status,
 * assigns a token number, or leaves clinical notes on their consultation.
 *
 * Prevents redundant/duplicate emails if no meaningful change occurred.
 */
export async function sendAdminActionEmail(params: {
  appointment: Appointment;
  previousStatus?: string;
  previousTokenNumber?: string | null;
  previousDoctorNotes?: string | null;
  adminEmail?: string;
}): Promise<EmailSendResult> {
  const {
    appointment,
    previousStatus,
    previousTokenNumber,
    previousDoctorNotes,
  } = params;

  if (!appointment.patientEmail || !isValidEmail(appointment.patientEmail)) {
    console.warn(
      `[Email Service] Invalid or missing email address for reference ${appointment.referenceId}: "${appointment.patientEmail}"`,
    );
    return {
      success: false,
      error: "Invalid patient email address.",
      skipped: true,
    };
  }

  // Prevent duplicate notifications if nothing user-facing changed
  const statusChanged = previousStatus && previousStatus !== appointment.status;
  const tokenChanged =
    previousTokenNumber !== undefined &&
    previousTokenNumber !== appointment.tokenNumber &&
    Boolean(appointment.tokenNumber);
  const notesChanged =
    previousDoctorNotes !== undefined &&
    previousDoctorNotes !== appointment.doctorNotes &&
    Boolean(appointment.doctorNotes);

  if (
    previousStatus !== undefined &&
    !statusChanged &&
    !tokenChanged &&
    !notesChanged
  ) {
    console.info(
      `[Email Service] No user-facing status, token, or notes change for ${appointment.referenceId}. Skipping notification email.`,
    );
    return {
      success: true,
      skipped: true,
    };
  }

  const resend = getResendClient();
  if (!resend) {
    console.info(
      `[Email Service] RESEND_API_KEY not set. Skipping admin action email for ${appointment.referenceId}.`,
    );
    return {
      success: false,
      error: "RESEND_API_KEY is not configured.",
      skipped: true,
    };
  }

  try {
    // Generate context-aware action summary
    let actionSummary: string | undefined;

    if (statusChanged) {
      if (appointment.status === "confirmed") {
        actionSummary = appointment.tokenNumber
          ? `Your consultation request has been confirmed! Your assigned OPD token is #${appointment.tokenNumber}.`
          : "Your consultation request has been confirmed by our clinic reception.";
      } else if (
        appointment.status === "cancelled" ||
        appointment.status === "rejected"
      ) {
        actionSummary = appointment.doctorNotes
          ? `Your consultation request could not be confirmed: "${appointment.doctorNotes}". Please contact reception to reschedule.`
          : "Your consultation request has been cancelled by the clinic desk.";
      } else if (appointment.status === "completed") {
        actionSummary =
          "Your consultation at Aura Clinic has been completed. Thank you for visiting us!";
      } else if (appointment.status === "pending") {
        actionSummary =
          "Your consultation has been moved back to pending status for schedule re-verification.";
      }
    } else if (tokenChanged) {
      actionSummary = `An OPD token #${appointment.tokenNumber} has been assigned to your consultation.`;
    } else if (notesChanged) {
      actionSummary =
        "The doctor / clinic reception has updated the notes on your consultation.";
    }

    const emailData: AdminActionEmailData = {
      patientName: appointment.patientName,
      referenceId: appointment.referenceId,
      preferredDate: appointment.preferredDate,
      preferredTimeSlot: appointment.preferredTimeSlot,
      visitType: appointment.visitType,
      status: appointment.status as
        | "pending"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "rejected",
      tokenNumber: appointment.tokenNumber,
      doctorNotes: appointment.doctorNotes,
      actionSummary,
    };

    const { subject, html, text } = generateAdminActionEmail(emailData);
    const from = getDefaultFromEmail();
    const adminEmail = getAdminNotificationEmail();

    const response = await resend.emails.send({
      from,
      to: [appointment.patientEmail],
      replyTo: adminEmail,
      subject,
      html,
      text,
    });

    if (response.error) {
      console.error(
        `[Email Service] Resend API error sending admin action update to ${appointment.patientEmail} (Ref: ${appointment.referenceId}):`,
        response.error,
      );
      return {
        success: false,
        error: response.error.message,
      };
    }

    console.info(
      `[Email Service] Admin action email sent to ${appointment.patientEmail} (Ref: ${appointment.referenceId}, Status: ${appointment.status}, Email ID: ${response.data?.id})`,
    );

    return {
      success: true,
      emailId: response.data?.id,
    };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown email sending error";
    console.error(
      `[Email Service] Exception sending admin action update (Ref: ${appointment.referenceId}):`,
      errorMessage,
    );
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 3. Cancellation OTP Email Service
 * Sends the 6-digit verification code to the patient's registered email.
 */
export async function sendCancellationOtpEmail(params: {
  patientName: string;
  patientEmail: string;
  referenceId: string;
  otp: string;
  expiresInMinutes?: number;
}): Promise<EmailSendResult> {
  const {
    patientName,
    patientEmail,
    referenceId,
    otp,
    expiresInMinutes = 10,
  } = params;

  if (!patientEmail || !isValidEmail(patientEmail)) {
    return { success: false, error: "Invalid email address." };
  }

  const resend = getResendClient();
  if (!resend) {
    return { success: false, error: "RESEND_API_KEY is not configured." };
  }

  try {
    const { subject, html, text } = generateCancellationOtpEmail({
      patientName,
      referenceId,
      otp,
      expiresInMinutes,
    });

    const from = getDefaultFromEmail();
    const adminEmail = getAdminNotificationEmail();

    const response = await resend.emails.send({
      from,
      to: [patientEmail],
      replyTo: adminEmail,
      subject,
      html,
      text,
    });

    if (response.error) {
      console.error(
        `[Email Service] Failed to send cancellation OTP to ${patientEmail}:`,
        response.error,
      );
      return { success: false, error: response.error.message };
    }

    return { success: true, emailId: response.data?.id };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error sending OTP email";
    return { success: false, error: errorMessage };
  }
}

/**
 * 4. User Cancellation Confirmed Email Service
 * Sends cancellation confirmation to the patient and alerts the admin inbox.
 */
export async function sendUserCancellationConfirmedEmail(params: {
  appointment: Pick<
    Appointment,
    | "referenceId"
    | "patientName"
    | "patientPhone"
    | "patientEmail"
    | "preferredDate"
    | "preferredTimeSlot"
    | "visitType"
  >;
  reason?: string;
}): Promise<EmailSendResult> {
  const { appointment, reason } = params;

  if (!appointment.patientEmail || !isValidEmail(appointment.patientEmail)) {
    return { success: false, error: "Invalid email address." };
  }

  const resend = getResendClient();
  if (!resend) {
    return { success: false, error: "RESEND_API_KEY is not configured." };
  }

  try {
    const { subject, html, text } = generateUserCancellationConfirmedEmail({
      patientName: appointment.patientName,
      referenceId: appointment.referenceId,
      preferredDate: appointment.preferredDate,
      preferredTimeSlot: appointment.preferredTimeSlot,
      visitType: appointment.visitType,
    });

    const from = getDefaultFromEmail();
    const adminEmail = getAdminNotificationEmail();

    // 1. Patient cancellation email
    const patientTask = resend.emails.send({
      from,
      to: [appointment.patientEmail],
      replyTo: adminEmail,
      subject,
      html,
      text,
    });

    // 2. Admin notification email
    const adminTask = resend.emails.send({
      from,
      to: [adminEmail],
      replyTo: appointment.patientEmail,
      subject: `🚨 Appointment Cancelled by Patient: ${appointment.patientName} (${appointment.referenceId})`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 20px; color: #1e293b; line-height: 1.6; max-width: 600px;">
          <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 8px; margin-top: 0;">
            Appointment Cancelled by Patient
          </h2>
          <p>The patient has verified OTP and self-cancelled their pending consultation.</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 14px;">
            <tr><td style="padding: 5px 0; color: #64748b; width: 140px;">Reference ID:</td><td style="font-family: monospace; font-weight: bold; color: #0f172a;">${appointment.referenceId}</td></tr>
            <tr><td style="padding: 5px 0; color: #64748b;">Patient:</td><td style="font-weight: 600;">${appointment.patientName}</td></tr>
            <tr><td style="padding: 5px 0; color: #64748b;">Mobile:</td><td>${appointment.patientPhone}</td></tr>
            <tr><td style="padding: 5px 0; color: #64748b;">Email:</td><td>${appointment.patientEmail}</td></tr>
            <tr><td style="padding: 5px 0; color: #64748b;">Original Slot:</td><td style="font-weight: 600;">${appointment.preferredDate} (${appointment.preferredTimeSlot})</td></tr>
            ${reason ? `<tr><td style="padding: 5px 0; color: #64748b;">Cancellation Reason:</td><td style="font-style: italic;">"${reason}"</td></tr>` : ""}
          </table>
          <p style="font-size: 12px; color: #64748b; margin-top: 16px;">
            This appointment has been atomically locked as user-cancelled and its time slot is released.
          </p>
        </div>
      `,
      text: `
APPOINTMENT CANCELLED BY PATIENT:
- Reference ID: ${appointment.referenceId}
- Patient: ${appointment.patientName}
- Phone: ${appointment.patientPhone}
- Email: ${appointment.patientEmail}
- Slot: ${appointment.preferredDate} (${appointment.preferredTimeSlot})
${reason ? `- Reason: ${reason}\n` : ""}
      `.trim(),
    });

    const [patientRes, adminRes] = await Promise.all([patientTask, adminTask]);

    if (patientRes.error) {
      console.error(
        `[Email Service] Error sending cancellation notice to ${appointment.patientEmail}:`,
        patientRes.error,
      );
    }
    if (adminRes.error) {
      console.error(
        `[Email Service] Error sending cancellation alert to admin ${adminEmail}:`,
        adminRes.error,
      );
    }

    return {
      success: !patientRes.error,
      emailId: patientRes.data?.id,
      error: patientRes.error?.message,
    };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown cancellation email error";
    return { success: false, error: errorMessage };
  }
}
