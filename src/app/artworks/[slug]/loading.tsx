export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
        {/* Breadcrumb skeleton */}
        <div className="mb-6 h-5 w-48 animate-pulse rounded bg-muted"></div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Image skeleton */}
          <div className="lg:col-span-7 xl:col-span-6">
            <div className="sticky top-24 space-y-4">
              <div className="aspect-[4/5] w-full animate-pulse rounded-2xl bg-muted/60"></div>
              <div className="flex gap-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 w-20 animate-pulse rounded-xl bg-muted/60"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Info skeleton */}
          <div className="flex flex-col lg:col-span-5 xl:col-span-6">
            <div className="mb-8 border-b border-border pb-8">
              <div className="mb-4 h-4 w-24 animate-pulse rounded bg-muted"></div>
              <div className="mb-6 h-10 w-3/4 animate-pulse rounded bg-muted"></div>
              <div className="h-8 w-1/3 animate-pulse rounded bg-muted"></div>
            </div>

            <div className="mb-10 space-y-4">
              <div className="h-6 w-32 animate-pulse rounded bg-muted"></div>
              <div className="flex gap-2">
                <div className="h-10 w-24 animate-pulse rounded-xl bg-muted"></div>
                <div className="h-10 w-24 animate-pulse rounded-xl bg-muted"></div>
              </div>
              <div className="h-12 w-full animate-pulse rounded-xl bg-muted mt-4"></div>
              <div className="h-12 w-full animate-pulse rounded-xl bg-muted"></div>
            </div>

            <div className="space-y-4">
              <div className="h-6 w-40 animate-pulse rounded bg-muted"></div>
              <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
              <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

