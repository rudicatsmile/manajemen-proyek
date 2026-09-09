import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not defined in .env.local");
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  console.log("Running migration for live URL and health check monitoring columns...");

  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS live_url TEXT;`;
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS last_health_status TEXT;`;
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS last_http_code TEXT;`;
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS last_response_time TEXT;`;
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS ssl_status TEXT;`;
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS ssl_expires_at TIMESTAMP;`;
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMP;`;

  console.log("Health check monitoring columns added successfully to projects table!");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
