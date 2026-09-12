export default function StoriesLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse" aria-busy="true" aria-label="Loading collector stories">
      {/* Hero Header Skeleton */}
      <section className="border-b border-border/80 px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-3xl text-center space-y-3">
          <div className="mx-auto h-4 w-32 rounded-full bg-primary/20" />
          <div className="mx-auto h-10 sm:h-14 w-72 sm:w-[500px] rounded-xl bg-muted/70" />
          <div className="mx-auto h-4 w-64 sm:w-96 rounded bg-muted/50" />
          <div className="pt-2 flex justify-center gap-3">
            <div className="h-10 w-36 rounded-xl bg-primary/20" />
            <div className="h-10 w-36 rounded-xl bg-muted/60" />
          </div>
        </div>
      </section>

      {/* Stories Grid Skeleton */}
      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-border bg-card overflow-hidden shadow-xs flex flex-col justify-between p-6 sm:p-7 space-y-5"
            >
              <div className="space-y-3.5">
                {/* Rating Stars Skeleton */}
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <div key={s} className="size-4 rounded-xs bg-muted/60" />
                  ))}
                </div>

                {/* Quote Skeleton */}
                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-muted/60" />
                  <div className="h-4 w-11/12 rounded bg-muted/60" />
                  <div className="h-4 w-4/5 rounded bg-muted/60" />
                </div>

                {/* Optional Image placeholder in alternating cards */}
                {i % 2 === 0 && (
                  <div className="aspect-[4/3] w-full rounded-2xl bg-muted/70 mt-3" />
                )}
              </div>

              {/* Author & Artwork Meta Skeleton */}
              <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-4 w-28 rounded bg-muted/70" />
                  <div className="h-3 w-20 rounded bg-muted/40" />
                </div>
                <div className="h-3.5 w-24 rounded bg-muted/50" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

