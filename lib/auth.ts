import { INITIAL_MEMBERS, Member } from "@/lib/mock-data";
import { currentUser as clerkCurrentUser } from "@clerk/nextjs/server";

export interface CurrentUserSession {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
}

/**
 * Mengambil informasi akun user yang sedang aktif
 * Menggunakan Clerk session jika tersedia, dengan fallback ke session akun default
 */
export async function getCurrentUser(): Promise<CurrentUserSession> {
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || "admin@projectku.id";

  try {
    const clerkUser = await clerkCurrentUser();
    if (clerkUser) {
      const email = clerkUser.emailAddresses?.[0]?.emailAddress || adminEmail;
      const name =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
        "Pengguna";
      const role = email.toLowerCase() === adminEmail.toLowerCase() ? "admin" : "member";

      return {
        id: clerkUser.id,
        name,
        email,
        role,
      };
    }
  } catch {
    // Fallback jika mode development offline atau key dummy
  }

  // Akun pengembang aktif default
  return {
    id: INITIAL_MEMBERS[0].id,
    name: INITIAL_MEMBERS[0].name,
    email: adminEmail,
    role: "admin",
  };
}

/**
 * Mengambil objek Member lengkap dari pengguna yang sedang login
 */
export async function getCurrentMember(): Promise<Member> {
  const user = await getCurrentUser();
  const existing = INITIAL_MEMBERS.find((m) => m.id === user.id);

  if (existing) {
    return existing;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    specialization: "Lead Architect",
    avatarUrl: INITIAL_MEMBERS[0].avatarUrl,
    createdAt: new Date().toISOString().split("T")[0],
  };
}

/**
 * Memeriksa apakah user saat ini memiliki peran Admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user.role === "admin";
}

/**
 * Guard proteksi otorisasi khusus Admin
 * Melemparkan error jika bukan Admin
 */
export async function requireAdmin(): Promise<CurrentUserSession> {
  const user = await getCurrentUser();
  if (user.role !== "admin") {
    throw new Error("Akses ditolak: Anda harus memiliki peran Admin untuk aksi ini.");
  }
  return user;
}

/**
 * Sinkronkan dan ambil user aktif dari tabel `members` Neon PostgreSQL
 * Menjamin id bertipe UUID valid untuk foreign key relasi database
 */
export async function getOrCreateDbMember(): Promise<{
  id: string;
  clerkId: string;
  name: string;
  email: string;
  role: "admin" | "member";
}> {
  const currentUser = await getCurrentUser();
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || "admin@projectku.id";

  try {
    if (process.env.DATABASE_URL) {
      const { db } = await import("@/lib/db");
      const { members } = await import("@/lib/db/schema");
      const { eq, or } = await import("drizzle-orm");

      const existing = await db
        .select()
        .from(members)
        .where(
          or(
            eq(members.clerkId, currentUser.id),
            eq(members.email, currentUser.email)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return existing[0];
      }

      // Insert member baru jika belum terdaftar
      const [inserted] = await db
        .insert(members)
        .values({
          clerkId: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role:
            currentUser.email.toLowerCase() === adminEmail.toLowerCase()
              ? "admin"
              : currentUser.role,
        })
        .returning();

      if (inserted) {
        return inserted;
      }
    }
  } catch (err) {
    console.error("Gagal sinkronisasi member ke Neon DB:", err);
  }

  // Fallback jika DB offline
  return {
    id: "00000000-0000-0000-0000-000000000001",
    clerkId: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    role: currentUser.role,
  };
}

