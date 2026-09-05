"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export function CartIcon() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const itemCount = useCartStore((state) => state.getItemCount());
  const hasItems = isMounted && itemCount > 0;

  return (
    <Link
      href="/cart"
      aria-label={hasItems ? `Shopping bag with ${itemCount} items` : "Shopping bag"}
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "relative flex size-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      )}
    >
      <ShoppingBag className="size-5" aria-hidden="true" />
      {hasItems && (
        <span
          className="absolute right-1 top-1 flex min-w-4.5 h-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-xs"
          aria-hidden="true"
        >
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      )}
    </Link>
  );
}
