export default function BlogPostLoading() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      {/* Back button skeleton */}
      <div className="mb-8 h-5 w-28 animate-pulse rounded bg-muted/70" />

      <article className="mx-auto">
        <header className="mb-8 text-center space-y-4">
          {/* Tags skeleton */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <div className="h-6 w-20 animate-pulse rounded-full bg-muted/60" />
            <div className="h-6 w-24 animate-pulse rounded-full bg-muted/60" />
          </div>

          {/* Title skeleton */}
          <div className="space-y-2 max-w-2xl mx-auto mb-6">
            <div className="h-10 md:h-12 w-full animate-pulse rounded-lg bg-muted" />
            <div className="h-10 md:h-12 w-3/4 mx-auto animate-pulse rounded-lg bg-muted" />
          </div>

          {/* Author / Date skeleton */}
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-28 animate-pulse rounded bg-muted/70" />
            <div className="size-1 rounded-full bg-muted-foreground/50" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted/60" />
          </div>
        </header>

        {/* Cover Image skeleton */}
        <div className="aspect-video w-full rounded-2xl overflow-hidden mb-12 animate-pulse bg-muted/60" />

        {/* Content paragraph skeletons */}
        <div className="space-y-4 max-w-none pt-4">
          <div className="h-4 w-full animate-pulse rounded bg-muted/70" />
          <div className="h-4 w-full animate-pulse rounded bg-muted/70" />
          <div className="h-4 w-11/12 animate-pulse rounded bg-muted/70" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-muted/70" />

          <div className="h-8 w-1/3 animate-pulse rounded-lg bg-muted pt-6 mt-8" />

          <div className="h-4 w-full animate-pulse rounded bg-muted/70" />
          <div className="h-4 w-full animate-pulse rounded bg-muted/70" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted/70" />
        </div>
      </article>
    </div>
  );
}

