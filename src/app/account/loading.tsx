export default function AccountLoading() {
  return (
    <div className="space-y-8 animate-pulse" aria-busy="true" aria-label="Loading account details">
      {/* Page Header Skeleton */}
      <div className="border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-muted/70" />
          <div className="space-y-1.5">
            <div className="h-6 w-48 sm:w-64 rounded-md bg-muted/70" />
            <div className="h-3.5 w-60 sm:w-80 rounded bg-muted/50" />
          </div>
        </div>
      </div>

      {/* Quick Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-muted/60" />
            <div className="space-y-1.5">
              <div className="h-3 w-24 rounded bg-muted/50" />
              <div className="h-6 w-16 rounded-md bg-muted/70" />
            </div>
          </div>
          <div className="size-4 rounded-full bg-muted/40" />
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-muted/60" />
            <div className="space-y-1.5">
              <div className="h-3 w-28 rounded bg-muted/50" />
              <div className="h-6 w-20 rounded-md bg-muted/70" />
            </div>
          </div>
          <div className="size-4 rounded-full bg-muted/40" />
        </div>
      </div>

      {/* Main Content Area / Form Skeleton */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-border pb-4 space-y-1.5">
          <div className="h-5 w-40 rounded-md bg-muted/70" />
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

          <div className="space-y-2">
            <div className="h-3.5 w-24 rounded bg-muted/60" />
            <div className="h-10 w-full rounded-xl bg-muted/40" />
          </div>

          <div className="space-y-2">
            <div className="h-3.5 w-28 rounded bg-muted/60" />
            <div className="h-10 w-full rounded-xl bg-muted/40" />
          </div>

          <div className="pt-2">
            <div className="h-10 w-32 rounded-xl bg-primary/20" />
          </div>
        </div>
      </div>
    </div>
  );
}

