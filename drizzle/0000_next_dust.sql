CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference_id" varchar(30) NOT NULL,
	"patient_name" varchar(150) NOT NULL,
	"patient_phone" varchar(25) NOT NULL,
	"patient_email" varchar(255) NOT NULL,
	"visit_type" varchar(100) NOT NULL,
	"preferred_date" date NOT NULL,
	"preferred_time_slot" varchar(100) NOT NULL,
	"notes" text,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"token_number" varchar(50),
	"doctor_notes" text,
	"source" varchar(50) DEFAULT 'website' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "appointments_reference_id_unique" UNIQUE("reference_id")
);
--> statement-breakpoint
CREATE TABLE "clinic_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clinic_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE INDEX "appointments_phone_idx" ON "appointments" USING btree ("patient_phone");--> statement-breakpoint
CREATE INDEX "appointments_preferred_date_idx" ON "appointments" USING btree ("preferred_date");--> statement-breakpoint
CREATE INDEX "appointments_status_idx" ON "appointments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "appointments_created_at_idx" ON "appointments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "appointments_reference_idx" ON "appointments" USING btree ("reference_id");