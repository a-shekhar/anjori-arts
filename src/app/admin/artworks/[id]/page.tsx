import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArtworkForm } from "@/components/forms/artwork-form";
import { getAdminArtworkById, getArtworkFormTaxonomies } from "@/actions/admin-artworks";

export const metadata: Metadata = {
  title: "Edit Artwork | Admin",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditArtworkPage({ params }: PageProps) {
  const resolvedParams = await params;
  
  const [artwork, taxonomies] = await Promise.all([
    getAdminArtworkById(resolvedParams.id),
    getArtworkFormTaxonomies()
  ]);

  if (!artwork) {
    notFound();
  }

  return (
    <div className="w-full">
      <ArtworkForm initialData={artwork} taxonomies={taxonomies} />
    </div>
  );
}
