"use client";

// "use client" — кнопка меняет корзину, которая живёт в браузере.

import { QuantityStepper } from "@/components/quantity-stepper";
import { useCartStore, useDishQuantity } from "@/lib/cart-store";

// Пока блюда нет в корзине — кнопка «Add to cart».
// Как только добавили — на её месте счётчик «− 1 +».
export function AddToCartButton({
  dishId,
  dishName,
  isAvailable,
}: {
  dishId: number;
  dishName: string;
  isAvailable: boolean;
}) {
  const quantity = useDishQuantity(dishId);
  const addDish = useCartStore((state) => state.addDish);
  const setQuantity = useCartStore((state) => state.setQuantity);

  if (isAvailable && quantity > 0) {
    return (
      <QuantityStepper
        quantity={quantity}
        dishName={dishName}
        onChange={(next) => setQuantity(dishId, next)}
      />
    );
  }

  return (
    <button
      type="button"
      disabled={!isAvailable}
      onClick={() => addDish(dishId)}
      aria-label={`Add ${dishName} to cart`}
      className="btn-roast font-display rounded-full px-[30px] py-2.5 text-base leading-none font-medium tracking-[0.32px]"
    >
      {isAvailable ? "Add to cart" : "Sold out"}
    </button>
  );
}
