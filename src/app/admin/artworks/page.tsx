import { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ArtworkTable } from "@/components/admin/artwork-table";
import { getAdminArtworks } from "@/actions/admin-artworks";

export const metadata: Metadata = {
  title: "Manage Artworks | Admin",
};

export default async function AdminArtworksPage() {
  const artworks = await getAdminArtworks();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Artworks</h2>
          <p className="text-muted-foreground">
            Manage your store's artwork catalog.
          </p>
        </div>
        <Link href="/admin/artworks/new" className={buttonVariants()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Artwork
        </Link>
      </div>

      <ArtworkTable artworks={artworks} />
    </div>
  );
}
