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
