export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Hero Header */}
      <section className="border-b border-border bg-muted/30 px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <span className="aa-eyebrow mb-2.5 inline-block">Order Finalization</span>
          <h1 className="font-serif text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl lg:text-5xl">
            Collector Checkout
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Enter your insured delivery destination and choose your preferred payment option.
          </p>
        </div>
      </section>

      {/* Main Form Content */}
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
        {/* Reassurance Banner */}
        <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs sm:text-sm">
          <div className="size-4 shrink-0 rounded bg-primary/40" />
          <div className="h-4 w-3/4 rounded bg-primary/20" />
        </div>

        {/* 2-Column Checkout Grid */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Form Sections */}
          <div className="space-y-8 lg:col-span-7 xl:col-span-8">
            {/* Section 1: Contact & Address */}
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 space-y-6 shadow-xs">
              <div className="flex items-center gap-2.5 border-b border-border/80 pb-4">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary/30 text-xs font-semibold" />
                <div className="h-5 w-72 rounded bg-muted/70" />
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="h-3 w-20 rounded bg-muted/60" />
                  <div className="h-11 w-full rounded-xl bg-muted/40" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <div className="h-3 w-28 rounded bg-muted/60" />
                    <div className="h-11 w-full rounded-xl bg-muted/40" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3 w-28 rounded bg-muted/60" />
                    <div className="h-11 w-full rounded-xl bg-muted/40" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <div className="h-3 w-16 rounded bg-muted/60" />
                    <div className="h-11 w-full rounded-xl bg-muted/40" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3 w-20 rounded bg-muted/60" />
                    <div className="h-11 w-full rounded-xl bg-muted/40" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3 w-16 rounded bg-muted/60" />
                    <div className="h-11 w-full rounded-xl bg-muted/40" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 w-32 rounded bg-muted/60" />
                  <div className="h-11 w-full rounded-xl bg-muted/40" />
                </div>
              </div>
            </div>

            {/* Section 2: Payment Method */}
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 space-y-6 shadow-xs">
              <div className="flex items-center gap-2.5 border-b border-border/80 pb-4">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary/30 text-xs font-semibold" />
                <div className="space-y-1">
                  <div className="h-5 w-48 rounded bg-muted/70" />
                  <div className="h-3 w-64 rounded bg-muted/40" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-28 rounded-2xl border border-primary/20 bg-primary/5 p-4" />
                <div className="h-20 rounded-2xl border border-border bg-muted/20 p-4" />
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 space-y-5 shadow-xs">
              <div className="space-y-1.5 border-b border-border/80 pb-4">
                <div className="h-6 w-36 rounded bg-muted/80" />
                <div className="h-3 w-24 rounded bg-muted/50" />
              </div>
              <div className="space-y-3">
                <div className="flex gap-3 items-center py-2">
                  <div className="size-12 rounded-lg bg-muted/60" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-3/4 rounded bg-muted/70" />
                    <div className="h-2.5 w-1/2 rounded bg-muted/40" />
                  </div>
                  <div className="h-3.5 w-14 rounded bg-muted/70" />
                </div>
              </div>
              <div className="space-y-2.5 border-t border-border/80 pt-4">
                <div className="flex justify-between">
                  <div className="h-3.5 w-16 rounded bg-muted/50" />
                  <div className="h-3.5 w-20 rounded bg-muted/70" />
                </div>
                <div className="flex justify-between">
                  <div className="h-3.5 w-20 rounded bg-muted/50" />
                  <div className="h-3.5 w-12 rounded bg-muted/70" />
                </div>
                <div className="flex justify-between border-t border-border pt-3">
                  <div className="h-5 w-24 rounded bg-muted/80" />
                  <div className="h-5 w-24 rounded bg-primary/40" />
                </div>
              </div>
              <div className="h-12 w-full rounded-xl bg-primary/40" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

