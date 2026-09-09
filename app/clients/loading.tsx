import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";

export default function ClientsLoading() {
  return (
    <DashboardShell
      title="Memuat Master Data Klien..."
      subtitle="Mengambil daftar instansi dan kontak dari server..."
    >
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between gap-4">
          <div className="h-10 w-80 rounded-lg bg-slate-200 dark:bg-zinc-800" />
          <div className="h-10 w-36 rounded-lg bg-slate-200 dark:bg-zinc-800" />
        </div>

        <Card className="border-slate-200 dark:border-slate-800 p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-zinc-800 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-48 rounded bg-slate-200 dark:bg-zinc-800" />
                  <div className="h-3 w-32 rounded bg-slate-100 dark:bg-zinc-800" />
                </div>
              </div>
              <div className="h-6 w-20 rounded bg-slate-100 dark:bg-zinc-800" />
            </div>
          ))}
        </Card>
      </div>
    </DashboardShell>
  );
}
