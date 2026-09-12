export default function AdminBlogLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading blog posts">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="h-9 w-48 rounded-md bg-muted" />
          <div className="h-5 w-64 rounded-md bg-muted/60" />
        </div>
        <div className="h-10 w-32 rounded-md bg-primary/20" />
      </div>

      {/* Table Skeleton */}
      <div className="rounded-md border border-border bg-card overflow-hidden shadow-xs">
        {/* Table Header */}
        <div className="flex items-center border-b border-border bg-muted/30 px-4 py-3 text-xs font-medium text-muted-foreground">
          <div className="flex-1">Title</div>
          <div className="w-28">Status</div>
          <div className="w-32 hidden md:block">Author</div>
          <div className="w-28 hidden sm:block">Date</div>
          <div className="w-20 text-right">Actions</div>
        </div>

        {/* Table Rows Skeleton */}
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center px-4 py-3.5 gap-4">
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-3/5 rounded bg-muted/80" />
                <div className="h-3 w-32 rounded bg-muted/50" />
              </div>
              <div className="w-28">
                <div className="h-6 w-20 rounded-full bg-muted/60" />
              </div>
              <div className="w-32 hidden md:block">
                <div className="h-4 w-24 rounded bg-muted/60" />
              </div>
              <div className="w-28 hidden sm:block">
                <div className="h-4 w-20 rounded bg-muted/50" />
              </div>
              <div className="w-20 flex justify-end gap-2">
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

