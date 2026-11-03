"use client";

// "use client" — содержимое корзины лежит в браузере (localStorage), сервер его не знает.

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { ArrowLink } from "@/components/arrow-link";
import { QuantityStepper } from "@/components/quantity-stepper";
import { DELIVERY } from "@/config/cafe";
import { useCartHydrated, useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import type { Dish } from "@/lib/menu";

export function CartView({ dishes }: { dishes: Dish[] }) {
  const isHydrated = useCartHydrated();
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeDish = useCartStore((state) => state.removeDish);

  // Соединяем «что в корзине» с «что сейчас есть в меню»
  const dishesById = new Map(dishes.map((dish) => [dish.id, dish]));
  const lines = items.flatMap((item) => {
    const dish = dishesById.get(item.dishId);
    return dish && dish.is_available ? [{ dish, quantity: item.quantity }] : [];
  });

  // Блюдо убрали из меню или оно закончилось — тихо убираем его и из корзины
  useEffect(() => {
    if (!isHydrated) return;
    items.forEach((item) => {
      const dish = dishesById.get(item.dishId);
      if (!dish || !dish.is_available) removeDish(item.dishId);
    });
    // dishesById пересоздаётся при каждой отрисовке, поэтому следим за самими данными
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, items, dishes, removeDish]);

  // Пока корзина не прочитана из браузера — короткая заглушка, а не «корзина пуста»
  if (!isHydrated) {
    return <div aria-hidden="true" className="h-64 animate-pulse rounded-xl bg-bark/10" />;
  }

  if (lines.length === 0) {
    return (
      <div className="border-glow flex flex-col items-start gap-6 rounded-xl p-8 md:p-12">
        <h2 className="font-display text-2xl leading-[1.2] font-medium tracking-[-0.24px] md:text-4xl">
          Your cart is empty
        </h2>
        <p className="max-w-[460px] text-lg leading-[1.4] font-medium text-black/60">
          Pick something warm from the menu — a flat white, a croissant, or a bowl of shakshuka.
        </p>
        <ArrowLink href="/menu">Explore menu</ArrowLink>
      </div>
    );
  }

  const subtotal = lines.reduce((sum, line) => sum + line.dish.price_grosze * line.quantity, 0);
  const missingForDelivery = Math.max(DELIVERY.minimumOrderGrosze - subtotal, 0);
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
      <ul aria-label="Dishes in your cart" className="flex flex-col gap-2.5">
        {lines.map(({ dish, quantity }) => (
          <li
            key={dish.id}
            className="grid grid-cols-[88px_minmax(0,1fr)] gap-4 rounded-xl border border-bark/30 bg-cream p-3 sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:items-center sm:gap-6 sm:p-4"
          >
            <Link
              href={`/menu/${dish.slug}`}
              className="relative row-span-2 aspect-square overflow-hidden rounded-lg sm:row-span-1"
            >
              {dish.image_url && (
                <Image src={dish.image_url} alt={dish.name} fill sizes="120px" className="object-cover" />
              )}
            </Link>

            <div className="min-w-0">
              <Link
                href={`/menu/${dish.slug}`}
                className="font-display text-xl leading-[1.2] font-medium tracking-[-0.24px] hover:text-accent md:text-2xl"
              >
                {dish.name}
              </Link>
              <p className="mt-1 text-base font-medium text-black/60">
                {formatPrice(dish.price_grosze)} each
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 sm:justify-end sm:gap-6">
              <QuantityStepper
                quantity={quantity}
                dishName={dish.name}
                onChange={(next) => setQuantity(dish.id, next)}
                size="sm"
              />
              <p className="font-display text-right text-xl font-medium whitespace-nowrap tabular-nums sm:w-[110px]">
                {formatPrice(dish.price_grosze * quantity)}
              </p>
              <button
                type="button"
                onClick={() => removeDish(dish.id)}
                aria-label={`Remove ${dish.name} from cart`}
                className="flex size-9 items-center justify-center rounded-full text-black/50 transition-colors hover:bg-bark/10 hover:text-black"
              >
                <TrashIcon />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <aside
        aria-label="Order summary"
        className="border-glow flex flex-col gap-5 rounded-xl p-6 md:p-8 lg:sticky lg:top-[110px]"
      >
        <h2 className="font-display text-2xl leading-[1.2] font-medium tracking-[-0.24px]">
          Order summary
        </h2>

        <dl className="flex flex-col gap-3 text-lg font-medium">
          <div className="flex justify-between">
            <dt className="text-black/60">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </dt>
            <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between border-t border-bark/20 pt-3 text-xl">
            <dt>Subtotal</dt>
            <dd className="font-display tabular-nums">{formatPrice(subtotal)}</dd>
          </div>
        </dl>

        {/* Подсказка про доставку: минимум считается по сумме блюд */}
        <p className="rounded-lg bg-bark/5 p-4 text-base leading-[1.4] font-medium text-black/70">
          {missingForDelivery > 0 ? (
            <>
              Add <span className="text-accent">{formatPrice(missingForDelivery)}</span> more for
              delivery (minimum {formatPrice(DELIVERY.minimumOrderGrosze)}). Pickup and dine-in are
              available for any amount.
            </>
          ) : (
            <>
              Delivery is available: {formatPrice(DELIVERY.feeGrosze)} will be added at checkout.
              Pickup and dine-in are free.
            </>
          )}
        </p>

        <ArrowLink href="/checkout" className="w-full">
          Checkout
        </ArrowLink>
        <Link
          href="/menu"
          className="self-center text-base font-medium text-black/60 transition-colors hover:text-black"
        >
          ← Continue shopping
        </Link>
      </aside>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
