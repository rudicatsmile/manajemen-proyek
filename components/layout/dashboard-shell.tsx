"use client";

import * as React from "react";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardHeader } from "./dashboard-header";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function DashboardShell({
  children,
  title,
  subtitle,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="flex min-h-[100dvh] w-full bg-slate-50/50 dark:bg-zinc-950">
      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-40">
        <DashboardSidebar />
      </div>

      {/* Mobile Off-Canvas Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Off-Canvas Drawer Content */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-zinc-950 transition-transform duration-300 ease-in-out lg:hidden shadow-2xl flex flex-col ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute top-3 right-3 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            aria-label="Tutup navigasi"
            className="h-8 w-8 text-slate-500"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <DashboardSidebar onNavClick={() => setMobileOpen(false)} className="w-full border-r-0" />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-64 min-w-0">
        <DashboardHeader
          onMenuToggle={() => setMobileOpen(true)}
          title={title}
          subtitle={subtitle}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar & Quick Action Sheet */}
      <MobileBottomNav />
    </div>
  );
}
