import Link from "next/link";
import {
  FolderKanban,
  PlayCircle,
  Building2,
  Users,
  ArrowRight,
  Plus,
  Clock,
  ExternalLink,
  GitBranch,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUS_CONFIG } from "@/lib/mock-data";
import type { Metadata } from "next";
import { getProjectsAction } from "@/actions/projects";
import { getClientsAction } from "@/actions/clients";
import { getTeamMembersAction } from "@/actions/team";
import { getRuntimeActivityLogs } from "@/lib/activity-logger";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dasbor Ringkasan",
  description: "Pantau status operasional dan aktivitas proyek internal.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardPage() {
  const [projects, clients, members, activities] = await Promise.all([
    getProjectsAction(),
    getClientsAction(),
    getTeamMembersAction(),
    Promise.resolve(getRuntimeActivityLogs()),
  ]);

  const totalProjects = projects.length;
  const inProgressProjects = projects.filter((p) => p.status === "in_progress").length;
  const totalClients = clients.length;
  const totalMembers = members.length;

  const recentProjects = projects.slice(0, 5);
  const recentActivities = activities.slice(0, 5);

  return (
    <DashboardShell
      title="Dasbor Ringkasan"
      subtitle="Pantau status operasional dan aktivitas seluruh proyek software internal."
    >
      <div className="space-y-8">
        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-200 shadow-xs dark:border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Proyek
                </span>
                <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center">
                  <FolderKanban className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {totalProjects}
                </span>
                <p className="mt-1 text-xs text-slate-500">
                  Terdaftar di database
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-xs dark:border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Sedang Berjalan
                </span>
                <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center">
                  <PlayCircle className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {inProgressProjects}
                </span>
                <p className="mt-1 text-xs text-slate-500">
                  Fase pengerjaan aktif
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-xs dark:border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Klien
                </span>
                <div className="h-9 w-9 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 flex items-center justify-center">
                  <Building2 className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {totalClients}
                </span>
                <p className="mt-1 text-xs text-slate-500">
                  Instansi dan perusahaan
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-xs dark:border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Anggota Tim
                </span>
                <div className="h-9 w-9 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 flex items-center justify-center">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {totalMembers}
                </span>
                <p className="mt-1 text-xs text-slate-500">
                  Developer dan desainer
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Proyek Terbaru */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Daftar Proyek Terbaru
                </h2>
                <p className="text-xs text-slate-500">
                  5 proyek terakhir yang diperbarui oleh tim.
                </p>
              </div>
              <Link href="/projects">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-blue-600 dark:text-blue-400">
                  Lihat Semua
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {recentProjects.map((project) => {
                const statusInfo = STATUS_CONFIG[project.status];
                return (
                  <Card
                    key={project.id}
                    className="hover:border-blue-300 transition-colors shadow-xs dark:hover:border-blue-800"
                  >
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              href={`/projects/${project.id}`}
                              className="text-sm sm:text-base font-semibold text-slate-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 transition-colors truncate"
                            >
                              {project.name}
                            </Link>
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold border ${statusInfo.bgClass} ${statusInfo.textClass} ${statusInfo.borderClass}`}
                            >
                              {statusInfo.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Klien:{" "}
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {project.client.companyName}
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="hidden md:inline-flex items-center gap-1 font-mono text-[11px] text-slate-500">
                            <GitBranch className="h-3 w-3" />
                            {project.githubDetails.defaultBranch}
                          </span>
                          <Link href={`/projects/${project.id}`}>
                            <Button variant="outline" size="sm" className="text-xs gap-1">
                              Detail
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>

                      {/* Tech Stack Chips */}
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                        <span className="font-medium text-slate-400">Stack:</span>
                        <span className="rounded bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 font-mono">
                          {project.frontendTech.split(",")[0]}
                        </span>
                        <span className="rounded bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 font-mono">
                          {project.backendTech.split(",")[0]}
                        </span>
                        <span className="rounded bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 font-mono">
                          {project.databaseTech.split(",")[0]}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Right Col: Aktivitas Terbaru */}
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Aktivitas Terbaru
              </h2>
              <p className="text-xs text-slate-500">
                Audit log kronologis perubahan data.
              </p>
            </div>

            <Card className="border-slate-200 shadow-xs dark:border-slate-800">
              <CardContent className="p-4 sm:p-5 space-y-4">
                {recentActivities.map((act, index) => (
                  <div
                    key={act.id}
                    className={`flex items-start gap-3 text-xs ${
                      index !== recentActivities.length - 1
                        ? "pb-3 border-b border-slate-100 dark:border-slate-800/60"
                        : ""
                    }`}
                  >
                    <div className="h-7 w-7 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 font-semibold text-[10px]">
                      {act.memberName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-slate-800 dark:text-slate-200 leading-snug">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {act.memberName}
                        </span>{" "}
                        {act.details}
                      </p>
                      {act.projectName && (
                        <p className="font-medium text-blue-600 dark:text-blue-400 text-[11px] truncate">
                          {act.projectName}
                        </p>
                      )}
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Clock className="h-3 w-3" />
                        {act.createdAt}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions Panel */}
            <Card className="border-slate-200 shadow-xs bg-gradient-to-br from-white to-slate-50 dark:border-slate-800 dark:from-zinc-900 dark:to-zinc-950">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-semibold">
                  Aksi Cepat
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-2">
                <Link href="/projects/new" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                    <Plus className="h-3.5 w-3.5 text-blue-600" />
                    Tambah Proyek Baru
                  </Button>
                </Link>
                <Link href="/clients/new" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                    <Plus className="h-3.5 w-3.5 text-purple-600" />
                    Tambah Data Klien
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
