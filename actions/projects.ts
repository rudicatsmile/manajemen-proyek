"use server";

import { revalidatePath } from "next/cache";
import {
  Project,
  GitHubRepoDetails,
  Client,
  ProjectMember,
  ProjectNote,
  ProjectCredential,
  INITIAL_CLIENTS,
} from "@/lib/mock-data";
import { getCurrentUser, getOrCreateDbMember } from "@/lib/auth";
import { createActivityLog } from "@/lib/activity-logger";
import { encryptCredential, decryptCredential } from "@/lib/crypto";
import { getGitHubRepoDetails } from "@/lib/github";
import { sanitizeObject } from "@/lib/sanitize";
import { db } from "@/lib/db";
import {
  projects,
  clients,
  members,
  projectMembers,
  projectNotes,
  projectCredentials,
  activityLogs,
} from "@/lib/db/schema";
import { eq, desc, or, and } from "drizzle-orm";
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

function mapDbProject(
  p: typeof projects.$inferSelect & {
    client?: typeof clients.$inferSelect | null;
    projectMembers?: Array<
      typeof projectMembers.$inferSelect & {
        member?: typeof members.$inferSelect | null;
      }
    >;
    notes?: Array<
      typeof projectNotes.$inferSelect & {
        author?: typeof members.$inferSelect | null;
      }
    >;
    credentials?: Array<typeof projectCredentials.$inferSelect>;
  },
  githubDetails?: GitHubRepoDetails
): Project {
  let plainPass = "";
  if (p.credentialPassword && p.credentialIv) {
    plainPass = decryptCredential(p.credentialPassword, p.credentialIv);
  }

  const client: Client = p.client
    ? {
        id: p.client.id,
        name: p.client.name,
        companyName: p.client.company || p.client.name,
        email: p.client.email || "",
        phone: p.client.phone || "",
        address: p.client.address || "",
        notes: p.client.notes || "",
        createdAt: p.client.createdAt ? p.client.createdAt.toISOString() : new Date().toISOString(),
      }
    : {
        id: p.clientId,
        name: "Klien",
        companyName: "Klien Proyek",
        email: "",
        phone: "",
        address: "",
        createdAt: new Date().toISOString(),
      };

  const mappedMembers: ProjectMember[] = (p.projectMembers || []).map((pm, idx) => ({
    id: `pm-${p.id}-${pm.memberId || idx}`,
    memberId: pm.memberId,
    projectId: p.id,
    role: pm.role,
    assignedAt: pm.assignedAt ? pm.assignedAt.toISOString() : new Date().toISOString(),
    member: pm.member
      ? {
          id: pm.member.id,
          name: pm.member.name,
          email: pm.member.email,
          role: pm.member.role,
          specialization: "Tim Teknis",
          avatarUrl: pm.member.avatarUrl || undefined,
          createdAt: pm.member.createdAt ? pm.member.createdAt.toISOString() : new Date().toISOString(),
        }
      : {
          id: pm.memberId,
          name: "Anggota Tim",
          email: "",
          role: "member",
          specialization: "Developer",
          createdAt: new Date().toISOString(),
        },
  }));

  const mappedNotes: ProjectNote[] = (p.notes || []).map((n) => ({
    id: n.id,
    projectId: n.projectId,
    authorId: n.authorId,
    authorName: n.author?.name || "Anggota Tim",
    title: n.content.slice(0, 30),
    content: n.content,
    isPinned: n.pinned,
    createdAt: n.createdAt ? n.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: n.updatedAt ? n.updatedAt.toISOString() : new Date().toISOString(),
  }));

  const mappedCredentials: ProjectCredential[] = (p.credentials || []).map((c) => {
    let plain = "";
    if (c.password && c.iv) {
      plain = decryptCredential(c.password, c.iv);
    }
    return {
      id: c.id,
      projectId: c.projectId,
      name: c.name,
      type: c.type || "other",
      host: c.host || undefined,
      port: c.port || undefined,
      username: c.username,
      passwordPlain: plain,
      passwordEncrypted: c.password ? `enc_${c.password.slice(0, 16)}_gcm` : "",
      notes: c.notes || undefined,
      createdAt: c.createdAt ? c.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: c.updatedAt ? c.updatedAt.toISOString() : new Date().toISOString(),
    };
  });

  if (mappedCredentials.length === 0 && (p.credentialUsername || p.credentialPassword)) {
    mappedCredentials.push({
      id: `legacy-${p.id}`,
      projectId: p.id,
      name: "Server Utama (Default)",
      type: "vps",
      username: p.credentialUsername || "",
      passwordPlain: plainPass,
      passwordEncrypted: p.credentialPassword ? `enc_${p.credentialPassword.slice(0, 16)}_gcm` : "",
      createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: p.updatedAt ? p.updatedAt.toISOString() : new Date().toISOString(),
    });
  }

  return {
    id: p.id,
    name: p.name,
    clientId: p.clientId,
    client,
    status: p.status,
    description: p.description || "",
    frontendTech: p.frontendTech || "",
    backendTech: p.backendTech || "",
    databaseTech: p.databaseTech || "",
    repositoryUrl: p.repositoryUrl || "",
    credentialUsername: p.credentialUsername || "",
    credentialPasswordEncrypted: p.credentialPassword
      ? `enc_${p.credentialPassword.substring(0, 16)}_gcm`
      : "",
    credentialPasswordPlain: plainPass,
    credentials: mappedCredentials,
    githubDetails: githubDetails || {
      connected: !!p.repositoryUrl,
      repoUrl: p.repositoryUrl || "",
      defaultBranch: "main",
      isPrivate: false,
      starsCount: 0,
      openIssuesCount: 0,
      latestCommit: {
        message: "Initial commit",
        authorName: "Developer",
        committedAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
        hash: "main",
      },
    },
    members: mappedMembers,
    notes: mappedNotes,
    createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: p.updatedAt ? p.updatedAt.toISOString() : new Date().toISOString(),
  };
}

export async function getProjectsAction(): Promise<Project[]> {
  try {
    if (process.env.DATABASE_URL) {
      const dbProjects = await db.query.projects.findMany({
        with: {
          client: true,
          projectMembers: {
            with: {
              member: true,
            },
          },
          notes: {
            with: {
              author: true,
            },
          },
          credentials: true,
        },
        orderBy: [desc(projects.createdAt)],
      });

      if (dbProjects.length > 0) {
        return dbProjects.map((p) => mapDbProject(p));
      }
    }
  } catch (err) {
    console.error("Error fetching projects from Neon DB, falling back to runtime:", err);
  }

  return runtimeProjects;
}

export async function getProjectByIdAction(id: string): Promise<Project | null> {
  try {
    if (process.env.DATABASE_URL) {
      const found = await db.query.projects.findFirst({
        where: or(eq(projects.id, id), eq(projects.slug, id)),
        with: {
          client: true,
          projectMembers: {
            with: {
              member: true,
            },
          },
          notes: {
            with: {
              author: true,
            },
          },
          credentials: true,
        },
      });

      if (found) {
        const ghDetails = found.repositoryUrl
          ? await getGitHubRepoDetails(found.repositoryUrl)
          : undefined;
        return mapDbProject(found, ghDetails);
      }
    }
  } catch (err) {
    console.error("Error fetching project by id from Neon DB:", err);
  }

  const project = runtimeProjects.find((p) => p.id === id);
  return project || null;
}

export async function createProjectAction(data: ProjectFormValues) {
  const sanitized = sanitizeObject(data);
  const parsed = projectFormSchema.parse(sanitized);
  const currentUser = await getCurrentUser();
  const dbUser = await getOrCreateDbMember();

  // Enkripsi password jika ada
  let enc = null;
  if (parsed.credentialPassword) {
    enc = encryptCredential(parsed.credentialPassword);
  }

  const repoUrl = parsed.repositoryUrl || "";
  const githubDetails = await getGitHubRepoDetails(repoUrl);

  const slug = `${parsed.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}-${Date.now().toString().slice(-4)}`;

  let createdProject: Project;

  try {
    if (process.env.DATABASE_URL) {
      const [inserted] = await db
        .insert(projects)
        .values({
          name: parsed.name,
          slug,
          description: parsed.description || null,
          clientId: parsed.clientId,
          status: parsed.status,
          frontendTech: parsed.frontendTech || null,
          backendTech: parsed.backendTech || null,
          databaseTech: parsed.databaseTech || null,
          repositoryUrl: repoUrl || null,
          credentialUsername: parsed.credentialUsername || null,
          credentialPassword: enc ? enc.encrypted : null,
          credentialIv: enc ? enc.iv : null,
          createdById: dbUser.id,
        })
        .returning();

      if (inserted) {
        // Daftarkan pembuat proyek sebagai project manager
        try {
          await db.insert(projectMembers).values({
            projectId: inserted.id,
            memberId: dbUser.id,
            role: "project_manager",
            assignedBy: dbUser.id,
          });
        } catch (memberErr) {
          console.warn("Could not add initial project member:", memberErr);
        }

        // Tambahkan kredensial jika disediakan
        if (parsed.credentials && parsed.credentials.length > 0) {
          for (const cred of parsed.credentials) {
            if (!cred.name || !cred.username) continue;
            const credEnc = cred.password ? encryptCredential(cred.password) : { encrypted: "", iv: "" };
            await db.insert(projectCredentials).values({
              projectId: inserted.id,
              name: cred.name,
              type: cred.type || "other",
              host: cred.host || null,
              port: cred.port || null,
              username: cred.username,
              password: credEnc.encrypted,
              iv: credEnc.iv,
              notes: cred.notes || null,
            });
          }
        }

        // Ambil data lengkap dengan relasi client dan credentials
        const full = await db.query.projects.findFirst({
          where: eq(projects.id, inserted.id),
          with: {
            client: true,
            projectMembers: { with: { member: true } },
            notes: { with: { author: true } },
            credentials: true,
          },
        });

        createdProject = full ? mapDbProject(full, githubDetails) : {
          id: inserted.id,
          name: inserted.name,
          clientId: inserted.clientId,
          client: INITIAL_CLIENTS[0],
          status: inserted.status,
          description: inserted.description || "",
          frontendTech: inserted.frontendTech || "",
          backendTech: inserted.backendTech || "",
          databaseTech: inserted.databaseTech || "",
          repositoryUrl: inserted.repositoryUrl || "",
          credentialUsername: inserted.credentialUsername || "",
          credentialPasswordEncrypted: enc ? `enc_${enc.encrypted.slice(0, 16)}_gcm` : "",
          credentialPasswordPlain: parsed.credentialPassword || "",
          credentials: (parsed.credentials || []).map((c, idx) => ({
            id: c.id || `cred-${idx}`,
            projectId: inserted.id,
            name: c.name,
            type: c.type || "other",
            host: c.host,
            port: c.port,
            username: c.username,
            passwordPlain: c.password || "",
            notes: c.notes,
          })),
          githubDetails,
          members: [],
          notes: [],
          createdAt: inserted.createdAt.toISOString(),
          updatedAt: inserted.updatedAt.toISOString(),
        };
      } else {
        throw new Error("Gagal menyimpan proyek ke database.");
      }
    } else {
      throw new Error("DATABASE_URL tidak disetel");
    }
  } catch (err) {
    console.warn("DB insert project failed, using memory store:", err);
    const client = INITIAL_CLIENTS.find((c) => c.id === parsed.clientId) || INITIAL_CLIENTS[0];
    createdProject = {
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
      credentialPasswordEncrypted: enc ? `enc_${enc.encrypted.slice(0, 16)}_gcm` : "",
      credentialPasswordPlain: parsed.credentialPassword || "",
      credentials: (parsed.credentials || []).map((c, idx) => ({
        id: c.id || `cred-${idx}`,
        projectId: `proj-${Date.now()}`,
        name: c.name,
        type: c.type || "other",
        host: c.host,
        port: c.port,
        username: c.username,
        passwordPlain: c.password || "",
        notes: c.notes,
      })),
      githubDetails,
      members: [],
      notes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    runtimeProjects.unshift(createdProject);
  }

  await createActivityLog({
    memberId: currentUser.id,
    memberName: currentUser.name,
    projectId: createdProject.id,
    projectName: createdProject.name,
    action: "PROJECT_CREATED",
    details: `Membuat proyek baru '${createdProject.name}'`,
  });

  safeRevalidate("/projects");
  safeRevalidate("/dashboard");
  return { success: true, project: createdProject };
}

export async function updateProjectAction(id: string, data: ProjectFormValues) {
  const sanitized = sanitizeObject(data);
  const parsed = projectFormSchema.parse(sanitized);
  const currentUser = await getCurrentUser();

  let enc = null;
  if (parsed.credentialPassword) {
    enc = encryptCredential(parsed.credentialPassword);
  }

  let updatedProject: Project;

  try {
    if (process.env.DATABASE_URL) {
      const updatePayload: Record<string, unknown> = {
        name: parsed.name,
        clientId: parsed.clientId,
        status: parsed.status,
        description: parsed.description || null,
        frontendTech: parsed.frontendTech || null,
        backendTech: parsed.backendTech || null,
        databaseTech: parsed.databaseTech || null,
        repositoryUrl: parsed.repositoryUrl || null,
        credentialUsername: parsed.credentialUsername || null,
        updatedAt: new Date(),
      };

      if (enc) {
        updatePayload.credentialPassword = enc.encrypted;
        updatePayload.credentialIv = enc.iv;
      }

      await db
        .update(projects)
        .set(updatePayload)
        .where(or(eq(projects.id, id), eq(projects.slug, id)));

      // Sinkronisasi kredensial jika dikirimkan
      if (parsed.credentials !== undefined) {
        const existingCreds = await db
          .select()
          .from(projectCredentials)
          .where(eq(projectCredentials.projectId, id));

        const incomingIds = new Set(
          parsed.credentials
            .filter((c) => c.id && !c.id.startsWith("new-") && !c.id.startsWith("legacy-"))
            .map((c) => c.id as string)
        );

        for (const ec of existingCreds) {
          if (!incomingIds.has(ec.id)) {
            await db.delete(projectCredentials).where(eq(projectCredentials.id, ec.id));
          }
        }

        for (const c of parsed.credentials) {
          if (!c.name || !c.username) continue;
          if (c.id && incomingIds.has(c.id)) {
            const updateData: Record<string, unknown> = {
              name: c.name,
              type: c.type || "other",
              host: c.host || null,
              port: c.port || null,
              username: c.username,
              notes: c.notes || null,
              updatedAt: new Date(),
            };
            if (c.password && c.password.trim()) {
              const encCred = encryptCredential(c.password);
              updateData.password = encCred.encrypted;
              updateData.iv = encCred.iv;
            }
            await db.update(projectCredentials).set(updateData).where(eq(projectCredentials.id, c.id));
          } else {
            const encCred = c.password ? encryptCredential(c.password) : { encrypted: "", iv: "" };
            await db.insert(projectCredentials).values({
              projectId: id,
              name: c.name,
              type: c.type || "other",
              host: c.host || null,
              port: c.port || null,
              username: c.username,
              password: encCred.encrypted,
              iv: encCred.iv,
              notes: c.notes || null,
            });
          }
        }
      }

      const full = await db.query.projects.findFirst({
        where: or(eq(projects.id, id), eq(projects.slug, id)),
        with: {
          client: true,
          projectMembers: { with: { member: true } },
          notes: { with: { author: true } },
          credentials: true,
        },
      });

      if (full) {
        const gh = full.repositoryUrl ? await getGitHubRepoDetails(full.repositoryUrl) : undefined;
        updatedProject = mapDbProject(full, gh);
      } else {
        throw new Error("Proyek tidak ditemukan.");
      }
    } else {
      throw new Error("DATABASE_URL tidak disetel");
    }
  } catch (err) {
    console.warn("DB update project failed, using memory store:", err);
    const index = runtimeProjects.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error("Proyek tidak ditemukan");
    }
    const prev = runtimeProjects[index];
    const client = INITIAL_CLIENTS.find((c) => c.id === parsed.clientId) || prev.client;

    updatedProject = {
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
      credentialPasswordEncrypted: enc ? `enc_${enc.encrypted.slice(0, 16)}_gcm` : prev.credentialPasswordEncrypted,
      credentialPasswordPlain: parsed.credentialPassword || prev.credentialPasswordPlain,
      credentials: parsed.credentials
        ? parsed.credentials.map((c, idx) => ({
            id: c.id || `cred-${idx}`,
            projectId: prev.id,
            name: c.name,
            type: c.type || "other",
            host: c.host,
            port: c.port,
            username: c.username,
            passwordPlain: c.password || "",
            notes: c.notes,
          }))
        : prev.credentials || [],
      updatedAt: new Date().toISOString(),
    };
    runtimeProjects[index] = updatedProject;
  }

  await createActivityLog({
    memberId: currentUser.id,
    memberName: currentUser.name,
    projectId: updatedProject.id,
    projectName: updatedProject.name,
    action: "PROJECT_UPDATED",
    details: `Memperbarui informasi proyek '${updatedProject.name}'`,
  });

  safeRevalidate(`/projects/${id}`);
  safeRevalidate("/projects");
  safeRevalidate("/dashboard");
  return { success: true, project: updatedProject };
}

export async function deleteProjectAction(id: string) {
  const currentUser = await getCurrentUser();

  try {
    if (process.env.DATABASE_URL) {
      await db.delete(projects).where(or(eq(projects.id, id), eq(projects.slug, id)));
    }
  } catch (err) {
    console.warn("DB delete project failed or falling back to memory:", err);
    const index = runtimeProjects.findIndex((p) => p.id === id);
    if (index !== -1) {
      runtimeProjects.splice(index, 1);
    }
  }

  await createActivityLog({
    memberId: currentUser.id,
    memberName: currentUser.name,
    projectId: id,
    action: "PROJECT_DELETED",
    details: `Menghapus proyek ID '${id}'`,
  });

  safeRevalidate("/projects");
  safeRevalidate("/dashboard");
  return { success: true };
}

