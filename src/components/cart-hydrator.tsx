"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";

// Один раз после загрузки страницы достаёт корзину из localStorage.
// Ничего не рисует — просто стоит в layout.tsx.
export function CartHydrator() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);
  return null;
}
