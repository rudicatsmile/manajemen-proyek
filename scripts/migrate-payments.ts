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
  console.log("Running migration for project payments and contract amount...");

  // 1. Add contract_amount to projects table
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS contract_amount NUMERIC;`;
  console.log("Column contract_amount added/verified on projects table.");

  // 2. Create project_payments table if not exists
  await sql`
    CREATE TABLE IF NOT EXISTS project_payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      amount NUMERIC NOT NULL,
      payment_date TIMESTAMP NOT NULL DEFAULT NOW(),
      note TEXT,
      recorded_by_id UUID REFERENCES members(id) ON DELETE SET NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;
  console.log("Table project_payments created/verified.");

  // 3. Create index on project_payments.project_id
  await sql`
    CREATE INDEX IF NOT EXISTS project_payments_project_idx ON project_payments (project_id);
  `;
  console.log("Index project_payments_project_idx created/verified.");

  console.log("Financial migration completed successfully!");
}

main().catch((err) => {
  console.error("Financial migration failed:", err);
  process.exit(1);
});
