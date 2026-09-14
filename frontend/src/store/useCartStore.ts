import type { CartItem, Product } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartState {
  items: CartItem[];
  storeId: string | null;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      storeId: null,

      addItem: (product) => {
        const { items, storeId } = get();
        // If adding from a different store, clear cart
        if (storeId && storeId !== product.storeId) {
          set({ items: [{ product, quantity: 1 }], storeId: product.storeId });
          return;
        }
        const existing = items.find((i) => i.product.id === product.id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({ items: [...items, { product, quantity: 1 }], storeId: product.storeId });
        }
      },

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
          storeId: state.items.length <= 1 ? null : state.storeId,
        })),

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [], storeId: null }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    }),
    { name: 'freshora-cart' }
  )
);
