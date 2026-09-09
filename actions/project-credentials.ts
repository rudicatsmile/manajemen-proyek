"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { projects, projectCredentials } from "@/lib/db/schema";
import { encryptCredential } from "@/lib/crypto";
import { getCurrentUser } from "@/lib/auth";
import { createActivityLog } from "@/lib/activity-logger";
import { eq, and, or } from "drizzle-orm";
import { runtimeProjects } from "@/lib/data-store";

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Safe outside request lifecycle
  }
}

export interface CredentialActionInput {
  projectId: string;
  name: string;
  type?: string;
  host?: string;
  port?: string;
  username: string;
  password?: string;
  notes?: string;
}

export async function addProjectCredentialAction(data: CredentialActionInput) {
  const currentUser = await getCurrentUser();
  const enc = data.password ? encryptCredential(data.password) : { encrypted: "", iv: "" };

  try {
    if (process.env.DATABASE_URL) {
      // Find project by id or slug
      const proj = await db.query.projects.findFirst({
        where: or(eq(projects.id, data.projectId), eq(projects.slug, data.projectId)),
      });

      if (!proj) {
        throw new Error("Proyek tidak ditemukan.");
      }

      const [inserted] = await db
        .insert(projectCredentials)
        .values({
          projectId: proj.id,
          name: data.name,
          type: data.type || "other",
          host: data.host || null,
          port: data.port || null,
          username: data.username,
          password: enc.encrypted,
          iv: enc.iv,
          notes: data.notes || null,
        })
        .returning();

      await createActivityLog({
        memberId: currentUser.id,
        memberName: currentUser.name,
        projectId: proj.id,
        projectName: proj.name,
        action: "PROJECT_UPDATED",
        details: `Menambahkan kredensial server '${data.name}'`,
      });

      safeRevalidate(`/projects/${proj.id}`);
      safeRevalidate("/projects");
      return { success: true, credentialId: inserted.id };
    }
  } catch (err: unknown) {
    console.warn("DB add credential failed, using memory store:", err);
  }

  // Memory store fallback
  const projIndex = runtimeProjects.findIndex(
    (p) => p.id === data.projectId
  );
  if (projIndex !== -1) {
    const proj = runtimeProjects[projIndex];
    const newCred = {
      id: `cred-${Date.now()}`,
      projectId: proj.id,
      name: data.name,
      type: data.type || "other",
      host: data.host,
      port: data.port,
      username: data.username,
      passwordPlain: data.password || "",
      passwordEncrypted: enc.encrypted ? `enc_${enc.encrypted.slice(0, 16)}_gcm` : "",
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!proj.credentials) proj.credentials = [];
    proj.credentials.push(newCred);
  }

  safeRevalidate(`/projects/${data.projectId}`);
  safeRevalidate("/projects");
  return { success: true };
}

export async function updateProjectCredentialAction(
  credentialId: string,
  data: Partial<CredentialActionInput> & { projectId: string }
) {
  const currentUser = await getCurrentUser();

  try {
    if (process.env.DATABASE_URL) {
      const proj = await db.query.projects.findFirst({
        where: or(eq(projects.id, data.projectId), eq(projects.slug, data.projectId)),
      });

      if (!proj) {
        throw new Error("Proyek tidak ditemukan.");
      }

      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (data.name !== undefined) updateData.name = data.name;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.host !== undefined) updateData.host = data.host || null;
      if (data.port !== undefined) updateData.port = data.port || null;
      if (data.username !== undefined) updateData.username = data.username;
      if (data.notes !== undefined) updateData.notes = data.notes || null;

      if (data.password && data.password.trim()) {
        const enc = encryptCredential(data.password);
        updateData.password = enc.encrypted;
        updateData.iv = enc.iv;
      }

      await db
        .update(projectCredentials)
        .set(updateData)
        .where(
          and(
            eq(projectCredentials.id, credentialId),
            eq(projectCredentials.projectId, proj.id)
          )
        );

      await createActivityLog({
        memberId: currentUser.id,
        memberName: currentUser.name,
        projectId: proj.id,
        projectName: proj.name,
        action: "PROJECT_UPDATED",
        details: `Memperbarui kredensial server '${data.name || "kredensial"}'`,
      });

      safeRevalidate(`/projects/${proj.id}`);
      safeRevalidate("/projects");
      return { success: true };
    }
  } catch (err: unknown) {
    console.warn("DB update credential failed, using memory store:", err);
  }

  // Memory store fallback
  const proj = runtimeProjects.find((p) => p.id === data.projectId);
  if (proj && proj.credentials) {
    const cred = proj.credentials.find((c) => c.id === credentialId);
    if (cred) {
      if (data.name) cred.name = data.name;
      if (data.type) cred.type = data.type;
      if (data.host !== undefined) cred.host = data.host;
      if (data.port !== undefined) cred.port = data.port;
      if (data.username) cred.username = data.username;
      if (data.password) {
        cred.passwordPlain = data.password;
        const enc = encryptCredential(data.password);
        cred.passwordEncrypted = `enc_${enc.encrypted.slice(0, 16)}_gcm`;
      }
      if (data.notes !== undefined) cred.notes = data.notes;
    }
  }

  safeRevalidate(`/projects/${data.projectId}`);
  safeRevalidate("/projects");
  return { success: true };
}

export async function deleteProjectCredentialAction(
  projectId: string,
  credentialId: string
) {
  const currentUser = await getCurrentUser();

  try {
    if (process.env.DATABASE_URL) {
      const proj = await db.query.projects.findFirst({
        where: or(eq(projects.id, projectId), eq(projects.slug, projectId)),
      });

      if (!proj) {
        throw new Error("Proyek tidak ditemukan.");
      }

      await db
        .delete(projectCredentials)
        .where(
          and(
            eq(projectCredentials.id, credentialId),
            eq(projectCredentials.projectId, proj.id)
          )
        );

      await createActivityLog({
        memberId: currentUser.id,
        memberName: currentUser.name,
        projectId: proj.id,
        projectName: proj.name,
        action: "PROJECT_UPDATED",
        details: `Menghapus salah satu kredensial server`,
      });

      safeRevalidate(`/projects/${proj.id}`);
      safeRevalidate("/projects");
      return { success: true };
    }
  } catch (err: unknown) {
    console.warn("DB delete credential failed, using memory store:", err);
  }

  // Memory store fallback
  const proj = runtimeProjects.find((p) => p.id === projectId);
  if (proj && proj.credentials) {
    proj.credentials = proj.credentials.filter((c) => c.id !== credentialId);
  }

  safeRevalidate(`/projects/${projectId}`);
  safeRevalidate("/projects");
  return { success: true };
}
