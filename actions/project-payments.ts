"use server";

import { revalidatePath } from "next/cache";
import { ProjectPayment } from "@/lib/mock-data";
import { getCurrentUser, getOrCreateDbMember } from "@/lib/auth";
import { createActivityLog } from "@/lib/activity-logger";
import { sanitizeInput } from "@/lib/sanitize";
import { formatRupiah } from "@/lib/currency";
import { db } from "@/lib/db";
import { projectPayments } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { runtimeProjects } from "@/lib/data-store";

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Aman jika dipanggil di luar request lifecycle
  }
}

export async function addProjectPaymentAction(data: {
  projectId: string;
  amount: number;
  paymentDate?: string;
  note?: string;
}) {
  if (!data.projectId) {
    throw new Error("ID Proyek wajib disertakan");
  }

  if (!data.amount || data.amount <= 0) {
    throw new Error("Nominal pembayaran harus lebih dari 0");
  }

  const currentUser = await getCurrentUser();
  const dbUser = await getOrCreateDbMember();

  const cleanNote = data.note ? sanitizeInput(data.note).trim() : "";
  const paymentDate = data.paymentDate ? new Date(data.paymentDate) : new Date();

  let newPayment: ProjectPayment;

  try {
    if (process.env.DATABASE_URL) {
      const [inserted] = await db
        .insert(projectPayments)
        .values({
          projectId: data.projectId,
          amount: data.amount.toString(),
          paymentDate,
          note: cleanNote || null,
          recordedById: dbUser.id,
        })
        .returning();

      if (inserted) {
        newPayment = {
          id: inserted.id,
          projectId: inserted.projectId,
          amount: parseFloat(inserted.amount),
          paymentDate: inserted.paymentDate.toISOString(),
          note: inserted.note || undefined,
          recordedByName: dbUser.name,
          createdAt: inserted.createdAt.toISOString(),
        };
      } else {
        throw new Error("Gagal menyimpan data pembayaran ke database");
      }
    } else {
      throw new Error("DATABASE_URL tidak disetel");
    }
  } catch (err) {
    console.warn("DB add payment failed, fallback to memory store:", err);
    newPayment = {
      id: `payment-${Date.now()}`,
      projectId: data.projectId,
      amount: data.amount,
      paymentDate: paymentDate.toISOString(),
      note: cleanNote || undefined,
      recordedByName: currentUser.name,
      createdAt: new Date().toISOString(),
    };

    const project = runtimeProjects.find((p) => p.id === data.projectId);
    if (project) {
      if (!project.payments) project.payments = [];
      project.payments.unshift(newPayment);
    }
  }

  const formattedAmount = formatRupiah(data.amount);
  await createActivityLog({
    memberId: currentUser.id,
    memberName: currentUser.name,
    projectId: data.projectId,
    action: "NOTE_CREATED",
    details: `Mencatat pembayaran masuk ${formattedAmount}${cleanNote ? ` (${cleanNote})` : ""}`,
  });

  safeRevalidate(`/projects/${data.projectId}`);
  safeRevalidate("/projects");
  safeRevalidate("/dashboard");

  return { success: true, payment: newPayment };
}

export async function deleteProjectPaymentAction(projectId: string, paymentId: string) {
  if (!projectId || !paymentId) {
    throw new Error("ID Proyek dan ID Pembayaran wajib disertakan");
  }

  const currentUser = await getCurrentUser();

  try {
    if (process.env.DATABASE_URL) {
      await db.delete(projectPayments).where(eq(projectPayments.id, paymentId));
    }
  } catch (err) {
    console.warn("DB delete payment failed or fallback to memory:", err);
  }

  const project = runtimeProjects.find((p) => p.id === projectId);
  if (project && project.payments) {
    project.payments = project.payments.filter((p) => p.id !== paymentId);
  }

  await createActivityLog({
    memberId: currentUser.id,
    memberName: currentUser.name,
    projectId: projectId,
    action: "NOTE_DELETED",
    details: "Menghapus catatan riwayat pembayaran proyek",
  });

  safeRevalidate(`/projects/${projectId}`);
  safeRevalidate("/projects");
  safeRevalidate("/dashboard");

  return { success: true };
}
