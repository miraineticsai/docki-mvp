# Database Guide — Drizzle ORM + Neon PostgreSQL

This project uses **Drizzle ORM** with **Neon PostgreSQL** as the database backend.  
Everything is strictly server-side. The database URL is never exposed to the browser.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [First-Time Setup](#2-first-time-setup)
3. [Schema — Understanding the Tables](#3-schema--understanding-the-tables)
4. [Drizzle CLI Commands](#4-drizzle-cli-commands)
5. [How to Query the Database](#5-how-to-query-the-database)
6. [How to Write Data](#6-how-to-write-data)
7. [How to Update & Delete](#7-how-to-update--delete)
8. [Using in Server Actions](#8-using-in-server-actions)
9. [Using in API Routes](#9-using-in-api-routes)
10. [Adding a New Table](#10-adding-a-new-table)
11. [Common Patterns](#11-common-patterns)
12. [Rules — What NOT to Do](#12-rules--what-not-to-do)

---

## 1. Project Structure

```
docki/
├── db/
│   ├── index.ts          ← DB client (import `db` from here)
│   └── schema.ts         ← All table definitions + exported types
├── drizzle/
│   └── 0000_*.sql        ← Auto-generated SQL migration files
├── drizzle.config.ts     ← Drizzle Kit config (points to schema + Neon)
├── actions/
│   └── appointments.ts   ← Server Actions that use the DB
├── app/api/
│   └── appointments/
│       └── route.ts      ← API Route that uses the DB
└── lib/validations/
    └── appointment.ts    ← Zod schema for input validation
```

---

## 2. First-Time Setup

### Step 1 — Create a Neon Project

1. Go to [neon.tech](https://neon.tech) and create a free project.
2. Open your project → **Connection Details** tab.
3. Toggle to **"Pooled connection"** ← required for serverless (Next.js).
4. Copy the connection string:
   ```
   postgresql://user:password@ep-xxx-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```

### Step 2 — Configure Environment

Create a `.env` file in the project root:

```bash
# .env
DATABASE_URL=postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
```

> **Important:** Never commit `.env` — it is in `.gitignore`.  
> Use `.env.example` as the reference template.

### Step 3 — Push Schema to Neon

Run this once to create the tables in your Neon database:

```bash
pnpm db:push
```

That's it. Your database is ready.

---

## 3. Schema — Understanding the Tables

All tables are defined in [`db/schema.ts`](../db/schema.ts).

### `appointments` table

Stores every patient appointment request submitted via the website form.

| Column              | Type        | Description                                          |
| :------------------ | :---------- | :--------------------------------------------------- |
| `id`                | `uuid`      | Auto-generated primary key                           |
| `referenceId`       | `varchar`   | Human-readable ID e.g. `APT-20261015-8F3A` (unique) |
| `patientName`       | `varchar`   | Patient's full name                                  |
| `patientPhone`      | `varchar`   | Cleaned phone number (no spaces/dashes)              |
| `patientEmail`      | `varchar`   | Patient's email address                              |
| `visitType`         | `varchar`   | Type of consultation                                 |
| `preferredDate`     | `date`      | Requested date `YYYY-MM-DD`                          |
| `preferredTimeSlot` | `varchar`   | Morning / Evening / Flexible                         |
| `notes`             | `text`      | Optional patient notes (nullable)                    |
| `status`            | `varchar`   | `pending` → `confirmed` → `completed`                |
| `tokenNumber`       | `varchar`   | OPD token (assigned by reception, nullable)          |
| `doctorNotes`       | `text`      | Internal clinical notes (nullable)                   |
| `source`            | `varchar`   | `website` / `whatsapp` / `chatbot` / `phone`         |
| `metadata`          | `jsonb`     | Extensible JSON for automation payloads              |
| `createdAt`         | `timestamp` | Auto-set on insert                                   |
| `updatedAt`         | `timestamp` | Auto-set on insert (update via your code)            |

**Indexes:** `patientPhone`, `preferredDate`, `status`, `createdAt`, `referenceId`

---

### `clinic_settings` table

Key-value store for dynamic clinic configuration.

| Column        | Type        | Description                              |
| :------------ | :---------- | :--------------------------------------- |
| `id`          | `uuid`      | Primary key                              |
| `key`         | `varchar`   | Setting name e.g. `max_daily_tokens`     |
| `value`       | `jsonb`     | Any JSON value                           |
| `description` | `text`      | Human-readable description (nullable)    |
| `updatedAt`   | `timestamp` | Auto-set on insert                       |

**Example entries:**

```json
{ "key": "max_daily_tokens", "value": 30 }
{ "key": "doctor_on_leave", "value": ["2026-12-25", "2026-12-26"] }
{ "key": "emergency_banner", "value": "Clinic closed today. Call 108." }
```

---

## 4. Drizzle CLI Commands

| Command            | What it does                                                    |
| :----------------- | :-------------------------------------------------------------- |
| `pnpm db:push`     | Sync your schema directly to Neon (**use during development**)  |
| `pnpm db:generate` | Generate SQL migration files from schema changes                |
| `pnpm db:studio`   | Open Drizzle Studio — visual table browser at `localhost:4983`  |

> **Tip:** Use `db:push` while developing locally. Use `db:generate` when you need versioned migration files for production deployments.

---

## 5. How to Query the Database

Always import `db` and your table from the right place:

```ts
import { db } from "@/db";
import { appointments, clinicSettings } from "@/db/schema";
```

### Fetch all appointments

```ts
const all = await db.select().from(appointments);
```

### Fetch specific columns only

```ts
const list = await db
  .select({
    referenceId: appointments.referenceId,
    patientName: appointments.patientName,
    status: appointments.status,
  })
  .from(appointments);
```

### Fetch by a condition

```ts
import { eq } from "drizzle-orm";

const result = await db
  .select()
  .from(appointments)
  .where(eq(appointments.status, "pending"));
```

### Fetch one row by reference ID

```ts
import { eq } from "drizzle-orm";

const appt = await db.query.appointments.findFirst({
  where: eq(appointments.referenceId, "APT-20261015-8F3A"),
});
```

### Multiple conditions (AND)

```ts
import { and, eq, gte } from "drizzle-orm";

const recent = await db
  .select()
  .from(appointments)
  .where(
    and(
      eq(appointments.patientPhone, "9876543210"),
      eq(appointments.preferredDate, "2026-10-20"),
      gte(appointments.createdAt, new Date(Date.now() - 15 * 60 * 1000)),
    ),
  )
  .limit(1);
```

### Order and limit

```ts
import { desc } from "drizzle-orm";

const latest = await db
  .select()
  .from(appointments)
  .orderBy(desc(appointments.createdAt))
  .limit(10);
```

---

## 6. How to Write Data

### Insert a new appointment

```ts
await db.insert(appointments).values({
  referenceId: "APT-20261015-ABCD",
  patientName: "Rohan Deshmukh",
  patientPhone: "9876543210",
  patientEmail: "rohan@example.com",
  visitType: "General Consultation",
  preferredDate: "2026-10-20",
  preferredTimeSlot: "Morning",
  status: "pending",
  source: "website",
});
```

### Insert and get the created row back

```ts
const [created] = await db
  .insert(appointments)
  .values({ ... })
  .returning();

console.log(created.id, created.referenceId);
```

### Insert a clinic setting

```ts
await db.insert(clinicSettings).values({
  key: "max_daily_tokens",
  value: 30,
  description: "Maximum OPD tokens per day",
});
```

---

## 7. How to Update & Delete

### Update appointment status

```ts
import { eq } from "drizzle-orm";

await db
  .update(appointments)
  .set({ status: "confirmed", tokenNumber: "T-007" })
  .where(eq(appointments.referenceId, "APT-20261015-8F3A"));
```

### Update with timestamp

```ts
await db
  .update(appointments)
  .set({
    status: "completed",
    doctorNotes: "BP normal, advised dietary changes.",
    updatedAt: new Date(),
  })
  .where(eq(appointments.id, "some-uuid-here"));
```

### Delete a record

```ts
import { eq } from "drizzle-orm";

await db
  .delete(appointments)
  .where(eq(appointments.referenceId, "APT-20261015-8F3A"));
```

---

## 8. Using in Server Actions

Server Actions run on the server only — safe to use `db` directly here.

```ts
// actions/appointments.ts
"use server";

import { db } from "@/db";
import { appointments } from "@/db/schema";

export async function confirmAppointment(referenceId: string) {
  await db
    .update(appointments)
    .set({ status: "confirmed", updatedAt: new Date() })
    .where(eq(appointments.referenceId, referenceId));

  return { success: true };
}
```

Call from a Client Component:

```tsx
// app/admin/page.tsx (Client Component)
"use client";
import { confirmAppointment } from "@/actions/appointments";

<button onClick={() => confirmAppointment("APT-20261015-8F3A")}>
  Confirm
</button>
```

---

## 9. Using in API Routes

API Routes are server-side — safe to use `db` here too.

```ts
// app/api/appointments/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { appointments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const pending = await db
    .select()
    .from(appointments)
    .where(eq(appointments.status, "pending"))
    .orderBy(desc(appointments.createdAt));

  return NextResponse.json({ appointments: pending });
}
```

---

## 10. Adding a New Table

### Step 1 — Define the table in `db/schema.ts`

```ts
// db/schema.ts
import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const patients = pgTable("patients", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  phone: varchar("phone", { length: 25 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Always export the inferred types
export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;
```

### Step 2 — Push to Neon

```bash
pnpm db:push
```

That's it! The table is live in your Neon database.

### Step 3 — Use it

```ts
import { db } from "@/db";
import { patients } from "@/db/schema";

const all = await db.select().from(patients);
```

---

## 11. Common Patterns

### Count rows

```ts
import { count } from "drizzle-orm";

const [{ total }] = await db.select({ total: count() }).from(appointments);
console.log("Total appointments:", total);
```

### Check if a record exists

```ts
const exists = await db.query.appointments.findFirst({
  where: eq(appointments.referenceId, "APT-20261015-8F3A"),
});

if (!exists) {
  return { error: "Appointment not found" };
}
```

### Fetch a clinic setting value

```ts
const setting = await db.query.clinicSettings.findFirst({
  where: eq(clinicSettings.key, "max_daily_tokens"),
});

const maxTokens = (setting?.value as number) ?? 30;
```

### Available filter operators

| Operator    | Meaning                              |
| :---------- | :----------------------------------- |
| `eq(a, b)`  | `a = b`                              |
| `ne(a, b)`  | `a != b`                             |
| `gt(a, b)`  | `a > b`                              |
| `gte(a, b)` | `a >= b`                             |
| `lt(a, b)`  | `a < b`                              |
| `lte(a, b)` | `a <= b`                             |
| `like(a,b)` | `a LIKE b` (use `%` wildcards)       |
| `and(...)`  | Combine conditions with AND          |
| `or(...)`   | Combine conditions with OR           |
| `not(...)`  | Negate a condition                   |
| `isNull(a)` | `a IS NULL`                          |
| `inArray(a, [])` | `a IN (...)` — match a list    |

Import all from `"drizzle-orm"`.

---

## 12. Rules — What NOT to Do

| ❌ Never do this                                      | ✅ Do this instead                                      |
| :--------------------------------------------------- | :------------------------------------------------------ |
| Import `db` in a Client Component (`"use client"`)   | Use Server Actions or API Routes                        |
| Put `DATABASE_URL` in `NEXT_PUBLIC_*` variables      | Keep it in `.env` — server-side only                   |
| Write raw SQL strings                                | Use Drizzle's typed query builder                       |
| Skip Zod validation before inserting user data       | Always validate with `appointmentSubmissionSchema` first|
| Edit migration files in `drizzle/` manually          | Edit `schema.ts` → run `pnpm db:push` or `db:generate` |
| Run `db:push` in production without testing locally  | Test locally first, use migrations for production       |

---

## Quick Reference Card

```bash
# Setup
cp .env.example .env          # Copy env template
# Edit .env with your Neon DATABASE_URL
pnpm db:push                  # Create tables in Neon

# Development
pnpm db:studio                # Visual DB browser at localhost:4983
pnpm db:generate              # Generate SQL migration files
pnpm db:push                  # Sync schema changes to Neon

# In code — always import from here:
import { db } from "@/db";
import { appointments, clinicSettings } from "@/db/schema";
import { type Appointment, type NewAppointment } from "@/db/schema";
```

---

*This project is built for Dr. Rajesh Kulkarni's clinic — Aura Clinic & Family Healthcare, Dhankawadi, Pune.*
