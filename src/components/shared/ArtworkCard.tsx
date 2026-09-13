import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/helpers";
import { WishlistButton } from "@/components/shared/WishlistButton";
import type { Artwork, Category } from "@/types";

interface ArtworkCardProps {
  artwork: Artwork;
  category?: Category;
  priority?: boolean;
}

export function ArtworkCard({ artwork, category, priority = false }: ArtworkCardProps) {
  const primaryImage = artwork.images[0];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
      {/* Image */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted/30">
        <Link
          href={`/artworks/${artwork.slug}`}
          className="block size-full"
          aria-label={`View ${artwork.title}`}
        >
          {primaryImage && (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt}
              fill
              priority={priority}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
            />
          )}
        </Link>
        {!artwork.isAvailable && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <span className="rounded-full bg-background px-4 py-2 text-xs font-bold uppercase tracking-widest text-foreground shadow-sm">
              Sold Out
            </span>
          </div>
        )}

        {/* Floating Wishlist Button */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <WishlistButton artworkId={artwork.id} artworkTitle={artwork.title} />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          {category && (
            <p className="aa-eyebrow text-muted-foreground mb-1.5 text-[10px]">
              {category.name}
            </p>
          )}
          <h3 className="font-serif text-sm font-semibold leading-snug text-foreground line-clamp-2 transition-colors sm:text-base">
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
              <p className="mt-1.5 text-[11px] text-muted-foreground line-clamp-1 sm:text-xs">
                {meta.join(" · ")}
              </p>
            );
          })()}
        </div>

        <div className="mt-3 flex items-end justify-between border-t border-border/50 pt-3">
          <p className="text-sm font-semibold text-foreground sm:text-base">
            {formatPrice(artwork.price)}
          </p>
          <Link
            href={`/artworks/${artwork.slug}`}
            className="text-xs font-medium text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            tabIndex={-1}
            aria-hidden="true"
          >
            View →
          </Link>
        </div>
      </div>
    </article>
  );
}
