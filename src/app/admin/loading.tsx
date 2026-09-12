export default function AdminDashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading admin dashboard">
      {/* Header Skeleton */}
      <div className="space-y-1">
        <div className="h-9 w-48 rounded-md bg-muted" />
        <div className="h-5 w-80 rounded-md bg-muted/60" />
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 rounded bg-muted/70" />
              <div className="size-5 rounded-md bg-muted/50" />
            </div>
            <div className="h-8 w-16 rounded-md bg-muted" />
            <div className="h-3 w-36 rounded bg-muted/40" />
          </div>
        ))}
      </div>

      {/* Quick Action Navigation Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-muted/70" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-32 rounded bg-muted/70" />
                <div className="h-3 w-48 rounded bg-muted/40" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

