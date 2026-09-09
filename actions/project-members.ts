"use server";

import { revalidatePath } from "next/cache";
import {
  INITIAL_MEMBERS,
  ProjectMember,
  ProjectMemberRole,
} from "@/lib/mock-data";
import { getCurrentUser } from "@/lib/auth";
import { createActivityLog } from "@/lib/activity-logger";
import {
  addProjectMemberSchema,
  AddProjectMemberValues,
  runtimeProjects,
} from "@/lib/data-store";

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Aman jika di luar request lifecycle
  }
}

export async function addProjectMemberAction(data: AddProjectMemberValues) {
  const parsed = addProjectMemberSchema.parse(data);
  const currentUser = await getCurrentUser();

  const project = runtimeProjects.find((p) => p.id === parsed.projectId);
  if (!project) {
    throw new Error("Proyek tidak ditemukan");
  }

  // Cek apakah member sudah terdaftar di proyek ini
  const existing = project.members.find((m) => m.memberId === parsed.memberId);
  if (existing) {
    throw new Error("Anggota tim sudah terdaftar dalam proyek ini");
  }

  const memberInfo = INITIAL_MEMBERS.find((m) => m.id === parsed.memberId);
  if (!memberInfo) {
    throw new Error("Data anggota tim tidak valid");
  }

  const newProjectMember: ProjectMember = {
    id: `pm-${Date.now()}`,
    projectId: parsed.projectId,
    memberId: parsed.memberId,
    role: parsed.role as ProjectMemberRole,
    assignedAt: new Date().toISOString(),
    member: memberInfo,
  };

  project.members.push(newProjectMember);

  await createActivityLog({
    memberId: currentUser.id,
    memberName: currentUser.name,
    projectId: project.id,
    projectName: project.name,
    action: "MEMBER_ADDED",
    details: `Menugaskan ${memberInfo.name} sebagai ${parsed.role} pada proyek ${project.name}`,
  });

  safeRevalidate(`/projects/${parsed.projectId}`);
  return { success: true, projectMember: newProjectMember };
}

export async function removeProjectMemberAction(projectId: string, memberId: string) {
  const currentUser = await getCurrentUser();

  const project = runtimeProjects.find((p) => p.id === projectId);
  if (!project) {
    throw new Error("Proyek tidak ditemukan");
  }

  const memberIndex = project.members.findIndex((m) => m.memberId === memberId);
  if (memberIndex === -1) {
    throw new Error("Anggota tidak ditemukan dalam proyek ini");
  }

  const removed = project.members.splice(memberIndex, 1)[0];

  await createActivityLog({
    memberId: currentUser.id,
    memberName: currentUser.name,
    projectId: project.id,
    projectName: project.name,
    action: "MEMBER_REMOVED",
    details: `Menghapus ${removed.member.name} dari tim proyek ${project.name}`,
  });

  safeRevalidate(`/projects/${projectId}`);
  return { success: true };
}

export async function updateProjectMemberRoleAction(
  projectId: string,
  memberId: string,
  newRole: ProjectMemberRole
) {
  const currentUser = await getCurrentUser();

  const project = runtimeProjects.find((p) => p.id === projectId);
  if (!project) {
    throw new Error("Proyek tidak ditemukan");
  }

  const member = project.members.find((m) => m.memberId === memberId);
  if (!member) {
    throw new Error("Anggota tidak ditemukan dalam proyek ini");
  }

  const prevRole = member.role;
  member.role = newRole;

  await createActivityLog({
    memberId: currentUser.id,
    memberName: currentUser.name,
    projectId: project.id,
    projectName: project.name,
    action: "PROJECT_UPDATED",
    details: `Mengubah peran ${member.member.name} dari ${prevRole} menjadi ${newRole}`,
  });

  safeRevalidate(`/projects/${projectId}`);
  return { success: true, member };
}
