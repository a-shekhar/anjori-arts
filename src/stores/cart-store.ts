"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DELIVERY_CHARGE, MAX_CART_QUANTITY } from "@/config/constants";
import {
  addToCloudCart,
  removeFromCloudCart,
  updateCloudCartQuantity,
  clearCloudCart,
  syncAndMergeCartAction,
} from "@/actions/cart";
import { getIsAuthenticated, getAuthSession } from "@/lib/supabase/client";

export interface CartItem {
  id: string; // Unique ID for cart entry (e.g. variantId + framed state)
  artworkId: string;
  slug?: string;
  variantId: string;
  quantity: number;
  isFramed?: boolean;
  framingPrice?: number;
  // Snapshot for display (avoids server call to render cart)
  title: string;
  imageUrl: string;
  size: string;
  sellingPrice: number; // in paise (base artwork price)
  mrp: number; // in paise
}

interface CartState {
  items: CartItem[];
  isSyncing: boolean;
  hasSynced: boolean;

  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: (options?: { skipCloudSync?: boolean }) => void;
  syncWithCloud: () => Promise<void>;
  getItemCount: () => number;
  getSubtotal: () => number;
  getDeliveryCharge: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isSyncing: false,
      hasSynced: false,

      addItem: (item) => {
        // Optimistic UI update
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: Math.min(i.quantity + item.quantity, MAX_CART_QUANTITY) }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        });

        // Background cloud sync if user is signed in
        if (getIsAuthenticated()) {
          addToCloudCart({
            artworkId: item.artworkId,
            variantId: item.variantId,
            quantity: item.quantity,
            isFramed: item.isFramed,
          }).catch((err) => {
            console.error("[useCartStore.addItem] cloud sync error:", err);
          });
        }
      },

      removeItem: (id) => {
        const itemToRemove = get().items.find((i) => i.id === id);

        // Optimistic UI update
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));

        if (!itemToRemove) return;

        // Background cloud sync if user is signed in
        if (getIsAuthenticated()) {
          removeFromCloudCart(itemToRemove.variantId, Boolean(itemToRemove.isFramed)).catch(
            (err) => {
              console.error("[useCartStore.removeItem] cloud sync error:", err);
            }
          );
        }
      },

      updateQuantity: (id, quantity) => {
        const targetItem = get().items.find((i) => i.id === id);

        // Optimistic UI update
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) =>
                  i.id === id
                    ? { ...i, quantity: Math.min(quantity, MAX_CART_QUANTITY) }
                    : i
                ),
        }));

        if (!targetItem) return;

        // Background cloud sync if user is signed in
        if (getIsAuthenticated()) {
          updateCloudCartQuantity(
            targetItem.variantId,
            Boolean(targetItem.isFramed),
            quantity
          ).catch((err) => {
            console.error("[useCartStore.updateQuantity] cloud sync error:", err);
          });
        }
      },

      clearCart: (options) => {
        set({ items: [] });

        if (options?.skipCloudSync) return;

        if (getIsAuthenticated()) {
          clearCloudCart().catch((err) => {
            console.error("[useCartStore.clearCart] cloud sync error:", err);
          });
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

          // Auto-merge guest local items with user's cloud items
          const localItems = get().items;
          const mergedItems = await syncAndMergeCartAction(localItems);

          set({
            items: mergedItems,
            isSyncing: false,
            hasSynced: true,
          });
        } catch (err) {
          console.error("[useCartStore.syncWithCloud] error:", err);
          set({ isSyncing: false });
        }
      },

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce(
          (sum, item) => sum + ((item.sellingPrice + (item.framingPrice || 0)) * item.quantity),
          0
        ),

      getDeliveryCharge: () => {
        return DELIVERY_CHARGE;
      },

      getTotal: () => {
        return get().getSubtotal() + get().getDeliveryCharge();
      },
    }),
    {
      name: "anjori-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
