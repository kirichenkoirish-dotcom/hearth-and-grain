"use client";

// Корзина гостя. Хранится в браузере (localStorage), поэтому не пропадает при обновлении страницы.
// zustand — «общая доска»: кнопка на карточке, значок в шапке и страница корзины
// читают и меняют одни и те же данные.
//
// Храним только «какое блюдо и сколько штук». Цены не храним:
// страница корзины берёт их из меню, поэтому они всегда актуальные.

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { MAX_QUANTITY_PER_DISH } from "@/config/cafe";

export type CartItem = { dishId: number; quantity: number };

type CartState = {
  items: CartItem[];
  // Номер столика, если гость открыл сайт по QR-коду на столе (этап 6.3)
  tableNumber: number | null;
  setTableNumber: (tableNumber: number | null) => void;
  addDish: (dishId: number) => void;
  setQuantity: (dishId: number, quantity: number) => void;
  removeDish: (dishId: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      tableNumber: null,
      setTableNumber: (tableNumber) => set({ tableNumber }),

      addDish: (dishId) =>
        set((state) => {
          const existing = state.items.find((item) => item.dishId === dishId);
          if (!existing) return { items: [...state.items, { dishId, quantity: 1 }] };
          return {
            items: state.items.map((item) =>
              item.dishId === dishId
                ? { ...item, quantity: Math.min(item.quantity + 1, MAX_QUANTITY_PER_DISH) }
                : item,
            ),
          };
        }),

      // 0 и меньше — убираем блюдо из корзины совсем
      setQuantity: (dishId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.dishId !== dishId)
              : state.items.map((item) =>
                  item.dishId === dishId
                    ? { ...item, quantity: Math.min(quantity, MAX_QUANTITY_PER_DISH) }
                    : item,
                ),
        })),

      removeDish: (dishId) =>
        set((state) => ({ items: state.items.filter((item) => item.dishId !== dishId) })),

      clear: () => set({ items: [] }),
    }),
    {
      name: "hearth-and-grain-cart",
      storage: createJSONStorage(() => localStorage),
      // Не читаем корзину сразу: сервер её не знает, и первая отрисовка в браузере
      // должна совпасть с серверной. Читаем после — в CartHydrator.
      skipHydration: true,
    },
  ),
);

// Сколько всего штук блюд в корзине — для значка в шапке
export function useCartCount() {
  return useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
}

// Сколько штук конкретного блюда в корзине — для кнопки «Add to cart»
export function useDishQuantity(dishId: number) {
  return useCartStore(
    (state) => state.items.find((item) => item.dishId === dishId)?.quantity ?? 0,
  );
}

// Уже прочитали корзину из браузера? Пока нет — показываем заглушку, а не «пустая корзина»
export function useCartHydrated() {
  return useSyncExternalStore(
    (onChange) => useCartStore.persist.onFinishHydration(onChange),
    () => useCartStore.persist.hasHydrated(),
    () => false,
  );
}
