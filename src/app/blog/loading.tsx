export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header matching BlogListingPage */}
      <section className="aa-hero-grid border-b border-border/80 px-5 py-16 sm:px-8 sm:py-24 lg:px-10 mb-12 sm:mb-16">
        <div className="mx-auto max-w-4xl text-center">
          <span className="aa-eyebrow inline-block mb-3">Journal &amp; News</span>
          <h1 className="font-serif text-4xl font-medium tracking-[-0.03em] sm:text-5xl lg:text-7xl text-foreground leading-[1.1]">
            Our Blog
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
            Discover stories about traditional Indian art forms, artist spotlights, and cultural heritage.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 pb-16 sm:pb-24">
        {/* Toolbar Skeleton */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input skeleton */}
            <div className="h-10 w-full sm:max-w-sm animate-pulse rounded-xl bg-muted/60" />
            {/* Sort skeleton */}
            <div className="h-10 w-36 animate-pulse rounded-xl bg-muted/60" />
          </div>
          {/* Results count skeleton */}
          <div className="h-4 w-32 animate-pulse rounded bg-muted/50" />
        </div>

        {/* 6-Card Blog Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
            >
              {/* Cover Image Skeleton */}
              <div className="aspect-[16/10] w-full animate-pulse bg-muted/60" />
              {/* Content Skeleton */}
              <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
                <div className="space-y-3">
                  {/* Date & Tag badges */}
                  <div className="flex gap-2">
                    <div className="h-5 w-16 animate-pulse rounded-full bg-muted/70" />
                    <div className="h-5 w-20 animate-pulse rounded-full bg-muted/50" />
                  </div>
                  {/* Title lines */}
                  <div className="h-5 w-4/5 animate-pulse rounded bg-muted" />
                  <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
                  {/* Excerpt lines */}
                  <div className="space-y-1.5 pt-1">
                    <div className="h-3.5 w-full animate-pulse rounded bg-muted/60" />
                    <div className="h-3.5 w-5/6 animate-pulse rounded bg-muted/60" />
                  </div>
                </div>
                {/* Author footer */}
                <div className="flex items-center gap-2 pt-4 border-t border-border/60">
                  <div className="size-6 animate-pulse rounded-full bg-muted/70" />
                  <div className="h-3.5 w-24 animate-pulse rounded bg-muted/60" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

