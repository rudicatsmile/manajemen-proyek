/**
 * Modul Integrasi Bunny CDN untuk Pengiriman Aset Statis & Media Publik
 * Mendukung fallback lokal otomatis saat CDN tidak dikonfigurasi.
 */

const CDN_BASE_URL = process.env.NEXT_PUBLIC_CDN_URL?.replace(/\/$/, "") || "";
const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE || "";
const BUNNY_API_KEY = process.env.BUNNY_API_KEY || "";

/**
 * Menghasilkan URL absolut aset statis melalui Bunny CDN dengan fallback lokal
 */
export function getCdnAssetUrl(path: string): string {
  if (!path) return "";

  // Jika sudah merupakan URL absolut (misalnya Unsplash atau https), kembalikan langsung
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const cleanPath = path.startsWith("/") ? path.substring(1) : path;

  if (CDN_BASE_URL) {
    return `${CDN_BASE_URL}/${cleanPath}`;
  }

  // Fallback lokal default
  return `/${cleanPath}`;
}

/**
 * Helper avatar pengguna dengan fallback nama inisial jika URL foto kosong
 */
export function getAvatarUrl(url?: string | null): string | null {
  if (!url) return null;
  return getCdnAssetUrl(url);
}

/**
 * Upload file statis ke Bunny CDN Storage API (hanya berjalan jika kredensial storage tersedia)
 */
export async function uploadToBunnyStorage(
  fileName: string,
  fileBuffer: Buffer,
  contentType: string = "application/octet-stream"
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!BUNNY_STORAGE_ZONE || !BUNNY_API_KEY) {
    return {
      success: false,
      error: "Kredensial BUNNY_STORAGE_ZONE atau BUNNY_API_KEY belum dikonfigurasi.",
    };
  }

  const endpoint = `https://storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}/${fileName}`;

  try {
    const res = await fetch(endpoint, {
      method: "PUT",
      headers: {
        AccessKey: BUNNY_API_KEY,
        "Content-Type": contentType,
      },
      body: fileBuffer as unknown as BodyInit,
    });

    if (res.ok) {
      const publicUrl = CDN_BASE_URL
        ? `${CDN_BASE_URL}/${fileName}`
        : `https://${BUNNY_STORAGE_ZONE}.b-cdn.net/${fileName}`;
      return { success: true, url: publicUrl };
    }

    return {
      success: false,
      error: `Gagal upload ke Bunny CDN: status ${res.status} ${res.statusText}`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error upload Bunny CDN";
    return { success: false, error: msg };
  }
}
