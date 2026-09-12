export default function CategoriesLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse" aria-busy="true" aria-label="Loading art traditions">
      {/* Hero Header Skeleton */}
      <section className="border-b border-border/80 px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-4xl text-center space-y-3">
          <div className="mx-auto h-4 w-28 rounded-full bg-primary/20" />
          <div className="mx-auto h-10 sm:h-14 w-64 sm:w-96 rounded-xl bg-muted/70" />
          <div className="mx-auto h-4 w-72 sm:w-[500px] rounded bg-muted/50" />
        </div>
      </section>

      {/* Categories Grid Skeleton */}
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-border bg-card overflow-hidden shadow-xs flex flex-col"
            >
              {/* Image Area Skeleton */}
              <div className="aspect-[4/3] w-full bg-muted/70" />

              {/* Card Body Skeleton */}
              <div className="p-6 sm:p-7 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-24 rounded-full bg-muted/60" />
                    <div className="h-4 w-16 rounded bg-muted/40" />
                  </div>
                  <div className="h-6 w-3/4 rounded-md bg-muted/70" />
                  <div className="space-y-1.5 pt-1">
                    <div className="h-3.5 w-full rounded bg-muted/50" />
                    <div className="h-3.5 w-4/5 rounded bg-muted/50" />
                  </div>
                </div>

                <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                  <div className="h-4 w-28 rounded bg-primary/20" />
                  <div className="size-4 rounded-full bg-muted/40" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

