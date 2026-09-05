export default function AdminArtworksLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Artworks</h2>
          <p className="text-muted-foreground">
            Manage your store's artwork catalog.
          </p>
        </div>
        <div className="h-10 w-32 animate-pulse rounded-md bg-primary/30" />
      </div>

      {/* Filter / Search Bar Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="h-10 w-full sm:max-w-sm animate-pulse rounded-md bg-muted/60" />
        <div className="h-10 w-full sm:w-[150px] animate-pulse rounded-md bg-muted/60" />
      </div>

      {/* Table Skeleton */}
      <div className="rounded-md border border-border bg-card overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center border-b border-border bg-muted/30 px-4 py-3 text-xs font-medium text-muted-foreground">
          <div className="w-[80px]">Image</div>
          <div className="flex-1">Details</div>
          <div className="w-24 hidden md:block">Price</div>
          <div className="w-28 hidden sm:block">Status</div>
          <div className="w-24 hidden lg:block">Featured</div>
          <div className="w-16 text-right">Actions</div>
        </div>

        {/* Table Rows Skeleton */}
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center px-4 py-3.5 gap-4">
              {/* Thumbnail */}
              <div className="h-12 w-12 shrink-0 animate-pulse rounded-md bg-muted/70" />

              {/* Details (Title, slug, category badge) */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-4 w-2/5 animate-pulse rounded bg-muted" />
                <div className="flex gap-2 items-center">
                  <div className="h-3 w-20 animate-pulse rounded bg-muted/60" />
                  <div className="h-4 w-16 animate-pulse rounded-full bg-muted/50" />
                </div>
              </div>

              {/* Price */}
              <div className="w-24 hidden md:block">
                <div className="h-4 w-16 animate-pulse rounded bg-muted/70" />
              </div>

              {/* Status Badge */}
              <div className="w-28 hidden sm:block">
                <div className="h-6 w-20 animate-pulse rounded-full bg-muted/60" />
              </div>

              {/* Featured Badge */}
              <div className="w-24 hidden lg:block">
                <div className="h-6 w-16 animate-pulse rounded-full bg-muted/40" />
              </div>

              {/* Action Button */}
              <div className="w-16 flex justify-end">
                <div className="h-8 w-8 animate-pulse rounded-md bg-muted/70" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

