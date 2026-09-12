"use client";

import * as React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/stores/wishlist-store";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const emptySubscribe = () => () => {};

export function WishlistIcon() {
  const isMounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const itemCount = useWishlistStore((state) => state.getItemCount());
  const syncWithCloud = useWishlistStore((state) => state.syncWithCloud);

  // Auto-sync guest items with user account on mount and on auth change (sign-in)
  React.useEffect(() => {
    syncWithCloud();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        syncWithCloud();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [syncWithCloud]);

  const hasItems = isMounted && itemCount > 0;

  return (
    <Link
      href="/wishlist"
      aria-label={hasItems ? `Collector Wishlist with ${itemCount} items` : "Collector Wishlist"}
      title="Wishlist"
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "relative flex size-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      )}
    >
      <Heart className={cn("size-5", hasItems && "text-rose-500 fill-rose-500/20")} aria-hidden="true" />
      {hasItems && (
        <span
          className="absolute right-1 top-1 flex min-w-4.5 h-4.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs"
          aria-hidden="true"
        >
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      )}
    </Link>
  );
}
