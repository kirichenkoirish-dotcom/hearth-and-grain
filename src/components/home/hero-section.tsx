import Image from "next/image";
import { ArrowLink } from "@/components/arrow-link";
import { CoffeeBadge } from "@/components/home/coffee-badge";
import { Steam } from "@/components/home/steam";

// Первый экран главной: слева текст и кнопка, справа большое фото со значком.
export function HeroSection() {
  return (
    <section className="mx-auto grid max-w-[1440px] gap-10 px-4 pt-28 md:px-10 lg:grid-cols-[minmax(0,661px)_minmax(0,646px)] lg:items-center lg:justify-between lg:gap-8 lg:pt-0">
      <div className="flex flex-col gap-8 lg:gap-[50px]">
        <div className="flex flex-col gap-5 lg:gap-10">
          <p className="flex items-center gap-2.5 text-base leading-[37px] font-medium tracking-[0.32px] text-accent uppercase">
            <span aria-hidden="true" className="h-px w-[25px] bg-accent" />
            Fresh since 7am
          </p>
          <h1 className="font-display text-[44px] leading-[1.2] font-medium tracking-[-0.8px] uppercase sm:text-6xl xl:text-[80px]">
            Your{" "}
            <span className="bg-linear-to-r from-cocoa to-caramel bg-clip-text text-transparent">
              daily coffee
            </span>{" "}
            ritual
          </h1>
          <p className="max-w-[550px] text-base leading-[1.4] font-medium text-[#333]/80 md:text-lg">
            A small cafe on a quiet corner of Brzozowa Street — light-roast coffee, a bakery case
            that turns over every morning, and tables we don’t rush you off of.
          </p>
        </div>
        <ArrowLink href="/menu">Explore menu</ArrowLink>
      </div>

      <div className="relative">
        {/* @container — блок с фото становится «контейнером», от ширины которого считается пар */}
        <div className="@container relative aspect-[646/842] max-h-[560px] w-full overflow-hidden rounded-xl sm:max-h-[700px] lg:max-h-none">
          <Image
            src="/images/home/hero.jpg"
            alt="Latte with heart latte art and a coffee cup in morning light"
            fill
            priority
            sizes="(min-width: 1024px) 646px, 100vw"
            className="object-cover object-bottom"
          />
          <Steam />
        </div>
        {/* Значок ровно наполовину на фото, наполовину на фоне (178 / 2 = 89px) */}
        <CoffeeBadge className="absolute -bottom-10 left-4 scale-75 sm:scale-100 lg:bottom-14 lg:-left-[89px]" />
      </div>
    </section>
  );
}
