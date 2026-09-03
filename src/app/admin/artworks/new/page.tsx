import { Metadata } from "next";
import { ArtworkForm } from "@/components/forms/artwork-form";
import { getArtworkFormTaxonomies } from "@/actions/admin-artworks";

export const metadata: Metadata = {
  title: "New Artwork | Admin",
};

export default async function NewArtworkPage() {
  const taxonomies = await getArtworkFormTaxonomies();

  return (
    <div className="w-full">
      <ArtworkForm taxonomies={taxonomies} />
    </div>
  );
}
