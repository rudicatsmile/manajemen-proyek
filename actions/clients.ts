"use server";

import { revalidatePath } from "next/cache";
import { Client } from "@/lib/mock-data";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { createActivityLog } from "@/lib/activity-logger";
import { sanitizeObject } from "@/lib/sanitize";
import { db } from "@/lib/db";
import { clients, projects } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  clientFormSchema,
  ClientFormValues,
  runtimeClients,
  runtimeProjects,
} from "@/lib/data-store";

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Aman jika dipanggil di luar request lifecycle
  }
}

function mapDbClient(row: typeof clients.$inferSelect, count = 0): Client {
  return {
    id: row.id,
    name: row.name,
    companyName: row.company || row.name,
    email: row.email || "",
    phone: row.phone || "",
    address: row.address || "",
    notes: row.notes || "",
    createdAt: row.createdAt ? row.createdAt.toISOString() : new Date().toISOString(),
    projectsCount: count,
  };
}

export async function getClientsAction(): Promise<Client[]> {
  try {
    if (process.env.DATABASE_URL) {
      const dbClients = await db.select().from(clients).orderBy(desc(clients.createdAt));
      const dbProjects = await db.select().from(projects);

      if (dbClients.length > 0) {
        return dbClients.map((c) => {
          const count = dbProjects.filter((p) => p.clientId === c.id).length;
          return mapDbClient(c, count);
        });
      }
    }
  } catch (err) {
    console.error("Error fetching clients from DB, falling back to runtime:", err);
  }

  // Fallback ke in-memory store
  return runtimeClients.map((client) => {
    const count = runtimeProjects.filter((p) => p.clientId === client.id).length;
    return {
      ...client,
      projectsCount: count,
    };
  });
}

export async function getClientByIdAction(id: string): Promise<Client | null> {
  try {
    if (process.env.DATABASE_URL) {
      const [found] = await db.select().from(clients).where(eq(clients.id, id));
      if (found) {
        const dbProjects = await db.select().from(projects).where(eq(projects.clientId, id));
        return mapDbClient(found, dbProjects.length);
      }
    }
  } catch (err) {
    console.error("Error fetching client by id from DB:", err);
  }

  const client = runtimeClients.find((c) => c.id === id);
  if (!client) return null;

  const count = runtimeProjects.filter((p) => p.clientId === client.id).length;
  return {
    ...client,
    projectsCount: count,
  };
}

export async function createClientAction(data: ClientFormValues) {
  const sanitized = sanitizeObject(data);
  const parsed = clientFormSchema.parse(sanitized);
  const currentUser = await getCurrentUser();

  let createdClient: Client;

  try {
    if (process.env.DATABASE_URL) {
      const [inserted] = await db
        .insert(clients)
        .values({
          name: parsed.name,
          company: parsed.companyName,
          email: parsed.email,
          phone: parsed.phone,
          address: parsed.address || null,
          notes: parsed.notes || null,
        })
        .returning();

      if (inserted) {
        createdClient = mapDbClient(inserted, 0);
      } else {
        throw new Error("Gagal menyimpan klien ke database.");
      }
    } else {
      throw new Error("DATABASE_URL tidak disetel");
    }
  } catch (err) {
    console.warn("DB insert client failed, using memory store:", err);
    createdClient = {
      id: `client-${Date.now()}`,
      name: parsed.name,
      companyName: parsed.companyName,
      email: parsed.email,
      phone: parsed.phone,
      address: parsed.address || "",
      notes: parsed.notes || "",
      createdAt: new Date().toISOString(),
      projectsCount: 0,
    };
    runtimeClients.unshift(createdClient);
  }

  await createActivityLog({
    memberId: currentUser.id,
    memberName: currentUser.name,
    action: "PROJECT_CREATED",
    details: `Menambahkan profil klien baru '${createdClient.companyName}' (PIC: ${createdClient.name})`,
  });

  safeRevalidate("/clients");
  safeRevalidate("/dashboard");
  safeRevalidate("/projects/new");
  return { success: true, client: createdClient };
}

export async function updateClientAction(id: string, data: ClientFormValues) {
  const sanitized = sanitizeObject(data);
  const parsed = clientFormSchema.parse(sanitized);
  const currentUser = await getCurrentUser();

  let updatedClient: Client;

  try {
    if (process.env.DATABASE_URL) {
      const [updated] = await db
        .update(clients)
        .set({
          name: parsed.name,
          company: parsed.companyName,
          email: parsed.email,
          phone: parsed.phone,
          address: parsed.address || null,
          notes: parsed.notes || null,
          updatedAt: new Date(),
        })
        .where(eq(clients.id, id))
        .returning();

      if (updated) {
        const dbProjects = await db.select().from(projects).where(eq(projects.clientId, id));
        updatedClient = mapDbClient(updated, dbProjects.length);
      } else {
        throw new Error("Klien tidak ditemukan di database.");
      }
    } else {
      throw new Error("DATABASE_URL tidak disetel");
    }
  } catch (err) {
    console.warn("DB update client failed, using memory store:", err);
    const index = runtimeClients.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error("Klien tidak ditemukan");
    }
    const prev = runtimeClients[index];
    updatedClient = {
      ...prev,
      name: parsed.name,
      companyName: parsed.companyName,
      email: parsed.email,
      phone: parsed.phone,
      address: parsed.address || "",
      notes: parsed.notes || "",
    };
    runtimeClients[index] = updatedClient;
  }

  await createActivityLog({
    memberId: currentUser.id,
    memberName: currentUser.name,
    action: "PROJECT_UPDATED",
    details: `Memperbarui data klien '${updatedClient.companyName}'`,
  });

  safeRevalidate("/clients");
  safeRevalidate(`/clients/${id}/edit`);
  safeRevalidate("/dashboard");
  return { success: true, client: updatedClient };
}

export async function deleteClientAction(id: string) {
  await requireAdmin();

  try {
    if (process.env.DATABASE_URL) {
      const connectedProjects = await db
        .select()
        .from(projects)
        .where(eq(projects.clientId, id));

      if (connectedProjects.length > 0) {
        throw new Error(
          `Tidak dapat menghapus klien karena masih terhubung dengan ${connectedProjects.length} proyek aktif.`
        );
      }

      await db.delete(clients).where(eq(clients.id, id));
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("masih terhubung")) {
      throw err;
    }
    console.warn("DB delete client failed or falling back to memory:", err);
    const connectedProjects = runtimeProjects.filter((p) => p.clientId === id);
    if (connectedProjects.length > 0) {
      throw new Error(
        `Tidak dapat menghapus klien karena masih terhubung dengan ${connectedProjects.length} proyek aktif.`
      );
    }
    const index = runtimeClients.findIndex((c) => c.id === id);
    if (index !== -1) {
      runtimeClients.splice(index, 1);
    }
  }

  const currentUser = await getCurrentUser();
  await createActivityLog({
    memberId: currentUser.id,
    memberName: currentUser.name,
    action: "PROJECT_DELETED",
    details: `Menghapus master data klien ID '${id}'`,
  });

  safeRevalidate("/clients");
  safeRevalidate("/dashboard");
  return { success: true };
}

