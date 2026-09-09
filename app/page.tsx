import Link from "next/link";
import {
  ShieldCheck,
  GitBranch,
  History,
  Users2,
  ArrowRight,
  Database,
  Terminal,
  Lock,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import type { Metadata } from "next";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Pusat Kendali Dokumentasi dan Proyek Software",
  description:
    "Aplikasi internal untuk mengelola repositori GitHub, kredensial server terenkripsi, penugasan tim, dan riwayat aktivitas proyek software.",
  openGraph: {
    title: "Project Management - Pusat Kendali Dokumentasi Software",
    description:
      "Aplikasi internal untuk mengelola repositori GitHub, kredensial server terenkripsi, penugasan tim, dan riwayat aktivitas proyek software.",
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "Project Management - Pusat Kendali Dokumentasi Software",
    description:
      "Aplikasi internal untuk mengelola repositori GitHub, kredensial server terenkripsi, penugasan tim, dan riwayat aktivitas proyek software.",
  },
};

export default function HomePage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-white dark:bg-zinc-950">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24 border-b border-slate-100 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            {/* Eyebrow */}
            <span className="text-xs font-semibold tracking-wider text-blue-600 uppercase mb-3 dark:text-blue-400">
              Inventarisasi dan Dokumentasi Software
            </span>

            {/* Headline: Max 2 lines */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Pusat Kendali Dokumentasi dan Proyek Software Anda
            </h1>

            {/* Subtext: Max 20 words */}
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Kelola kredensial aman, repository GitHub, tim pengembang, dan log aktivitas proyek dalam satu aplikasi terpadu.
            </p>

            {/* CTAs: Single-line buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto gap-2 text-base px-7">
                  Buka Dasbor
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#fitur" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base">
                  Pelajari Fitur
                </Button>
              </Link>
            </div>
          </div>

          {/* Interactive Hero Product Preview Component */}
          <div className="mt-12 max-w-4xl mx-auto">
            <Card className="border border-slate-200 shadow-xl overflow-hidden dark:border-slate-800 dark:bg-zinc-900">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-zinc-950 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-mono text-slate-500">
                    si-desa.projectku.internal
                  </span>
                </div>
                <Badge variant="success">Sedang Berjalan</Badge>
              </div>

              <CardContent className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Sistem Informasi Desa (SI-Desa)
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Klien: Pemerintah Desa Sukamaju
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="font-mono text-[11px]">
                      Next.js 15
                    </Badge>
                    <Badge variant="outline" className="font-mono text-[11px]">
                      NestJS
                    </Badge>
                    <Badge variant="outline" className="font-mono text-[11px]">
                      PostgreSQL
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Repo Box */}
                  <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-zinc-950/60">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <GitBranch className="h-3.5 w-3.5 text-blue-600" />
                        Repository GitHub
                      </span>
                      <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                        Branch: main
                      </span>
                    </div>
                    <p className="mt-2 font-mono text-xs text-blue-600 dark:text-blue-400 truncate">
                      github.com/eduwbemu/si-desa
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Commit terbaru: feat: integrasi modul export surat (2 jam lalu)
                    </p>
                  </div>

                  {/* Credential Box */}
                  <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-zinc-950/60">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <Lock className="h-3.5 w-3.5 text-purple-600" />
                        Kredensial Server Terenkripsi
                      </span>
                      <span className="text-[11px] font-medium text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded">
                        AES-256-GCM
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-600 dark:text-slate-400">
                        User: admin_sidesa
                      </span>
                      <span className="font-mono text-slate-400 tracking-widest">
                        **********
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Password terenkripsi aman dan tidak terekspos di log aktivitas.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section className="py-6 border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-medium text-slate-500">
            Digunakan oleh tim teknis pengembang untuk mengelola dokumentasi dan repositori proyek software internal
          </p>
        </div>
      </section>

      {/* Features Bento Grid Section */}
      <section id="fitur" className="py-16 md:py-24 bg-white dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Fitur Lengkap untuk Manajemen Proyek Modern
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Dirancang khusus untuk memecahkan masalah data proyek yang tercecer di berbagai catatan pribadi.
            </p>
          </div>

          {/* Bento Grid: 4 distinct cells */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Cell 1: Kredensial Enkripsi */}
            <Card className="lg:col-span-2 border-slate-200 bg-gradient-to-br from-white to-blue-50/40 dark:from-zinc-900 dark:to-blue-950/20">
              <CardContent className="p-6 sm:p-8">
                <div className="h-10 w-10 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-4 shadow-sm">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Enkripsi Kredensial Server AES-256-GCM
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                  Simpan username dan password server, staging, atau database proyek dengan aman. Nilai password dienkripsi sebelum masuk database dan tidak pernah dicatat sebagai teks terbuka di log aktivitas.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-white/80 dark:bg-zinc-900">
                    Dekripsi Sisi Server
                  </Badge>
                  <Badge variant="outline" className="bg-white/80 dark:bg-zinc-900">
                    Tombol Tampil Password Khusus Hak Akses
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Cell 2: Integrasi GitHub API */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardContent className="p-6 sm:p-8">
                <div className="h-10 w-10 rounded-lg bg-purple-600 text-white flex items-center justify-center mb-4 shadow-sm">
                  <GitBranch className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Integrasi GitHub API
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Menampilkan status default branch, jumlah bintang, open issues, dan riwayat commit terakhir langsung dari GitHub dengan strategi caching hemat kuota.
                </p>
              </CardContent>
            </Card>

            {/* Cell 3: Log Aktivitas Audit Trail */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardContent className="p-6 sm:p-8">
                <div className="h-10 w-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-sm">
                  <History className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Jejak Audit Aktivitas Lengkap
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Mencatat secara kronologis siapa yang membuat proyek, memperbarui status, menambah anggota tim, hingga menambahkan catatan dokumentasi teknis.
                </p>
              </CardContent>
            </Card>

            {/* Cell 4: Multi-Anggota & Klien */}
            <Card className="lg:col-span-2 border-slate-200 bg-gradient-to-br from-white to-purple-50/40 dark:from-zinc-900 dark:to-purple-950/20">
              <CardContent className="p-6 sm:p-8">
                <div className="h-10 w-10 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center mb-4 shadow-sm">
                  <Users2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Alokasi Anggota Tim dan Master Klien
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                  Hubungkan banyak developer dengan peran spesifik (Project Manager, Frontend, Backend, QA, Designer) ke tiap proyek, serta pisahkan master data klien untuk menghindari duplikasi input.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-white/80 dark:bg-zinc-900">
                    Dukungan Multi-Penugasan
                  </Badge>
                  <Badge variant="outline" className="bg-white/80 dark:bg-zinc-900">
                    Aturan Proteksi Hapus Klien Aktif
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security & Non-Functional Highlight Section */}
      <section id="keamanan" className="py-16 bg-slate-50 border-t border-slate-200 dark:border-slate-800 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div>
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider dark:text-blue-400">
                Fondasi Teruji
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
                Dirancang Cepat, Aman, dan Siap Produksi
              </h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Dibangun di atas teknologi modern untuk menjamin keandalan data proyek internal perusahaan Anda.
              </p>
              <div className="mt-6">
                <Link href="/dashboard">
                  <Button className="gap-2">
                    Masuk ke Aplikasi
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-zinc-900 shadow-xs">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Next.js 15 App Router
                </div>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Performa rendering cepat menggunakan React Server Components dan arsitektur route modern.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-zinc-900 shadow-xs">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Neon PostgreSQL & Drizzle
                </div>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Penyimpanan data relasional kuat dengan skema type-safe dan migrasi terstruktur.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-zinc-900 shadow-xs">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Clerk Authentication
                </div>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Proteksi sesi login yang aman dengan metode Email dan Password untuk anggota tim terdaftar.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-zinc-900 shadow-xs">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Validasi Zod Server Actions
                </div>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Validasi input ketat dari sisi klien hingga server untuk perlindungan keamanan data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
