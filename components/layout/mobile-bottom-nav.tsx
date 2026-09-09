"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Building2,
  Users,
  Plus,
  X,
  Globe,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionItem {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  iconColor: string;
  badge?: string;
}

const QUICK_ACTIONS: QuickActionItem[] = [
  {
    title: "Buat Proyek Baru",
    description: "Input portofolio proyek, repositori, dan kredensial server",
    href: "/projects/new",
    icon: FolderKanban,
    iconColor: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
  },
  {
    title: "Tambah Klien Baru",
    description: "Daftarkan perusahaan atau instansi klien baru",
    href: "/clients/new",
    icon: Building2,
    iconColor: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
  },
  {
    title: "Kelola & Undang Tim",
    description: "Undang personil developer atau atur peran sistem",
    href: "/team",
    icon: Users,
    iconColor: "bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400",
  },
  {
    title: "Buka Beranda Publik",
    description: "Tinjau halaman depan / landing page utama aplikasi",
    href: "/",
    icon: Globe,
    iconColor: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = React.useState(false);

  // Prevent background scroll when bottom sheet is open
  React.useEffect(() => {
    if (sheetOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sheetOpen]);

  // Close sheet on route change
  React.useEffect(() => {
    setSheetOpen(false);
  }, [pathname]);

  const navItems = [
    {
      label: "Dasbor",
      href: "/dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard",
    },
    {
      label: "Proyek",
      href: "/projects",
      icon: FolderKanban,
      isActive: pathname.startsWith("/projects"),
    },
    // Center Quick Action is rendered separately
    {
      label: "Klien",
      href: "/clients",
      icon: Building2,
      isActive: pathname.startsWith("/clients"),
    },
    {
      label: "Tim",
      href: "/team",
      icon: Users,
      isActive: pathname.startsWith("/team"),
    },
  ];

  return (
    <>
      {/* Bottom Sheet Backdrop Overlay */}
      {sheetOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setSheetOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Quick Action Bottom Sheet */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 w-full max-w-lg mx-auto bg-white dark:bg-zinc-950 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-5 shadow-2xl transition-transform duration-300 ease-out lg:hidden flex flex-col",
          sheetOpen ? "translate-y-0" : "translate-y-full pointer-events-none"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Tindakan Cepat"
      >
        {/* Drag Handle Indicator */}
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full mx-auto mb-3" />

        {/* Sheet Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Tindakan Cepat
            </h3>
            <p className="text-[11px] text-slate-500">
              Pilih menu aksi yang ingin Anda lakukan di mode seluler.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSheetOpen(false)}
            className="h-7 w-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-zinc-800 dark:hover:text-slate-200 transition-colors"
            aria-label="Tutup sheet"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action Items List */}
        <div className="py-3 space-y-2">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                onClick={() => setSheetOpen(false)}
                className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-blue-50/60 hover:border-blue-200 dark:border-zinc-800/80 dark:bg-zinc-900/60 dark:hover:bg-blue-950/40 dark:hover:border-blue-800/60 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                      action.iconColor
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {action.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {action.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </Link>
            );
          })}
        </div>

        {/* Close Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setSheetOpen(false)}
            className="w-full py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-300 dark:hover:bg-zinc-850 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Fixed Mobile Bottom Navigation Bar */}
      <nav
        className="fixed bottom-0 inset-x-0 z-40 lg:hidden border-t border-slate-200/90 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-zinc-950/95 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
        aria-label="Navigasi Bawah Seluler"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-1">
          {/* Tab 1: Dasbor */}
          <Link
            href={navItems[0].href}
            className={cn(
              "flex flex-col items-center justify-center py-1 gap-1 text-[10px] font-medium transition-colors",
              navItems[0].isActive
                ? "text-blue-600 font-semibold dark:text-blue-400"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            )}
          >
            <LayoutDashboard
              className={cn(
                "h-5 w-5 transition-transform",
                navItems[0].isActive && "scale-110"
              )}
            />
            <span>{navItems[0].label}</span>
          </Link>

          {/* Tab 2: Proyek */}
          <Link
            href={navItems[1].href}
            className={cn(
              "flex flex-col items-center justify-center py-1 gap-1 text-[10px] font-medium transition-colors",
              navItems[1].isActive
                ? "text-blue-600 font-semibold dark:text-blue-400"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            )}
          >
            <FolderKanban
              className={cn(
                "h-5 w-5 transition-transform",
                navItems[1].isActive && "scale-110"
              )}
            />
            <span>{navItems[1].label}</span>
          </Link>

          {/* Center Raised Action Button (+) */}
          <div className="flex flex-col items-center justify-center relative -top-3">
            <button
              type="button"
              onClick={() => setSheetOpen(!sheetOpen)}
              className={cn(
                "h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center transition-all active:scale-95",
                sheetOpen && "rotate-45 bg-slate-900 dark:bg-zinc-800 shadow-slate-900/20"
              )}
              aria-label={sheetOpen ? "Tutup tindakan cepat" : "Buka tindakan cepat"}
            >
              <Plus className="h-6 w-6" />
            </button>
            <span className="text-[9px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
              Aksi
            </span>
          </div>

          {/* Tab 3: Klien */}
          <Link
            href={navItems[2].href}
            className={cn(
              "flex flex-col items-center justify-center py-1 gap-1 text-[10px] font-medium transition-colors",
              navItems[2].isActive
                ? "text-blue-600 font-semibold dark:text-blue-400"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            )}
          >
            <Building2
              className={cn(
                "h-5 w-5 transition-transform",
                navItems[2].isActive && "scale-110"
              )}
            />
            <span>{navItems[2].label}</span>
          </Link>

          {/* Tab 4: Tim */}
          <Link
            href={navItems[3].href}
            className={cn(
              "flex flex-col items-center justify-center py-1 gap-1 text-[10px] font-medium transition-colors",
              navItems[3].isActive
                ? "text-blue-600 font-semibold dark:text-blue-400"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            )}
          >
            <Users
              className={cn(
                "h-5 w-5 transition-transform",
                navItems[3].isActive && "scale-110"
              )}
            />
            <span>{navItems[3].label}</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
