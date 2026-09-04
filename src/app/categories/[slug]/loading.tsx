import { ArtworkGridSkeleton } from "@/components/shared/ArtworkCardSkeleton";

export default function CategoryDetailLoading() {
  return (
    <div className="min-h-screen bg-background">

      {/* Category Hero Banner Skeleton */}
      <section className="aa-hero-grid border-b border-border/80 px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-3 h-3 w-24 animate-pulse rounded bg-muted" />
          <div className="mx-auto mb-4 h-9 w-64 animate-pulse rounded-xl bg-muted/80 sm:h-12 sm:w-96" />
          <div className="mx-auto h-4 w-4/5 max-w-lg animate-pulse rounded bg-muted/60" />
        </div>
      </section>

      {/* Category Navigation Pills Skeleton */}
      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
        <div className="flex flex-wrap gap-2">
          <div className="h-9 w-24 animate-pulse rounded-full bg-muted/60" />
          <div className="h-9 w-32 animate-pulse rounded-full bg-primary/20" />
          <div className="h-9 w-28 animate-pulse rounded-full bg-muted/60" />
          <div className="h-9 w-24 animate-pulse rounded-full bg-muted/60" />
          <div className="h-9 w-20 animate-pulse rounded-full bg-muted/60" />
        </div>
      </div>

      {/* Gallery Container Skeleton */}
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="h-10 w-full sm:max-w-sm animate-pulse rounded-xl bg-muted/60" />
            <div className="h-10 w-36 animate-pulse rounded-xl bg-muted/60" />
          </div>
          <div className="h-4 w-32 animate-pulse rounded bg-muted/50" />
        </div>

        <ArtworkGridSkeleton count={8} />
      </div>
    </div>
  );
}

