"use server";

import { revalidatePath } from "next/cache";
import { Client } from "@/lib/mock-data";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { createActivityLog } from "@/lib/activity-logger";
import { sanitizeObject } from "@/lib/sanitize";
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

export async function getClientsAction(): Promise<Client[]> {
  // Hitung ulang projectsCount berdasarkan runtimeProjects
  return runtimeClients.map((client) => {
    const count = runtimeProjects.filter((p) => p.clientId === client.id).length;
    return {
      ...client,
      projectsCount: count,
    };
  });
}

export async function getClientByIdAction(id: string): Promise<Client | null> {
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

  const newClient: Client = {
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

  runtimeClients.unshift(newClient);

  await createActivityLog({
    memberId: currentUser.id,
    memberName: currentUser.name,
    action: "PROJECT_CREATED",
    details: `Menambahkan profil klien baru '${newClient.companyName}' (PIC: ${newClient.name})`,
  });

  safeRevalidate("/clients");
  safeRevalidate("/dashboard");
  safeRevalidate("/projects/new");
  return { success: true, client: newClient };
}

export async function updateClientAction(id: string, data: ClientFormValues) {
  const sanitized = sanitizeObject(data);
  const parsed = clientFormSchema.parse(sanitized);
  const currentUser = await getCurrentUser();

  const index = runtimeClients.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error("Klien tidak ditemukan");
  }

  const prev = runtimeClients[index];
  const updatedClient: Client = {
    ...prev,
    name: parsed.name,
    companyName: parsed.companyName,
    email: parsed.email,
    phone: parsed.phone,
    address: parsed.address || "",
    notes: parsed.notes || "",
  };

  runtimeClients[index] = updatedClient;

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
  // Hanya Admin yang berhak menghapus klien
  await requireAdmin();

  // Aturan Task 2.6: Cek apakah klien masih digunakan proyek
  const connectedProjects = runtimeProjects.filter((p) => p.clientId === id);
  if (connectedProjects.length > 0) {
    throw new Error(
      `Tidak dapat menghapus klien karena masih terhubung dengan ${connectedProjects.length} proyek aktif.`
    );
  }

  const index = runtimeClients.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error("Klien tidak ditemukan");
  }

  const currentUser = await getCurrentUser();
  const removed = runtimeClients.splice(index, 1)[0];

  await createActivityLog({
    memberId: currentUser.id,
    memberName: currentUser.name,
    action: "PROJECT_DELETED",
    details: `Menghapus master data klien '${removed.companyName}'`,
  });

  safeRevalidate("/clients");
  safeRevalidate("/dashboard");
  return { success: true };
}
