"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";

// Очищает корзину после успешной оплаты. Ничего не рисует.
export function ClearCart() {
  useEffect(() => {
    useCartStore.getState().clear();
  }, []);
  return null;
}
