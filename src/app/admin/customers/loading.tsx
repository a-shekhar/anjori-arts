export default function AdminCustomersLoading() {
  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 animate-pulse">
      {/* Page Header */}
      <div className="space-y-1.5">
        <div className="h-8 w-64 sm:w-80 rounded-lg bg-muted/80" />
        <div className="h-4 w-72 sm:w-96 rounded bg-muted/50" />
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs ${
              i === 4 ? "col-span-2 sm:col-span-1" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 rounded bg-muted/60" />
              <div className="size-4 rounded-full bg-muted/50" />
            </div>
            <div className="mt-3 h-8 w-16 rounded-md bg-muted/70" />
          </div>
        ))}
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 w-28 rounded-xl bg-muted/60" />
          ))}
        </div>
        <div className="h-10 w-full sm:w-72 rounded-xl bg-muted/60" />
      </div>

      {/* Table Skeleton */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <div className="border-b border-border bg-muted/40 px-4 py-3.5">
          <div className="grid grid-cols-12 gap-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            <div className="col-span-4">Collector</div>
            <div className="col-span-3">Contact</div>
            <div className="col-span-2 hidden md:block">Type &amp; Auth</div>
            <div className="col-span-2">Orders &amp; Spend</div>
            <div className="col-span-1 text-right">Action</div>
          </div>
        </div>

        <div className="divide-y divide-border/60">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-4 py-4">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4 flex items-center gap-3">
                  <div className="size-9 rounded-full bg-muted/80 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 w-32 rounded bg-muted/80" />
                    <div className="h-3 w-20 rounded bg-muted/50" />
                  </div>
                </div>
                <div className="col-span-3 space-y-1.5">
                  <div className="h-3.5 w-36 rounded bg-muted/70" />
                  <div className="h-3 w-24 rounded bg-muted/50" />
                </div>
                <div className="col-span-2 hidden md:block space-y-1.5">
                  <div className="h-5 w-20 rounded-md bg-muted/60" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <div className="h-4 w-16 rounded bg-muted/80" />
                  <div className="h-3 w-12 rounded bg-muted/50" />
                </div>
                <div className="col-span-1 text-right">
                  <div className="h-8 w-16 rounded-xl bg-muted/60 ml-auto" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

