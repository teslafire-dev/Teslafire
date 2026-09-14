import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface B2BCartItem {
  id: string; // producto_id
  sku: string;
  nombre: string;
  precio_mayor: number;
  precio_detal?: number;
  stock?: number;
  unidad_medida?: string;
  imagen?: string;
  cantidad: number;
}

interface B2BCartStore {
  items: B2BCartItem[];
  addItem: (item: Omit<B2BCartItem, 'cantidad'>, cantidad?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, cantidad: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getIva: () => number;
  getTotal: () => number;
  getTotalItems: () => number;
}

export const useB2BCartStore = create<B2BCartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, cantidad = 1) => {
        const currentItems = get().items;
        const existing = currentItems.find((i) => i.id === product.id);

        if (existing) {
          set({
            items: currentItems.map((i) =>
              i.id === product.id ? { ...i, cantidad: i.cantidad + cantidad } : i
            ),
          });
        } else {
          set({
            items: [...currentItems, { ...product, cantidad }],
          });
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },
      updateQuantity: (id, cantidad) => {
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, cantidad: Math.max(1, cantidad) } : i
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      getSubtotal: () => {
        return get().items.reduce((acc, item) => acc + (item.precio_mayor * item.cantidad), 0);
      },
      getIva: () => {
        return get().getSubtotal() * 0.16;
      },
      getTotal: () => {
        return get().getSubtotal() * 1.16;
      },
      getTotalItems: () => {
        return get().items.reduce((acc, item) => acc + item.cantidad, 0);
      }
    }),
    {
      name: "teslafire-b2b-cart",
    }
  )
);
