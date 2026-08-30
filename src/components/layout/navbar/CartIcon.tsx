"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useState, useEffect } from "react";

export function CartIcon() {
  const [isMounted, setIsMounted] = useState(false);
  const itemCount = useCartStore((state) => state.getItemCount());

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Link
      href="/cart"
      aria-label="Shopping cart"
      className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative size-9 rounded-full text-foreground hover:bg-muted")}
    >
      <ShoppingBag className="size-4" />
      {isMounted && itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{itemCount > 9 ? "9+" : itemCount}</span>
      )}
    </Link>
  );
}
