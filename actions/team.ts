"use server";

import { revalidatePath } from "next/cache";
import { Member, MemberRole } from "@/lib/mock-data";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { createActivityLog } from "@/lib/activity-logger";
import { sanitizeObject } from "@/lib/sanitize";
import {
  inviteMemberSchema,
  InviteMemberValues,
  runtimeMembers,
} from "@/lib/data-store";

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Aman jika di luar request lifecycle
  }
}

export async function getTeamMembersAction(): Promise<Member[]> {
  return runtimeMembers;
}

export async function inviteTeamMemberAction(data: InviteMemberValues) {
  // Hanya admin yang dapat mengundang anggota
  await requireAdmin();
  const sanitized = sanitizeObject(data);
  const parsed = inviteMemberSchema.parse(sanitized);
  const currentUser = await getCurrentUser();

  const existing = runtimeMembers.find((m) => m.email.toLowerCase() === parsed.email.toLowerCase());
  if (existing) {
    throw new Error("Email tersebut sudah terdaftar sebagai anggota tim");
  }

  const newMember: Member = {
    id: `mem-${Date.now()}`,
    name: parsed.name,
    email: parsed.email,
    role: parsed.role as MemberRole,
    specialization: parsed.specialization,
    createdAt: new Date().toISOString().split("T")[0],
  };

  runtimeMembers.push(newMember);

  await createActivityLog({
    memberId: currentUser.id,
    memberName: currentUser.name,
    action: "MEMBER_ADDED",
    details: `Mengundang anggota baru ${newMember.name} (${newMember.role}) ke dalam tim`,
  });

  safeRevalidate("/team");
  return { success: true, member: newMember };
}

export async function updateTeamMemberRoleAction(memberId: string, role: MemberRole) {
  await requireAdmin();
  const currentUser = await getCurrentUser();

  const member = runtimeMembers.find((m) => m.id === memberId);
  if (!member) {
    throw new Error("Anggota tidak ditemukan");
  }

  const prevRole = member.role;
  member.role = role;

  await createActivityLog({
    memberId: currentUser.id,
    memberName: currentUser.name,
    action: "PROJECT_UPDATED",
    details: `Mengubah peran ${member.name} dari ${prevRole} menjadi ${role}`,
  });

  safeRevalidate("/team");
  return { success: true, member };
}
