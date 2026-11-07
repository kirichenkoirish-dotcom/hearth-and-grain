import type { Metadata } from "next";
import { DishCard } from "@/components/dish-card";
import { MenuCategoryNav } from "@/components/menu-category-nav";
import { PageHero } from "@/components/page-hero";
import { getMenu } from "@/lib/menu";

export const metadata: Metadata = {
  title: "Our Menu",
  description:
    "Coffee, fresh pastries, all-day breakfast and something sweet. Order for delivery, pickup or at your table.",
  openGraph: {
    title: "Our Menu · Hearth & Grain",
    description: "Coffee, fresh pastries, all-day breakfast and something sweet.",
    images: [{ url: "/images/menu-hero.jpg", alt: "A latte and a dessert on a cafe table" }],
  },
};

export default async function MenuPage() {
  const menu = await getMenu();

  return (
    <>
      <PageHero
        image="/images/menu-hero.jpg"
        imageAlt="Latte, croissant and avocado toast on a sunlit cafe table"
        eyebrow="Updated this week"
        title="Our Menu"
      >
        Coffee changes every two weeks with the roast; the kitchen changes with the season.
        Everything below is served all day, from open to close.
      </PageHero>

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
