"use server";

import { revalidatePath } from "next/cache";
import { INITIAL_MEMBERS, ProjectNote } from "@/lib/mock-data";
import { getCurrentUser } from "@/lib/auth";
import { createActivityLog } from "@/lib/activity-logger";
import { sanitizeInput } from "@/lib/sanitize";
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

  const project = runtimeProjects.find((p) => p.id === parsed.projectId);
  if (!project) {
    throw new Error("Proyek tidak ditemukan");
  }

  const author = INITIAL_MEMBERS.find((m) => m.id === currentUser.id) || INITIAL_MEMBERS[0];

  let title = "Catatan Dokumentasi";
  let content = parsed.content;

  if (content.startsWith("[") && content.includes("]\n")) {
    const endIdx = content.indexOf("]\n");
    title = content.substring(1, endIdx);
    content = content.substring(endIdx + 2);
  }

  const newNote: ProjectNote = {
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

  project.notes.unshift(newNote);

  await createActivityLog({
    memberId: currentUser.id,
    memberName: currentUser.name,
    projectId: project.id,
    projectName: project.name,
    action: "NOTE_CREATED",
    details: `Menambahkan catatan '${title}' pada proyek '${project.name}'`,
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
  const project = runtimeProjects.find((p) => p.id === projectId);
  if (!project) {
    throw new Error("Proyek tidak ditemukan");
  }

  const note = project.notes.find((n) => n.id === noteId);
  if (!note) {
    throw new Error("Catatan tidak ditemukan");
  }

  // Aturan kepemilikan data: Hanya author atau admin yang boleh mengedit
  if (note.authorId !== currentUser.id && currentUser.role !== "admin") {
    throw new Error("Akses ditolak: Anda hanya dapat mengedit catatan buatan sendiri");
  }

  note.content = content.trim();
  note.updatedAt = "Baru saja";

  await createActivityLog({
    memberId: currentUser.id,
    memberName: currentUser.name,
    projectId: project.id,
    projectName: project.name,
    action: "NOTE_UPDATED",
    details: `Memperbarui catatan '${note.title}' pada proyek '${project.name}'`,
  });

  safeRevalidate(`/projects/${projectId}`);
  return { success: true, note };
}

export async function deleteProjectNoteAction(projectId: string, noteId: string) {
  const currentUser = await getCurrentUser();
  const project = runtimeProjects.find((p) => p.id === projectId);
  if (!project) {
    throw new Error("Proyek tidak ditemukan");
  }

  const noteIndex = project.notes.findIndex((n) => n.id === noteId);
  if (noteIndex === -1) {
    throw new Error("Catatan tidak ditemukan");
  }

  const note = project.notes[noteIndex];
  // Aturan kepemilikan data: Hanya author atau admin yang boleh menghapus
  if (note.authorId !== currentUser.id && currentUser.role !== "admin") {
    throw new Error("Akses ditolak: Anda hanya dapat menghapus catatan buatan sendiri");
  }

  project.notes.splice(noteIndex, 1);

  await createActivityLog({
    memberId: currentUser.id,
    memberName: currentUser.name,
    projectId: project.id,
    projectName: project.name,
    action: "NOTE_DELETED",
    details: `Menghapus catatan '${note.title}' pada proyek '${project.name}'`,
  });

  safeRevalidate(`/projects/${projectId}`);
  return { success: true };
}

export async function togglePinNoteAction(projectId: string, noteId: string) {
  const currentUser = await getCurrentUser();
  const project = runtimeProjects.find((p) => p.id === projectId);
  if (!project) {
    throw new Error("Proyek tidak ditemukan");
  }

  const note = project.notes.find((n) => n.id === noteId);
  if (!note) {
    throw new Error("Catatan tidak ditemukan");
  }

  note.isPinned = !note.isPinned;

  await createActivityLog({
    memberId: currentUser.id,
    memberName: currentUser.name,
    projectId: project.id,
    projectName: project.name,
    action: "NOTE_UPDATED",
    details: `${note.isPinned ? "Menyematkan" : "Melepaskan sematan"} catatan pada proyek '${project.name}'`,
  });

  safeRevalidate(`/projects/${projectId}`);
  return { success: true, pinned: note.isPinned };
}
