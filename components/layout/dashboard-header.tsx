"use client";

import Link from "next/link";
import { Menu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  onMenuToggle: () => void;
  title?: string;
  subtitle?: string;
}

export function DashboardHeader({
  onMenuToggle,
  title = "Dasbor Utama",
  subtitle,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md dark:border-slate-800 dark:bg-zinc-950/95">
      <div className="flex items-center gap-3">
        {/* Mobile Sidebar Trigger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="lg:hidden h-9 w-9 text-slate-600 dark:text-slate-300"
          aria-label="Buka menu navigasi"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Header Title */}
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <Link href="/projects/new">
          <Button size="sm" className="gap-1.5 shadow-xs">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Tambah Proyek</span>
            <span className="sm:hidden">Proyek</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
