"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Palette,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useCartStore } from "@/stores/cart-store";
import { getArtworksByIds } from "@/actions/wishlist";
import { formatPrice } from "@/lib/helpers";
import { MAX_WISHLIST_ITEMS } from "@/config/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AccountSubpageHeader } from "@/components/account/AccountSubpageHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Artwork } from "@/types";

interface WishlistViewProps {
  initialArtworks?: Artwork[];
}

export function WishlistView({ initialArtworks = [] }: WishlistViewProps) {
  const router = useRouter();
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const wishlistIds = useWishlistStore((state) => state.items);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);
  const addToCart = useCartStore((state) => state.addItem);

  const [artworks, setArtworks] = React.useState<Artwork[]>(initialArtworks);
  const [loading, setLoading] = React.useState(false);
  const [showClearDialog, setShowClearDialog] = React.useState(false);
  const isProcessingRef = React.useRef(false);

  // Sync displayed artworks with wishlistIds
  React.useEffect(() => {
    if (!isMounted) return;

    let ignore = false;

    // Check if the current artworks match the store IDs
    const currentIds = artworks.map((a) => a.id);
    const hasDifference =
      wishlistIds.length !== currentIds.length ||
      wishlistIds.some((id) => !currentIds.includes(id));

    if (hasDifference) {
      const fetchArtworks = async () => {
        if (wishlistIds.length === 0) {
          await Promise.resolve();
          if (!ignore) {
            setArtworks([]);
          }
          return;
        }

        setLoading(true);
        try {
          const fetched = await getArtworksByIds(wishlistIds);
          if (!ignore) {
            setArtworks(fetched);
          }
        } catch (err) {
          console.error("Failed to hydrate wishlist artworks:", err);
        } finally {
          if (!ignore) {
            setLoading(false);
          }
        }
      };

      fetchArtworks();
    }

    return () => {
      ignore = true;
    };
  }, [isMounted, wishlistIds, artworks]);

  const handleMoveToBag = async (artwork: Artwork) => {
    if (!artwork.isAvailable) {
      toast.error("This artwork is currently sold out.", { id: "wishlist-action" });
      return;
    }

    if (!artwork.variants || artwork.variants.length === 0) {
      toast.error("Specifications for this artwork are pending update. Please view the artwork to inquire.", { id: "wishlist-action" });
      return;
    }

    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    // Optimistically update local view immediately
    setArtworks((prev) => prev.filter((a) => a.id !== artwork.id));

    try {
      const defaultVariant = artwork.variants?.[0];
      const variantId = defaultVariant?.id || artwork.id;

      addToCart({
        id: `${variantId}-unframed`,
        artworkId: artwork.id,
        slug: artwork.slug,
        variantId,
        quantity: 1,
        isFramed: false,
        framingPrice: 0,
        title: artwork.title,
        imageUrl: artwork.images[0]?.url || "",
        size: defaultVariant?.label || "Standard",
        sellingPrice: defaultVariant?.sellingPrice || artwork.price,
        mrp: defaultVariant?.mrp || Math.round(artwork.price * 1.2),
      });

      // Remove from wishlist silently because it has been moved to shopping bag
      await removeItem(artwork.id, undefined, { silent: true });

      toast.success(`Moved "${artwork.title}" to your bag!`, {
        id: "wishlist-action",
        description: "Item moved from wishlist to your shopping bag.",
        action: {
          label: "View Bag",
          onClick: () => router.push("/cart"),
        },
      });
    } finally {
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 350);
    }
  };

  const handleMoveAllToBag = async () => {
    const eligible = artworks.filter(
      (a) => a.isAvailable && a.variants && a.variants.length > 0
    );
    if (eligible.length === 0) {
      toast.error("None of your wishlisted artworks currently have verified variants in stock.", { id: "wishlist-action" });
      return;
    }

    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    // Optimistically remove eligible artworks from local view immediately
    setArtworks((prev) => prev.filter((a) => !eligible.some((e) => e.id === a.id)));

    try {
      for (const art of eligible) {
        const defaultVariant = art.variants![0];
        const variantId = defaultVariant.id;

        addToCart({
          id: `${variantId}-unframed`,
          artworkId: art.id,
          slug: art.slug,
          variantId,
          quantity: 1,
          isFramed: false,
          framingPrice: 0,
          title: art.title,
          imageUrl: art.images[0]?.url || "",
          size: defaultVariant.label || "Standard",
          sellingPrice: defaultVariant.sellingPrice,
          mrp: defaultVariant.mrp || defaultVariant.sellingPrice,
        });

        await removeItem(art.id, undefined, { silent: true });
      }

      toast.success(
        `Moved ${eligible.length} ${eligible.length === 1 ? "artwork" : "artworks"} to your bag!`,
        {
          id: "wishlist-action",
          action: {
            label: "View Bag",
            onClick: () => router.push("/cart"),
          },
        }
      );
    } finally {
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 350);
    }
  };

  const handleRemove = async (
    e: React.MouseEvent,
    artworkId: string,
    artworkTitle: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    // Optimistically remove from local view immediately
    setArtworks((prev) => prev.filter((a) => a.id !== artworkId));

    try {
      await removeItem(artworkId, artworkTitle);
    } finally {
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 350);
    }
  };

  const handleClearAll = () => {
    clearWishlist();
    setArtworks([]);
    setShowClearDialog(false);
    toast.info("Your wishlist has been cleared.", { id: "wishlist-action" });
  };

  // SSR skeleton
  if (!isMounted) {
    return (
      <div className="space-y-6">
        <div className="border-b border-border pb-5">
          <div className="h-7 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-muted/60" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-muted/40" />
          ))}
        </div>
      </div>
    );
  }

  const count = wishlistIds.length;
  const isFull = count >= MAX_WISHLIST_ITEMS;

  return (
    <div className="space-y-6">
      <AccountSubpageHeader
        title="Collector Wishlist"
        description="Curate and bookmark your favorite traditional folk art pieces for upcoming occasions."
        badge={
          <Badge
            variant={isFull ? "destructive" : "secondary"}
            className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
          >
            {count} / {MAX_WISHLIST_ITEMS} saved
          </Badge>
        }
        action={
          count > 0 ? (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMoveAllToBag}
                className="flex-1 sm:flex-initial rounded-xl text-xs font-medium gap-1.5 min-h-[40px] shadow-xs hover:border-primary/40 hover:text-primary"
              >
                <ShoppingBag className="size-3.5" />
                <span>Move All to Bag</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClearDialog(true)}
                className="rounded-xl text-xs font-medium min-h-[40px] text-muted-foreground hover:text-destructive hover:border-destructive/40"
              >
                <Trash2 className="size-3.5 mr-1" />
                <span>Clear All</span>
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* Capacity Warning Alert if at or near limit */}
      {isFull && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 p-4 text-xs flex items-center gap-3">
          <AlertCircle className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-amber-800 dark:text-amber-300">
            <strong>Wishlist capacity reached ({MAX_WISHLIST_ITEMS} items).</strong> Move your
            favorites into your shopping bag or remove pieces to save new artworks.
          </p>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-muted/40" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && count === 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-14 text-center shadow-xs">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mb-5 shadow-xs">
            <Heart className="size-8 fill-rose-500/20 text-rose-500" />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground mb-3">
            <Sparkles className="size-3.5 text-primary" />
            <span>Personal Art Treasury</span>
          </div>

          <h3 className="font-serif text-2xl font-medium text-foreground tracking-tight max-w-md mx-auto">
            Your Wishlist is Empty
          </h3>

          <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            You haven&apos;t saved any handcrafted folk art pieces yet. Explore our authentic gallery of
            Madhubani, Tanjore, and traditional Indian artworks to curate your collection.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/shop">
              <Button className="rounded-xl font-medium gap-2 shadow-xs h-11 px-6">
                <Palette className="size-4" />
                <span>Explore Art Gallery</span>
                <ArrowRight className="size-4" />
              </Button>
            </Link>

            <Link href="/custom-order">
              <Button variant="outline" className="rounded-xl font-medium h-11 px-6">
                <span>Commission Custom Artwork</span>
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Wishlist Artworks Grid */}
      {!loading && count > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {artworks.map((artwork) => {
            const primaryImage = artwork.images[0];

            return (
              <article
                key={artwork.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              >
                {/* Artwork Thumbnail with Sold Out Overlay & Delete button */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted/30">
                  <Link href={`/artworks/${artwork.slug}`} className="block size-full">
                    {primaryImage && (
                      <Image
                        src={primaryImage.url}
                        alt={primaryImage.alt || artwork.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                      />
                    )}
                  </Link>

                  {!artwork.isAvailable && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-xs">
                      <span className="rounded-full bg-background px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-foreground shadow-xs">
                        Sold Out
                      </span>
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={(e) => handleRemove(e, artwork.id, artwork.title)}
                    aria-label={`Remove ${artwork.title} from wishlist`}
                    title="Remove from wishlist"
                    className="absolute top-2.5 right-2.5 z-10 flex size-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-background/85 backdrop-blur-md text-muted-foreground transition-all duration-200 hover:bg-destructive hover:text-white shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive cursor-pointer active:scale-95"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                {/* Details & Actions */}
                <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                  <div>
                    <h3 className="font-serif text-base font-semibold leading-snug text-foreground line-clamp-2">
                      <Link
                        href={`/artworks/${artwork.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {artwork.title}
                      </Link>
                    </h3>

                    {(() => {
                      const isZeroDimension = artwork.dimensions && /^0(?:\.0+)?["']?\s*[×x*]\s*0(?:\.0+)?["']?$/i.test(artwork.dimensions.trim());
                      const cleanDimensions = isZeroDimension ? null : artwork.dimensions;
                      const meta = [cleanDimensions, artwork.surface].filter(Boolean);
                      if (meta.length === 0) return null;
                      return (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                          {meta.join(" · ")}
                        </p>
                      );
                    })()}

                    <p className="mt-2.5 text-base font-semibold text-foreground">
                      {formatPrice(artwork.price)}
                    </p>
                  </div>

                  {/* Move to Bag Action */}
                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center gap-2">
                    {artwork.isAvailable ? (
                      artwork.variants && artwork.variants.length > 0 ? (
                        <Button
                          onClick={() => handleMoveToBag(artwork)}
                          className="w-full min-h-[44px] h-11 rounded-xl font-medium gap-2 shadow-xs text-xs sm:text-sm"
                        >
                          <ShoppingBag className="size-4" />
                          <span>Move to Bag</span>
                        </Button>
                      ) : (
                        <Link href={`/artworks/${artwork.slug}`} className="w-full">
                          <Button
                            variant="outline"
                            className="w-full min-h-[44px] h-11 rounded-xl font-medium gap-2 text-xs sm:text-sm text-amber-600 dark:text-amber-400 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20"
                          >
                            <AlertCircle className="size-4" />
                            <span>Specs Pending · View</span>
                          </Button>
                        </Link>
                      )
                    ) : (
                      <Link
                        href={`/custom-order?type=Custom&title=${encodeURIComponent(artwork.title)}`}
                        className="w-full"
                      >
                        <Button
                          variant="outline"
                          className="w-full min-h-[44px] h-11 rounded-xl font-medium gap-1.5 text-xs sm:text-sm border-dashed"
                        >
                          <Sparkles className="size-3.5 text-primary" />
                          <span>Commission Similar</span>
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Clear Wishlist Confirmation Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Clear Collector Wishlist?</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              This will remove all {count} saved artworks from your wishlist. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClearDialog(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearAll}
              className="rounded-xl"
            >
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

