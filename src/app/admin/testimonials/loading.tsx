export default function AdminTestimonialsLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-1">
        <div className="h-9 w-64 animate-pulse rounded-md bg-muted" />
        <div className="h-5 w-96 max-w-full animate-pulse rounded-md bg-muted/60" />
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 animate-pulse rounded bg-muted/70" />
              <div className="h-4 w-4 animate-pulse rounded bg-muted/50" />
            </div>
            <div className="h-8 w-12 animate-pulse rounded bg-muted font-bold" />
          </div>
        ))}
      </div>

      {/* Filter and Action Bar Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="flex gap-2">
          <div className="h-10 w-24 animate-pulse rounded-lg bg-muted/70" />
          <div className="h-10 w-24 animate-pulse rounded-lg bg-muted/50" />
          <div className="h-10 w-24 animate-pulse rounded-lg bg-muted/50" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-64 animate-pulse rounded-md bg-muted/60" />
          <div className="h-10 w-36 animate-pulse rounded-md bg-primary/30" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center border-b border-border bg-muted/30 px-4 py-3 text-xs font-medium text-muted-foreground">
          <div className="w-[180px]">Collector</div>
          <div className="w-[160px] hidden md:block">Rating & Artwork</div>
          <div className="flex-1 min-w-0">Review Quote</div>
          <div className="w-24 hidden sm:block">Room Photo</div>
          <div className="w-28">Status</div>
          <div className="w-24 text-right">Actions</div>
        </div>

        {/* Table Rows Skeleton */}
        <div className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center px-4 py-3.5 gap-4">
              {/* Collector */}
              <div className="w-[180px] space-y-1">
                <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                <div className="h-3 w-20 animate-pulse rounded bg-muted/60" />
              </div>

              {/* Rating & Artwork */}
              <div className="w-[160px] hidden md:block space-y-1">
                <div className="h-4 w-20 animate-pulse rounded bg-amber-500/20" />
                <div className="h-3 w-24 animate-pulse rounded bg-muted/60" />
              </div>

              {/* Quote */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted/80" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted/50" />
              </div>

              {/* Photo */}
              <div className="w-24 hidden sm:block">
                <div className="h-12 w-12 animate-pulse rounded-md bg-muted/70" />
              </div>

              {/* Status */}
              <div className="w-28">
                <div className="h-6 w-20 animate-pulse rounded-full bg-muted/60" />
              </div>

              {/* Actions */}
              <div className="w-24 flex justify-end gap-2">
                <div className="h-8 w-8 animate-pulse rounded-md bg-muted/70" />
                <div className="h-8 w-8 animate-pulse rounded-md bg-muted/70" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
