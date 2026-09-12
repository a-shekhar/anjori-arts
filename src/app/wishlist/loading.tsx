import { ArtworkGridSkeleton } from "@/components/shared/ArtworkCardSkeleton";

export default function WishlistLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse" aria-busy="true" aria-label="Loading collector wishlist">
      {/* Hero Header Skeleton */}
      <section className="border-b border-border bg-muted/30 px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-4xl text-center space-y-3">
          <div className="mx-auto h-4 w-36 rounded-full bg-primary/20" />
          <div className="mx-auto h-10 sm:h-14 w-64 sm:w-80 rounded-xl bg-muted/70" />
          <div className="mx-auto h-4 w-72 sm:w-[500px] rounded bg-muted/50" />
        </div>
      </section>

      {/* Main Content Skeleton */}
      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="h-5 w-36 rounded bg-muted/60" />
          <div className="h-9 w-32 rounded-xl bg-muted/40" />
        </div>

        <ArtworkGridSkeleton count={8} />
      </main>
    </div>
  );
}

