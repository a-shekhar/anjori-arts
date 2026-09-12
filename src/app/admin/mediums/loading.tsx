export default function AdminMediumsLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading mediums">
      {/* Header Skeleton */}
      <div className="space-y-1">
        <div className="h-9 w-44 rounded-md bg-muted" />
        <div className="h-5 w-96 max-w-full rounded-md bg-muted/60" />
      </div>

      {/* Filter and Action Bar Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="h-10 w-full sm:w-80 rounded-md bg-muted/60" />
        <div className="h-10 w-36 rounded-md bg-primary/20" />
      </div>

      {/* Table Skeleton */}
      <div className="rounded-md border border-border bg-card overflow-hidden shadow-xs">
        <div className="flex items-center border-b border-border bg-muted/30 px-4 py-3 text-xs font-medium text-muted-foreground">
          <div className="w-12">Icon</div>
          <div className="flex-1">Medium Name & Description</div>
          <div className="w-28 hidden sm:block">Category</div>
          <div className="w-24 hidden md:block">Artworks</div>
          <div className="w-24 text-right">Actions</div>
        </div>

        <div className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center px-4 py-3.5 gap-4">
              <div className="size-9 rounded-lg bg-muted/70 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-1/4 rounded bg-muted/80" />
                <div className="h-3 w-3/5 rounded bg-muted/50" />
              </div>
              <div className="w-28 hidden sm:block">
                <div className="h-5 w-16 rounded-full bg-muted/60" />
              </div>
              <div className="w-24 hidden md:block">
                <div className="h-5 w-12 rounded-full bg-muted/50" />
              </div>
              <div className="w-24 flex justify-end gap-2">
                <div className="size-8 rounded-md bg-muted/70" />
                <div className="size-8 rounded-md bg-muted/70" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

