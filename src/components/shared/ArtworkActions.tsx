"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, MessageCircle, AlertCircle, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { inquiryHref } from "@/config/site";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import { WishlistButton } from "@/components/shared/WishlistButton";
import { type Artwork, type Category } from "@/types";

interface ArtworkActionsProps {
  artwork: Artwork;
  category?: Category | null;
}

export function ArtworkActions({ artwork, category }: ArtworkActionsProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  
  // Default to first variant if variants exist, otherwise we just handle a single product state.
  // We'll mock a default variant if none are provided to keep it backward compatible.
  const variants = useMemo(() => {
    return artwork.variants?.length ? artwork.variants : [{
      id: artwork.id,
      label: "Standard",
      widthInches: 12,
      heightInches: 16,
      mrp: artwork.price * 1.2,
      sellingPrice: artwork.price,
      stockQuantity: artwork.isAvailable ? 1 : 0,
      isActive: true
    }];
  }, [artwork]);

  // Group variants by label
  const groupedVariants = useMemo(() => {
    const groups: Record<string, typeof variants> = {};
    variants.forEach(v => {
      if (!groups[v.label]) groups[v.label] = [];
      groups[v.label].push(v);
    });
    return groups;
  }, [variants]);

  const groupLabels = Object.keys(groupedVariants);

  const [selectedGroup, setSelectedGroup] = useState(variants[0].label);
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0].id);

  const handleGroupChange = (group: string) => {
    setSelectedGroup(group);
    setSelectedVariantId(groupedVariants[group][0].id);
  };

  const [isFramed, setIsFramed] = useState(false);
  const selectedVariant = variants.find(v => v.id === selectedVariantId) || variants[0];
  const isOutOfStock = !artwork.isAvailable || selectedVariant.isActive === false;
  const isMadeToOrder = !isOutOfStock && selectedVariant.stockQuantity <= 0;

  const canBeFramed = Boolean(selectedVariant.canBeFramed);
  const framingPrice = selectedVariant.framingPrice || 0;
  const effectiveIsFramed = canBeFramed && isFramed;
  const effectiveFramingPrice = effectiveIsFramed ? framingPrice : 0;
  const resolvedSize = selectedVariant.label || (selectedVariant.widthInches && selectedVariant.heightInches ? `${selectedVariant.widthInches}" × ${selectedVariant.heightInches}"` : "Original");

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    
    addItem({
      id: `${selectedVariant.id}-${effectiveIsFramed ? 'framed' : 'unframed'}`,
      artworkId: artwork.id,
      slug: artwork.slug,
      variantId: selectedVariant.id,
      quantity: 1,
      isFramed: effectiveIsFramed,
      framingPrice: effectiveFramingPrice,
      title: artwork.title,
      imageUrl: artwork.images[0]?.url || "",
      size: resolvedSize,
      sellingPrice: selectedVariant.sellingPrice,
      mrp: selectedVariant.mrp
    });

    toast.success(`"${artwork.title}" added to your bag!`, {
      description: "Review your items and proceed with your order.",
      action: {
        label: "View Bag",
        onClick: () => {
          router.push("/cart");
        },
      },
    });
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;

    const cartItemId = `${selectedVariant.id}-${effectiveIsFramed ? "framed" : "unframed"}`;
    const existing = useCartStore.getState().items.find((item) => item.id === cartItemId);

    if (!existing) {
      addItem({
        id: cartItemId,
        artworkId: artwork.id,
        slug: artwork.slug,
        variantId: selectedVariant.id,
        quantity: 1,
        isFramed: effectiveIsFramed,
        framingPrice: effectiveFramingPrice,
        title: artwork.title,
        imageUrl: artwork.images[0]?.url || "",
        size: resolvedSize,
        sellingPrice: selectedVariant.sellingPrice,
        mrp: selectedVariant.mrp,
      });
    }

    router.push("/checkout");
  };

  // Pre-fill WhatsApp general inquiry message
  const variantDesc = `${resolvedSize}${canBeFramed ? (effectiveIsFramed ? ", Framed" : ", Unframed") : ""}`;
  const whatsappUrl = `${inquiryHref}?text=${encodeURIComponent(
    `Hi! I'm interested in "${artwork.title}" (${variantDesc}). Could you share more details?`
  )}`;

  return (
    <div className="flex flex-col gap-6">
      {/* Dynamic Price Display */}
      <div className="-mt-4 mb-2">
        <PriceDisplay 
          mrp={selectedVariant.mrp + effectiveFramingPrice} 
          sellingPrice={selectedVariant.sellingPrice + effectiveFramingPrice} 
          showTaxNote 
        />
        {selectedVariant.sku && (
          <p className="mt-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            SKU: {selectedVariant.sku}
          </p>
        )}
      </div>

      {/* Size Selector or Single Variant Sizing Card */}
      {variants.length === 1 ? (
        <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Size / Edition</span>
            <span className="font-medium text-foreground text-sm">
              {selectedVariant.label || "Original Edition"}
            </span>
          </div>
          {selectedVariant.widthInches > 0 && selectedVariant.heightInches > 0 && (
            <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-primary/20">
              {selectedVariant.label && (selectedVariant.label.includes('"') || selectedVariant.label.includes('×'))
                ? `${Math.round(selectedVariant.widthInches * 2.54)} × ${Math.round(selectedVariant.heightInches * 2.54)} cm`
                : `${selectedVariant.widthInches}" × ${selectedVariant.heightInches}" (${Math.round(selectedVariant.widthInches * 2.54)} × ${Math.round(selectedVariant.heightInches * 2.54)} cm)`}
            </span>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Select Size / Edition</span>
              {selectedVariant.widthInches > 0 && selectedVariant.heightInches > 0 && (
                <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-primary/20">
                  {selectedVariant.widthInches}" × {selectedVariant.heightInches}" ({Math.round(selectedVariant.widthInches * 2.54)} × {Math.round(selectedVariant.heightInches * 2.54)} cm)
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {groupLabels.map((group) => {
                const groupVariant = groupedVariants[group]?.[0];
                const isSelected = selectedGroup === group;
                return (
                  <button
                    key={group}
                    type="button"
                    onClick={() => handleGroupChange(group)}
                    className={cn(
                      "rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all text-left flex items-center gap-2",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                        : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    )}
                  >
                    <span>{group}</span>
                    {groupVariant?.sellingPrice && (
                      <span className={cn(
                        "text-xs font-semibold px-1.5 py-0.5 rounded-md",
                        isSelected ? "bg-primary/20 text-primary" : "text-muted-foreground bg-muted/60"
                      )}>
                        ₹{(groupVariant.sellingPrice / 100).toLocaleString("en-IN")}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {groupedVariants[selectedGroup]?.length > 1 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Select Dimensions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {groupedVariants[selectedGroup].map((variant) => {
                  const isSelected = selectedVariantId === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={cn(
                        "rounded-xl border px-3.5 py-2 text-sm font-medium transition-all flex items-center gap-2",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                          : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      )}
                    >
                      <span>{variant.widthInches}" × {variant.heightInches}"</span>
                      <span className="text-xs text-muted-foreground">({Math.round(variant.widthInches * 2.54)} × {Math.round(variant.heightInches * 2.54)} cm)</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Framing Toggle */}
      {canBeFramed && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Framing Option</span>
            <span className="text-xs text-muted-foreground">
              {isFramed ? `+ ₹${(framingPrice / 100).toLocaleString()}` : 'Unframed'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsFramed(false)}
              className={cn(
                "rounded-xl border px-4 py-2.5 text-sm font-medium transition-all flex-1",
                !isFramed
                  ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              Unframed
            </button>
            <button
              onClick={() => setIsFramed(true)}
              className={cn(
                "rounded-xl border px-4 py-2.5 text-sm font-medium transition-all flex-1",
                isFramed
                  ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              Premium Frame
            </button>
          </div>
        </div>
      )}

      {/* Custom Size Request Link */}
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-muted-foreground">Need a different size?</span>
        <Link 
          href={`/custom-order?artworkId=${artwork.id}&type=${encodeURIComponent(category?.name || 'Other')}&title=${encodeURIComponent(artwork.title)}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          Request Custom Size
        </Link>
      </div>

      {/* Stock Status */}
      <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-4 py-3 text-sm">
        {isOutOfStock ? (
          <>
            <AlertCircle className="size-4 text-destructive" />
            <span className="font-medium text-destructive">Sold Out</span>
            <span className="text-muted-foreground ml-1">Currently unavailable</span>
          </>
        ) : isMadeToOrder ? (
          <>
            <Check className="size-4 text-primary" />
            <span className="font-medium text-primary">Made to Order</span>
            <span className="text-muted-foreground ml-1">· Ships in 7-10 days</span>
          </>
        ) : (
          <>
            <Check className="size-4 text-emerald-600" />
            <span className="font-medium text-emerald-600">In Stock</span>
            {selectedVariant.stockQuantity < 5 && (
              <span className="text-muted-foreground ml-1">· Only {selectedVariant.stockQuantity} left</span>
            )}
          </>
        )}
      </div>

      {/* Purchase Actions Row: Wishlist Icon + Add to Cart + Buy Now */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <WishlistButton
          artworkId={artwork.id}
          artworkTitle={artwork.title}
          variant="icon"
          className="size-12 rounded-xl border border-border bg-card shrink-0 hover:bg-muted/60 transition-colors shadow-xs"
        />
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-primary bg-transparent text-sm font-semibold text-primary transition-all hover:bg-primary/5 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
        >
          <ShoppingBag className="size-4 shrink-0" />
          <span>Add to Cart</span>
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-md shadow-primary/10 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
        >
          <span>Buy Now</span>
          <ArrowRight className="size-4 shrink-0" />
        </button>
      </div>

      {/* Subtle WhatsApp Inquiry Helper */}
      <div className="flex items-center justify-center -mt-1">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1 px-2.5 rounded-lg hover:bg-muted/50"
        >
          <MessageCircle className="size-3.5 sm:size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Questions about this piece? <strong className="font-semibold text-foreground underline decoration-border hover:decoration-foreground">Chat on WhatsApp</strong></span>
        </a>
      </div>
    </div>
  );
}

