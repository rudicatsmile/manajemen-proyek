"use client";

import * as React from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import {
  GitBranch,
  Building2,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Edit,
  Plus,
  Pin,
  Clock,
  ExternalLink,
  Shield,
  Star,
  Users,
  FileText,
  History,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import {
  STATUS_CONFIG,
  PROJECT_ROLE_LABELS,
  ProjectMemberRole,
  Project,
  Member,
  INITIAL_MEMBERS,
  ActivityLog,
} from "@/lib/mock-data";
import { getProjectByIdAction, deleteProjectAction } from "@/actions/projects";
import {
  addProjectNoteAction,
  togglePinNoteAction,
  deleteProjectNoteAction,
} from "@/actions/project-notes";
import {
  addProjectMemberAction,
  removeProjectMemberAction,
} from "@/actions/project-members";
import { getTeamMembersAction } from "@/actions/team";
import { getRuntimeActivityLogs } from "@/lib/activity-logger";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const unwrappedParams = React.use(params);
  const router = useRouter();

  const [project, setProject] = React.useState<Project | null>(null);
  const [teamMembers, setTeamMembers] = React.useState<Member[]>(INITIAL_MEMBERS);
  const [activityLogs, setActivityLogs] = React.useState<ActivityLog[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [activeTab, setActiveTab] = React.useState<"members" | "notes" | "activity">("notes");
  const [showPassword, setShowPassword] = React.useState(false);
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  // Note creation form state
  const [newNoteTitle, setNewNoteTitle] = React.useState("");
  const [newNoteContent, setNewNoteContent] = React.useState("");
  const [newNotePinned, setNewNotePinned] = React.useState(false);
  const [submittingNote, setSubmittingNote] = React.useState(false);

  // Add member modal state
  const [addMemberModalOpen, setAddMemberModalOpen] = React.useState(false);
  const [selectedMemberId, setSelectedMemberId] = React.useState(INITIAL_MEMBERS[1]?.id || "");
  const [selectedMemberRole, setSelectedMemberRole] = React.useState<ProjectMemberRole>("frontend");
  const [submittingMember, setSubmittingMember] = React.useState(false);

  // Delete project state
  const [deleteModalOpen, setDeleteDialogOpen] = React.useState(false);
  const [isDeletingProject, setIsDeletingProject] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState("");

  const refreshProjectData = React.useCallback(async () => {
    try {
      const [proj, members, logs] = await Promise.all([
        getProjectByIdAction(unwrappedParams.projectId),
        getTeamMembersAction(),
        Promise.resolve(getRuntimeActivityLogs()),
      ]);

      if (proj) {
        setProject(proj);
      }
      if (members && members.length > 0) {
        setTeamMembers(members);
        if (!selectedMemberId && members[0]) {
          setSelectedMemberId(members[0].id);
        }
      }
      if (logs) {
        const projectLogs = logs.filter(
          (l) => l.projectId === unwrappedParams.projectId || l.projectName === proj?.name
        );
        setActivityLogs(projectLogs);
      }
    } catch (err) {
      console.error("Gagal memuat data detail proyek:", err);
    } finally {
      setLoading(false);
    }
  }, [unwrappedParams.projectId, selectedMemberId]);

  React.useEffect(() => {
    refreshProjectData();
  }, [refreshProjectData]);

  if (!loading && !project) {
    return notFound();
  }

  if (!project) {
    return (
      <DashboardShell title="Memuat Proyek..." subtitle="Mengambil data dari server...">
        <div className="py-12 text-center text-xs text-slate-500">Memuat rincian proyek...</div>
      </DashboardShell>
    );
  }

  const statusInfo = STATUS_CONFIG[project.status];

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || submittingNote) return;

    setSubmittingNote(true);
    try {
      const fullContent = newNoteTitle.trim()
        ? `[${newNoteTitle.trim()}]\n${newNoteContent.trim()}`
        : newNoteContent.trim();

      const res = await addProjectNoteAction({
        projectId: project.id,
        content: fullContent,
        pinned: newNotePinned,
      });

      if (res.success && res.note) {
        setProject((prev) =>
          prev
            ? {
                ...prev,
                notes: [res.note, ...prev.notes],
              }
            : prev
        );
        setNewNoteTitle("");
        setNewNoteContent("");
        setNewNotePinned(false);
        refreshProjectData();
      }
    } catch (err) {
      console.error("Gagal menambahkan catatan:", err);
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingMember) return;

    setSubmittingMember(true);
    try {
      const res = await addProjectMemberAction({
        projectId: project.id,
        memberId: selectedMemberId,
        role: selectedMemberRole,
      });

      if (res.success && res.projectMember) {
        setProject((prev) =>
          prev
            ? {
                ...prev,
                members: [...prev.members, res.projectMember],
              }
            : prev
        );
        setAddMemberModalOpen(false);
        refreshProjectData();
      }
    } catch (err) {
      console.error("Gagal menugaskan anggota:", err);
    } finally {
      setSubmittingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const res = await removeProjectMemberAction(project.id, memberId);
      if (res.success) {
        setProject((prev) =>
          prev
            ? {
                ...prev,
                members: prev.members.filter((m) => m.memberId !== memberId),
              }
            : prev
        );
        refreshProjectData();
      }
    } catch (err) {
      console.error("Gagal menghapus penugasan anggota:", err);
    }
  };

  const handleTogglePinNote = async (noteId: string) => {
    try {
      const res = await togglePinNoteAction(project.id, noteId);
      if (res.success) {
        setProject((prev) =>
          prev
            ? {
                ...prev,
                notes: prev.notes.map((n) =>
                  n.id === noteId ? { ...n, isPinned: res.pinned ?? !n.isPinned } : n
                ),
              }
            : prev
        );
      }
    } catch (err) {
      console.error("Gagal menyematkan catatan:", err);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const res = await deleteProjectNoteAction(project.id, noteId);
      if (res.success) {
        setProject((prev) =>
          prev
            ? {
                ...prev,
                notes: prev.notes.filter((n) => n.id !== noteId),
              }
            : prev
        );
        refreshProjectData();
      }
    } catch (err) {
      console.error("Gagal menghapus catatan:", err);
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    setIsDeletingProject(true);
    setDeleteError("");
    try {
      const res = await deleteProjectAction(project.id);
      if (res.success) {
        router.push("/projects");
      } else {
        setDeleteError("Gagal menghapus proyek dari database.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus proyek";
      setDeleteError(msg);
    } finally {
      setIsDeletingProject(false);
    }
  };

  const sortedNotes = [...project.notes].sort((a, b) => {
    if (a.isPinned === b.isPinned) return 0;
    return a.isPinned ? -1 : 1;
  });

  return (
    <DashboardShell
      title={project.name}
      subtitle={`Klien: ${project.client.companyName}`}
    >
      <div className="space-y-6">
        {/* Top Header Card */}
        <Card className="border-slate-200 shadow-xs dark:border-slate-800">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {project.name}
                  </h1>
                  <span
                    className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-semibold border ${statusInfo.bgClass} ${statusInfo.textClass} ${statusInfo.borderClass}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  Klien Terdaftar:{" "}
                  <Link href={`/clients`} className="font-semibold text-blue-600 hover:underline">
                    {project.client.companyName}
                  </Link>
                  <span className="text-slate-400">({project.client.name})</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(project.repositoryUrl, "repo")}
                  className="text-xs gap-1.5"
                >
                  {copiedField === "repo" ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      Tersalin!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Salin Repository
                    </>
                  )}
                </Button>
                <Link href={`/projects/${project.id}/edit`}>
                  <Button size="sm" className="text-xs gap-1.5">
                    <Edit className="h-3.5 w-3.5" />
                    Edit Data Proyek
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-xs gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-slate-200 dark:border-slate-800 dark:hover:bg-rose-950/40"
                  title="Hapus proyek"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Hapus Proyek
                </Button>
              </div>
            </div>

            {/* Description */}
            <p className="mt-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
              {project.description}
            </p>
          </CardContent>
        </Card>

        {/* 2-Column Overview Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tech Stack & Kredensial Box */}
          <Card className="border-slate-200 shadow-xs dark:border-slate-800">
            <CardHeader className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                Spesifikasi Teknis & Kredensial Akses
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              {/* Tech Stack */}
              <div className="space-y-2">
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
                  Tech Stack
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-zinc-950">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Frontend</p>
                    <p className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                      {project.frontendTech}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-zinc-950">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Backend</p>
                    <p className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                      {project.backendTech}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-zinc-950">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Database</p>
                    <p className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                      {project.databaseTech}
                    </p>
                  </div>
                </div>
              </div>

              {/* Kredensial Box */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px] flex items-center gap-1">
                    <Lock className="h-3 w-3 text-purple-600" />
                    Kredensial Server (Terenkripsi AES-256)
                  </span>
                  <span className="text-[10px] text-purple-600 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded font-medium">
                    Aman Terlindungi
                  </span>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 space-y-2.5 dark:border-slate-800 dark:bg-zinc-950">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Username:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">
                        {project.credentialUsername}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(project.credentialUsername, "username")}
                        className="h-6 w-6 text-slate-400"
                        title="Salin username"
                      >
                        {copiedField === "username" ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800 pt-2">
                    <span className="text-slate-500">Kata Sandi:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">
                        {showPassword
                          ? project.credentialPasswordPlain
                          : "****************"}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPassword(!showPassword)}
                        className="h-6 w-6 text-slate-400"
                        title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(project.credentialPasswordPlain, "pwd")}
                        className="h-6 w-6 text-slate-400"
                        title="Salin password"
                      >
                        {copiedField === "pwd" ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GitHub Repository Widget */}
          <Card className="border-slate-200 shadow-xs dark:border-slate-800">
            <CardHeader className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-purple-600" />
                Status Integrasi GitHub
              </CardTitle>
              <Badge variant="outline" className="text-[11px] font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40">
                Terhubung (Read-Only)
              </Badge>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <p className="text-slate-500 text-[11px]">URL Repositori:</p>
                <a
                  href={project.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 truncate"
                >
                  {project.repositoryUrl}
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-zinc-950">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Branch</span>
                  <p className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {project.githubDetails.defaultBranch}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-zinc-950">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Visibilitas</span>
                  <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 mt-0.5">
                    {project.githubDetails.isPrivate ? "Private Repo" : "Public Repo"}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-zinc-950">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Bintang</span>
                  <p className="font-mono text-xs font-semibold text-amber-600 mt-0.5 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-500" />
                    {project.githubDetails.starsCount}
                  </p>
                </div>
              </div>

              {/* Latest Commit Card */}
              <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-3.5 dark:border-purple-900/60 dark:bg-purple-950/30 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-purple-900 dark:text-purple-300">
                    Commit Terakhir:
                  </span>
                  <span className="font-mono text-slate-500 text-[10px]">
                    #{project.githubDetails.latestCommit.hash}
                  </span>
                </div>
                <p className="font-mono text-xs text-slate-800 dark:text-slate-200 font-medium">
                  &quot;{project.githubDetails.latestCommit.message}&quot;
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>Oleh: <strong>{project.githubDetails.latestCommit.authorName}</strong></span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {project.githubDetails.latestCommit.committedAt}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3 Interactive Tabs */}
        <div className="space-y-4">
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab("notes")}
              className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === "notes"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <FileText className="h-4 w-4" />
              Catatan & Dokumentasi ({project.notes.length})
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === "members"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Users className="h-4 w-4" />
              Anggota Tim Proyek ({project.members.length})
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === "activity"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <History className="h-4 w-4" />
              Log Aktivitas ({activityLogs.length})
            </button>
          </div>

          {/* TAB 1: Catatan & Dokumentasi */}
          {activeTab === "notes" && (
            <div className="space-y-6">
              {/* Form Tambah Catatan */}
              <Card className="border-slate-200 shadow-xs dark:border-slate-800">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-bold">
                    Tulis Catatan Dokumentasi Baru
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <form onSubmit={handleAddNote} className="space-y-3">
                    <Input
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      placeholder="Judul catatan (misal: Keputusan Arsitektur, Hasil Rapat)..."
                      className="text-xs"
                    />
                    <textarea
                      rows={3}
                      required
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder="Tulis detail catatan dokumentasi teknis atau progres pengerjaan di sini..."
                      className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-slate-700 dark:bg-zinc-900 dark:text-slate-100"
                    />
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newNotePinned}
                          onChange={(e) => setNewNotePinned(e.target.checked)}
                          className="rounded text-blue-600"
                        />
                        Sematkan di urutan paling atas (Pin)
                      </label>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={submittingNote}
                        className="text-xs gap-1.5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {submittingNote ? "Menyimpan..." : "Simpan Catatan"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* List of Notes */}
              <div className="space-y-3">
                {sortedNotes.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl">
                    Belum ada catatan atau dokumentasi untuk proyek ini.
                  </div>
                ) : (
                  sortedNotes.map((note) => (
                    <Card
                      key={note.id}
                      className={`border-slate-200 shadow-xs dark:border-slate-800 ${
                        note.isPinned ? "border-l-4 border-l-blue-600 bg-blue-50/20" : ""
                      }`}
                    >
                      <CardContent className="p-4 sm:p-5 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                {note.title}
                              </h3>
                              {note.isPinned && (
                                <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                  <Pin className="h-2.5 w-2.5 fill-blue-600" />
                                  Tersemat
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500">
                              Ditulis oleh{" "}
                              <strong className="text-slate-700 dark:text-slate-300">
                                {note.authorName}
                              </strong>{" "}
                              pada {note.createdAt}
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTogglePinNote(note.id)}
                              className="h-7 text-xs text-slate-500 hover:text-blue-600 gap-1"
                            >
                              <Pin className="h-3 w-3" />
                              {note.isPinned ? "Lepas Pin" : "Sematkan"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteNote(note.id)}
                              className="h-7 w-7 text-slate-400 hover:text-rose-600"
                              title="Hapus Catatan"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line pt-1">
                          {note.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Anggota Tim Proyek */}
          {activeTab === "members" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Daftar Anggota Tim yang Ditugaskan
                  </h2>
                  <p className="text-xs text-slate-500">
                    Developer dan personil yang memiliki hak akses ke proyek ini.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setAddMemberModalOpen(true)}
                  className="gap-1.5 text-xs shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Tambah Anggota
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.members.map((pm) => (
                  <Card key={pm.id} className="border-slate-200 shadow-xs dark:border-slate-800">
                    <CardContent className="p-4 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {pm.member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {pm.member.name}
                          </p>
                          <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                            {PROJECT_ROLE_LABELS[pm.role]}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {pm.member.email}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMember(pm.memberId)}
                        className="h-7 w-7 text-slate-400 hover:text-rose-600 shrink-0"
                        title="Keluarkan dari proyek"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Log Aktivitas Proyek */}
          {activeTab === "activity" && (
            <Card className="border-slate-200 shadow-xs dark:border-slate-800">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-sm font-bold">
                  Riwayat Aktivitas Proyek Ini
                </CardTitle>
                <CardDescription className="text-xs">
                  Seluruh perubahan data proyek, status, anggota, dan catatan tercatat otomatis.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-4">
                  {activityLogs.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">
                      Belum ada catatan aktivitas untuk proyek ini.
                    </div>
                  ) : (
                    activityLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 text-xs pb-3 border-b border-slate-100 dark:border-slate-800 last:border-0"
                      >
                        <div className="h-7 w-7 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {log.memberName
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <div>
                          <p className="text-slate-800 dark:text-slate-200">
                            <strong>{log.memberName}</strong>: {log.details}
                          </p>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {log.createdAt}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal Tambah Anggota ke Proyek */}
      <Modal
        isOpen={addMemberModalOpen}
        onClose={() => setAddMemberModalOpen(false)}
        title="Tugaskan Anggota ke Proyek"
        description="Pilih personil tim dan tentukan peran spesifiknya pada proyek ini."
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Pilih Anggota Tim
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 dark:border-slate-700 dark:bg-zinc-900 dark:text-slate-100"
            >
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.specialization})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Peran dalam Proyek Ini
            </label>
            <select
              value={selectedMemberRole}
              onChange={(e) => setSelectedMemberRole(e.target.value as ProjectMemberRole)}
              className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 dark:border-slate-700 dark:bg-zinc-900 dark:text-slate-100"
            >
              <option value="project_manager">Project Manager</option>
              <option value="frontend">Frontend Developer</option>
              <option value="backend">Backend Developer</option>
              <option value="fullstack">Fullstack Developer</option>
              <option value="designer">UI/UX Designer</option>
              <option value="qa">QA & Tester</option>
              <option value="other">Anggota Tim Lainnya</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAddMemberModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={submittingMember}>
              {submittingMember ? "Menyimpan..." : "Simpan Penugasan"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Dialog Konfirmasi Hapus Proyek */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Konfirmasi Hapus Proyek"
        description={`Apakah Anda yakin ingin menghapus proyek '${project.name}'?`}
      >
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
          <p>
            Tindakan ini akan menghapus data dokumentasi proyek, catatan tim, penugasan anggota, dan kredensial terenkripsi secara permanen dari database. Tindakan ini tidak dapat dibatalkan.
          </p>
          {deleteError && (
            <div className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{deleteError}</span>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={isDeletingProject}
              onClick={handleDeleteProject}
            >
              {isDeletingProject ? "Menghapus..." : "Hapus Proyek"}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  );
}
