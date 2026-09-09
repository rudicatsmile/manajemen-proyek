"use client";

import Link from "next/link";
import { FolderKanban, Info, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50 p-4 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2.5 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <FolderKanban className="h-6 w-6" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Pendaftaran Pengguna Tim
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Portal Manajemen Proyek Internal
          </p>
        </div>

        <Card className="border-slate-200 shadow-lg dark:border-slate-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Khusus Anggota Terundang</CardTitle>
            <CardDescription>
              Aplikasi ini adalah sistem internal tertutup untuk developer dan tim manajemen proyek.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300 leading-relaxed flex items-start gap-2.5">
              <Info className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Cara Mendapatkan Akun:</p>
                <p>
                  Pendaftaran akun baru dilakukan melalui undangan email resmi dari Admin tim melalui menu Manajemen Tim. Silakan hubungi Lead Developer atau Admin perusahaan Anda untuk meminta tautan undangan.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <Link href="/sign-in">
                <Button className="w-full justify-center gap-2">
                  <Mail className="h-4 w-4" />
                  Sudah Memiliki Akun? Masuk di Sini
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full justify-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Kembali ke Beranda
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
