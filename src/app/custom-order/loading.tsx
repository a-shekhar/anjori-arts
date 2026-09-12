export default function CustomOrderLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse" aria-busy="true" aria-label="Loading custom commission page">
      {/* Hero Section Skeleton */}
      <section className="border-b border-border bg-muted/30 px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
        <div className="mx-auto max-w-4xl text-center space-y-3">
          <div className="mx-auto h-4 w-28 rounded-full bg-primary/20" />
          <div className="mx-auto h-10 sm:h-14 w-72 sm:w-[500px] rounded-xl bg-muted/70" />
          <div className="mx-auto h-4 w-64 sm:w-[550px] rounded bg-muted/50" />
        </div>
      </section>

      {/* Main Content Skeleton */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          {/* Left Column: Process Steps Skeleton */}
          <div className="space-y-10">
            <div className="space-y-2">
              <div className="h-7 w-40 rounded-md bg-muted/70" />
              <div className="h-4 w-full max-w-md rounded bg-muted/50" />
            </div>

            <div className="space-y-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="size-10 rounded-full bg-muted/70 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-40 rounded bg-muted/70" />
                    <div className="h-3.5 w-5/6 rounded bg-muted/50" />
                    <div className="h-3.5 w-3/4 rounded bg-muted/50" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Form Skeleton */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xs sm:p-10 space-y-6">
            <div className="space-y-2">
              <div className="h-6 w-52 rounded-md bg-muted/70" />
              <div className="h-3.5 w-72 rounded bg-muted/50" />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-3.5 w-20 rounded bg-muted/60" />
                  <div className="h-10 w-full rounded-xl bg-muted/40" />
                </div>
                <div className="space-y-2">
                  <div className="h-3.5 w-20 rounded bg-muted/60" />
                  <div className="h-10 w-full rounded-xl bg-muted/40" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-3.5 w-24 rounded bg-muted/60" />
                  <div className="h-10 w-full rounded-xl bg-muted/40" />
                </div>
                <div className="space-y-2">
                  <div className="h-3.5 w-24 rounded bg-muted/60" />
                  <div className="h-10 w-full rounded-xl bg-muted/40" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-3.5 w-32 rounded bg-muted/60" />
                <div className="h-28 w-full rounded-xl bg-muted/40" />
              </div>

              <div className="pt-2">
                <div className="h-11 w-full rounded-xl bg-primary/20" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

