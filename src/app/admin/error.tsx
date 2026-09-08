"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import {
  AlertCircle,
  RefreshCw,
  LayoutDashboard,
  ArrowLeft,
  ShoppingBag,
  Paintbrush,
  MessageSquare,
  Sparkles,
  BookOpen,
  Folder,
  Palette,
  Layers,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubRouteConfig {
  sectionName: string;
  itemTitle: string;
  listTitle: string;
  parentHref: string;
  parentLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SUB_ROUTES: Record<string, SubRouteConfig> = {
  "/admin/orders": {
    sectionName: "Orders",
    itemTitle: "Order Failed to Load",
    listTitle: "Orders Failed to Load",
    parentHref: "/admin/orders",
    parentLabel: "Back to Orders",
    icon: ShoppingBag,
  },
  "/admin/custom-orders": {
    sectionName: "Custom Orders",
    itemTitle: "Custom Order Failed to Load",
    listTitle: "Custom Orders Failed to Load",
    parentHref: "/admin/custom-orders",
    parentLabel: "Back to Custom Orders",
    icon: Paintbrush,
  },
  "/admin/artworks": {
    sectionName: "Artworks",
    itemTitle: "Artwork Failed to Load",
    listTitle: "Artworks Catalog Failed to Load",
    parentHref: "/admin/artworks",
    parentLabel: "Back to Artworks",
    icon: Palette,
  },
  "/admin/inquiries": {
    sectionName: "Inquiries",
    itemTitle: "Inquiry Failed to Load",
    listTitle: "Inquiries Failed to Load",
    parentHref: "/admin/inquiries",
    parentLabel: "Back to Inquiries",
    icon: MessageSquare,
  },
  "/admin/blog": {
    sectionName: "Blog",
    itemTitle: "Blog Post Failed to Load",
    listTitle: "Blog Posts Failed to Load",
    parentHref: "/admin/blog",
    parentLabel: "Back to Blog Posts",
    icon: BookOpen,
  },
  "/admin/testimonials": {
    sectionName: "Testimonials",
    itemTitle: "Testimonial Failed to Load",
    listTitle: "Testimonials Failed to Load",
    parentHref: "/admin/testimonials",
    parentLabel: "Reload Testimonials",
    icon: Sparkles,
  },
  "/admin/categories": {
    sectionName: "Categories",
    itemTitle: "Category Failed to Load",
    listTitle: "Categories Failed to Load",
    parentHref: "/admin/categories",
    parentLabel: "Reload Categories",
    icon: Folder,
  },
  "/admin/mediums": {
    sectionName: "Mediums",
    itemTitle: "Medium Failed to Load",
    listTitle: "Mediums Failed to Load",
    parentHref: "/admin/mediums",
    parentLabel: "Reload Mediums",
    icon: Palette,
  },
  "/admin/surfaces": {
    sectionName: "Surfaces",
    itemTitle: "Surface Failed to Load",
    listTitle: "Surfaces Failed to Load",
    parentHref: "/admin/surfaces",
    parentLabel: "Reload Surfaces",
    icon: Layers,
  },
};

function resolveRouteContext(pathname: string | null) {
  if (!pathname) return null;

  for (const [routePrefix, config] of Object.entries(SUB_ROUTES)) {
    if (pathname === routePrefix) {
      return {
        ...config,
        title: config.listTitle,
        isNested: false,
      };
    }
    if (pathname.startsWith(`${routePrefix}/`)) {
      return {
        ...config,
        title: config.itemTitle,
        isNested: true,
      };
    }
  }

  return null;
}

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const routeContext = resolveRouteContext(pathname);

  useEffect(() => {
    console.error(`[AdminError at ${pathname || "unknown route"}]:`, error);
    Sentry.captureException(error, {
      extra: {
        pathname,
        sectionName: routeContext?.sectionName,
      },
    });
  }, [error, pathname, routeContext]);

  const title = routeContext?.title || "Section Failed to Load";
  const eyebrow = routeContext?.sectionName
    ? `Admin / ${routeContext.sectionName}`
    : "Admin Error";
  const IconComponent = routeContext?.icon || AlertCircle;

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-4 sm:p-8">
      <div className="mx-auto flex max-w-lg flex-col items-center text-center rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <IconComponent className="size-7" aria-hidden="true" />
        </div>

        <span className="aa-eyebrow mb-2 text-destructive">{eyebrow}</span>

        <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>

        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {routeContext?.isNested
            ? `An error occurred while loading this specific record. You can retry or return to the ${routeContext.sectionName.toLowerCase()} overview.`
            : "An error occurred while loading this administrative section. The rest of the admin portal remains available."}
        </p>

        {error.digest && (
          <div className="mt-4 w-full rounded-lg border border-border bg-muted/50 p-2.5 text-left text-xs font-mono text-muted-foreground break-all">
            <span className="font-semibold text-foreground">Digest:</span> {error.digest}
          </div>
        )}

        <div className="mt-6 flex w-full flex-col gap-2.5 sm:flex-row sm:justify-center flex-wrap">
          <Button
            onClick={() => reset()}
            className="min-h-[44px] gap-2 shrink-0 flex-1 sm:flex-initial"
          >
            <RefreshCw className="size-4" />
            Try Again
          </Button>

          {routeContext?.isNested && (
            <Link
              href={routeContext.parentHref}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "min-h-[44px] gap-2 shrink-0 flex-1 sm:flex-initial"
              )}
            >
              <ArrowLeft className="size-4" />
              {routeContext.parentLabel}
            </Link>
          )}

          <Link
            href="/admin"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "min-h-[44px] gap-2 shrink-0 flex-1 sm:flex-initial text-muted-foreground hover:text-foreground"
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
