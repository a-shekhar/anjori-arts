"use client";

import * as React from "react";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/stores/wishlist-store";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  artworkId: string;
  artworkTitle?: string;
  variant?: "icon" | "full";
  className?: string;
}

export function WishlistButton({
  artworkId,
  artworkTitle,
  variant = "icon",
  className,
}: WishlistButtonProps) {
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const isInWishlist = useWishlistStore((state) => state.isInWishlist(artworkId));
  const toggleItem = useWishlistStore((state) => state.toggleItem);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const isProcessingRef = React.useRef(false);

  const active = isMounted && isInWishlist;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    setIsAnimating(true);
    try {
      await toggleItem(artworkId, artworkTitle);
    } finally {
      setTimeout(() => {
        setIsAnimating(false);
        isProcessingRef.current = false;
      }, 350);
    }
  };

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={active ? `Remove ${artworkTitle || "artwork"} from wishlist` : `Add ${artworkTitle || "artwork"} to wishlist`}
        aria-pressed={active}
        className={cn(
          "flex h-12 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-medium transition-all active:scale-[0.98]",
          active
            ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-400 shadow-xs"
            : "border-border bg-card text-foreground hover:bg-muted/70 hover:border-primary/40",
          className
        )}
      >
        <Heart
          className={cn(
            "size-4.5 transition-transform duration-200",
            active ? "fill-rose-500 text-rose-500" : "text-muted-foreground",
            isAnimating && "scale-125"
          )}
        />
        <span>{active ? "Saved to Wishlist" : "Save to Wishlist"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={active ? `Remove ${artworkTitle || "artwork"} from wishlist` : `Add ${artworkTitle || "artwork"} to wishlist`}
      aria-pressed={active}
      className={cn(
        "group/wishlist relative flex size-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-background shadow-xs active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        active
          ? "text-rose-500 hover:text-rose-600 shadow-rose-500/10"
          : "text-muted-foreground hover:text-rose-500",
        className
      )}
      title={active ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={cn(
          "size-4.5 transition-all duration-200",
          active ? "fill-rose-500 text-rose-500" : "text-foreground/70 group-hover/wishlist:text-rose-500",
          isAnimating && "scale-125 animate-pulse"
        )}
      />
    </button>
  );
}

