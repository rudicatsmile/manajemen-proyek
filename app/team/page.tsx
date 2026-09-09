"use client";

import * as React from "react";
import {
  Users,
  Plus,
  ShieldCheck,
  UserCheck,
  Mail,
  Search,
  CheckCircle2,
  Calendar,
  Sparkles,
  AlertCircle,
  Edit,
  Trash2,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { INITIAL_MEMBERS, Member, MemberRole } from "@/lib/mock-data";
import {
  getTeamMembersAction,
  inviteTeamMemberAction,
  updateTeamMemberRoleAction,
  updateTeamMemberAction,
  deleteTeamMemberAction,
} from "@/actions/team";

export default function TeamPage() {
  const [members, setMembers] = React.useState<Member[]>(INITIAL_MEMBERS);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Invite modal state
  const [inviteModalOpen, setInviteModalOpen] = React.useState(false);
  const [inviteName, setInviteName] = React.useState("");
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState<MemberRole>("member");
  const [inviteSpecialization, setInviteSpecialization] = React.useState("Fullstack Developer");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [inviteSuccess, setInviteSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [memberToEdit, setMemberToEdit] = React.useState<Member | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editEmail, setEditEmail] = React.useState("");
  const [editRole, setEditRole] = React.useState<MemberRole>("member");
  const [editSpecialization, setEditSpecialization] = React.useState("Fullstack Developer");
  const [isEditing, setIsEditing] = React.useState(false);
  const [editErrorMessage, setEditErrorMessage] = React.useState("");

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [memberToDelete, setMemberToDelete] = React.useState<Member | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = React.useState("");

  // Success alert
  const [successBanner, setSuccessBanner] = React.useState("");

  const refreshMembers = React.useCallback(async () => {
    try {
      const data = await getTeamMembersAction();
      if (data) setMembers(data);
    } catch (err) {
      console.error("Gagal memuat data anggota tim:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refreshMembers();
  }, [refreshMembers]);

  const filteredMembers = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        m.specialization.toLowerCase().includes(query)
    );
  }, [members, searchQuery]);

  const handleToggleRole = async (memberId: string) => {
    const target = members.find((m) => m.id === memberId);
    if (!target) return;

    const newRole: MemberRole = target.role === "admin" ? "member" : "admin";
    try {
      const res = await updateTeamMemberRoleAction(memberId, newRole);
      if (res.success) {
        setMembers((prev) =>
          prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
        );
      }
    } catch (err) {
      console.error("Gagal memperbarui peran anggota:", err);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await inviteTeamMemberAction({
        name: inviteName.trim(),
        email: inviteEmail.trim(),
        role: inviteRole,
        specialization: inviteSpecialization,
      });

      if (res.success && res.member) {
        setMembers((prev) => [res.member, ...prev]);
        setInviteName("");
        setInviteEmail("");
        setInviteSuccess(true);

        setTimeout(() => {
          setInviteSuccess(false);
          setInviteModalOpen(false);
        }, 800);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengundang anggota baru";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (member: Member) => {
    setMemberToEdit(member);
    setEditName(member.name);
    setEditEmail(member.email);
    setEditRole(member.role);
    setEditSpecialization(member.specialization || "Fullstack Developer");
    setEditErrorMessage("");
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberToEdit || !editName.trim() || !editEmail.trim() || isEditing) return;

    setIsEditing(true);
    setEditErrorMessage("");

    try {
      const res = await updateTeamMemberAction({
        id: memberToEdit.id,
        name: editName.trim(),
        email: editEmail.trim(),
        role: editRole,
        specialization: editSpecialization.trim(),
      });

      if (res.success) {
        setMembers((prev) =>
          prev.map((m) =>
            m.id === memberToEdit.id
              ? {
                  ...m,
                  name: editName.trim(),
                  email: editEmail.trim(),
                  role: editRole,
                  specialization: editSpecialization.trim(),
                }
              : m
          )
        );
        setEditModalOpen(false);
        setSuccessBanner(`Data anggota '${editName.trim()}' berhasil diperbarui.`);
        setTimeout(() => setSuccessBanner(""), 4000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memperbarui data anggota";
      setEditErrorMessage(msg);
    } finally {
      setIsEditing(false);
    }
  };

  const handleOpenDelete = (member: Member) => {
    setMemberToDelete(member);
    setDeleteErrorMessage("");
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!memberToDelete || isDeleting) return;

    setIsDeleting(true);
    setDeleteErrorMessage("");

    try {
      const res = await deleteTeamMemberAction(memberToDelete.id);
      if (res.success) {
        setMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id));
        setDeleteModalOpen(false);
        setSuccessBanner(`Anggota tim '${memberToDelete.name}' berhasil dihapus dari sistem.`);
        setTimeout(() => setSuccessBanner(""), 4000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus anggota tim";
      setDeleteErrorMessage(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardShell
      title="Manajemen Anggota Tim"
      subtitle="Kelola akun internal, hak akses Admin / Member, dan undang personil developer."
    >
      <div className="space-y-6">
        {/* Banner Notifikasi Sukses */}
        {successBanner && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800 flex items-center gap-2 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
        )}

        {/* Top Action & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama anggota, email, atau spesialisasi..."
              className="pl-9"
            />
          </div>

          <Button
            size="sm"
            onClick={() => {
              setErrorMessage("");
              setInviteModalOpen(true);
            }}
            className="gap-1.5 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Undang Anggota Baru
          </Button>
        </div>

        {/* Members Table */}
        <Card className="border-slate-200 shadow-xs overflow-hidden dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-zinc-900/60">
                <tr>
                  <th scope="col" className="px-6 py-3.5">
                    Anggota Tim
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Spesialisasi Teknis
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Peran Sistem
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Bergabung
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-slate-50/80 transition-colors dark:hover:bg-zinc-900/40"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-900 dark:text-white">
                            {member.name}
                          </p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                        {member.specialization}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {member.role === "admin" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                          <ShieldCheck className="h-3 w-3" />
                          Admin / Pemilik
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-zinc-800 dark:text-slate-300">
                          <UserCheck className="h-3 w-3 text-slate-500" />
                          Member Tim
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-slate-500 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {member.createdAt.split("T")[0]}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleRole(member.id)}
                          className="h-7 px-2 text-[11px]"
                          title="Ubah peran admin / member"
                        >
                          {member.role === "admin" ? "Jadikan Member" : "Jadikan Admin"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(member)}
                          className="h-7 px-2 text-[11px] gap-1 text-slate-700 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:bg-blue-950/40"
                          title="Edit data anggota"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDelete(member)}
                          className="h-7 px-2 text-[11px] gap-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-slate-200 dark:border-slate-800 dark:hover:bg-rose-950/40"
                          title="Hapus anggota tim"
                        >
                          <Trash2 className="h-3 w-3" />
                          Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal Undang Anggota Baru */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Undang Anggota Tim Baru"
        description="Kirim undangan akses ke alamat email developer untuk bergabung ke workspace internal."
      >
        {inviteSuccess ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Undangan berhasil dikirimkan dan anggota telah ditambahkan ke sistem!
          </div>
        ) : (
          <form onSubmit={handleInviteSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-2 text-xs">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nama Lengkap Anggota <span className="text-rose-500">*</span>
              </label>
              <Input
                required
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Contoh: Budi Gunawan"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Alamat Email Pengguna <span className="text-rose-500">*</span>
              </label>
              <Input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="nama@projectku.id"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Peran Hak Akses
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as MemberRole)}
                  className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 dark:border-slate-700 dark:bg-zinc-900 dark:text-slate-100"
                >
                  <option value="member">Member (Akses Proyek)</option>
                  <option value="admin">Admin (Hak Penuh)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Spesialisasi Teknis
                </label>
                <select
                  value={inviteSpecialization}
                  onChange={(e) => setInviteSpecialization(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 dark:border-slate-700 dark:bg-zinc-900 dark:text-slate-100"
                >
                  <option value="Fullstack Developer">Fullstack Developer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Technical Project Manager">Project Manager</option>
                  <option value="QA & Automation Tester">QA Engineer</option>
                  <option value="UI/UX Product Designer">UI/UX Designer</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setInviteModalOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                {isSubmitting ? "Mengirim..." : "Kirim Undangan Akses"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal Edit Data Anggota */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Data Anggota Tim"
        description="Perbarui informasi profil, email, hak akses, dan spesialisasi teknis anggota."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          {editErrorMessage && (
            <div className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{editErrorMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <Input
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Contoh: Budi Pratama"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Alamat Email <span className="text-rose-500">*</span>
            </label>
            <Input
              type="email"
              required
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder="budi@projectku.id"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Peran Hak Akses
              </label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as MemberRole)}
                className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 dark:border-slate-700 dark:bg-zinc-900 dark:text-slate-100"
              >
                <option value="member">Member (Akses Proyek)</option>
                <option value="admin">Admin (Hak Penuh)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Spesialisasi Teknis
              </label>
              <Input
                value={editSpecialization}
                onChange={(e) => setEditSpecialization(e.target.value)}
                placeholder="Contoh: Fullstack Developer, QA Lead"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={isEditing}>
              {isEditing ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Dialog Konfirmasi Hapus Anggota */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Konfirmasi Hapus Anggota"
        description={`Apakah Anda yakin ingin menghapus anggota tim '${memberToDelete?.name}'?`}
      >
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
          <p>
            Tindakan ini akan menghapus akun internal anggota ini dari database dan mencabut seluruh penugasan proyek yang bersangkutan. Tindakan ini tidak dapat dibatalkan.
          </p>

          {deleteErrorMessage && (
            <div className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{deleteErrorMessage}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
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
              {isDeleting ? "Menghapus..." : "Hapus Anggota"}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  );
}
