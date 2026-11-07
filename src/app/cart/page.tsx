import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { PageHero } from "@/components/page-hero";
import { getMenu } from "@/lib/menu";

// Личная или служебная страница — поисковикам показывать не нужно
export const metadata: Metadata = { title: "My order", robots: { index: false } };

// Сама корзина живёт в браузере, а цены и фото берём из меню на сервере —
// так они всегда актуальные. Сервер передаёт в браузер список блюд, а CartView
// сопоставляет его с тем, что лежит в корзине.
export default async function CartPage() {
  const menu = await getMenu();
  const dishes = menu.flatMap((category) => category.dishes);

  return (
    <>
      <PageHero
        image="/images/cart-hero.jpg"
        imageAlt="Takeaway bag, coffee cups and a croissant with the Hearth & Grain logo"
        eyebrow="Cart"
        title="My order"
        textWidth="max-w-[400px]"
      >
        Review your items, make changes, and confirm your order.
      </PageHero>

      <section
        aria-label="Cart"
        className="mx-auto max-w-[1440px] px-4 pt-10 pb-24 md:px-10 lg:pt-[120px]"
      >
        <CartView dishes={dishes} />
      </section>
    </>
  );
}
