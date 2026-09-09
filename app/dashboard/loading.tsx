import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <DashboardShell
      title="Memuat Dasbor..."
      subtitle="Menghubungkan ke data proyek dan aktivitas..."
    >
      <div className="space-y-8 animate-pulse">
        {/* 4 Stat Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-slate-200 dark:border-slate-800">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-3 w-24 rounded bg-slate-200 dark:bg-zinc-800" />
                  <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-zinc-800" />
                </div>
                <div className="h-7 w-16 rounded bg-slate-200 dark:bg-zinc-800" />
                <div className="h-3 w-32 rounded bg-slate-100 dark:bg-zinc-800" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 2-Column Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-3">
            <div className="h-5 w-40 rounded bg-slate-200 dark:bg-zinc-800 mb-4" />
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-slate-200 dark:border-slate-800">
                <CardContent className="p-5 space-y-3">
                  <div className="h-5 w-1/2 rounded bg-slate-200 dark:bg-zinc-800" />
                  <div className="h-3 w-1/3 rounded bg-slate-100 dark:bg-zinc-800" />
                  <div className="h-3 w-full rounded bg-slate-100 dark:bg-zinc-800" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-3">
            <div className="h-5 w-36 rounded bg-slate-200 dark:bg-zinc-800 mb-4" />
            <Card className="border-slate-200 dark:border-slate-800">
              <CardContent className="p-5 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-zinc-800 shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 w-3/4 rounded bg-slate-200 dark:bg-zinc-800" />
                      <div className="h-2 w-1/2 rounded bg-slate-100 dark:bg-zinc-800" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
