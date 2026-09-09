"use server";

import { revalidatePath } from "next/cache";
import {
  INITIAL_MEMBERS,
  ProjectMember,
  ProjectMemberRole,
} from "@/lib/mock-data";
import { getCurrentUser, getOrCreateDbMember } from "@/lib/auth";
import { createActivityLog } from "@/lib/activity-logger";
import { db } from "@/lib/db";
import { projectMembers, members, projects } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
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
  const dbUser = await getOrCreateDbMember();

  let memberName = "Anggota Tim";

  try {
    if (process.env.DATABASE_URL) {
      const existing = await db
        .select()
        .from(projectMembers)
        .where(
          and(
            eq(projectMembers.projectId, parsed.projectId),
            eq(projectMembers.memberId, parsed.memberId)
          )
        );

      if (existing.length > 0) {
        throw new Error("Anggota tim sudah terdaftar dalam proyek ini");
      }

      await db.insert(projectMembers).values({
        projectId: parsed.projectId,
        memberId: parsed.memberId,
        role: parsed.role,
        assignedBy: dbUser.id,
      });

      const [memberRow] = await db
        .select()
        .from(members)
        .where(eq(members.id, parsed.memberId));
      if (memberRow) memberName = memberRow.name;
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("sudah terdaftar")) {
      throw err;
    }
    console.warn("DB add project member failed, using memory store:", err);
  }

  const memberInfo =
    INITIAL_MEMBERS.find((m) => m.id === parsed.memberId) || {
      id: parsed.memberId,
      name: memberName,
      email: "",
      role: "member" as const,
      specialization: "Developer",
      createdAt: new Date().toISOString(),
    };

  const newProjectMember: ProjectMember = {
    id: `pm-${Date.now()}`,
    projectId: parsed.projectId,
    memberId: parsed.memberId,
    role: parsed.role as ProjectMemberRole,
    assignedAt: new Date().toISOString(),
    member: memberInfo,
  };

  const project = runtimeProjects.find((p) => p.id === parsed.projectId);
  if (project) {
    const existing = project.members.find((m) => m.memberId === parsed.memberId);
    if (!existing) {
      project.members.push(newProjectMember);
    }
  }

  await createActivityLog({
    memberId: currentUser.id,
    memberName: currentUser.name,
    projectId: parsed.projectId,
    action: "MEMBER_ADDED",
    details: `Menugaskan ${memberInfo.name} sebagai ${parsed.role}`,
  });

  safeRevalidate(`/projects/${parsed.projectId}`);
  return { success: true, projectMember: newProjectMember };
}

export async function removeProjectMemberAction(projectId: string, memberId: string) {
  const currentUser = await getCurrentUser();

  try {
    if (process.env.DATABASE_URL) {
      await db
        .delete(projectMembers)
        .where(
          and(
            eq(projectMembers.projectId, projectId),
            eq(projectMembers.memberId, memberId)
          )
        );
    }
  } catch (err) {
    console.warn("DB remove project member failed or fallback to memory:", err);
  }

  const project = runtimeProjects.find((p) => p.id === projectId);
  if (project) {
    const memberIndex = project.members.findIndex((m) => m.memberId === memberId);
    if (memberIndex !== -1) {
      project.members.splice(memberIndex, 1);
    }
  }

  await createActivityLog({
    memberId: currentUser.id,
    memberName: currentUser.name,
    projectId: projectId,
    action: "MEMBER_REMOVED",
    details: `Menghapus anggota dari tim proyek`,
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

  try {
    if (process.env.DATABASE_URL) {
      await db
        .update(projectMembers)
        .set({ role: newRole })
        .where(
          and(
            eq(projectMembers.projectId, projectId),
            eq(projectMembers.memberId, memberId)
          )
        );
    }
  } catch (err) {
    console.warn("DB update project member role failed or fallback to memory:", err);
  }

  const project = runtimeProjects.find((p) => p.id === projectId);
  if (project) {
    const member = project.members.find((m) => m.memberId === memberId);
    if (member) {
      member.role = newRole;
    }
  }

  await createActivityLog({
    memberId: currentUser.id,
    memberName: currentUser.name,
    projectId: projectId,
    action: "PROJECT_UPDATED",
    details: `Mengubah peran anggota tim menjadi ${newRole}`,
  });

  safeRevalidate(`/projects/${projectId}`);
  return { success: true };
}

