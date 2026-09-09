"use client";

import * as React from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
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
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Client, INITIAL_CLIENTS, Project, ProjectStatus } from "@/lib/mock-data";
import { getProjectByIdAction, updateProjectAction } from "@/actions/projects";
import { getClientsAction } from "@/actions/clients";

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const router = useRouter();
  const unwrappedParams = React.use(params);

  const [project, setProject] = React.useState<Project | null>(null);
  const [clients, setClients] = React.useState<Client[]>(INITIAL_CLIENTS);
  const [loading, setLoading] = React.useState(true);

  const [name, setName] = React.useState("");
  const [clientId, setClientId] = React.useState("");
  const [status, setStatus] = React.useState<ProjectStatus>("in_progress");
  const [description, setDescription] = React.useState("");
  const [frontendTech, setFrontendTech] = React.useState("");
  const [backendTech, setBackendTech] = React.useState("");
  const [databaseTech, setDatabaseTech] = React.useState("");
  const [repositoryUrl, setRepositoryUrl] = React.useState("");
  const [credentialUsername, setCredentialUsername] = React.useState("");
  const [credentialPassword, setCredentialPassword] = React.useState("");

  const [saving, setSaving] = React.useState(false);
  const [savedSuccess, setSavedSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  React.useEffect(() => {
    async function loadData() {
      try {
        const [proj, clientList] = await Promise.all([
          getProjectByIdAction(unwrappedParams.projectId),
          getClientsAction(),
        ]);

        if (!proj) {
          setLoading(false);
          return;
        }

        setProject(proj);
        if (clientList && clientList.length > 0) {
          setClients(clientList);
        }

        setName(proj.name);
        setClientId(proj.clientId);
        setStatus(proj.status);
        setDescription(proj.description || "");
        setFrontendTech(proj.frontendTech || "");
        setBackendTech(proj.backendTech || "");
        setDatabaseTech(proj.databaseTech || "");
        setRepositoryUrl(proj.repositoryUrl || "");
        setCredentialUsername(proj.credentialUsername || "");
        setCredentialPassword(proj.credentialPasswordPlain || "");
      } catch (err) {
        console.error("Gagal memuat data proyek untuk diedit:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [unwrappedParams.projectId]);

  if (!loading && !project) {
    return notFound();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    setSaving(true);
    setErrorMessage("");

    try {
      const res = await updateProjectAction(project.id, {
        name,
        clientId,
        status,
        description,
        frontendTech,
        backendTech,
        databaseTech,
        repositoryUrl,
        credentialUsername,
        credentialPassword,
      });

      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => {
          router.push(`/projects/${project.id}`);
        }, 600);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan perubahan";
      setErrorMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell
      title={project ? `Edit: ${project.name}` : "Memuat Proyek..."}
      subtitle="Perbarui metadata, tech stack, atau kredensial server proyek."
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href={project ? `/projects/${project.id}` : "/projects"}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Detail Proyek
        </Link>

        {savedSuccess && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Perubahan data proyek berhasil disimpan! Mengalihkan ke halaman detail...
          </div>
        )}

        {errorMessage && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 flex items-center gap-2 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="h-5 w-5 text-rose-600" />
            {errorMessage}
          </div>
        )}

        {project && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Card 1: Info Utama */}
            <Card className="border-slate-200 shadow-xs dark:border-slate-800">
              <CardHeader className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <FolderKanban className="h-4 w-4 text-blue-600" />
                  Informasi Utama Proyek
                </CardTitle>
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
                    className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-slate-700 dark:bg-zinc-900 dark:text-slate-100"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Spesifikasi Teknis */}
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
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Backend Tech
                    </label>
                    <Input
                      value={backendTech}
                      onChange={(e) => setBackendTech(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Database Tech
                    </label>
                    <Input
                      value={databaseTech}
                      onChange={(e) => setDatabaseTech(e.target.value)}
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
                  />
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Kredensial Server */}
            <Card className="border-slate-200 shadow-xs dark:border-slate-800">
              <CardHeader className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Lock className="h-4 w-4 text-emerald-600" />
                  Kredensial Server (Akan Dienkripsi Otomatis)
                </CardTitle>
                <CardDescription className="text-xs">
                  Password tersimpan secara aman dengan AES-256-GCM.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Username / Akun Kredensial
                    </label>
                    <Input
                      value={credentialUsername}
                      onChange={(e) => setCredentialUsername(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Kata Sandi Kredensial
                    </label>
                    <Input
                      type="password"
                      value={credentialPassword}
                      onChange={(e) => setCredentialPassword(e.target.value)}
                      placeholder="Masukkan kata sandi baru untuk memperbarui..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link href={`/projects/${project.id}`}>
                <Button type="button" variant="outline">
                  Batal
                </Button>
              </Link>
              <Button type="submit" disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardShell>
  );
}
