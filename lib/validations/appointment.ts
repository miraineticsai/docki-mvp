import { z } from "zod";

/**
 * Zod validation schema for patient appointment submissions.
 * Supports both Indian standard 10-digit mobile numbers and international numbers.
 */
export const appointmentSubmissionSchema = z.object({
  patientName: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters." })
    .max(100, { message: "Name cannot exceed 100 characters." }),

  patientPhone: z
    .string()
    .trim()
    .min(10, {
      message: "Please enter a valid phone number (at least 10 digits).",
    })
    .max(20, { message: "Phone number cannot exceed 20 characters." })
    .regex(/^[+]?[0-9\s\-()]{10,20}$/, {
      message:
        "Please enter a valid mobile number (e.g. 98220 12345 or +91 98220 12345).",
    }),

  patientEmail: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address." })
    .max(255, { message: "Email cannot exceed 255 characters." }),

  visitType: z
    .string()
    .trim()
    .min(2, { message: "Please select a reason for your visit." })
    .max(100),

  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Preferred date must be in YYYY-MM-DD format.",
  }),

  preferredTimeSlot: z
    .string()
    .trim()
    .min(2, { message: "Please select your preferred time window." })
    .max(100),

  notes: z
    .string()
    .trim()
    .max(500, { message: "Notes cannot exceed 500 characters." })
    .optional()
    .or(z.literal("")),
});

export type AppointmentSubmissionInput = z.infer<
  typeof appointmentSubmissionSchema
>;

export interface AppointmentActionResponse {
  success: boolean;
  message: string;
  referenceId?: string;
  fieldErrors?: Record<string, string>;
  isDuplicate?: boolean;
}
