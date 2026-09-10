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
  console.log("Running migration for project order column...");

  // 1. Add order to projects table
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;`;
  console.log("Column 'order' added/verified on projects table.");

  // 2. Add index on projects.order
  await sql`CREATE INDEX IF NOT EXISTS projects_order_idx ON projects ("order");`;
  console.log("Index projects_order_idx created/verified.");

  console.log("Order migration completed successfully!");
}

main().catch((err) => {
  console.error("Order migration failed:", err);
  process.exit(1);
});
