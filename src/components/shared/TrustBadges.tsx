import { Package, RefreshCcw, ShieldCheck, Truck, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TrustBadgeItem {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export interface TrustBadgesProps {
  className?: string;
  showDescriptions?: boolean;
}

const DEFAULT_BADGES: TrustBadgeItem[] = [
  {
    icon: Truck,
    title: "Free Shipping ≥ ₹1,500",
    description: "Insured all-India delivery",
  },
  {
    icon: ShieldCheck,
    title: "Handmade & Authentic",
    description: "100% genuine artisan crafts",
  },
  {
    icon: Package,
    title: "Safe Packaging",
    description: "Museum-grade protection",
  },
  {
    icon: RefreshCcw,
    title: "Easy Returns",
    description: "Hassle-free 7-day replacement",
  },
];

/**
 * Server Component for e-commerce trust signals.
 * Displays a 4-item grid highlighting shipping, authenticity, packaging, and returns.
 */
export function TrustBadges({
  className,
  showDescriptions = true,
}: TrustBadgesProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3",
        className
      )}
    >
      {DEFAULT_BADGES.map((badge) => {
        const Icon = badge.icon;
        return (
          <div
            key={badge.title}
            className="flex flex-col items-center justify-center rounded-xl border border-border/80 bg-muted/40 p-3 text-center transition-colors hover:bg-muted/70 sm:p-4"
          >
            <div className="mb-2 flex size-8 sm:size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4 sm:size-4.5" aria-hidden="true" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-foreground leading-snug">
              {badge.title}
            </p>
            {showDescriptions && badge.description && (
              <p className="mt-0.5 text-[10px] sm:text-[11px] text-muted-foreground">
                {badge.description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

