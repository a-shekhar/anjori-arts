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

  const canBeFramed = selectedVariant.canBeFramed;
  const framingPrice = selectedVariant.framingPrice || 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    
    addItem({
      id: `${selectedVariant.id}-${isFramed ? 'framed' : 'unframed'}`,
      artworkId: artwork.id,
      slug: artwork.slug,
      variantId: selectedVariant.id,
      quantity: 1,
      isFramed,
      framingPrice: isFramed ? framingPrice : 0,
      title: artwork.title,
      imageUrl: artwork.images[0]?.url || "",
      size: selectedVariant.label,
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

    const cartItemId = `${selectedVariant.id}-${isFramed ? "framed" : "unframed"}`;
    const existing = useCartStore.getState().items.find((item) => item.id === cartItemId);

    if (!existing) {
      addItem({
        id: cartItemId,
        artworkId: artwork.id,
        slug: artwork.slug,
        variantId: selectedVariant.id,
        quantity: 1,
        isFramed,
        framingPrice: isFramed ? framingPrice : 0,
        title: artwork.title,
        imageUrl: artwork.images[0]?.url || "",
        size: selectedVariant.label,
        sellingPrice: selectedVariant.sellingPrice,
        mrp: selectedVariant.mrp,
      });
    }

    router.push("/checkout");
  };

  // Pre-fill WhatsApp general inquiry message
  const whatsappUrl = `${inquiryHref}?text=${encodeURIComponent(
    `Hi! I'm interested in "${artwork.title}" (${selectedVariant.label}). Could you share more details?`
  )}`;

  return (
    <div className="flex flex-col gap-6">
      {/* Dynamic Price Display */}
      <div className="-mt-4 mb-2">
        <PriceDisplay 
          mrp={selectedVariant.mrp + (isFramed ? framingPrice : 0)} 
          sellingPrice={selectedVariant.sellingPrice + (isFramed ? framingPrice : 0)} 
          showTaxNote 
        />
        {selectedVariant.sku && (
          <p className="mt-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            SKU: {selectedVariant.sku}
          </p>
        )}
      </div>

      {/* Size Selector */}
      {variants.length > 1 && (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Select Size Category</span>
              <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-primary/20">
                {selectedVariant.widthInches} × {selectedVariant.heightInches} in
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {groupLabels.map((group) => (
                <button
                  key={group}
                  onClick={() => handleGroupChange(group)}
                  className={cn(
                    "rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
                    selectedGroup === group
                      ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20"
                      : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>

          {groupedVariants[selectedGroup].length > 1 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Select Dimensions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {groupedVariants[selectedGroup].map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={cn(
                      "rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
                      selectedVariantId === variant.id
                        ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20"
                        : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    )}
                  >
                    {variant.widthInches} × {variant.heightInches} in
                  </button>
                ))}
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

      {/* Primary Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-primary bg-transparent font-semibold text-primary transition-colors hover:bg-primary/5 disabled:pointer-events-none disabled:opacity-50"
        >
          <ShoppingBag className="size-4" />
          Add to Cart
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className={cn(
            "flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground transition-colors hover:bg-primary/90 shadow-md shadow-primary/10 disabled:pointer-events-none disabled:opacity-50"
          )}
        >
          Buy Now
          <ArrowRight className="size-4" />
        </button>
      </div>

      {/* WhatsApp Inquiry */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card font-medium text-foreground transition-colors hover:bg-muted"
      >
        <MessageCircle className="size-4 text-whatsapp" />
        Ask About This Artwork
      </a>
    </div>
  );
}

