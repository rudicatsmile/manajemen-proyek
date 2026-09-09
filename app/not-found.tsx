import Link from "next/link";
import { FolderKanban, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-slate-50 px-4 text-center dark:bg-zinc-950">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 mb-6">
        <FolderKanban className="h-8 w-8" />
      </div>
      <span className="rounded-full bg-slate-200/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 mb-3">
        Error 404
      </span>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white mb-3">
        Halaman Tidak Ditemukan
      </h1>
      <p className="max-w-md text-sm text-slate-600 dark:text-slate-400 mb-8">
        Halaman yang Anda cari tidak tersedia, telah dipindahkan, atau alamat URL yang Anda tuju salah.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <Home className="h-4 w-4" />
            Beranda
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Ke Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
