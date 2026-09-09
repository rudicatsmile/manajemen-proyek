"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FolderKanban, ShieldCheck, ArrowRight, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("admin@projectku.id");
  const [password, setPassword] = React.useState("password123");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 400);
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 400);
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50 p-4 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2.5 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <FolderKanban className="h-6 w-6" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Project Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Masuk ke dasbor internal tim software
          </p>
        </div>

        {/* Card Form */}
        <Card className="border-slate-200 shadow-lg dark:border-slate-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Masuk Akun</CardTitle>
            <CardDescription>
              Masukkan alamat email dan kata sandi Anda untuk melanjutkan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@projectku.id"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Kata Sandi
                  </label>
                  <span className="text-[11px] text-blue-600 hover:underline cursor-pointer">
                    Lupa sandi?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="******"
                    className="pl-9"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full justify-center gap-2" disabled={loading}>
                {loading ? "Memproses..." : "Masuk ke Dasbor"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            {/* Quick Demo Login Preset Buttons */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[11px] font-medium text-slate-500 mb-2 text-center">
                Pintasan Demo Cepat (Tahap 1 Data Dummy):
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin("admin@projectku.id")}
                  className="text-xs justify-center gap-1"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                  Login Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin("dimas.dev@projectku.id")}
                  className="text-xs justify-center"
                >
                  Login Member
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="text-center text-xs text-slate-500">
          Belum memiliki akun tim?{" "}
          <Link href="/sign-up" className="text-blue-600 font-semibold hover:underline">
            Minta Undangan Akses
          </Link>
        </div>
      </div>
    </div>
  );
}
