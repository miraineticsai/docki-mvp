import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Server-side PostgreSQL connection for Neon via Drizzle ORM.
 * Keep DATABASE_URL in server environment variables only — never expose it client-side.
 */
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:dummy@localhost:5432/dummy";

// Prevent multiple connection pools during Next.js hot reloads in development
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const client =
  globalForDb.conn ??
  postgres(connectionString, {
    prepare: false, // Required for Neon's pooled connections (PgBouncer)
    max: process.env.NODE_ENV === "production" ? 10 : 2,
    idle_timeout: 20,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = client;
}

export const db = drizzle(client, { schema });
export { schema };
