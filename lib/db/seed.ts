import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./index";
import {
  members,
  clients,
  projects,
  projectMembers,
  projectNotes,
  activityLogs,
} from "./schema";
import { encryptCredential } from "../crypto";

export async function seedDatabase() {
  console.log("Memulai proses seeding database Neon PostgreSQL...");

  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || "admin@projectku.id";

  // 1. Seed Admin & Tim Utama
  console.log("1. Seeding data members...");
  const [admin] = await db
    .insert(members)
    .values({
      clerkId: "user_seed_admin_01",
      name: "Budi Pratama",
      email: adminEmail,
      role: "admin",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    })
    .onConflictDoNothing()
    .returning();

  const [dev1] = await db
    .insert(members)
    .values({
      clerkId: "user_seed_dev_02",
      name: "Siti Rahmawati",
      email: "siti.rahma@projectku.id",
      role: "member",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    })
    .onConflictDoNothing()
    .returning();

  // 2. Seed Klien
  console.log("2. Seeding master data klien...");
  const [client1] = await db
    .insert(clients)
    .values({
      name: "Hendra Wijaya",
      company: "Pemerintah Desa Sukamaju",
      email: "kontak@desasukamaju.id",
      phone: "081234567890",
      address: "Jl. Raya Sukamaju No. 12, Jawa Barat",
      notes: "Proyek digitalisasi layanan administrasi desa",
    })
    .returning();

  // 3. Seed Proyek & Kredensial Terenkripsi
  console.log("3. Seeding data proyek dengan kredensial terenkripsi AES-256-GCM...");
  const encResult = encryptCredential("RahasiaSukamaju2026!");

  const [project1] = await db
    .insert(projects)
    .values({
      name: "Sistem Informasi Desa (SI-Desa)",
      slug: "sistem-informasi-desa-si-desa",
      description:
        "Platform digital terpadu untuk pelayanan administrasi surat menyurat dan sensus penduduk desa.",
      clientId: client1.id,
      status: "in_progress",
      frontendTech: "Next.js, TypeScript, Tailwind CSS",
      backendTech: "NestJS, REST API",
      databaseTech: "PostgreSQL",
      repositoryUrl: "https://github.com/eduwbemu/si-desa",
      credentialUsername: "admin_sidesa",
      credentialPassword: encResult.encrypted,
      credentialIv: encResult.iv,
      createdById: admin.id,
    })
    .returning();

  // 4. Seed Anggota Proyek
  console.log("4. Seeding penugasan anggota proyek...");
  await db
    .insert(projectMembers)
    .values({
      projectId: project1.id,
      memberId: admin.id,
      role: "project_manager",
      assignedBy: admin.id,
    });

  if (dev1) {
    await db
      .insert(projectMembers)
      .values({
        projectId: project1.id,
        memberId: dev1.id,
        role: "frontend",
        assignedBy: admin.id,
      });
  }

  // 5. Seed Catatan Proyek
  console.log("5. Seeding catatan proyek...");
  await db
    .insert(projectNotes)
    .values({
      projectId: project1.id,
      authorId: admin.id,
      content:
        "Menunggu konfirmasi final mengenai format surat pengantar dari pihak kepala desa.",
      pinned: true,
    });

  // 6. Seed Log Aktivitas
  console.log("6. Seeding log aktivitas audit trail...");
  await db
    .insert(activityLogs)
    .values({
      projectId: project1.id,
      actorId: admin.id,
      action: "PROJECT_CREATED",
      entityType: "project",
      metadata: {
        projectName: project1.name,
        clientCompany: client1.company,
      },
    });

  console.log("Proses seeding database selesai dengan sukses!");
}

// Menjalankan langsung jika dipanggil via script
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Gagal melakukan seeding:", err);
      process.exit(1);
    });
}
