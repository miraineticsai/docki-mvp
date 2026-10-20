import { sql } from "drizzle-orm";
import {
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * Appointments Table
 * Stores patient appointment requests with "pending" status by default.
 * Includes fields designed for future admin triage, token assignment,
 * and n8n / chatbot automation payloads.
 */
export const appointments = pgTable(
  "appointments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    referenceId: varchar("reference_id", { length: 30 }).notNull().unique(),
    patientName: varchar("patient_name", { length: 150 }).notNull(),
    patientPhone: varchar("patient_phone", { length: 25 }).notNull(),
    patientEmail: varchar("patient_email", { length: 255 }).notNull(),
    visitType: varchar("visit_type", { length: 100 }).notNull(),
    preferredDate: date("preferred_date").notNull(),
    preferredTimeSlot: varchar("preferred_time_slot", {
      length: 100,
    }).notNull(),
    notes: text("notes"),
    status: varchar("status", { length: 30 }).default("pending").notNull(), // pending | confirmed | completed | cancelled | rescheduled
    tokenNumber: varchar("token_number", { length: 50 }), // Assigned by doctor or reception
    doctorNotes: text("doctor_notes"), // Internal clinical or triage notes
    source: varchar("source", { length: 50 }).default("website").notNull(), // website | whatsapp | chatbot | phone | reception
    metadata: jsonb("metadata").default({}), // Extensible JSON for n8n automation, client IP, webhooks
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("appointments_phone_idx").on(table.patientPhone),
    index("appointments_preferred_date_idx").on(table.preferredDate),
    index("appointments_status_idx").on(table.status),
    index("appointments_created_at_idx").on(table.createdAt),
    index("appointments_reference_idx").on(table.referenceId),
    uniqueIndex("appointments_active_slot_idx")
      .on(table.preferredDate, table.preferredTimeSlot)
      .where(sql`status IN ('pending', 'confirmed')`),
  ],
);

/**
 * Clinic Settings Table
 * Dynamic configuration for clinic operating hours, token limits,
 * doctor vacation dates, and emergency banners.
 */
export const clinicSettings = pgTable("clinic_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: jsonb("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
export type ClinicSetting = typeof clinicSettings.$inferSelect;
export type NewClinicSetting = typeof clinicSettings.$inferInsert;

/**
 * Cancellation Requests Table
 * Secure storage for OTP hashes, session verification tokens, and rate-limiting metrics.
 */
export const cancellationRequests = pgTable(
  "cancellation_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    referenceId: varchar("reference_id", { length: 30 }).notNull(),
    otpHash: text("otp_hash").notNull(),
    sessionToken: varchar("session_token", { length: 64 }).unique(),
    attempts: integer("attempts").default(0).notNull(),
    maxAttempts: integer("max_attempts").default(5).notNull(),
    resendCooldownUntil: timestamp("resend_cooldown_until", {
      withTimezone: true,
    }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    usedAt: timestamp("used_at", { withTimezone: true }),
    ipAddress: varchar("ip_address", { length: 45 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("cancellation_requests_reference_idx").on(table.referenceId),
    index("cancellation_requests_session_idx").on(table.sessionToken),
    index("cancellation_requests_created_idx").on(table.createdAt),
  ],
);

export type CancellationRequest = typeof cancellationRequests.$inferSelect;
export type NewCancellationRequest = typeof cancellationRequests.$inferInsert;
