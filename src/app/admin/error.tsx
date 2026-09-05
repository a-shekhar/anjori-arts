"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, LayoutDashboard } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-4 sm:p-8">
      <div className="mx-auto flex max-w-md flex-col items-center text-center rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertCircle className="size-7" aria-hidden="true" />
        </div>

        <span className="aa-eyebrow mb-2 text-destructive">Admin Error</span>
        
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Section Failed to Load
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          An error occurred while loading this administrative section. The rest of the admin portal remains available.
        </p>

        {error.digest && (
          <div className="mt-4 w-full rounded-lg border border-border bg-muted/50 p-2.5 text-left text-xs font-mono text-muted-foreground break-all">
            <span className="font-semibold text-foreground">Digest:</span> {error.digest}
          </div>
        )}

        <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
          <Button
            onClick={() => reset()}
            className="flex-1 gap-2"
          >
            <RefreshCw className="size-4" />
            Try Again
          </Button>

          <Link
            href="/admin"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "flex-1 gap-2"
            )}
          >
            <LayoutDashboard className="size-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

