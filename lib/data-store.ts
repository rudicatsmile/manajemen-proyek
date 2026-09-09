import { z } from "zod";
import {
  INITIAL_PROJECTS,
  INITIAL_CLIENTS,
  INITIAL_MEMBERS,
  INITIAL_ACTIVITY_LOGS,
  Project,
  Client,
  Member,
  ActivityLog,
} from "./mock-data";

// ==========================================
// Zod Schemas & Types
// ==========================================

export const projectCredentialInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nama/label kredensial wajib diisi"),
  type: z.string().default("other"),
  host: z.string().optional(),
  port: z.string().optional(),
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().optional(),
  notes: z.string().optional(),
});

export type ProjectCredentialInput = z.infer<typeof projectCredentialInputSchema>;

export const projectFormSchema = z.object({
  name: z.string().min(3, "Nama proyek wajib diisi minimal 3 karakter"),
  clientId: z.string().min(1, "Klien wajib dipilih"),
  status: z.enum(["planning", "in_progress", "on_hold", "completed", "cancelled"]),
  description: z.string().optional(),
  frontendTech: z.string().optional(),
  backendTech: z.string().optional(),
  databaseTech: z.string().optional(),
  repositoryUrl: z.string().optional(),
  credentialUsername: z.string().optional(),
  credentialPassword: z.string().optional(),
  credentials: z.array(projectCredentialInputSchema).optional(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const clientFormSchema = z.object({
  name: z.string().min(2, "Nama PIC / kontak wajib diisi minimal 2 karakter"),
  companyName: z.string().min(2, "Nama perusahaan / instansi wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().min(6, "Nomor telepon wajib diisi"),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;

export const addProjectMemberSchema = z.object({
  projectId: z.string().min(1, "ID Proyek wajib diisi"),
  memberId: z.string().min(1, "Anggota wajib dipilih"),
  role: z.enum([
    "project_manager",
    "frontend",
    "backend",
    "fullstack",
    "designer",
    "qa",
    "other",
  ]),
});

export type AddProjectMemberValues = z.infer<typeof addProjectMemberSchema>;

export const noteSchema = z.object({
  projectId: z.string().min(1, "ID Proyek wajib diisi"),
  content: z.string().min(3, "Isi catatan minimal 3 karakter"),
  pinned: z.boolean().optional(),
});

export type NoteFormValues = z.infer<typeof noteSchema>;

export const inviteMemberSchema = z.object({
  name: z.string().min(2, "Nama lengkap minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  role: z.enum(["admin", "member"]),
  specialization: z.string().min(2, "Spesialisasi wajib diisi"),
});

export type InviteMemberValues = z.infer<typeof inviteMemberSchema>;

// ==========================================
// Runtime State Stores (Stateful Memory Cache)
// ==========================================

export const runtimeProjects: Project[] = [...INITIAL_PROJECTS];
export const runtimeClients: Client[] = [...INITIAL_CLIENTS];
export const runtimeMembers: Member[] = [...INITIAL_MEMBERS];
export const runtimeActivityLogs: ActivityLog[] = [...INITIAL_ACTIVITY_LOGS];
