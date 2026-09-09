"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Search,
  Phone,
  MapPin,
  FolderKanban,
  Edit,
  Trash2,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Client, INITIAL_CLIENTS } from "@/lib/mock-data";
import { getClientsAction, deleteClientAction } from "@/actions/clients";

export default function ClientsPage() {
  const [clients, setClients] = React.useState<Client[]>(INITIAL_CLIENTS);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");

  // State untuk konfirmasi hapus dan alert pesan
  const [clientToDelete, setClientToDelete] = React.useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");

  const refreshClients = React.useCallback(async () => {
    try {
      const data = await getClientsAction();
      if (data) setClients(data);
    } catch (err) {
      console.error("Gagal memuat data klien:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refreshClients();
  }, [refreshClients]);

  const filteredClients = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.companyName.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.address.toLowerCase().includes(query)
    );
  }, [clients, searchQuery]);

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    setIsDeleting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await deleteClientAction(clientToDelete.id);
      if (res.success) {
        setSuccessMessage(`Klien '${clientToDelete.companyName}' berhasil dihapus.`);
        setClientToDelete(null);
        await refreshClients();
        setTimeout(() => setSuccessMessage(""), 4000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus klien";
      setErrorMessage(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardShell
      title="Master Data Klien"
      subtitle="Kelola data instansi, perusahaan, dan kontak person pemilik proyek."
    >
      <div className="space-y-6">
        {/* Top Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama klien, instansi, atau alamat..."
              className="pl-9"
            />
          </div>

          <Link href="/clients/new">
            <Button size="sm" className="gap-1.5 shadow-xs">
              <Plus className="h-4 w-4" />
              Tambah Klien Baru
            </Button>
          </Link>
        </div>

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

        {/* Info Note: Anti-Delete Rule */}
        <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3 text-xs text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-blue-600 shrink-0" />
          <span>
            <strong>Aturan Proteksi Integritas:</strong> Klien yang masih memiliki proyek aktif tidak dapat dihapus langsung untuk menjaga validitas riwayat proyek.
          </span>
        </div>

        {/* Clients Table Card */}
        <Card className="border-slate-200 shadow-xs overflow-hidden dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-zinc-900/60">
                <tr>
                  <th scope="col" className="px-6 py-3.5">
                    Instansi / Perusahaan
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Kontak Person
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Kontak & Alamat
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-center">
                    Proyek Aktif
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-slate-50/80 transition-colors dark:hover:bg-zinc-900/40"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-900 dark:text-white">
                            {client.companyName}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Terdaftar: {client.createdAt.split("T")[0]}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {client.name}
                      </p>
                      <p className="text-[11px] text-slate-500">{client.email}</p>
                    </td>

                    <td className="px-6 py-4 space-y-1">
                      <p className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Phone className="h-3 w-3 text-slate-400" />
                        {client.phone}
                      </p>
                      <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {client.address}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                        <FolderKanban className="h-3 w-3" />
                        {client.projectsCount ?? 0} Proyek
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/clients/${client.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-blue-600"
                            title="Edit data klien"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setErrorMessage("");
                            setClientToDelete(client);
                          }}
                          className="h-7 w-7 text-slate-400 hover:text-rose-600"
                          title="Hapus data klien"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {/* Modal Konfirmasi Hapus Klien */}
      <Modal
        isOpen={!!clientToDelete}
        onClose={() => setClientToDelete(null)}
        title="Konfirmasi Hapus Klien"
        description={`Apakah Anda yakin ingin menghapus data klien '${clientToDelete?.companyName}'?`}
      >
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
          <p>
            Tindakan ini akan menghapus data kontak dan riwayat instansi klien secara permanen.
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
              onClick={() => setClientToDelete(null)}
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
              {isDeleting ? "Menghapus..." : "Hapus Klien"}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  );
}
