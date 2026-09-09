import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { FolderKanban } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masuk Akun",
  description: "Masuk ke portal manajemen proyek software.",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-slate-50 p-4 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-6 flex flex-col items-center">
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-2.5 mb-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md transition-transform group-hover:scale-105">
            <FolderKanban className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Project Management
          </span>
        </Link>

        {/* Clerk Sign In Component */}
        <div className="w-full flex justify-center">
          <SignIn
            routing="path"
            path="/sign-in"
            fallbackRedirectUrl="/dashboard"
            signUpUrl="/sign-up"
          />
        </div>
      </div>
    </div>
  );
}
