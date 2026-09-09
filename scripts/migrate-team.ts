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
  console.log("Adding specialization column to members table if not exists...");
  await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS specialization TEXT;`;
  console.log("Column specialization added/verified successfully!");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
