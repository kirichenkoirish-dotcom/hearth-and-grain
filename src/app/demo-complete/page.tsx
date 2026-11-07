import type { Metadata } from "next";
import Link from "next/link";
import { ClearCart } from "@/components/checkout/clear-cart";
import { PageHero } from "@/components/page-hero";
import { SOCIAL } from "@/config/cafe";

export const metadata: Metadata = { title: "Thank you for your order" };

// Сюда попадает гость после «Pay» в режиме портфолио: заказа и оплаты нет,
// только спасибо, ссылка на Instagram автора и ссылка на главную.
export default function DemoCompletePage() {
  return (
    <>
      <PageHero
        image="/images/cart-hero.jpg"
        imageAlt="Takeaway bag, coffee cups and a croissant with the Hearth & Grain logo"
        eyebrow="Demo version"
        title="Thank you"
        textWidth="max-w-[400px]"
      >
        Thank you for your order!
      </PageHero>

      <section className="mx-auto max-w-[1440px] px-4 pt-10 pb-24 md:px-10 lg:pt-[120px]">
        {/* Демо-заказ «оформлен» — корзину очищаем, как после настоящей оплаты */}
        <ClearCart />

        <div className="border-glow mx-auto flex max-w-[720px] flex-col gap-5 rounded-xl p-6 md:p-10">
          <h2 className="font-display text-[28px] leading-[1.2] font-medium text-accent md:text-4xl">
            This is a demo version
          </h2>
          <p className="text-lg leading-[1.4] font-medium text-black/70">
            Hearth & Grain is a portfolio project, so no real order was placed and no payment was
            taken.
          </p>
          <p className="text-lg leading-[1.4] font-medium text-black/70">
            This website was designed and built by{" "}
            <span className="text-black">Senvori.Agency</span>. Visit our Instagram to see more of
            our work.
          </p>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:gap-6">
            <a
              href={SOCIAL.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-roast font-display rounded-full px-[30px] py-[15px] text-center text-base leading-none font-medium tracking-[0.32px]"
            >
              Visit our Instagram
            </a>
            <Link
              href="/"
              className="text-center text-base font-medium text-black/60 underline-offset-4 transition-colors hover:text-black hover:underline"
            >
              Back to home page
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
