/**
 * Modul Sanitasi Input Pengguna untuk Proteksi XSS (Cross-Site Scripting)
 */

/**
 * Membersihkan string dari karakter berbahaya dan tag HTML/Script yang berpotensi XSS
 */
export function sanitizeInput(input?: string | null): string {
  if (!input) return "";

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/javascript:[^"']*/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/on\w+\s*=\s*[^>\s]+/gi, "")
    .trim();
}

/**
 * Sanitasi rekursif untuk seluruh properti bertipe string dalam objek form
 */
export function sanitizeObject<T extends Record<string, unknown>>(data: T): T {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      result[key] = sanitizeInput(value);
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}
