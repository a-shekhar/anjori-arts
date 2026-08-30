import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/helpers";
import type { Artwork, Category } from "@/data/dummy";

interface ArtworkCardProps {
  artwork: Artwork;
  category?: Category;
}

export function ArtworkCard({ artwork, category }: ArtworkCardProps) {
  const primaryImage = artwork.images[0];

  return (
    <Link href={`/artworks/${artwork.slug}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
        {/* Image */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted/30">
          {primaryImage && (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
            />
          )}
          {!artwork.isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
              <span className="rounded-full bg-background px-4 py-2 text-xs font-bold uppercase tracking-widest text-foreground shadow-sm">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
          <div>
            {category && (
              <p className="aa-eyebrow text-muted-foreground mb-1.5 text-[10px]">
                {category.name}
              </p>
            )}
            <h3 className="font-serif text-sm font-semibold leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors sm:text-base">
              {artwork.title}
            </h3>
            <p className="mt-1.5 text-[11px] text-muted-foreground line-clamp-1 sm:text-xs">
              {artwork.dimensions} · {artwork.surface}
            </p>
          </div>

          <div className="mt-3 flex items-end justify-between border-t border-border/50 pt-3">
            <p className="text-sm font-semibold text-foreground sm:text-base">
              {formatPrice(artwork.price)}
            </p>
            <span className="text-xs font-medium text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              View →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
