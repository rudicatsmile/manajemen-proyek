import { NextRequest, NextResponse } from "next/server";
import { runtimeMembers } from "@/lib/data-store";
import { createActivityLog } from "@/lib/activity-logger";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const eventType = payload.type;
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL || "admin@projectku.id";

    // 1. Tangani user baru dibuat atau diperbarui
    if (eventType === "user.created" || eventType === "user.updated") {
      const { id: clerkId, email_addresses, first_name, last_name, image_url } = payload.data;
      const primaryEmail = email_addresses?.[0]?.email_address || "";
      const fullName = [first_name, last_name].filter(Boolean).join(" ") || "Anggota Tim";
      const role = primaryEmail.toLowerCase() === adminEmail.toLowerCase() ? "admin" : "member";

      const existingIndex = runtimeMembers.findIndex(
        (m) => m.email.toLowerCase() === primaryEmail.toLowerCase() || m.id === clerkId
      );

      if (existingIndex !== -1) {
        runtimeMembers[existingIndex] = {
          ...runtimeMembers[existingIndex],
          name: fullName,
          email: primaryEmail,
          avatarUrl: image_url,
          role,
        };
      } else {
        runtimeMembers.push({
          id: clerkId,
          name: fullName,
          email: primaryEmail,
          role,
          specialization: "Developer",
          avatarUrl: image_url,
          createdAt: new Date().toISOString().split("T")[0],
        });
      }

      await createActivityLog({
        memberId: clerkId,
        memberName: fullName,
        action: "MEMBER_ADDED",
        details: `Sinkronisasi akun Clerk (${fullName}, peran: ${role})`,
      });

      console.log(`[Clerk Webhook] Pengguna berhasil disinkronkan: ${fullName} (${primaryEmail}) - Peran: ${role}`);
    }

    // 2. Tangani user dihapus
    if (eventType === "user.deleted") {
      const { id: clerkId } = payload.data;
      const index = runtimeMembers.findIndex((m) => m.id === clerkId);
      if (index !== -1) {
        const removed = runtimeMembers.splice(index, 1)[0];
        console.log(`[Clerk Webhook] Pengguna dihapus dari sistem: ${removed.name} (${removed.email})`);
      }
    }

    return NextResponse.json({ success: true, message: "Webhook processed successfully" });
  } catch (error) {
    console.error("[Clerk Webhook Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
