"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import {
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Package,
  MapPin,
  Heart,
  Shield,
  User,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AccountSectionConfig {
  sectionName: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SECTION_CONFIGS: Record<string, AccountSectionConfig> = {
  "/account/orders": {
    sectionName: "Orders & Acquisitions",
    title: "Orders Failed to Load",
    description: "We couldn't retrieve your acquisition history. Your order records remain secure in our database.",
    icon: Package,
  },
  "/account/addresses": {
    sectionName: "Saved Addresses",
    title: "Addresses Failed to Load",
    description: "We couldn't retrieve your delivery coordinates. Please try again or re-authenticate.",
    icon: MapPin,
  },
  "/account/wishlist": {
    sectionName: "Collector Wishlist",
    title: "Wishlist Failed to Load",
    description: "We couldn't load your bookmarked artworks. Please try refreshing.",
    icon: Heart,
  },
  "/account/security": {
    sectionName: "Security & Settings",
    title: "Security Settings Failed to Load",
    description: "We couldn't load your account credentials and sessions.",
    icon: Shield,
  },
  "/account": {
    sectionName: "Personal Profile",
    title: "Profile Failed to Load",
    description: "We couldn't load your profile details and preferences.",
    icon: User,
  },
};

export default function AccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const config = (pathname && SECTION_CONFIGS[pathname]) || SECTION_CONFIGS["/account"];
  const IconComponent = config.icon || AlertCircle;

  useEffect(() => {
    console.error(`[AccountError at ${pathname || "unknown route"}]:`, error);
    Sentry.captureException(error, {
      extra: {
        pathname,
        sectionName: config.sectionName,
      },
    });
  }, [error, pathname, config]);

  return (
    <div className="flex min-h-[45vh] flex-col items-center justify-center p-2 sm:p-6">
      <div className="mx-auto flex max-w-lg w-full flex-col items-center text-center rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <IconComponent className="size-7" aria-hidden="true" />
        </div>

        <span className="aa-eyebrow mb-2 text-destructive">
          Account / {config.sectionName}
        </span>

        <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {config.title}
        </h2>

        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {config.description}
        </p>

        {error.digest && (
          <div className="mt-4 w-full rounded-lg border border-border bg-muted/50 p-2.5 text-left text-xs font-mono text-muted-foreground break-all">
            <span className="font-semibold text-foreground">Digest:</span> {error.digest}
          </div>
        )}

        <div className="mt-6 flex w-full flex-col gap-2.5 sm:flex-row sm:justify-center flex-wrap">
          <Button
            onClick={() => reset()}
            className="min-h-[44px] gap-2 shrink-0 flex-1 sm:flex-initial rounded-xl shadow-xs"
          >
            <RefreshCw className="size-4" />
            <span>Try Again</span>
          </Button>

          {pathname !== "/account" && (
            <Link
              href="/account"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "min-h-[44px] gap-2 shrink-0 flex-1 sm:flex-initial rounded-xl"
              )}
            >
              <ArrowLeft className="size-4" />
              <span>Back to Profile</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

