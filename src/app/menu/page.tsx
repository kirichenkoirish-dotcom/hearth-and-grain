import type { Metadata } from "next";
import Image from "next/image";
import { DishCard } from "@/components/dish-card";
import { MenuCategoryNav } from "@/components/menu-category-nav";
import { getMenu } from "@/lib/menu";

export const metadata: Metadata = {
  title: "Our Menu",
  description:
    "Coffee, fresh pastries, all-day breakfast and something sweet. Order for delivery, pickup or at your table.",
};

export default async function MenuPage() {
  const menu = await getMenu();

  return (
    <>
      <MenuHero />

      {/* grid-cols-1 не даёт длинной ленте категорий растянуть страницу шире экрана телефона */}
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 px-4 pt-10 pb-24 md:px-10 lg:grid-cols-[402px_1fr] lg:gap-0 lg:pt-[120px]">
        {/* В браузер передаём только то, что нужно списку, без блюд */}
        <MenuCategoryNav
          categories={menu.map(({ id, name, slug }) => ({ id, name, slug }))}
        />

        {/* Вертикальная линия-разделитель между категориями и блюдами — как в макете */}
        <div className="flex flex-col gap-[30px] lg:ml-10 lg:border-l lg:border-bark/50 lg:pl-10">
          {menu.map((category) => (
            <section
              key={category.id}
              id={category.slug}
              aria-labelledby={`${category.slug}-title`}
              // Отступ сверху при прокрутке к категории, чтобы её не закрыла шапка
              className="scroll-mt-40 lg:scroll-mt-28"
            >
              <div className="mb-5 flex items-center gap-6">
                <h2
                  id={`${category.slug}-title`}
                  className="font-display shrink-0 text-[28px] leading-[1.2] font-medium tracking-[-0.36px] text-accent md:text-4xl"
                >
                  {category.name}
                </h2>
                <span aria-hidden="true" className="h-px flex-1 bg-bark/50" />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {category.dishes.map((dish) => (
                  <DishCard key={dish.id} dish={dish} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}

function MenuHero() {
  return (
    <section className="relative h-[460px] overflow-hidden md:h-[607px]">
      <Image
        src="/images/menu-hero.jpg"
        alt="Latte, croissant and avocado toast on a sunlit cafe table"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[25%_center] md:object-[30%_center]"
      />
      {/* На телефоне и планшете фото обрезается, поэтому слегка осветляем левую часть под текстом */}
      <div className="absolute inset-0 bg-linear-to-r from-cream/85 via-cream/50 to-transparent lg:hidden" />

      {/* На телефоне текст начинается сразу под шапкой (pt-32), на компьютере — как в макете (175px) */}
      <div className="relative mx-auto flex h-full max-w-[1440px] flex-col px-4 pt-32 md:px-10 md:pt-[175px]">
        <p className="flex items-center gap-2.5 text-base leading-[37px] font-medium tracking-[0.32px] text-accent uppercase">
          <span aria-hidden="true" className="h-px w-[25px] bg-accent" />
          Updated this week
        </p>
        <h1 className="font-display bg-linear-90 from-caramel to-cocoa to-60% bg-clip-text pb-1 text-[56px] leading-[1.2] font-medium tracking-[-0.8px] text-transparent uppercase md:mt-6 md:text-[80px]">
          Our Menu
        </h1>
        <p className="mt-2 max-w-[563px] text-base leading-[1.4] font-medium text-black/70 md:mt-4 md:text-lg">
          Coffee changes every two weeks with the roast; the kitchen changes with the season.
          Everything below is served all day, from open to close.
        </p>
      </div>
    </section>
  );
}
