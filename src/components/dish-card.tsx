import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { FavoriteButton } from "@/components/favorite-button";
import { formatPrice } from "@/lib/format";
import type { Dish } from "@/lib/menu";

// Как в Figma (фрейм hover): на фото видно только название,
// а описание плавно появляется при наведении.
// На телефоне наводить мышку нечем, поэтому там описание видно всегда.
// Правила для .dish-card-reveal — в globals.css.

export function DishCard({ dish }: { dish: Dish }) {
  return (
    <article className="group relative flex flex-col gap-[30px] rounded-xl border border-bark/50 bg-cream p-5">
      {/* Сердечко лежит поверх фото, но вне ссылки: нажатие на него не открывает страницу блюда */}
      <div className="absolute top-8 right-8 z-10">
        <FavoriteButton dishId={dish.id} dishName={dish.name} />
      </div>
      <Link
        href={`/menu/${dish.slug}`}
        className="relative block aspect-[395/296] overflow-hidden rounded-xl border border-bark/50"
      >
        {dish.image_url && (
          <Image
            src={dish.image_url}
            alt={dish.name}
            fill
            sizes="(min-width: 1024px) 395px, (min-width: 640px) 45vw, 90vw"
            className="object-cover"
          />
        )}
        {/* Тёмный градиент снизу, чтобы белый текст читался на фото */}
        <div className="absolute inset-x-0 bottom-0 flex h-[53%] flex-col items-center justify-end bg-linear-to-t from-[rgba(56,30,17,0.8)] from-30% to-[rgba(102,59,38,0)] px-6 pb-5 text-center">
          <h3 className="font-display text-2xl leading-[1.2] font-medium tracking-[-0.24px] text-white">
            {dish.name}
          </h3>
          {/* Приём с grid-rows: высота блока плавно меняется от 0 до размера текста */}
          <div
            className="dish-card-reveal grid grid-rows-[1fr] transition-all duration-500 ease-out"
          >
            <p className="mt-1 max-w-[250px] overflow-hidden text-lg leading-[1.4] font-medium text-white/80">
              {dish.description}
            </p>
          </div>
        </div>
      </Link>

      <div className="flex items-center justify-between gap-4">
        <p className="font-display text-[28px] leading-none font-medium tracking-[0.56px]">
          {formatPrice(dish.price_grosze)}
        </p>
        <AddToCartButton dishId={dish.id} dishName={dish.name} isAvailable={dish.is_available} />
      </div>
    </article>
  );
}
