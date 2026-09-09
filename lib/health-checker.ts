import tls from "tls";
import { URL } from "url";

export interface HealthCheckResult {
  liveUrl: string;
  uptimeStatus: "online" | "degraded" | "offline";
  httpCode: number | null;
  responseTimeMs: number;
  sslStatus: "valid" | "warning" | "expired" | "no_ssl";
  sslExpiresAt: string | null;
  sslDaysRemaining: number | null;
  sslIssuer?: string;
  lastCheckedAt: string;
  errorDetail?: string;
}

/**
 * Normalisasi URL (pastikan memiliki skema https:// atau http://)
 */
export function normalizeUrl(inputUrl: string): string {
  let url = inputUrl.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
}

/**
 * Pengecekan HTTP Uptime dan Latency Response Time
 */
export async function checkWebsiteUptime(urlStr: string): Promise<{
  uptimeStatus: "online" | "degraded" | "offline";
  httpCode: number | null;
  responseTimeMs: number;
  errorDetail?: string;
}> {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(urlStr, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": "AntigravityProjectMonitor/1.0",
        Accept: "*/*",
      },
      cache: "no-store",
    });
    clearTimeout(timeoutId);
    const responseTimeMs = Date.now() - startTime;
    const httpCode = response.status;

    let uptimeStatus: "online" | "degraded" | "offline" = "online";
    if (httpCode >= 500) {
      uptimeStatus = "offline";
    } else if (httpCode >= 400) {
      uptimeStatus = "degraded";
    }

    return {
      uptimeStatus,
      httpCode,
      responseTimeMs,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const responseTimeMs = Date.now() - startTime;
    const msg = err instanceof Error ? err.message : "Koneksi terputus atau batas waktu habis";

    return {
      uptimeStatus: "offline",
      httpCode: null,
      responseTimeMs,
      errorDetail: msg,
    };
  }
}

/**
 * Pengecekan Masa Aktif dan Validitas Sertifikat SSL / TLS
 */
export function checkWebsiteSsl(hostname: string, port = 443): Promise<{
  sslStatus: "valid" | "warning" | "expired" | "no_ssl";
  sslExpiresAt: string | null;
  sslDaysRemaining: number | null;
  sslIssuer?: string;
  errorDetail?: string;
}> {
  return new Promise((resolve) => {
    let resolved = false;

    const socket = tls.connect(
      {
        host: hostname,
        port,
        servername: hostname,
        rejectUnauthorized: false, // Memungkinkan membaca detail cert meski self-signed
        timeout: 7000,
      },
      () => {
        if (resolved) return;
        resolved = true;

        try {
          const peerCert = socket.getPeerCertificate();
          socket.end();

          if (!peerCert || !peerCert.valid_to) {
            resolve({
              sslStatus: "no_ssl",
              sslExpiresAt: null,
              sslDaysRemaining: null,
            });
            return;
          }

          const expiresDate = new Date(peerCert.valid_to);
          const now = Date.now();
          const diffMs = expiresDate.getTime() - now;
          const daysRemaining = Math.floor(diffMs / (1000 * 60 * 60 * 24));

          let sslStatus: "valid" | "warning" | "expired" | "no_ssl" = "valid";
          if (daysRemaining < 0) {
            sslStatus = "expired";
          } else if (daysRemaining < 30) {
            sslStatus = "warning";
          }

          let rawIssuer: string | undefined = undefined;
          if (peerCert.issuer) {
            const val = peerCert.issuer.O || peerCert.issuer.CN;
            if (Array.isArray(val)) {
              rawIssuer = val.join(", ");
            } else if (typeof val === "string") {
              rawIssuer = val;
            }
          }
          const issuer = rawIssuer || "Sertifikat TLS Standar";

          resolve({
            sslStatus,
            sslExpiresAt: expiresDate.toISOString(),
            sslDaysRemaining: daysRemaining,
            sslIssuer: issuer,
          });
        } catch {
          resolve({
            sslStatus: "no_ssl",
            sslExpiresAt: null,
            sslDaysRemaining: null,
          });
        }
      }
    );

    socket.on("timeout", () => {
      if (resolved) return;
      resolved = true;
      socket.destroy();
      resolve({
        sslStatus: "no_ssl",
        sslExpiresAt: null,
        sslDaysRemaining: null,
        errorDetail: "Batas waktu handshake TLS habis",
      });
    });

    socket.on("error", (err) => {
      if (resolved) return;
      resolved = true;
      socket.destroy();
      resolve({
        sslStatus: "no_ssl",
        sslExpiresAt: null,
        sslDaysRemaining: null,
        errorDetail: err.message,
      });
    });
  });
}

/**
 * Pemeriksaan Terpadu: Uptime & SSL
 */
export async function checkProjectHealth(rawUrl: string): Promise<HealthCheckResult> {
  const normalized = normalizeUrl(rawUrl);
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(normalized);
  } catch {
    return {
      liveUrl: rawUrl,
      uptimeStatus: "offline",
      httpCode: null,
      responseTimeMs: 0,
      sslStatus: "no_ssl",
      sslExpiresAt: null,
      sslDaysRemaining: null,
      lastCheckedAt: new Date().toISOString(),
      errorDetail: "Format URL tidak valid",
    };
  }

  const isHttps = parsedUrl.protocol === "https:";
  const port = parsedUrl.port ? parseInt(parsedUrl.port, 10) : isHttps ? 443 : 80;

  // Lakukan pengecekan uptime dan SSL secara paralel
  const [uptimeResult, sslResult] = await Promise.all([
    checkWebsiteUptime(normalized),
    isHttps
      ? checkWebsiteSsl(parsedUrl.hostname, port)
      : Promise.resolve<{
          sslStatus: "valid" | "warning" | "expired" | "no_ssl";
          sslExpiresAt: string | null;
          sslDaysRemaining: number | null;
          sslIssuer?: string;
          errorDetail?: string;
        }>({
          sslStatus: "no_ssl",
          sslExpiresAt: null,
          sslDaysRemaining: null,
          sslIssuer: undefined,
          errorDetail: undefined,
        }),
  ]);

  return {
    liveUrl: normalized,
    uptimeStatus: uptimeResult.uptimeStatus,
    httpCode: uptimeResult.httpCode,
    responseTimeMs: uptimeResult.responseTimeMs,
    sslStatus: sslResult.sslStatus,
    sslExpiresAt: sslResult.sslExpiresAt,
    sslDaysRemaining: sslResult.sslDaysRemaining,
    sslIssuer: sslResult.sslIssuer,
    lastCheckedAt: new Date().toISOString(),
    errorDetail: uptimeResult.errorDetail || sslResult.errorDetail,
  };
}
