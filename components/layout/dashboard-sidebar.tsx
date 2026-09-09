"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Building2,
  Users,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "Dasbor",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Daftar Proyek",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    label: "Master Klien",
    href: "/clients",
    icon: Building2,
  },
  {
    label: "Manajemen Tim",
    href: "/team",
    icon: Users,
  },
];

interface DashboardSidebarProps {
  onNavClick?: () => void;
  className?: string;
}

export function DashboardSidebar({ onNavClick, className }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-zinc-950",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6 dark:border-slate-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
          <FolderKanban className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
            Project Management
          </span>
          <span className="text-[11px] font-medium text-slate-500">
            Internal Workspace
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="px-3 text-[11px] font-semibold text-slate-600 uppercase tracking-wider dark:text-slate-400">
          Menu Utama
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 font-semibold"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-zinc-900 dark:hover:text-slate-100"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* User Profile & Logout */}
      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 dark:bg-zinc-900/60">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold text-white text-xs">
            RP
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="truncate text-xs font-semibold text-slate-900 dark:text-white">
              Rian Pratama
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="h-3 w-3" />
              Admin
            </span>
          </div>
          <Link
            href="/sign-in"
            title="Keluar akun"
            className="rounded p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-slate-200 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
