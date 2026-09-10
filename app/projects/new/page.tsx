"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  FolderKanban,
  Building2,
  Lock,
  GitBranch,
  Layers,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  KeyRound,
  Banknote,
  Globe,
  ArrowUpDown,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Client, INITIAL_CLIENTS, ProjectStatus } from "@/lib/mock-data";
import { createProjectAction } from "@/actions/projects";
import { getClientsAction } from "@/actions/clients";
import { formatNumberWithDots, parseRupiahInput } from "@/lib/currency";

export default function CreateProjectPage() {
  const router = useRouter();
  const [clients, setClients] = React.useState<Client[]>(INITIAL_CLIENTS);

  const [name, setName] = React.useState("");
  const [clientId, setClientId] = React.useState(INITIAL_CLIENTS[0]?.id || "");
  const [status, setStatus] = React.useState<ProjectStatus>("in_progress");
  const [description, setDescription] = React.useState("");
  const [frontendTech, setFrontendTech] = React.useState("Next.js 15, TypeScript, Tailwind CSS");
  const [backendTech, setBackendTech] = React.useState("NestJS, REST API");
  const [databaseTech, setDatabaseTech] = React.useState("PostgreSQL");
  const [repositoryUrl, setRepositoryUrl] = React.useState("https://github.com/");
  const [liveUrl, setLiveUrl] = React.useState("");
  const [contractAmountInput, setContractAmountInput] = React.useState("");
  const [order, setOrder] = React.useState<number>(0);
  const [credentialsList, setCredentialsList] = React.useState<
    Array<{
      id: string;
      name: string;
      type: string;
      host: string;
      port: string;
      username: string;
      password: string;
      notes: string;
    }>
  >([
    {
      id: "temp-1",
      name: "Server Production (VPS)",
      type: "vps",
      host: "",
      port: "22",
      username: "",
      password: "",
      notes: "",
    },
  ]);

  const [saving, setSaving] = React.useState(false);
  const [savedSuccess, setSavedSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  React.useEffect(() => {
    async function loadClients() {
      try {
        const loaded = await getClientsAction();
        if (loaded && loaded.length > 0) {
          setClients(loaded);
          setClientId(loaded[0].id);
        }
      } catch (err) {
        console.error("Gagal memuat daftar klien:", err);
      }
    }
    loadClients();
  }, []);

  const handleAddCredentialItem = () => {
    setCredentialsList((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        name: "",
        type: "vps",
        host: "",
        port: "",
        username: "",
        password: "",
        notes: "",
      },
    ]);
  };

  const handleRemoveCredentialItem = (id: string) => {
    setCredentialsList((prev) => prev.filter((c) => c.id !== id));
  };

  const handleUpdateCredentialItem = (
    id: string,
    field: "name" | "type" | "host" | "port" | "username" | "password" | "notes",
    val: string
  ) => {
    setCredentialsList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: val } : c))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");

    try {
      const validCredentials = credentialsList
        .filter((c) => c.name.trim() && c.username.trim())
        .map((c) => ({
          name: c.name.trim(),
          type: c.type || "other",
          host: c.host.trim() || undefined,
          port: c.port.trim() || undefined,
          username: c.username.trim(),
          password: c.password || undefined,
          notes: c.notes.trim() || undefined,
        }));

      const res = await createProjectAction({
        name,
        clientId,
        status,
        description,
        frontendTech,
        backendTech,
        databaseTech,
        repositoryUrl,
        liveUrl: liveUrl.trim() || undefined,
        contractAmount: parseRupiahInput(contractAmountInput),
        order: Number(order) || 0,
        credentialUsername: validCredentials[0]?.username || "",
        credentialPassword: validCredentials[0]?.password || "",
        credentials: validCredentials,
      });

      if (res.success && res.project) {
        setSavedSuccess(true);
        setTimeout(() => {
          router.push(`/projects/${res.project.id}`);
        }, 600);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan proyek";
      setErrorMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell
      title="Tambah Proyek Baru"
      subtitle="Dokumentasikan proyek software baru ke dalam sistem inventaris internal."
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigasi Kembali */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Proyek
        </Link>

        {savedSuccess && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Proyek baru berhasil disimpan ke sistem! Mengalihkan ke detail proyek...
          </div>
        )}

        {errorMessage && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 flex items-center gap-2 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="h-5 w-5 text-rose-600" />
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Informasi Dasar */}
          <Card className="border-slate-200 shadow-xs dark:border-slate-800">
            <CardHeader className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-blue-600" />
                Informasi Utama Proyek
              </CardTitle>
              <CardDescription className="text-xs">
                Masukkan nama proyek, klien yang memesan, dan status pengerjaan saat ini.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nama Proyek <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Portal Sistem Informasi Desa (SI-Desa)"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    Klien Pemilik Proyek <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 dark:border-slate-700 dark:bg-zinc-900 dark:text-slate-100"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} ({c.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Status Proyek <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 dark:border-slate-700 dark:bg-zinc-900 dark:text-slate-100"
                  >
                    <option value="planning">Perencanaan (Planning)</option>
                    <option value="in_progress">Sedang Berjalan (In Progress)</option>
                    <option value="on_hold">Tertunda (On Hold)</option>
                    <option value="completed">Selesai (Completed)</option>
                    <option value="cancelled">Dibatalkan (Cancelled)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Deskripsi Singkat Proyek
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan tujuan software, ruang lingkup pengerjaan, atau fitur utama..."
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-slate-700 dark:bg-zinc-900 dark:text-slate-100"
                />
              </div>

              {/* Urutan Tampilan (Order) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ArrowUpDown className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  Urutan Tampilan (Order)
                </label>
                <Input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
                  placeholder="0"
                  min={0}
                  className="font-medium"
                />
                <p className="text-[11px] text-slate-400">
                  Semakin kecil angka, semakin atas posisinya di daftar. Default: 0.
                </p>
              </div>

              {/* Input Nilai Kontrak */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Banknote className="h-4 w-4 text-emerald-600" />
                  Nilai Kontrak Proyek (Rupiah)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-slate-400 dark:text-slate-500">
                    Rp
                  </span>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={contractAmountInput}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      setContractAmountInput(raw ? formatNumberWithDots(raw) : "");
                    }}
                    placeholder="Contoh: 25.000.000"
                    className="pl-10 font-medium"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Opsional. Format ribuan otomatis. Pembayaran bertahap (DP, termin) dapat dicatat di halaman detail proyek.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Spesifikasi Teknis & Repositori */}
          <Card className="border-slate-200 shadow-xs dark:border-slate-800">
            <CardHeader className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Layers className="h-4 w-4 text-purple-600" />
                Spesifikasi Tech Stack & Repositori
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Frontend Tech
                  </label>
                  <Input
                    value={frontendTech}
                    onChange={(e) => setFrontendTech(e.target.value)}
                    placeholder="Next.js 15, Tailwind"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Backend Tech
                  </label>
                  <Input
                    value={backendTech}
                    onChange={(e) => setBackendTech(e.target.value)}
                    placeholder="NestJS, REST API"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Database Tech
                  </label>
                  <Input
                    value={databaseTech}
                    onChange={(e) => setDatabaseTech(e.target.value)}
                    placeholder="PostgreSQL, Redis"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <GitBranch className="h-3.5 w-3.5 text-purple-600" />
                  URL Repositori GitHub
                </label>
                <Input
                  value={repositoryUrl}
                  onChange={(e) => setRepositoryUrl(e.target.value)}
                  placeholder="https://github.com/organisasi/nama-repo"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-blue-600" />
                  URL Website / Domain Live (Untuk Pemantauan Uptime & SSL)
                </label>
                <Input
                  type="url"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  placeholder="Contoh: https://klien-domain.com"
                />
                <p className="text-[11px] text-slate-400">
                  Opsional. Alamat website yang akan dipantau status aktif (uptime) dan masa berlaku sertifikat SSL-nya.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Kredensial Server Terenkripsi (Multi-Kredensial) */}
          <Card className="border-slate-200 shadow-xs dark:border-slate-800">
            <CardHeader className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Lock className="h-4 w-4 text-emerald-600" />
                  Kredensial Server (Akan Dienkripsi Otomatis)
                </CardTitle>
                <CardDescription className="text-xs">
                  Bisa menambahkan lebih dari satu kredensial (SSH, Database, Panel, API). Password dienkripsi dengan AES-256-GCM.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCredentialItem}
                className="text-xs gap-1.5 h-8 shrink-0 self-start sm:self-auto"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah Kredensial
              </Button>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {credentialsList.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500 border border-dashed rounded-lg border-slate-200 dark:border-slate-800">
                  Belum ada kredensial server. Klik tombol &ldquo;Tambah Kredensial&rdquo; jika ingin menambahkan kredensial akses server.
                </div>
              ) : (
                credentialsList.map((cred, index) => (
                  <div
                    key={cred.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 dark:border-slate-800 dark:bg-zinc-950/50"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <KeyRound className="h-3.5 w-3.5 text-blue-600" />
                        Kredensial #{index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCredentialItem(cred.id)}
                        className="h-7 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Hapus
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          Nama / Label Kredensial <span className="text-rose-500">*</span>
                        </label>
                        <Input
                          value={cred.name}
                          onChange={(e) => handleUpdateCredentialItem(cred.id, "name", e.target.value)}
                          placeholder="Contoh: Server Production (VPS)"
                          className="h-9 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          Tipe Akses
                        </label>
                        <select
                          value={cred.type}
                          onChange={(e) => handleUpdateCredentialItem(cred.id, "type", e.target.value)}
                          className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 dark:border-slate-700 dark:bg-zinc-900 dark:text-slate-100"
                        >
                          <option value="vps">VPS / Dedicated Server</option>
                          <option value="ssh">SSH Server</option>
                          <option value="database">Database Server</option>
                          <option value="cpanel">cPanel / Web Hosting</option>
                          <option value="api">API Key / Token</option>
                          <option value="other">Lainnya</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          Host / IP / URL
                        </label>
                        <Input
                          value={cred.host}
                          onChange={(e) => handleUpdateCredentialItem(cred.id, "host", e.target.value)}
                          placeholder="103.145.xx.xx atau db.domain.com"
                          className="h-9 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          Port (Opsional)
                        </label>
                        <Input
                          value={cred.port}
                          onChange={(e) => handleUpdateCredentialItem(cred.id, "port", e.target.value)}
                          placeholder="22, 5432, 3306"
                          className="h-9 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          Username / Akun <span className="text-rose-500">*</span>
                        </label>
                        <Input
                          value={cred.username}
                          onChange={(e) => handleUpdateCredentialItem(cred.id, "username", e.target.value)}
                          placeholder="admin, root, postgres"
                          className="h-9 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          Kata Sandi
                        </label>
                        <Input
                          type="password"
                          value={cred.password}
                          onChange={(e) => handleUpdateCredentialItem(cred.id, "password", e.target.value)}
                          placeholder="Password rahasia..."
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        Catatan Akses (Opsional)
                      </label>
                      <Input
                        value={cred.notes}
                        onChange={(e) => handleUpdateCredentialItem(cred.id, "notes", e.target.value)}
                        placeholder="Contoh: Akses via VPN kantor, database cluster standby"
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Form Bottom Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/projects">
              <Button type="button" variant="outline">
                Batal
              </Button>
            </Link>
            <Button type="submit" disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Menyimpan..." : "Simpan Proyek Baru"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
