import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { DishCard } from "@/components/dish-card";
import { formatPrice } from "@/lib/format";
import { getDishBySlug, getMenu } from "@/lib/menu";

// Заранее говорим Next.js, какие адреса блюд существуют, —
// он соберёт страницы для всех 16 блюд ещё при сборке сайта.
export async function generateStaticParams() {
  const menu = await getMenu();
  return menu.flatMap((category) => category.dishes.map((dish) => ({ slug: dish.slug })));
}

export async function generateMetadata({ params }: PageProps<"/menu/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const result = await getDishBySlug(slug);
  if (!result) return { title: "Dish not found" };

  return {
    title: result.dish.name,
    description: result.dish.description,
  };
}

// Suspense — «пока данные не готовы, покажи заглушку». Благодаря ему при переходе
// с одного блюда на другое страница меняется мгновенно: сначала скелет, сразу за ним содержимое.
export default function DishPage({ params }: PageProps<"/menu/[slug]">) {
  return (
    <Suspense fallback={<DishPageSkeleton />}>
      <DishContent params={params} />
    </Suspense>
  );
}

async function DishContent({ params }: { params: PageProps<"/menu/[slug]">["params"] }) {
  const { slug } = await params;
  const result = await getDishBySlug(slug);
  // Такого блюда нет — показываем страницу «Not found»
  if (!result) notFound();

  const { dish, category } = result;
  // «Ещё из этой категории» — до трёх других блюд
  const otherDishes = category.dishes.filter((item) => item.id !== dish.id).slice(0, 3);

  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-28 pb-24 md:px-10 lg:pt-[140px]">
      <nav aria-label="Breadcrumb" className="mb-6 text-base font-medium text-black/60 md:mb-10">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/menu" className="transition-colors hover:text-black">
              Menu
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={`/menu#${category.slug}`} className="transition-colors hover:text-black">
              {category.name}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-black">
            {dish.name}
          </li>
        </ol>
      </nav>

      <article className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-[395/296] overflow-hidden rounded-xl border border-bark/50">
          {dish.image_url && (
            <Image
              src={dish.image_url}
              alt={dish.name}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          )}
        </div>

        <div>
          <p className="flex items-center gap-2.5 text-base leading-[37px] font-medium tracking-[0.32px] text-accent uppercase">
            <span aria-hidden="true" className="h-px w-[25px] bg-accent" />
            {category.name}
          </p>
          <h1 className="font-display mt-2 text-4xl leading-[1.2] font-medium tracking-[-1px] md:text-[56px]">
            {dish.name}
          </h1>
          <p className="mt-4 max-w-[520px] text-lg leading-[1.4] font-medium text-black/70">
            {dish.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-bark/30 pt-8">
            <p className="font-display text-4xl leading-none font-medium tracking-[0.56px]">
              {formatPrice(dish.price_grosze)}
            </p>
            <AddToCartButton dishName={dish.name} isAvailable={dish.is_available} />
          </div>

          <Link
            href={`/menu#${category.slug}`}
            className="mt-8 inline-flex items-center gap-2 text-base font-medium text-black/60 transition-colors hover:text-black"
          >
            <span aria-hidden="true">←</span> Back to menu
          </Link>
        </div>
      </article>

      {otherDishes.length > 0 && (
        <section aria-labelledby="more-dishes-title" className="mt-20 md:mt-28">
          <div className="mb-5 flex items-center gap-6">
            <h2
              id="more-dishes-title"
              className="font-display shrink-0 text-[28px] leading-[1.2] font-medium tracking-[-0.36px] text-accent md:text-4xl"
            >
              More from {category.name}
            </h2>
            <span aria-hidden="true" className="h-px flex-1 bg-bark/50" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {otherDishes.map((item) => (
              <DishCard key={item.id} dish={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Заглушка той же формы, что и страница: серые блоки на месте фото и текста
function DishPageSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto max-w-[1440px] animate-pulse px-4 pt-28 pb-24 md:px-10 lg:pt-[140px]"
    >
      <div className="mb-6 h-5 w-64 rounded bg-bark/10 md:mb-10" />
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
        <div className="aspect-[395/296] rounded-xl bg-bark/10" />
        <div className="space-y-4">
          <div className="h-5 w-40 rounded bg-bark/10" />
          <div className="h-14 w-3/4 rounded bg-bark/10" />
          <div className="h-6 w-1/2 rounded bg-bark/10" />
          <div className="h-12 w-60 rounded-full bg-bark/10" />
        </div>
      </div>
    </div>
  );
}
