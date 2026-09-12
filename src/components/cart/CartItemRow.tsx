"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, Heart } from "lucide-react";
import { toast } from "sonner";
import { type CartItem, useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { formatPrice } from "@/lib/helpers";
import { MAX_CART_QUANTITY } from "@/config/constants";

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const router = useRouter();
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const addToWishlist = useWishlistStore((state) => state.addItem);

  const unitPrice = item.sellingPrice + (item.framingPrice || 0);
  const lineTotal = unitPrice * item.quantity;
  const productHref = item.slug ? `/artworks/${item.slug}` : `/artworks/${item.artworkId}`;

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (item.quantity < MAX_CART_QUANTITY) {
      updateQuantity(item.id, item.quantity + 1);
    } else {
      toast.error(`Maximum order limit is ${MAX_CART_QUANTITY} per item.`);
    }
  };

  const handleRemove = () => {
    removeItem(item.id);
    toast.info(`"${item.title}" was removed from your bag.`);
  };

  const handleMoveToWishlist = async () => {
    const success = await addToWishlist(item.artworkId, item.title, { silent: true });
    if (success) {
      removeItem(item.id);
      toast.success(`"${item.title}" moved to your wishlist!`, {
        description: "Saved to your wishlist and removed from shopping bag.",
        action: {
          label: "View Wishlist",
          onClick: () => router.push("/wishlist"),
        },
      });
    }
  };

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5 transition-colors">
      {/* Artwork Thumbnail */}
      <Link
        href={productHref}
        className="relative size-24 shrink-0 overflow-hidden rounded-xl border border-border/70 bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:size-28"
        aria-label={`View ${item.title}`}
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 96px, 112px"
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
      </Link>

      {/* Item Details */}
      <div className="flex flex-1 flex-col justify-between gap-2.5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link
              href={productHref}
              className="font-serif text-base font-semibold text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:text-lg"
            >
              {item.title}
            </Link>
            <div className="flex items-center gap-1 sm:-mr-2">
              <button
                type="button"
                onClick={handleMoveToWishlist}
                aria-label={`Save ${item.title} to wishlist`}
                title="Save to wishlist"
                className="flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
              >
                <Heart className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                aria-label={`Remove ${item.title} from cart`}
                title="Remove from bag"
                className="flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive cursor-pointer"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Attributes / Options */}
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-md bg-muted px-2 py-1 font-medium text-muted-foreground">
              Size: {item.size}
            </span>
            {item.isFramed ? (
              <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-1 font-medium text-primary">
                Premium Framing (+{formatPrice(item.framingPrice || 0)})
              </span>
            ) : (
              <span className="rounded-md border border-border bg-muted/50 px-2 py-1 text-muted-foreground">
                Unframed
              </span>
            )}
          </div>
        </div>

        {/* Quantity Controls & Line Price */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Stepper */}
          <div className="flex items-center rounded-xl border border-border bg-background p-0.5">
            <button
              type="button"
              onClick={handleDecrease}
              disabled={item.quantity <= 1}
              aria-label={`Decrease quantity of ${item.title}`}
              className="flex size-11 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Minus className="size-3.5" aria-hidden="true" />
            </button>

            <span
              className="w-9 text-center text-sm font-semibold tabular-nums text-foreground"
              aria-label={`Current quantity ${item.quantity}`}
            >
              {item.quantity}
            </span>

            <button
              type="button"
              onClick={handleIncrease}
              disabled={item.quantity >= MAX_CART_QUANTITY}
              aria-label={`Increase quantity of ${item.title}`}
              className="flex size-11 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Plus className="size-3.5" aria-hidden="true" />
            </button>
          </div>

          {/* Pricing */}
          <div className="text-right">
            <div className="font-serif text-lg font-semibold text-foreground sm:text-xl">
              {formatPrice(lineTotal)}
            </div>
            {item.quantity > 1 && (
              <div className="text-xs text-muted-foreground">
                {formatPrice(unitPrice)} each
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

