"use client";

import * as React from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { ArrowLeft, Save, Building2, CheckCircle2, AlertCircle } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "@/lib/mock-data";
import { getClientByIdAction, updateClientAction } from "@/actions/clients";

export default function EditClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const router = useRouter();
  const unwrappedParams = React.use(params);

  const [client, setClient] = React.useState<Client | null>(null);
  const [loading, setLoading] = React.useState(true);

  const [name, setName] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const [saving, setSaving] = React.useState(false);
  const [savedSuccess, setSavedSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  React.useEffect(() => {
    async function loadClient() {
      try {
        const data = await getClientByIdAction(unwrappedParams.clientId);
        if (data) {
          setClient(data);
          setName(data.name);
          setCompanyName(data.companyName);
          setEmail(data.email);
          setPhone(data.phone);
          setAddress(data.address);
          setNotes(data.notes || "");
        }
      } catch (err) {
        console.error("Gagal memuat data klien:", err);
      } finally {
        setLoading(false);
      }
    }
    loadClient();
  }, [unwrappedParams.clientId]);

  if (!loading && !client) {
    return notFound();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    setSaving(true);
    setErrorMessage("");

    try {
      const res = await updateClientAction(client.id, {
        name,
        companyName,
        email,
        phone,
        address,
        notes,
      });

      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => {
          router.push("/clients");
        }, 600);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memperbarui data klien";
      setErrorMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell
      title={client ? `Edit Klien: ${client.companyName}` : "Memuat Klien..."}
      subtitle="Perbarui data kontak atau alamat instansi klien."
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Klien
        </Link>

        {savedSuccess && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Perubahan data klien berhasil disimpan! Mengalihkan ke daftar klien...
          </div>
        )}

        {errorMessage && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 flex items-center gap-2 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="h-5 w-5 text-rose-600" />
            {errorMessage}
          </div>
        )}

        {client && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-slate-200 shadow-xs dark:border-slate-800">
              <CardHeader className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  Edit Informasi Klien
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Nama Kontak Person <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Nama Perusahaan / Instansi <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Alamat Email <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Nomor Telepon <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Alamat Kantor
                  </label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Catatan Tambahan
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-slate-700 dark:bg-zinc-900 dark:text-slate-100"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link href="/clients">
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
