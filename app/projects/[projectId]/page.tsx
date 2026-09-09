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
  KeyRound,
  Server,
  Banknote,
  Receipt,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
  CREDENTIAL_TYPE_CONFIG,
  ProjectCredential,
  ProjectPayment,
} from "@/lib/mock-data";
import { getProjectByIdAction, deleteProjectAction } from "@/actions/projects";
import {
  addProjectPaymentAction,
  deleteProjectPaymentAction,
} from "@/actions/project-payments";
import { formatRupiah, formatNumberWithDots, parseRupiahInput } from "@/lib/currency";
import {
  addProjectCredentialAction,
  deleteProjectCredentialAction,
} from "@/actions/project-credentials";
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

  // Multi-credential state
  const [visiblePasswords, setVisiblePasswords] = React.useState<Record<string, boolean>>({});
  const [addCredModalOpen, setAddCredModalOpen] = React.useState(false);
  const [credName, setCredName] = React.useState("");
  const [credType, setCredType] = React.useState("vps");
  const [credHost, setCredHost] = React.useState("");
  const [credPort, setCredPort] = React.useState("");
  const [credUsername, setCredUsername] = React.useState("");
  const [credPassword, setCredPassword] = React.useState("");
  const [credNotes, setCredNotes] = React.useState("");
  const [submittingCred, setSubmittingCred] = React.useState(false);
  const [credError, setCredError] = React.useState("");

  const [credToDelete, setCredToDelete] = React.useState<ProjectCredential | null>(null);
  const [isDeletingCred, setIsDeletingCred] = React.useState(false);

  // Payment states
  const [addPaymentModalOpen, setAddPaymentModalOpen] = React.useState(false);
  const [paymentAmountInput, setPaymentAmountInput] = React.useState("");
  const [paymentDate, setPaymentDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [paymentNote, setPaymentNote] = React.useState("");
  const [submittingPayment, setSubmittingPayment] = React.useState(false);
  const [paymentError, setPaymentError] = React.useState("");
  const [paymentToDelete, setPaymentToDelete] = React.useState<ProjectPayment | null>(null);
  const [isDeletingPayment, setIsDeletingPayment] = React.useState(false);

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

  const togglePasswordVisibility = (credId: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [credId]: !prev[credId],
    }));
  };

  const handleAddCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !credName.trim() || !credUsername.trim()) return;

    setSubmittingCred(true);
    setCredError("");

    try {
      const res = await addProjectCredentialAction({
        projectId: project.id,
        name: credName.trim(),
        type: credType,
        host: credHost.trim() || undefined,
        port: credPort.trim() || undefined,
        username: credUsername.trim(),
        password: credPassword || undefined,
        notes: credNotes.trim() || undefined,
      });

      if (res.success) {
        setAddCredModalOpen(false);
        setCredName("");
        setCredType("vps");
        setCredHost("");
        setCredPort("");
        setCredUsername("");
        setCredPassword("");
        setCredNotes("");
        refreshProjectData();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menambahkan kredensial";
      setCredError(msg);
    } finally {
      setSubmittingCred(false);
    }
  };

  const handleDeleteCredential = async () => {
    if (!project || !credToDelete) return;
    setIsDeletingCred(true);
    try {
      const res = await deleteProjectCredentialAction(project.id, credToDelete.id);
      if (res.success) {
        setCredToDelete(null);
        refreshProjectData();
      }
    } catch (err) {
      console.error("Gagal menghapus kredensial:", err);
    } finally {
      setIsDeletingCred(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    const amount = parseRupiahInput(paymentAmountInput);
    if (amount <= 0) {
      setPaymentError("Nominal pembayaran harus lebih dari 0");
      return;
    }

    setSubmittingPayment(true);
    setPaymentError("");
    try {
      const res = await addProjectPaymentAction({
        projectId: project.id,
        amount,
        paymentDate,
        note: paymentNote.trim() || undefined,
      });

      if (res.success) {
        setAddPaymentModalOpen(false);
        setPaymentAmountInput("");
        setPaymentNote("");
        setPaymentDate(new Date().toISOString().split("T")[0]);
        refreshProjectData();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mencatat pembayaran";
      setPaymentError(msg);
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleDeletePayment = async () => {
    if (!project || !paymentToDelete) return;
    setIsDeletingPayment(true);
    try {
      const res = await deleteProjectPaymentAction(project.id, paymentToDelete.id);
      if (res.success) {
        setPaymentToDelete(null);
        refreshProjectData();
      }
    } catch (err) {
      console.error("Gagal menghapus riwayat pembayaran:", err);
    } finally {
      setIsDeletingPayment(false);
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

        {/* Pelacak Finansial & Pembayaran Proyek Card */}
        {(() => {
          const contractAmount = project.contractAmount || 0;
          const payments = project.payments || [];
          const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
          const remainingDue = Math.max(0, contractAmount - totalPaid);
          const percentPaid =
            contractAmount > 0
              ? Math.min(100, Math.round((totalPaid / contractAmount) * 100))
              : 0;

          return (
            <Card className="border-slate-200 shadow-xs dark:border-slate-800 overflow-hidden">
              <CardHeader className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-900/40">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Banknote className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                        Status Finansial & Pembayaran Proyek
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Nilai kontrak yang disepakati, pembayaran masuk, dan sisa tagihan klien.
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setPaymentError("");
                        setAddPaymentModalOpen(true);
                      }}
                      className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Catat Pembayaran
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-5">
                {/* 3 Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                    <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                      <Receipt className="h-3.5 w-3.5 text-slate-400" />
                      Total Nilai Kontrak
                    </p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                      {formatRupiah(contractAmount)}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {contractAmount > 0
                        ? "Berdasarkan kesepakatan proyek"
                        : "Nilai kontrak belum diatur"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                    <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Sudah Terbayar
                    </p>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                      {formatRupiah(totalPaid)}
                    </p>
                    <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                      {contractAmount > 0
                        ? `${percentPaid}% dari total kontrak`
                        : `${payments.length} transaksi pembayaran`}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                    <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-amber-500" />
                      Sisa Tagihan
                    </p>
                    <p
                      className={cn(
                        "text-lg font-bold mt-1",
                        remainingDue === 0 && contractAmount > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-amber-600 dark:text-amber-400"
                      )}
                    >
                      {formatRupiah(remainingDue)}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {remainingDue === 0 && contractAmount > 0
                        ? "Tagihan telah lunas sepenuhnya"
                        : "Belum dilunasi klien"}
                    </p>
                  </div>
                </div>

                {/* Progress Bar Pelunasan */}
                {contractAmount > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Progres Pelunasan
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">
                        {percentPaid}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all duration-500 rounded-full",
                          percentPaid >= 100
                            ? "bg-emerald-500"
                            : percentPaid > 0
                            ? "bg-blue-600"
                            : "bg-slate-300 dark:bg-zinc-700"
                        )}
                        style={{ width: `${percentPaid}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Riwayat Pembayaran Masuk List */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Riwayat Pembayaran Masuk ({payments.length})
                  </h4>

                  {payments.length === 0 ? (
                    <div className="py-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30">
                      <Receipt className="h-6 w-6 text-slate-300 mx-auto mb-1.5" />
                      <p className="text-xs text-slate-500 font-medium">
                        Belum ada riwayat pembayaran yang dicatat.
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Klik tombol 'Catat Pembayaran' di atas untuk mendokumentasikan DP atau termin masuk.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-zinc-800 rounded-xl border border-slate-100 dark:border-zinc-800 overflow-hidden">
                      {payments.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 hover:bg-slate-50/70 dark:hover:bg-zinc-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center shrink-0">
                              <CheckCircle2 className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                  {formatRupiah(p.amount)}
                                </span>
                                {p.note && (
                                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                                    {p.note}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                                <Calendar className="h-3 w-3" />
                                {new Date(p.paymentDate).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                                {p.recordedByName && (
                                  <span>• Dicatat oleh {p.recordedByName}</span>
                                )}
                              </p>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setPaymentToDelete(p)}
                            className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            title="Hapus riwayat pembayaran"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })()}

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

              {/* Kredensial Multi-Server Box */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-purple-600" />
                      Kredensial Server ({project.credentials?.length || 0})
                    </span>
                    <span className="text-[10px] text-purple-600 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded font-medium">
                      AES-256
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddCredModalOpen(true)}
                    className="h-7 px-2 text-xs gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                  >
                    <Plus className="h-3 w-3" />
                    Tambah
                  </Button>
                </div>

                {(!project.credentials || project.credentials.length === 0) ? (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center space-y-2 dark:border-slate-800 dark:bg-zinc-950/50">
                    <p className="text-xs text-slate-500">
                      Belum ada kredensial server terdaftar pada proyek ini.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAddCredModalOpen(true)}
                      className="text-xs gap-1 h-7"
                    >
                      <Plus className="h-3 w-3" />
                      Tambah Kredensial Sekarang
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {project.credentials.map((cred) => {
                      const typeConfig =
                        CREDENTIAL_TYPE_CONFIG[cred.type] || CREDENTIAL_TYPE_CONFIG.other;
                      const isPwdVisible = visiblePasswords[cred.id] || false;

                      return (
                        <div
                          key={cred.id}
                          className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 space-y-2 dark:border-slate-800 dark:bg-zinc-950"
                        >
                          <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200/60 dark:border-slate-800">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <KeyRound className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                {cred.name}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded border font-medium ${typeConfig.badgeClass}`}
                              >
                                {typeConfig.label}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setCredToDelete(cred)}
                              className="h-6 w-6 text-slate-400 hover:text-rose-600"
                              title="Hapus kredensial ini"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>

                          {cred.host && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500">Host / IP:</span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-slate-900 dark:text-white">
                                  {cred.host}
                                  {cred.port ? `:${cred.port}` : ""}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleCopy(
                                      `${cred.host}${cred.port ? `:${cred.port}` : ""}`,
                                      `host-${cred.id}`
                                    )
                                  }
                                  className="h-5 w-5 text-slate-400"
                                  title="Salin host"
                                >
                                  {copiedField === `host-${cred.id}` ? (
                                    <Check className="h-3 w-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">Username:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-semibold text-slate-900 dark:text-white">
                                {cred.username}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCopy(cred.username, `user-${cred.id}`)}
                                className="h-5 w-5 text-slate-400"
                                title="Salin username"
                              >
                                {copiedField === `user-${cred.id}` ? (
                                  <Check className="h-3 w-3 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs border-t border-slate-200/60 dark:border-slate-800 pt-1.5">
                            <span className="text-slate-500">Kata Sandi:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-semibold text-slate-900 dark:text-white">
                                {isPwdVisible
                                  ? cred.passwordPlain || "Tidak disetel"
                                  : "****************"}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => togglePasswordVisibility(cred.id)}
                                className="h-5 w-5 text-slate-400"
                                title={isPwdVisible ? "Sembunyikan password" : "Tampilkan password"}
                              >
                                {isPwdVisible ? (
                                  <EyeOff className="h-3.5 w-3.5" />
                                ) : (
                                  <Eye className="h-3.5 w-3.5" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleCopy(cred.passwordPlain || "", `pwd-${cred.id}`)
                                }
                                className="h-5 w-5 text-slate-400"
                                title="Salin password"
                              >
                                {copiedField === `pwd-${cred.id}` ? (
                                  <Check className="h-3 w-3 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {cred.notes && (
                            <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/40 dark:border-slate-800/60">
                              Catatan: {cred.notes}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
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

      {/* Modal Tambah Kredensial Server Baru */}
      <Modal
        isOpen={addCredModalOpen}
        onClose={() => setAddCredModalOpen(false)}
        title="Tambah Kredensial Server"
        description={`Tambahkan detail akses server atau database baru untuk proyek '${project.name}'.`}
      >
        <form onSubmit={handleAddCredential} className="space-y-4 text-xs">
          {credError && (
            <div className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{credError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nama / Label Kredensial <span className="text-rose-500">*</span>
            </label>
            <Input
              required
              value={credName}
              onChange={(e) => setCredName(e.target.value)}
              placeholder="Contoh: Server Production (AWS), Database Staging"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tipe Akses
              </label>
              <select
                value={credType}
                onChange={(e) => setCredType(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 dark:border-slate-700 dark:bg-zinc-900 dark:text-slate-100"
              >
                <option value="vps">VPS / Dedicated Server</option>
                <option value="ssh">SSH Server</option>
                <option value="database">Database Server</option>
                <option value="cpanel">cPanel / Web Hosting</option>
                <option value="api">API Key / Token</option>
                <option value="other">Lainnya</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Port (Opsional)
              </label>
              <Input
                value={credPort}
                onChange={(e) => setCredPort(e.target.value)}
                placeholder="22, 5432, 3306"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Host / IP / URL Panel
            </label>
            <Input
              value={credHost}
              onChange={(e) => setCredHost(e.target.value)}
              placeholder="Contoh: 103.145.xx.xx atau db.domain.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Username / Akun <span className="text-rose-500">*</span>
              </label>
              <Input
                required
                value={credUsername}
                onChange={(e) => setCredUsername(e.target.value)}
                placeholder="admin, root, postgres"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Kata Sandi
              </label>
              <Input
                type="password"
                value={credPassword}
                onChange={(e) => setCredPassword(e.target.value)}
                placeholder="Password rahasia..."
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Catatan Akses (Opsional)
            </label>
            <Input
              value={credNotes}
              onChange={(e) => setCredNotes(e.target.value)}
              placeholder="Contoh: Terhubung via VPN kantor, jumpbox port 2222"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAddCredModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={submittingCred}>
              {submittingCred ? "Menyimpan..." : "Simpan Kredensial"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Dialog Konfirmasi Hapus Kredensial */}
      <Modal
        isOpen={!!credToDelete}
        onClose={() => setCredToDelete(null)}
        title="Konfirmasi Hapus Kredensial"
        description={`Apakah Anda yakin ingin menghapus kredensial '${credToDelete?.name}'?`}
      >
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
          <p>
            Tindakan ini akan menghapus kredensial akses ini dari database. Pengembang dan anggota tim tidak akan dapat melihat detail akun ini lagi.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCredToDelete(null)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={isDeletingCred}
              onClick={handleDeleteCredential}
            >
              {isDeletingCred ? "Menghapus..." : "Hapus Kredensial"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Dialog Catat Pembayaran Masuk */}
      <Modal
        isOpen={addPaymentModalOpen}
        onClose={() => setAddPaymentModalOpen(false)}
        title="Catat Pembayaran Masuk"
        description="Dokumentasikan pembayaran yang diterima dari klien (DP, Termin, atau Pelunasan)."
      >
        <form onSubmit={handleAddPayment} className="space-y-4 text-xs">
          {paymentError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
              {paymentError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Banknote className="h-3.5 w-3.5 text-emerald-600" />
              Nominal Pembayaran (Rp) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-slate-400 dark:text-slate-500">
                Rp
              </span>
              <Input
                required
                type="text"
                inputMode="numeric"
                value={paymentAmountInput}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  setPaymentAmountInput(raw ? formatNumberWithDots(raw) : "");
                }}
                placeholder="Contoh: 10.000.000"
                className="pl-10 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              Tanggal Pembayaran <span className="text-rose-500">*</span>
            </label>
            <Input
              required
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Keterangan / Termin (Opsional)
            </label>
            <Input
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              placeholder="Contoh: Uang Muka DP 30%, Termin 1 Tahap Pengembangan, Pelunasan"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAddPaymentModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submittingPayment}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {submittingPayment ? "Menyimpan..." : "Simpan Pembayaran"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Dialog Konfirmasi Hapus Pembayaran */}
      <Modal
        isOpen={!!paymentToDelete}
        onClose={() => setPaymentToDelete(null)}
        title="Konfirmasi Hapus Pembayaran"
        description={`Apakah Anda yakin ingin menghapus catatan pembayaran sebesar ${
          paymentToDelete ? formatRupiah(paymentToDelete.amount) : ""
        }?`}
      >
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
          <p>
            Tindakan ini akan menghapus catatan pembayaran dari database dan otomatis mengoreksi kembali total pembayaran serta sisa tagihan proyek.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPaymentToDelete(null)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={isDeletingPayment}
              onClick={handleDeletePayment}
            >
              {isDeletingPayment ? "Menghapus..." : "Hapus Pembayaran"}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  );
}
