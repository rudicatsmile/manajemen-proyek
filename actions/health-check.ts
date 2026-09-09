"use server";

import { revalidatePath } from "next/cache";
import { checkProjectHealth, HealthCheckResult } from "@/lib/health-checker";
import { getCurrentUser } from "@/lib/auth";
import { createActivityLog } from "@/lib/activity-logger";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { runtimeProjects } from "@/lib/data-store";

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Aman jika dipanggil di luar request lifecycle
  }
}

export async function checkProjectHealthAction(projectId: string): Promise<{
  success: boolean;
  result: HealthCheckResult;
}> {
  if (!projectId) {
    throw new Error("ID Proyek wajib disertakan");
  }

  // 1. Cari URL proyek
  let targetUrl: string | null = null;
  let projectName = "Proyek";

  try {
    if (process.env.DATABASE_URL) {
      const [found] = await db
        .select()
        .from(projects)
        .where(or(eq(projects.id, projectId), eq(projects.slug, projectId)));

      if (found) {
        targetUrl = found.liveUrl || null;
        projectName = found.name;
      }
    }
  } catch (err) {
    console.warn("DB find project for health check failed, checking memory:", err);
  }

  if (!targetUrl) {
    const memProject = runtimeProjects.find((p) => p.id === projectId || p.name === projectId);
    if (memProject) {
      targetUrl = memProject.liveUrl || null;
      projectName = memProject.name;
    }
  }

  if (!targetUrl || targetUrl.trim().length === 0) {
    throw new Error("Proyek ini belum memiliki URL Website / Domain Live untuk dipantau.");
  }

  // 2. Jalankan live test HTTP uptime dan SSL
  const result = await checkProjectHealth(targetUrl);

  // 3. Simpan hasil terakhir ke database
  try {
    if (process.env.DATABASE_URL) {
      await db
        .update(projects)
        .set({
          lastHealthStatus: result.uptimeStatus,
          lastHttpCode: result.httpCode ? result.httpCode.toString() : null,
          lastResponseTime: result.responseTimeMs.toString(),
          sslStatus: result.sslStatus,
          sslExpiresAt: result.sslExpiresAt ? new Date(result.sslExpiresAt) : null,
          lastCheckedAt: new Date(result.lastCheckedAt),
        })
        .where(or(eq(projects.id, projectId), eq(projects.slug, projectId)));
    }
  } catch (err) {
    console.warn("DB update health status failed:", err);
  }

  // 4. Update memory store fallback
  const memProj = runtimeProjects.find((p) => p.id === projectId || p.name === projectId);
  if (memProj) {
    memProj.lastHealthStatus = result.uptimeStatus;
    memProj.lastHttpCode = result.httpCode || undefined;
    memProj.lastResponseTime = result.responseTimeMs;
    memProj.sslStatus = result.sslStatus;
    memProj.sslExpiresAt = result.sslExpiresAt || undefined;
    memProj.sslDaysRemaining = result.sslDaysRemaining || undefined;
    memProj.lastCheckedAt = result.lastCheckedAt;
  }

  // 5. Catat log aktivitas
  const currentUser = await getCurrentUser();
  await createActivityLog({
    memberId: currentUser.id,
    memberName: currentUser.name,
    projectId,
    projectName,
    action: "PROJECT_UPDATED",
    details: `Pemeriksaan kesehatan live website: ${result.uptimeStatus.toUpperCase()} (${result.responseTimeMs} ms, SSL: ${result.sslStatus})`,
  });

  safeRevalidate(`/projects/${projectId}`);
  safeRevalidate("/projects");
  safeRevalidate("/dashboard");

  return { success: true, result };
}
