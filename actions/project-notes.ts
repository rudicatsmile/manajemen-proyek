"use server";

import { revalidatePath } from "next/cache";
import { INITIAL_MEMBERS, ProjectNote } from "@/lib/mock-data";
import { getCurrentUser, getOrCreateDbMember } from "@/lib/auth";
import { createActivityLog } from "@/lib/activity-logger";
import { sanitizeInput } from "@/lib/sanitize";
import { db } from "@/lib/db";
import { projectNotes, projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  noteSchema,
  NoteFormValues,
  runtimeProjects,
} from "@/lib/data-store";

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Aman jika di luar request lifecycle
  }
}

export async function addProjectNoteAction(data: NoteFormValues) {
  const sanitizedContent = sanitizeInput(data.content);
  const parsed = noteSchema.parse({ ...data, content: sanitizedContent });
  const currentUser = await getCurrentUser();
  const dbUser = await getOrCreateDbMember();

  let title = "Catatan Dokumentasi";
  let content = parsed.content;

  if (content.startsWith("[") && content.includes("]\n")) {
    const endIdx = content.indexOf("]\n");
    title = content.substring(1, endIdx);
    content = content.substring(endIdx + 2);
  }

  let newNote: ProjectNote;

  try {
    if (process.env.DATABASE_URL) {
      const [inserted] = await db
        .insert(projectNotes)
        .values({
          projectId: parsed.projectId,
          authorId: dbUser.id,
          content: parsed.content,
          pinned: parsed.pinned || false,
        })
        .returning();

      if (inserted) {
        newNote = {
          id: inserted.id,
          projectId: inserted.projectId,
          authorId: dbUser.id,
          authorName: dbUser.name,
          title,
          content,
          isPinned: inserted.pinned,
          createdAt: inserted.createdAt.toISOString(),
          updatedAt: inserted.updatedAt.toISOString(),
        };
      } else {
        throw new Error("Gagal menyimpan catatan ke database");
      }
    } else {
      throw new Error("DATABASE_URL tidak disetel");
    }
  } catch (err) {
    console.warn("DB add note failed, using memory store:", err);
    const author = INITIAL_MEMBERS.find((m) => m.id === currentUser.id) || INITIAL_MEMBERS[0];
    newNote = {
      id: `note-${Date.now()}`,
      projectId: parsed.projectId,
      authorId: currentUser.id,
      authorName: author.name,
      title,
      content,
      isPinned: parsed.pinned || false,
      createdAt: "Baru saja",
      updatedAt: "Baru saja",
    };

    const project = runtimeProjects.find((p) => p.id === parsed.projectId);
    if (project) {
      project.notes.unshift(newNote);
    }
  }

  await createActivityLog({
    memberId: currentUser.id,
    memberName: currentUser.name,
    projectId: parsed.projectId,
    action: "NOTE_CREATED",
    details: `Menambahkan catatan '${title}'`,
  });

  safeRevalidate(`/projects/${parsed.projectId}`);
  return { success: true, note: newNote };
}

export async function updateProjectNoteAction(
  projectId: string,
  noteId: string,
  content: string
) {
  const cleanContent = sanitizeInput(content);
  if (!cleanContent || cleanContent.trim().length < 3) {
    throw new Error("Isi catatan minimal 3 karakter");
  }

  const currentUser = await getCurrentUser();

  try {
    if (process.env.DATABASE_URL) {
      await db
        .update(projectNotes)
        .set({ content: cleanContent.trim(), updatedAt: new Date() })
        .where(eq(projectNotes.id, noteId));
    }
  } catch (err) {
    console.warn("DB update note failed or fallback to memory:", err);
  }

  const project = runtimeProjects.find((p) => p.id === projectId);
  if (project) {
    const note = project.notes.find((n) => n.id === noteId);
    if (note) {
      note.content = cleanContent.trim();
      note.updatedAt = "Baru saja";
    }
  }

  await createActivityLog({
    memberId: currentUser.id,
    memberName: currentUser.name,
    projectId: projectId,
    action: "NOTE_UPDATED",
    details: `Memperbarui catatan proyek`,
  });

  safeRevalidate(`/projects/${projectId}`);
  return { success: true };
}

export async function deleteProjectNoteAction(projectId: string, noteId: string) {
  const currentUser = await getCurrentUser();

  try {
    if (process.env.DATABASE_URL) {
      await db.delete(projectNotes).where(eq(projectNotes.id, noteId));
    }
  } catch (err) {
    console.warn("DB delete note failed or fallback to memory:", err);
  }

  const project = runtimeProjects.find((p) => p.id === projectId);
  if (project) {
    const noteIndex = project.notes.findIndex((n) => n.id === noteId);
    if (noteIndex !== -1) {
      project.notes.splice(noteIndex, 1);
    }
  }

  await createActivityLog({
    memberId: currentUser.id,
    memberName: currentUser.name,
    projectId: projectId,
    action: "NOTE_DELETED",
    details: `Menghapus catatan proyek`,
  });

  safeRevalidate(`/projects/${projectId}`);
  return { success: true };
}

export async function togglePinNoteAction(projectId: string, noteId: string) {
  const currentUser = await getCurrentUser();
  let isPinned = false;

  try {
    if (process.env.DATABASE_URL) {
      const [found] = await db
        .select()
        .from(projectNotes)
        .where(eq(projectNotes.id, noteId));

      if (found) {
        isPinned = !found.pinned;
        await db
          .update(projectNotes)
          .set({ pinned: isPinned, updatedAt: new Date() })
          .where(eq(projectNotes.id, noteId));
      }
    }
  } catch (err) {
    console.warn("DB toggle pin failed or fallback to memory:", err);
  }

  const project = runtimeProjects.find((p) => p.id === projectId);
  if (project) {
    const note = project.notes.find((n) => n.id === noteId);
    if (note) {
      note.isPinned = !note.isPinned;
      isPinned = note.isPinned;
    }
  }

  await createActivityLog({
    memberId: currentUser.id,
    memberName: currentUser.name,
    projectId: projectId,
    action: "NOTE_UPDATED",
    details: `${isPinned ? "Menyematkan" : "Melepaskan sematan"} catatan pada proyek`,
  });

  safeRevalidate(`/projects/${projectId}`);
  return { success: true, pinned: isPinned };
}

