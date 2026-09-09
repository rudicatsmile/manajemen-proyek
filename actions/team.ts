"use server";

import { revalidatePath } from "next/cache";
import { Member, MemberRole } from "@/lib/mock-data";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { createActivityLog } from "@/lib/activity-logger";
import { sanitizeObject } from "@/lib/sanitize";
import { db } from "@/lib/db";
import { members, projects } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
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
  try {
    if (process.env.DATABASE_URL) {
      const dbMembers = await db.select().from(members).orderBy(members.createdAt);
      if (dbMembers.length > 0) {
        return dbMembers.map((m) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          role: m.role,
          specialization: m.specialization || (m.role === "admin" ? "Super Admin & Architect" : "Software Engineer"),
          avatarUrl: m.avatarUrl || undefined,
          createdAt: m.createdAt ? m.createdAt.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        }));
      }
    }
  } catch (err) {
    console.error("Error fetching team from Neon DB:", err);
  }

  return runtimeMembers;
}

export async function inviteTeamMemberAction(data: InviteMemberValues) {
  await requireAdmin();
  const sanitized = sanitizeObject(data);
  const parsed = inviteMemberSchema.parse(sanitized);
  const currentUser = await getCurrentUser();

  let newMember: Member;

  try {
    if (process.env.DATABASE_URL) {
      const existing = await db.select().from(members).where(eq(members.email, parsed.email));
      if (existing.length > 0) {
        throw new Error("Email tersebut sudah terdaftar sebagai anggota tim");
      }

      const [inserted] = await db
        .insert(members)
        .values({
          clerkId: `invited_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          name: parsed.name,
          email: parsed.email,
          role: parsed.role as MemberRole,
          specialization: parsed.specialization,
        })
        .returning();

      if (inserted) {
        newMember = {
          id: inserted.id,
          name: inserted.name,
          email: inserted.email,
          role: inserted.role,
          specialization: parsed.specialization,
          createdAt: inserted.createdAt ? inserted.createdAt.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        };
      } else {
        throw new Error("Gagal menambahkan anggota ke database");
      }
    } else {
      throw new Error("DATABASE_URL tidak disetel");
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("sudah terdaftar")) {
      throw err;
    }
    console.warn("DB invite member failed, using memory store:", err);
    const existing = runtimeMembers.find((m) => m.email.toLowerCase() === parsed.email.toLowerCase());
    if (existing) {
      throw new Error("Email tersebut sudah terdaftar sebagai anggota tim");
    }

    newMember = {
      id: `mem-${Date.now()}`,
      name: parsed.name,
      email: parsed.email,
      role: parsed.role as MemberRole,
      specialization: parsed.specialization,
      createdAt: new Date().toISOString().split("T")[0],
    };
    runtimeMembers.push(newMember);
  }

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

  try {
    if (process.env.DATABASE_URL) {
      await db.update(members).set({ role }).where(eq(members.id, memberId));
    }
  } catch (err) {
    console.warn("DB update role failed or fallback to memory:", err);
  }

  const member = runtimeMembers.find((m) => m.id === memberId);
  if (member) {
    member.role = role;
  }

  await createActivityLog({
    memberId: currentUser.id,
    memberName: currentUser.name,
    action: "PROJECT_UPDATED",
    details: `Mengubah peran anggota tim menjadi ${role}`,
  });

  safeRevalidate("/team");
  return { success: true };
}

export interface UpdateTeamMemberInput {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  specialization: string;
}

export async function updateTeamMemberAction(data: UpdateTeamMemberInput) {
  await requireAdmin();
  const currentUser = await getCurrentUser();

  try {
    if (process.env.DATABASE_URL) {
      const existing = await db
        .select()
        .from(members)
        .where(and(eq(members.email, data.email.trim()), ne(members.id, data.id)));
      if (existing.length > 0) {
        throw new Error("Email tersebut sudah digunakan oleh anggota tim lain");
      }

      await db
        .update(members)
        .set({
          name: data.name.trim(),
          email: data.email.trim(),
          role: data.role,
          specialization: data.specialization.trim() || null,
          updatedAt: new Date(),
        })
        .where(eq(members.id, data.id));
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("sudah digunakan")) {
      throw err;
    }
    console.warn("DB update member failed, using memory store:", err);
  }

  const member = runtimeMembers.find((m) => m.id === data.id);
  if (member) {
    member.name = data.name.trim();
    member.email = data.email.trim();
    member.role = data.role;
    if (data.specialization) member.specialization = data.specialization;
  }

  await createActivityLog({
    memberId: currentUser.id,
    memberName: currentUser.name,
    action: "PROJECT_UPDATED",
    details: `Memperbarui data anggota tim ${data.name} (${data.role})`,
  });

  safeRevalidate("/team");
  return { success: true };
}

export async function deleteTeamMemberAction(memberId: string) {
  await requireAdmin();
  const currentUser = await getCurrentUser();

  if (currentUser.id === memberId) {
    throw new Error("Anda tidak dapat menghapus akun Anda sendiri.");
  }

  try {
    if (process.env.DATABASE_URL) {
      // Reassign any projects created by this member to the current admin
      await db
        .update(projects)
        .set({ createdById: currentUser.id })
        .where(eq(projects.createdById, memberId));

      await db.delete(members).where(eq(members.id, memberId));
    }
  } catch (err: unknown) {
    console.error("DB delete member error:", err);
    throw new Error("Gagal menghapus anggota tim dari database");
  }

  const idx = runtimeMembers.findIndex((m) => m.id === memberId);
  if (idx !== -1) {
    runtimeMembers.splice(idx, 1);
  }

  await createActivityLog({
    memberId: currentUser.id,
    memberName: currentUser.name,
    action: "MEMBER_REMOVED",
    details: `Menghapus anggota tim dari sistem`,
  });

  safeRevalidate("/team");
  return { success: true };
}

