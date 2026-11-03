"use client";

import { MAX_QUANTITY_PER_DISH } from "@/config/cafe";

// Счётчик «− 2 +». Им пользуются кнопка «Add to cart» и страница корзины.
export function QuantityStepper({
  quantity,
  dishName,
  onChange,
  size = "md",
}: {
  quantity: number;
  dishName: string;
  onChange: (quantity: number) => void;
  size?: "md" | "sm";
}) {
  const buttonSize = size === "md" ? "size-9" : "size-8";

  return (
    <div
      role="group"
      aria-label={`Quantity of ${dishName}`}
      className="font-display flex items-center gap-1 rounded-full border border-bark/50 bg-cream p-0.5"
    >
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        aria-label={quantity === 1 ? `Remove ${dishName} from cart` : `One less ${dishName}`}
        className={`${buttonSize} flex items-center justify-center rounded-full text-xl leading-none transition-colors hover:bg-bark hover:text-white`}
      >
        −
      </button>
      {/* aria-live — программы чтения экрана сами объявят новое число */}
      <span aria-live="polite" className="min-w-6 text-center text-base font-medium tabular-nums">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        disabled={quantity >= MAX_QUANTITY_PER_DISH}
        aria-label={`One more ${dishName}`}
        className={`${buttonSize} flex items-center justify-center rounded-full text-xl leading-none transition-colors hover:bg-bark hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-current`}
      >
        +
      </button>
    </div>
  );
}
