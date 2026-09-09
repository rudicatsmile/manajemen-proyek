import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";

export default function ProjectsLoading() {
  return (
    <DashboardShell
      title="Memuat Daftar Proyek..."
      subtitle="Mengambil data proyek dan tech stack dari database..."
    >
      <div className="space-y-6 animate-pulse">
        {/* Search Bar Skeleton */}
        <div className="flex justify-between gap-4">
          <div className="h-10 w-80 rounded-lg bg-slate-200 dark:bg-zinc-800" />
          <div className="h-10 w-36 rounded-lg bg-slate-200 dark:bg-zinc-800" />
        </div>

        {/* Filter Card Skeleton */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex gap-4">
            <div className="h-9 w-24 rounded bg-slate-200 dark:bg-zinc-800" />
            <div className="h-9 flex-1 rounded bg-slate-100 dark:bg-zinc-800" />
            <div className="h-9 flex-1 rounded bg-slate-100 dark:bg-zinc-800" />
          </CardContent>
        </Card>

        {/* Project Cards Skeleton */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-slate-200 dark:border-slate-800">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-1/3 rounded bg-slate-200 dark:bg-zinc-800" />
                    <div className="h-3 w-1/4 rounded bg-slate-100 dark:bg-zinc-800" />
                  </div>
                  <div className="h-8 w-24 rounded bg-slate-200 dark:bg-zinc-800" />
                </div>
                <div className="h-3 w-3/4 rounded bg-slate-100 dark:bg-zinc-800" />
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                  <div className="h-5 w-20 rounded bg-slate-100 dark:bg-zinc-800" />
                  <div className="h-5 w-20 rounded bg-slate-100 dark:bg-zinc-800" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
