export function ArtworkCardSkeleton() {
  return (
    <div
      data-slot="artwork-card-skeleton"
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card"
    >
      {/* Image Skeleton */}
      <div className="aspect-[4/5] w-full animate-pulse bg-muted/60" />

      {/* Content Skeleton */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div className="space-y-2.5">
          {/* Eyebrow */}
          <div className="h-2.5 w-16 animate-pulse rounded bg-muted" />
          {/* Title */}
          <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
          {/* Subtitle / Dimensions */}
          <div className="h-3 w-3/5 animate-pulse rounded bg-muted/70" />
        </div>

        {/* Price & Action Skeleton */}
        <div className="mt-4 flex items-end justify-between border-t border-border/50 pt-3">
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-3 w-10 animate-pulse rounded bg-muted/60" />
        </div>
      </div>
    </div>
  );
}

export function ArtworkGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ArtworkCardSkeleton key={i} />
      ))}
    </div>
  );
}

