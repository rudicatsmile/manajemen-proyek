import { ActivityAction, ActivityLog } from "./mock-data";
import { runtimeActivityLogs } from "./data-store";

export { runtimeActivityLogs };

export interface CreateActivityLogParams {
  memberId: string;
  memberName: string;
  projectId?: string;
  projectName?: string;
  action: ActivityAction;
  entityType?: "project" | "client" | "member" | "note" | "team";
  details: string;
  metadata?: Record<string, unknown>;
}

/**
 * Helper perbandingan data sebelum dan sesudah perubahan (Task 2.4)
 * Mendeteksi kolom yang berubah dan menyensor kredensial rahasia
 */
export function diffChanges<T extends Record<string, unknown>>(
  oldData: T,
  newData: T,
  sensitiveKeys: string[] = [
    "password",
    "credentialPassword",
    "credentialPasswordPlain",
    "credentialIv",
  ]
): { field: string; from: unknown; to: unknown }[] {
  const differences: { field: string; from: unknown; to: unknown }[] = [];

  for (const key of Object.keys(newData)) {
    if (sensitiveKeys.includes(key)) {
      continue;
    }

    const valOld = oldData[key];
    const valNew = newData[key];

    if (valOld !== undefined && valNew !== undefined && valOld !== valNew) {
      differences.push({
        field: key,
        from: valOld,
        to: valNew,
      });
    }
  }

  return differences;
}

/**
 * Format ringkasan teks perubahan data dalam Bahasa Indonesia
 */
export function formatChangeSummary(
  diffs: { field: string; from: unknown; to: unknown }[]
): string {
  if (diffs.length === 0) return "Tidak ada data yang berubah";
  return diffs
    .map(
      (d) =>
        `Kolom '${d.field}' diubah dari '${String(d.from)}' menjadi '${String(d.to)}'`
    )
    .join(", ");
}

/**
 * Membuat catatan log aktivitas audit trail baru
 * Menjamin kredensial password tidak pernah bocor ke dalam log
 */
export async function createActivityLog(
  params: CreateActivityLogParams
): Promise<ActivityLog> {
  // Sensor sanitasi jika ada kata sandi atau password di metadata
  const sanitizedMetadata = { ...params.metadata };
  if (sanitizedMetadata.password) delete sanitizedMetadata.password;
  if (sanitizedMetadata.credentialPassword) delete sanitizedMetadata.credentialPassword;
  if (sanitizedMetadata.credentialPasswordPlain) delete sanitizedMetadata.credentialPasswordPlain;

  const newLog: ActivityLog = {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    projectId: params.projectId,
    projectName: params.projectName,
    memberId: params.memberId,
    memberName: params.memberName,
    action: params.action,
    details: params.details,
    createdAt: "Baru saja",
  };

  runtimeActivityLogs.unshift(newLog);
  return newLog;
}

export function getRuntimeActivityLogs(): ActivityLog[] {
  return runtimeActivityLogs;
}
