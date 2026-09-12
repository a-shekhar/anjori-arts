export default function AdminInquiriesLoading() {
  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 animate-pulse" aria-busy="true" aria-label="Loading customer inquiries">
      {/* Header Skeleton */}
      <div className="space-y-1">
        <div className="h-9 w-60 rounded-md bg-muted" />
        <div className="h-5 w-96 max-w-full rounded-md bg-muted/60" />
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-muted/70" />
              <div className="size-4 rounded-full bg-muted/50" />
            </div>
            <div className="h-8 w-12 rounded-md bg-muted" />
          </div>
        ))}
      </div>

      {/* Filter and Search Bar Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="h-10 w-full sm:w-80 rounded-md bg-muted/60" />
        <div className="flex gap-2">
          <div className="h-10 w-28 rounded-md bg-muted/50" />
          <div className="h-10 w-28 rounded-md bg-muted/50" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="flex items-center border-b border-border bg-muted/30 px-4 py-3 text-xs font-medium text-muted-foreground">
          <div className="w-[180px]">Contact</div>
          <div className="flex-1">Message Subject / Preview</div>
          <div className="w-28 hidden sm:block">Date</div>
          <div className="w-28">Status</div>
          <div className="w-20 text-right">Actions</div>
        </div>

        <div className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center px-4 py-3.5 gap-4">
              <div className="w-[180px] space-y-1">
                <div className="h-4 w-28 rounded bg-muted/80" />
                <div className="h-3 w-36 rounded bg-muted/50" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="h-4 w-3/4 rounded bg-muted/70" />
                <div className="h-3 w-1/2 rounded bg-muted/50" />
              </div>
              <div className="w-28 hidden sm:block">
                <div className="h-4 w-20 rounded bg-muted/50" />
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
  );
}

