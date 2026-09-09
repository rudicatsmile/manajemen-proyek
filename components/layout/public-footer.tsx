import Link from "next/link";
import { FolderKanban } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50 py-12 dark:border-slate-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <FolderKanban className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              Project Management
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-400">
            <Link href="#fitur" className="hover:text-blue-600 transition-colors">
              Fitur Sistem
            </Link>
            <Link href="#keamanan" className="hover:text-blue-600 transition-colors">
              Enkripsi AES-256
            </Link>
            <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
              Dasbor Internal
            </Link>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hak Cipta (c) 2026 Project Management. Seluruh hak dilindungi undang-undang.
          </p>
        </div>
      </div>
    </footer>
  );
}
