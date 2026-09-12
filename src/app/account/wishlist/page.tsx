import type { Metadata } from "next";
import { WishlistView } from "@/components/account/WishlistView";
import { getUserWishlistArtworks } from "@/actions/wishlist";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Collector Wishlist | Anjori Arts",
  description: "Curate and review your personal collection of handcrafted Indian artworks.",
};

export default async function AccountWishlistPage() {
  const initialArtworks = await getUserWishlistArtworks();

  return <WishlistView initialArtworks={initialArtworks} />;
}
