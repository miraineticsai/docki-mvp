import { z } from "zod";

/**
 * Validation schema for admin login.
 */
export const adminLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required." })
    .email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(1, { message: "Password is required." })
    .max(100, { message: "Password cannot exceed 100 characters." }),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

/**
 * Validation schema for updating appointment status & clinical notes.
 */
export const updateAppointmentStatusSchema = z.object({
  referenceId: z
    .string()
    .trim()
    .min(1, { message: "Reference ID is required." }),
  status: z.enum(
    ["pending", "confirmed", "completed", "cancelled", "rejected"],
    {
      message: "Invalid status value.",
    },
  ),
  tokenNumber: z
    .string()
    .trim()
    .max(50, { message: "Token number cannot exceed 50 characters." })
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  doctorNotes: z
    .string()
    .trim()
    .max(2000, { message: "Doctor notes cannot exceed 2000 characters." })
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
});

export type UpdateAppointmentStatusInput = z.infer<
  typeof updateAppointmentStatusSchema
>;
