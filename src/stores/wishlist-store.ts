"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MAX_WISHLIST_ITEMS } from "@/config/constants";
import {
  addToWishlistAction,
  removeFromWishlistAction,
  syncAndMergeWishlistAction,
} from "@/actions/wishlist";
import { getIsAuthenticated, getAuthSession } from "@/lib/supabase/client";
import { toast } from "sonner";

export interface WishlistActionOptions {
  silent?: boolean;
}

interface WishlistState {
  items: string[]; // List of Artwork IDs
  isSyncing: boolean;
  hasSynced: boolean;

  // Actions
  addItem: (
    artworkId: string,
    artworkTitle?: string,
    options?: WishlistActionOptions
  ) => Promise<boolean>;
  removeItem: (
    artworkId: string,
    artworkTitle?: string,
    options?: WishlistActionOptions
  ) => Promise<boolean>;
  toggleItem: (artworkId: string, artworkTitle?: string) => Promise<boolean>;
  isInWishlist: (artworkId: string) => boolean;
  getItemCount: () => number;
  syncWithCloud: () => Promise<void>;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isSyncing: false,
      hasSynced: false,

      isInWishlist: (artworkId: string) => {
        return get().items.includes(artworkId);
      },

      getItemCount: () => {
        return get().items.length;
      },

      addItem: async (
        artworkId: string,
        artworkTitle?: string,
        options?: WishlistActionOptions
      ) => {
        const currentItems = get().items;
        if (currentItems.includes(artworkId)) {
          return true;
        }

        if (currentItems.length >= MAX_WISHLIST_ITEMS) {
          toast.error("Wishlist is full", {
            id: "wishlist-action",
            description: `You can keep up to ${MAX_WISHLIST_ITEMS} saved pieces.`,
          });
          return false;
        }

        // Optimistic UI update
        const updated = [artworkId, ...currentItems];
        set({ items: updated });

        if (!options?.silent) {
          toast.success(
            artworkTitle ? `Added "${artworkTitle}" to your wishlist` : "Added to your wishlist",
            {
              id: "wishlist-action",
              description: "You can view your curated collection in your account.",
            }
          );
        }

        // Background cloud sync if user is signed in
        if (getIsAuthenticated()) {
          try {
            const res = await addToWishlistAction(artworkId);
            if (!res.success && res.error) {
              // Revert if server failed
              set({ items: currentItems });
              toast.error("Could not save to cloud", {
                id: "wishlist-action",
                description: res.error,
              });
              return false;
            }
          } catch {
            // Keep local state on network error
          }
        }

        return true;
      },

      removeItem: async (
        artworkId: string,
        artworkTitle?: string,
        options?: WishlistActionOptions
      ) => {
        const currentItems = get().items;
        if (!currentItems.includes(artworkId)) {
          return true;
        }

        // Optimistic UI update
        const updated = currentItems.filter((id) => id !== artworkId);
        set({ items: updated });

        if (!options?.silent) {
          toast.info(
            artworkTitle
              ? `Removed "${artworkTitle}" from your wishlist`
              : "Removed from your wishlist",
            {
              id: "wishlist-action",
            }
          );
        }

        // Background cloud sync if user is signed in
        if (getIsAuthenticated()) {
          try {
            const res = await removeFromWishlistAction(artworkId);
            if (!res.success && res.error) {
              set({ items: currentItems });
              toast.error("Could not remove from cloud", {
                id: "wishlist-action",
                description: res.error,
              });
              return false;
            }
          } catch {
            // Keep local state on network error
          }
        }

        return true;
      },

      toggleItem: async (artworkId: string, artworkTitle?: string) => {
        if (get().isInWishlist(artworkId)) {
          return await get().removeItem(artworkId, artworkTitle);
        } else {
          return await get().addItem(artworkId, artworkTitle);
        }
      },

      syncWithCloud: async () => {
        if (get().isSyncing) return;
        set({ isSyncing: true });

        try {
          const session = await getAuthSession();
          if (!session?.user) {
            set({ isSyncing: false, hasSynced: true });
            return;
          }

          // Merge guest local items with user's cloud items
          const localIds = get().items;
          const mergedIds = await syncAndMergeWishlistAction(localIds);

          set({
            items: mergedIds.slice(0, MAX_WISHLIST_ITEMS),
            isSyncing: false,
            hasSynced: true,
          });
        } catch (err) {
          console.error("[useWishlistStore.syncWithCloud] error:", err);
          set({ isSyncing: false });
        }
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "anjori-wishlist",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
