import { getRelatedArtworks, getCategoryById } from "@/actions/shop";
import { ArtworkCard } from "./ArtworkCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface RelatedArtworksProps {
  currentArtworkId: string;
  categoryId: string;
}

export async function RelatedArtworks({ currentArtworkId, categoryId }: RelatedArtworksProps) {
  // Find related artworks in the same category, excluding the current one
  const related = await getRelatedArtworks(categoryId, currentArtworkId);

  if (related.length === 0) {
    return null;
  }

  const category = await getCategoryById(categoryId);

  return (
    <section className="mt-20 border-t border-border pt-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <span className="aa-eyebrow mb-2 inline-block">More like this</span>
          <h2 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
            You May Also Like
          </h2>
        </div>
        <Link 
          href={`/shop?category=${categoryId}`}
          className="group flex items-center gap-1 text-sm font-medium text-primary hover:underline underline-offset-4"
        >
          View all
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 xl:gap-6">
        {related.map((artwork) => (
          <ArtworkCard 
            key={artwork.id} 
            artwork={artwork} 
            category={category || undefined} 
          />
        ))}
      </div>
    </section>
  );
}

