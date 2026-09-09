"use server";

import { revalidatePath } from "next/cache";
import { INITIAL_CLIENTS, Project } from "@/lib/mock-data";
import { getCurrentUser } from "@/lib/auth";
import { createActivityLog } from "@/lib/activity-logger";
import { encryptCredential } from "@/lib/crypto";
import { getGitHubRepoDetails } from "@/lib/github";
import { sanitizeObject } from "@/lib/sanitize";
import {
  projectFormSchema,
  ProjectFormValues,
  runtimeProjects,
} from "@/lib/data-store";

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Aman jika di luar request lifecycle
  }
}

export async function getProjectsAction(): Promise<Project[]> {
  return runtimeProjects;
}

export async function getProjectByIdAction(id: string): Promise<Project | null> {
  const project = runtimeProjects.find((p) => p.id === id);
  return project || null;
}

export async function createProjectAction(data: ProjectFormValues) {
  const sanitized = sanitizeObject(data);
  const parsed = projectFormSchema.parse(sanitized);
  const currentUser = await getCurrentUser();

  const client = INITIAL_CLIENTS.find((c) => c.id === parsed.clientId) || INITIAL_CLIENTS[0];

  // Enkripsi password jika ada
  let encPassword = "";
  if (parsed.credentialPassword) {
    const enc = encryptCredential(parsed.credentialPassword);
    encPassword = `enc_${enc.encrypted.substring(0, 16)}_gcm`;
  }

  // Ambil GitHub info jika ada repositoryUrl
  const repoUrl = parsed.repositoryUrl || "";
  const githubDetails = await getGitHubRepoDetails(repoUrl);

  const newProject: Project = {
    id: `proj-${Date.now()}`,
    name: parsed.name,
    clientId: parsed.clientId,
    client,
    status: parsed.status,
    description: parsed.description || "",
    frontendTech: parsed.frontendTech || "",
    backendTech: parsed.backendTech || "",
    databaseTech: parsed.databaseTech || "",
    repositoryUrl: repoUrl,
    credentialUsername: parsed.credentialUsername || "",
    credentialPasswordEncrypted: encPassword,
    credentialPasswordPlain: parsed.credentialPassword || "",
    githubDetails,
    members: [],
    notes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  runtimeProjects.unshift(newProject);

  // Catat audit log
  await createActivityLog({
    memberId: currentUser.id,
    memberName: currentUser.name,
    projectId: newProject.id,
    projectName: newProject.name,
    action: "PROJECT_CREATED",
    details: `Membuat proyek baru '${newProject.name}' untuk klien ${client.companyName}`,
  });

  safeRevalidate("/projects");
  safeRevalidate("/dashboard");
  return { success: true, project: newProject };
}

export async function updateProjectAction(id: string, data: ProjectFormValues) {
  const sanitized = sanitizeObject(data);
  const parsed = projectFormSchema.parse(sanitized);
  const currentUser = await getCurrentUser();

  const index = runtimeProjects.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error("Proyek tidak ditemukan");
  }

  const prev = runtimeProjects[index];
  const client = INITIAL_CLIENTS.find((c) => c.id === parsed.clientId) || prev.client;

  let encPassword = prev.credentialPasswordEncrypted;
  let plainPassword = prev.credentialPasswordPlain;

  if (parsed.credentialPassword && parsed.credentialPassword !== prev.credentialPasswordPlain) {
    const enc = encryptCredential(parsed.credentialPassword);
    encPassword = `enc_${enc.encrypted.substring(0, 16)}_gcm`;
    plainPassword = parsed.credentialPassword;
  }

  const updatedProject: Project = {
    ...prev,
    name: parsed.name,
    clientId: parsed.clientId,
    client,
    status: parsed.status,
    description: parsed.description || "",
    frontendTech: parsed.frontendTech || "",
    backendTech: parsed.backendTech || "",
    databaseTech: parsed.databaseTech || "",
    repositoryUrl: parsed.repositoryUrl || prev.repositoryUrl,
    credentialUsername: parsed.credentialUsername || "",
    credentialPasswordEncrypted: encPassword,
    credentialPasswordPlain: plainPassword,
    updatedAt: new Date().toISOString(),
  };

  runtimeProjects[index] = updatedProject;

  // Log status change or general update
  if (prev.status !== parsed.status) {
    await createActivityLog({
      memberId: currentUser.id,
      memberName: currentUser.name,
      projectId: updatedProject.id,
      projectName: updatedProject.name,
      action: "PROJECT_STATUS_CHANGED",
      details: `Mengubah status proyek dari '${prev.status}' menjadi '${parsed.status}'`,
    });
  } else {
    await createActivityLog({
      memberId: currentUser.id,
      memberName: currentUser.name,
      projectId: updatedProject.id,
      projectName: updatedProject.name,
      action: "PROJECT_UPDATED",
      details: `Memperbarui informasi proyek '${updatedProject.name}'`,
    });
  }

  safeRevalidate(`/projects/${id}`);
  safeRevalidate("/projects");
  safeRevalidate("/dashboard");
  return { success: true, project: updatedProject };
}

export async function deleteProjectAction(id: string) {
  const currentUser = await getCurrentUser();
  const index = runtimeProjects.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error("Proyek tidak ditemukan");
  }

  const removed = runtimeProjects.splice(index, 1)[0];

  await createActivityLog({
    memberId: currentUser.id,
    memberName: currentUser.name,
    projectId: removed.id,
    projectName: removed.name,
    action: "PROJECT_DELETED",
    details: `Menghapus proyek '${removed.name}'`,
  });

  safeRevalidate("/projects");
  safeRevalidate("/dashboard");
  return { success: true };
}
