import { ArtworkGridSkeleton } from "@/components/shared/ArtworkCardSkeleton";

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header matching ShopPage */}
      <section className="border-b border-border/80 px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <span className="aa-eyebrow mb-3 inline-block">The Gallery</span>
          <h1 className="font-serif text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl">
            Shop Original Artworks
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Discover our curated collection of traditional Indian paintings, meditative Mandalas,
            and bespoke contemporary artwork. Each piece is meticulously handcrafted.
          </p>
        </div>
      </section>

      {/* Shop Gallery Container */}
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
        {/* Toolbar Skeleton */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input skeleton */}
            <div className="h-10 w-full sm:max-w-sm animate-pulse rounded-xl bg-muted/60" />
            {/* Sort skeleton */}
            <div className="h-10 w-36 animate-pulse rounded-xl bg-muted/60" />
          </div>

          {/* Category Pills skeleton */}
          <div className="flex flex-wrap gap-2">
            <div className="h-9 w-14 animate-pulse rounded-full bg-primary/20" />
            <div className="h-9 w-28 animate-pulse rounded-full bg-muted/60" />
            <div className="h-9 w-24 animate-pulse rounded-full bg-muted/60" />
            <div className="h-9 w-32 animate-pulse rounded-full bg-muted/60" />
            <div className="h-9 w-20 animate-pulse rounded-full bg-muted/60" />
          </div>

          {/* Results count skeleton */}
          <div className="h-4 w-32 animate-pulse rounded bg-muted/50" />
        </div>

        {/* Artwork Grid */}
        <ArtworkGridSkeleton count={8} />
      </div>
    </div>
  );
}

