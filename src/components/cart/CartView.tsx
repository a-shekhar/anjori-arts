"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Trash2,
  Paintbrush,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cart-store";
import { CartItemRow } from "./CartItemRow";
import { CartSummary } from "./CartSummary";
import { TrustBadges } from "@/components/shared/TrustBadges";

const POPULAR_COLLECTIONS = [
  { name: "Madhubani", href: "/categories/madhubani" },
  { name: "Tanjore", href: "/categories/tanjore" },
  { name: "Warli", href: "/categories/warli" },
  { name: "All Artworks", href: "/shop" },
  { name: "Custom Orders", href: "/custom-order" },
];

const emptySubscribe = () => () => {};

export function CartView() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getDeliveryCharge = useCartStore((state) => state.getDeliveryCharge);
  const getTotal = useCartStore((state) => state.getTotal);

  // SSR skeleton matching layout to eliminate hydration layout shifts
  if (!mounted) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-48 rounded-lg bg-muted/60" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7 xl:col-span-8">
            <div className="h-28 rounded-2xl border border-border bg-card/60" />
            <div className="h-28 rounded-2xl border border-border bg-card/60" />
          </div>
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="h-72 rounded-2xl border border-border bg-card/60" />
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center sm:py-20">
        <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary shadow-xs">
          <ShoppingBag className="size-10" aria-hidden="true" />
        </div>

        <h2 className="mt-6 font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Your shopping bag is empty
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base leading-relaxed">
          Looks like you haven&apos;t added any artworks to your bag yet. Discover original paintings, cyanotypes, and unique handmade crafts.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/shop"
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span>Explore All Artworks</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>

          <Link
            href="/custom-order"
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Paintbrush className="size-4 text-primary" aria-hidden="true" />
            <span>Commission Custom Art</span>
          </Link>
        </div>

        {/* Popular Categories Shortcut */}
        <div className="mt-12 w-full max-w-lg border-t border-border/70 pt-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Popular Collections
          </span>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {POPULAR_COLLECTIONS.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="rounded-lg border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        <TrustBadges className="mt-16 w-full max-w-4xl" />
      </div>
    );
  }

  const subtotal = getSubtotal();
  const deliveryCharge = getDeliveryCharge();
  const total = getTotal();

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to empty your shopping bag?")) {
      clearCart();
      toast.info("Your shopping bag has been cleared.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Promotional Free Delivery Announcement Banner */}
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3.5 text-xs sm:text-sm font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
        <Truck className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        <div className="flex-1">
          <strong className="font-semibold">Complimentary Pan-India Shipping: </strong>
          All original artworks and custom pieces currently ship free with full transit insurance.
        </div>
      </div>

      {/* Main Cart Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        {/* Left: Cart Items List */}
        <div className="space-y-4 lg:col-span-7 xl:col-span-8">
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Artworks ({items.reduce((acc, i) => acc + i.quantity, 0)})
            </h2>
            <button
              type="button"
              onClick={handleClearCart}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive rounded"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              <span>Clear Bag</span>
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>

          {/* Custom Size Prompt */}
          <div className="flex items-center justify-between rounded-xl border border-dashed border-border bg-muted/20 p-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="size-4 text-primary shrink-0" aria-hidden="true" />
              <span>Need custom dimensions, framing style, or a bespoke motif?</span>
            </div>
            <Link
              href="/custom-order"
              className="font-medium text-primary hover:underline shrink-0 ml-2"
            >
              Request Custom
            </Link>
          </div>
        </div>

        {/* Right: Order Summary Sidebar */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="sticky top-24">
            <CartSummary
              items={items}
              subtotal={subtotal}
              deliveryCharge={deliveryCharge}
              total={total}
            />
          </div>
        </div>
      </div>

      {/* Footer Trust Signals */}
      <div className="border-t border-border/80 pt-10">
        <TrustBadges />
      </div>
    </div>
  );
}

