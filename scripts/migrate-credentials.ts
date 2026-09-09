import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not defined in .env.local");
    process.exit(1);
  }

  console.log("Connecting to Neon PostgreSQL...");
  const sql = neon(databaseUrl);

  console.log("Creating table 'project_credentials' if not exists...");
  await sql`
    CREATE TABLE IF NOT EXISTS project_credentials (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'other',
      host TEXT,
      port TEXT,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      iv TEXT NOT NULL,
      notes TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS project_credentials_project_idx ON project_credentials(project_id);
  `;

  console.log("Checking for existing project credentials in 'projects' table to migrate...");
  const existingProjects = await sql`
    SELECT id, name, credential_username, credential_password, credential_iv
    FROM projects
    WHERE credential_username IS NOT NULL AND credential_username != '';
  `;

  console.log(`Found ${existingProjects.length} project(s) with old credentials.`);

  for (const proj of existingProjects) {
    // Check if project already has entries in project_credentials
    const credCount = await sql`
      SELECT COUNT(*) as count FROM project_credentials WHERE project_id = ${proj.id};
    `;

    if (Number(credCount[0].count) === 0 && proj.credential_password && proj.credential_iv) {
      console.log(`Migrating credential for project: ${proj.name} (${proj.id})`);
      await sql`
        INSERT INTO project_credentials (
          project_id,
          name,
          type,
          username,
          password,
          iv,
          notes
        ) VALUES (
          ${proj.id},
          'Server Utama (Default)',
          'vps',
          ${proj.credential_username},
          ${proj.credential_password},
          ${proj.credential_iv},
          'Dimigrasi otomatis dari kredensial awal proyek'
        );
      `;
      console.log(`✓ Migrated credential for ${proj.name}`);
    } else {
      console.log(`Skipping project ${proj.name}, already has credentials or incomplete fields.`);
    }
  }

  console.log("Migration completed successfully!");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
