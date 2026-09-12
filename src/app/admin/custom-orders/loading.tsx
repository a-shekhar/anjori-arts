export default function AdminCustomOrdersLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading custom orders">
      {/* Top Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-52 rounded-md bg-muted" />
            <div className="h-5 w-16 rounded-full bg-primary/20" />
          </div>
          <div className="h-5 w-96 max-w-full rounded-md bg-muted/60" />
        </div>
        <div className="h-10 w-40 rounded-md bg-muted/60" />
      </div>

      {/* Summary Metrics Cards Skeleton */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 rounded bg-muted/70" />
              <div className="size-4 rounded-full bg-muted/50" />
            </div>
            <div className="h-8 w-14 rounded-md bg-muted" />
            <div className="h-3 w-36 rounded bg-muted/40" />
          </div>
        ))}
      </div>

      {/* Table & Filter Skeleton */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          <div className="h-10 w-full sm:w-72 rounded-md bg-muted/60" />
          <div className="flex gap-2">
            <div className="h-10 w-24 rounded-md bg-muted/50" />
            <div className="h-10 w-24 rounded-md bg-muted/50" />
          </div>
        </div>

        <div className="rounded-md border border-border bg-card overflow-hidden shadow-xs">
          <div className="flex items-center border-b border-border bg-muted/30 px-4 py-3 text-xs font-medium text-muted-foreground">
            <div className="w-28">ID / Date</div>
            <div className="flex-1">Client & Specification</div>
            <div className="w-28 hidden sm:block">Budget</div>
            <div className="w-28">Status</div>
            <div className="w-20 text-right">Actions</div>
          </div>

          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center px-4 py-3.5 gap-4">
                <div className="w-28 space-y-1">
                  <div className="h-4 w-16 rounded bg-muted/70" />
                  <div className="h-3 w-20 rounded bg-muted/50" />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-2/5 rounded bg-muted/80" />
                  <div className="h-3 w-3/5 rounded bg-muted/50" />
                </div>
                <div className="w-28 hidden sm:block">
                  <div className="h-4 w-16 rounded bg-muted/60" />
                </div>
                <div className="w-28">
                  <div className="h-6 w-20 rounded-full bg-muted/60" />
                </div>
                <div className="w-20 flex justify-end">
                  <div className="size-8 rounded-md bg-muted/70" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

