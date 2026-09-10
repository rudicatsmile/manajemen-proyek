"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Filter,
  RotateCcw,
  GitBranch,
  Building2,
  Users,
  FileText,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Banknote,
  LayoutGrid,
  LayoutList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/currency";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import {
  Project,
  Client,
  STATUS_CONFIG,
  INITIAL_PROJECTS,
  INITIAL_CLIENTS,
} from "@/lib/mock-data";
import { getProjectsAction, deleteProjectAction } from "@/actions/projects";
import { getClientsAction } from "@/actions/clients";

export default function ProjectsPage() {
  const [allProjects, setAllProjects] = React.useState<Project[]>(INITIAL_PROJECTS);
  const [allClients, setAllClients] = React.useState<Client[]>(INITIAL_CLIENTS);
  const [loading, setLoading] = React.useState(true);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");
  const [selectedClient, setSelectedClient] = React.useState<string>("all");

  // State untuk konfirmasi hapus proyek
  const [projectToDelete, setProjectToDelete] = React.useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  // Mode tampilan: 'detailed' (kartu rinci) atau 'compact' (satu baris ringkas)
  const [viewMode, setViewMode] = React.useState<"detailed" | "compact">("detailed");

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("pm_projects_view_mode");
      if (saved === "detailed" || saved === "compact") {
        setViewMode(saved);
      }
    } catch {
      // Abaikan jika localStorage tidak diizinkan di browser
    }
  }, []);

  const handleViewModeChange = (mode: "detailed" | "compact") => {
    setViewMode(mode);
    try {
      localStorage.setItem("pm_projects_view_mode", mode);
    } catch {
      // Abaikan
    }
  };

  React.useEffect(() => {
    async function loadData() {
      try {
        const [projects, clients] = await Promise.all([
          getProjectsAction(),
          getClientsAction(),
        ]);
        if (projects) setAllProjects(projects);
        if (clients) setAllClients(clients);
      } catch (err) {
        console.error("Gagal memuat data proyek:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredProjects = React.useMemo(() => {
    return allProjects.filter((project) => {
      // Search text match
      const query = searchQuery.toLowerCase().trim();
      const matchQuery =
        !query ||
        project.name.toLowerCase().includes(query) ||
        project.client.name.toLowerCase().includes(query) ||
        project.client.companyName.toLowerCase().includes(query) ||
        project.repositoryUrl.toLowerCase().includes(query) ||
        project.frontendTech.toLowerCase().includes(query) ||
        project.backendTech.toLowerCase().includes(query);

      // Status match
      const matchStatus =
        selectedStatus === "all" || project.status === selectedStatus;

      // Client match
      const matchClient =
        selectedClient === "all" || project.clientId === selectedClient;

      return matchQuery && matchStatus && matchClient;
    });
  }, [allProjects, searchQuery, selectedStatus, selectedClient]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("all");
    setSelectedClient("all");
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await deleteProjectAction(projectToDelete.id);
      if (res.success) {
        setSuccessMessage(`Proyek '${projectToDelete.name}' berhasil dihapus.`);
        setAllProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
        setProjectToDelete(null);
        setTimeout(() => setSuccessMessage(""), 4000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus proyek";
      setErrorMessage(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const isFiltered =
    searchQuery !== "" || selectedStatus !== "all" || selectedClient !== "all";

  return (
    <DashboardShell
      title="Daftar Proyek"
      subtitle="Kelola seluruh portofolio proyek software, status pengerjaan, dan kredensial teknis."
    >
      <div className="space-y-6">
        {/* Notifikasi Sukses / Error */}
        {successMessage && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800 flex items-center gap-2 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Top Control Bar: Search & Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama proyek, klien, tech stack, atau repository..."
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2.5">
            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs text-slate-500 hover:text-slate-700 gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Filter
              </Button>
            )}
            <Link href="/projects/new">
              <Button size="sm" className="gap-1.5 shadow-xs">
                <Plus className="h-4 w-4" />
                Tambah Proyek
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Toolbar */}
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-zinc-900 shadow-xs">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                <Filter className="h-3.5 w-3.5 text-blue-600" />
                Filter Data:
              </div>

              {/* Status Filter */}
              <div className="flex-1">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  aria-label="Filter status proyek"
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-slate-700 dark:bg-zinc-900 dark:text-slate-100"
                >
                  <option value="all">Semua Status Proyek</option>
                  <option value="planning">Perencanaan (Planning)</option>
                  <option value="in_progress">Sedang Berjalan (In Progress)</option>
                  <option value="on_hold">Tertunda (On Hold)</option>
                  <option value="completed">Selesai (Completed)</option>
                  <option value="cancelled">Dibatalkan (Cancelled)</option>
                </select>
              </div>

              {/* Client Filter */}
              <div className="flex-1">
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  aria-label="Filter klien proyek"
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-slate-700 dark:bg-zinc-900 dark:text-slate-100"
                >
                  <option value="all">Semua Klien Instansi</option>
                  {allClients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.companyName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Results Summary & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Menampilkan <strong className="text-slate-900 dark:text-white">{filteredProjects.length}</strong> dari{" "}
            {allProjects.length} total proyek
          </span>

          {/* Segmented Control Mode Detail / Mode Ringkas */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100/90 p-0.5 dark:border-slate-800 dark:bg-zinc-900 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => handleViewModeChange("detailed")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all",
                viewMode === "detailed"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-zinc-800 dark:text-white font-semibold"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium"
              )}
              aria-label="Mode Detail"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Mode Detail</span>
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange("compact")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all",
                viewMode === "compact"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-zinc-800 dark:text-white font-semibold"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium"
              )}
              aria-label="Mode Ringkas"
            >
              <LayoutList className="h-3.5 w-3.5" />
              <span>Mode Ringkas</span>
            </button>
          </div>
        </div>

        {/* Projects List View */}
        {filteredProjects.length === 0 ? (
          <Card className="border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Tidak ada proyek yang sesuai dengan kriteria pencarian
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Coba gunakan kata kunci lain atau klik tombol reset filter.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="mt-4 gap-1 text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Kosongkan Filter
            </Button>
          </Card>
        ) : viewMode === "detailed" ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredProjects.map((project) => {
              const statusInfo = STATUS_CONFIG[project.status];
              return (
                <Card
                  key={project.id}
                  className="border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-zinc-900 dark:hover:border-slate-700 transition-all shadow-xs"
                >
                  <CardContent className="p-5 sm:p-6 space-y-4">
                    {/* Card Header Info */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <Link
                            href={`/projects/${project.id}`}
                            className="text-base sm:text-lg font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {project.name}
                          </Link>
                          <span
                            className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold border ${statusInfo.bgClass} ${statusInfo.textClass} ${statusInfo.borderClass}`}
                          >
                            {statusInfo.label}
                          </span>

                          {/* Live Website Indicator */}
                          {project.liveUrl && (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border bg-slate-50 text-slate-700 border-slate-200 hover:text-blue-600 hover:border-blue-300 dark:bg-zinc-800/80 dark:text-slate-300 dark:border-zinc-700 transition-colors"
                              title={`Buka live website: ${project.liveUrl}`}
                            >
                              <span
                                className={cn(
                                  "h-2 w-2 rounded-full",
                                  project.lastHealthStatus === "online"
                                    ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]"
                                    : project.lastHealthStatus === "degraded"
                                    ? "bg-amber-500"
                                    : project.lastHealthStatus === "offline"
                                    ? "bg-rose-500"
                                    : "bg-slate-400"
                                )}
                              />
                              <span>Live Website</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          Klien:{" "}
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {project.client.companyName}
                          </span>
                          <span className="text-slate-400">({project.client.name})</span>
                        </p>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex items-center gap-2">
                        <Link href={`/projects/${project.id}/edit`}>
                          <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs gap-1">
                            <Edit className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setProjectToDelete(project)}
                          className="h-8 px-2.5 text-xs gap-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-slate-200 dark:border-slate-800 dark:hover:bg-rose-950/40"
                          title="Hapus proyek"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Hapus</span>
                        </Button>
                        <Link href={`/projects/${project.id}`}>
                          <Button size="sm" className="h-8 px-3 text-xs gap-1">
                            Buka Detail
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                      {project.description}
                    </p>

                    {/* Financial summary bar */}
                    {(() => {
                      const contract = project.contractAmount || 0;
                      if (contract <= 0) return null;

                      const payments = project.payments || [];
                      const paid = payments.reduce((sum, p) => sum + p.amount, 0);
                      const remaining = Math.max(0, contract - paid);
                      const percent =
                        contract > 0
                          ? Math.min(100, Math.round((paid / contract) * 100))
                          : 0;

                      return (
                        <div className="flex items-center justify-between flex-wrap gap-2 py-2 px-3 rounded-lg bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-100 dark:border-slate-800/80 text-xs">
                          <div className="flex items-center gap-2">
                            <Banknote className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-slate-500 font-medium">Kontrak:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {formatRupiah(contract)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <div className="flex items-center gap-1 text-[11px]">
                              <span className="text-slate-400">Terbayar:</span>
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                {formatRupiah(paid)}
                              </span>
                              <span className="text-slate-400 font-mono">({percent}%)</span>
                            </div>
                            <span
                              className={cn(
                                "inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold border",
                                remaining === 0
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                                  : paid > 0
                                  ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
                                  : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                              )}
                            >
                              {remaining === 0
                                ? "Lunas"
                                : paid > 0
                                ? "Sebagian"
                                : "Belum Bayar"}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Bottom Metadata Bar */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                      {/* Tech Stack */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-[11px] text-slate-400">Stack:</span>
                        <span className="rounded bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                          {project.frontendTech}
                        </span>
                        <span className="rounded bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                          {project.backendTech}
                        </span>
                        <span className="rounded bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                          {project.databaseTech}
                        </span>
                      </div>

                      {/* Stats & Links */}
                      <div className="flex items-center gap-4 text-slate-500 shrink-0">
                        <span className="flex items-center gap-1 font-mono text-[11px] text-blue-600 dark:text-blue-400">
                          <GitBranch className="h-3 w-3" />
                          {project.githubDetails.defaultBranch}
                        </span>
                        <span className="flex items-center gap-1 text-[11px]">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          {project.members.length} Anggota
                        </span>
                        <span className="flex items-center gap-1 text-[11px]">
                          <FileText className="h-3.5 w-3.5 text-slate-400" />
                          {project.notes.length} Catatan
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Mode Ringkas: Single-line Compact Row List */
          <div className="rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-zinc-900 divide-y divide-slate-100 dark:divide-zinc-800 overflow-hidden">
            {filteredProjects.map((project) => {
              const statusInfo = STATUS_CONFIG[project.status];
              return (
                <div
                  key={project.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:px-4 hover:bg-slate-50/70 dark:hover:bg-zinc-850/50 transition-colors"
                >
                  {/* Left: Nama Proyek & Klien & Status */}
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 flex-wrap">
                    <Link
                      href={`/projects/${project.id}`}
                      className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
                      title={project.name}
                    >
                      {project.name}
                    </Link>
                    <span className="text-slate-300 dark:text-zinc-700 hidden sm:inline">|</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:inline">
                      {project.client.companyName}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold border shrink-0 ${statusInfo.bgClass} ${statusInfo.textClass} ${statusInfo.borderClass}`}
                    >
                      {statusInfo.label}
                    </span>

                    {/* Compact Live Dot */}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-blue-600 transition-colors shrink-0"
                        title={`Live: ${project.liveUrl}`}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            project.lastHealthStatus === "online"
                              ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]"
                              : project.lastHealthStatus === "degraded"
                              ? "bg-amber-500"
                              : project.lastHealthStatus === "offline"
                              ? "bg-rose-500"
                              : "bg-slate-400"
                          )}
                        />
                        <span className="hidden md:inline font-mono">Live</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>

                  {/* Right Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <Link href={`/projects/${project.id}/edit`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2.5 text-xs gap-1"
                        title="Edit proyek"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setProjectToDelete(project)}
                      className="h-8 px-2.5 text-xs gap-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-slate-200 dark:border-slate-800 dark:hover:bg-rose-950/40"
                      title="Hapus proyek"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Hapus</span>
                    </Button>
                    <Link href={`/projects/${project.id}`}>
                      <Button size="sm" className="h-8 px-3 text-xs gap-1">
                        <span className="hidden sm:inline">Detail</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Dialog Konfirmasi Hapus Proyek */}
        <Modal
          isOpen={!!projectToDelete}
          onClose={() => setProjectToDelete(null)}
          title="Konfirmasi Hapus Proyek"
          description={`Apakah Anda yakin ingin menghapus proyek '${projectToDelete?.name}'?`}
        >
          <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
            <p>
              Tindakan ini akan menghapus data dokumentasi proyek, catatan, penugasan tim, dan kredensial terenkripsi secara permanen dari database.
            </p>
            {errorMessage && (
              <div className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setProjectToDelete(null)}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
              >
                {isDeleting ? "Menghapus..." : "Hapus Proyek"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardShell>
  );
}
