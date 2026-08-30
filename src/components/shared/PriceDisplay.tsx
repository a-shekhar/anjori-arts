import { formatPrice, getDiscountPercent } from "@/lib/helpers";
import { cn } from "@/lib/utils";

export interface PriceDisplayProps {
  mrp: number;
  sellingPrice: number;
  showTaxNote?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Server Component for displaying prices in paise.
 * Renders the selling price prominently, strikethrough MRP when discounted,
 * a discount badge, and an optional tax footnote.
 */
export function PriceDisplay({
  mrp,
  sellingPrice,
  showTaxNote = false,
  className,
  size = "md",
}: PriceDisplayProps) {
  const discountPercent = getDiscountPercent(mrp, sellingPrice);
  const hasDiscount = discountPercent > 0 && mrp > sellingPrice;

  const sizeClasses = {
    sm: {
      container: "gap-0.5",
      selling: "text-base font-bold text-foreground",
      mrp: "text-xs text-muted-foreground line-through",
      badge: "text-[10px] px-1.5 py-0.5",
      tax: "text-[11px]",
    },
    md: {
      container: "gap-1",
      selling: "text-xl sm:text-2xl font-bold font-serif text-foreground",
      mrp: "text-sm sm:text-base text-muted-foreground line-through",
      badge: "text-xs px-2 py-0.5",
      tax: "text-xs",
    },
    lg: {
      container: "gap-1.5",
      selling: "text-2xl sm:text-3xl font-bold font-serif text-foreground",
      mrp: "text-base sm:text-lg text-muted-foreground line-through",
      badge: "text-xs sm:text-sm px-2.5 py-0.5",
      tax: "text-xs",
    },
  }[size];

  return (
    <div className={cn("flex flex-col", sizeClasses.container, className)}>
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span className={sizeClasses.selling}>
          {formatPrice(sellingPrice)}
        </span>

        {hasDiscount && (
          <>
            <span className={sizeClasses.mrp}>
              {formatPrice(mrp)}
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-full bg-emerald-500/10 font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
                sizeClasses.badge
              )}
            >
              {discountPercent}% OFF
            </span>
          </>
        )}
      </div>

      {showTaxNote && (
        <p className={cn("text-muted-foreground", sizeClasses.tax)}>
          Inclusive of all taxes
        </p>
      )}
    </div>
  );
}

