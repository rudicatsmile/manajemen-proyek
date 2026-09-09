import crypto from "crypto";

// Mengambil kunci enkripsi 32-byte dari environment variable
function getEncryptionKey(): Buffer {
  const hexKey = process.env.CREDENTIAL_ENCRYPTION_KEY || "";
  if (hexKey.length === 64) {
    return Buffer.from(hexKey, "hex");
  }
  // Fallback dev key 32 bytes
  return crypto.createHash("sha256").update(hexKey || "default-secret-key-project-management").digest();
}

export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
}

/**
 * Enkripsi password kredensial menggunakan AES-256-GCM
 */
export function encryptCredential(plainText: string): EncryptedData {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12); // Standar rekomendasi GCM: 12 bytes
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");

  return {
    encrypted,
    iv: iv.toString("hex"),
    tag,
  };
}

/**
 * Dekripsi password kredensial menggunakan AES-256-GCM
 */
export function decryptCredential(
  encryptedHex: string,
  ivHex: string,
  tagHex?: string
): string {
  try {
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);

    if (tagHex) {
      decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    }

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return "Error: Dekripsi kredensial gagal";
  }
}
