"use client";

// "use client" — блок помнит, на какую категорию сейчас навели мышку,
// и меняет фото слева (Figma: Frame 19965, варианты 1–5).

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { ArrowLink } from "@/components/arrow-link";
import { SectionHeading } from "@/components/home/section-heading";

const categories = [
  {
    slug: "fresh-from-the-oven",
    title: "Fresh From the Oven",
    text: "Buttery croissants and small-batch pastries baked fresh every morning.",
    image: "/images/home/menu-fresh-from-the-oven.jpg",
    alt: "Golden croissant on a plate",
  },
  {
    slug: "coffee-drinks",
    title: "Coffee, Done Right",
    text: "Light-roast coffee, carefully pulled espresso, and silky milk — simple, balanced, and made to order.",
    image: "/images/home/menu-coffee-drinks.jpg",
    alt: "Latte with latte art",
  },
  {
    slug: "breakfast-all-day",
    title: "Breakfast All Day",
    text: "Comforting plates made with good ingredients, from shakshuka and sourdough to seasonal favorites.",
    image: "/images/home/menu-breakfast-all-day.jpg",
    alt: "Shakshuka in a pan",
  },
  {
    slug: "something-sweet",
    title: "Something Sweet",
    text: "Freshly baked buns and pastries with pistachio, cardamom, brown butter, and whatever inspires us that morning.",
    image: "/images/home/menu-something-sweet.jpg",
    alt: "Pistachio pastry",
  },
];

export function MenuPreview() {
  // На какую категорию навели сейчас (null — ни на какую): её заголовок и стрелка оранжевые
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  // Какое фото показано и какое было перед ним: новое «выезжает» справа поверх предыдущего
  const [photo, setPhoto] = useState({ shown: 0, previous: 0 });
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

  // При каждой смене фото запускаем анимацию заново (Web Animations API — анимации из кода):
  // новое фото выезжает справа, а предыдущее под ним слегка тускнеет.
  // Так анимация работает в любую сторону — и вперёд по списку, и назад.
  // useLayoutEffect срабатывает до отрисовки кадра — так новое фото не «мелькнёт» на месте до начала анимации
  useLayoutEffect(() => {
    if (photo.shown === photo.previous) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const images = imageRefs.current;
    images.forEach((image) => image?.getAnimations().forEach((animation) => animation.cancel()));

    images[photo.shown]?.animate([{ translate: "100% 0" }, { translate: "0 0" }], {
      duration: 700,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    });
    images[photo.previous]?.animate([{ opacity: 1 }, { opacity: 0.55 }], {
      duration: 700,
      easing: "ease-out",
      fill: "forwards",
    });
  }, [photo]);

  const showCategory = (index: number) => {
    setActiveIndex(index);
    setPhoto((current) =>
      current.shown === index ? current : { shown: index, previous: current.shown },
    );
  };

  return (
    <section aria-labelledby="home-menu-title" className="mx-auto max-w-[1440px] px-4 md:px-10">
      <SectionHeading
        id="home-menu-title"
        title="Our menu"
        subtitle="Freshly made, thoughtfully served, and always worth slowing down for."
      />

      <div className="mt-8 grid gap-8 lg:mt-[31px] lg:grid-cols-[538px_minmax(0,792px)] lg:items-center lg:justify-between">
        <div className="rounded-xl border border-white/80 bg-cream p-3 lg:p-[19px]">
          {/* Все 4 фото лежат друг на друге. Показанное — сверху, предыдущее — под ним,
              остальные спрятаны. Само движение запускает useLayoutEffect выше. */}
          <div className="relative aspect-[500/625] max-h-[460px] w-full overflow-hidden rounded-xl sm:max-h-[560px] lg:max-h-none">
            {categories.map((category, index) => {
              const isShown = index === photo.shown;
              const isPrevious = index === photo.previous && !isShown;
              return (
                <Image
                  key={category.slug}
                  ref={(element) => {
                    imageRefs.current[index] = element;
                  }}
                  src={category.image}
                  alt={isShown ? category.alt : ""}
                  fill
                  sizes="(min-width: 1024px) 500px, 100vw"
                  className={`object-cover ${
                    isShown ? "z-20" : isPrevious ? "z-10" : "z-0 opacity-0"
                  }`}
                />
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-10">
          <ul className="flex flex-col gap-[17px]">
            {categories.map((category, index) => {
              const isActive = index === activeIndex;
              return (
                <li key={category.slug} className="border-b border-white/80 pb-4 last:border-b-0">
                  <Link
                    href={`/menu#${category.slug}`}
                    onMouseEnter={() => showCategory(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                    onFocus={() => showCategory(index)}
                    onBlur={() => setActiveIndex(null)}
                    className="block"
                  >
                    <span className="flex min-h-[53px] items-center justify-between gap-4">
                      <span
                        className={`font-display text-xl leading-[1.2] font-medium tracking-[-0.24px] transition-colors duration-300 md:text-2xl ${
                          isActive ? "text-accent" : "text-black"
                        }`}
                      >
                        {category.title}
                      </span>
                      {/* Стрелка вниз, повёрнутая на −150° (смотрит вверх-вправо);
                          при наведении поворачивается ещё на 60°, становится горизонтальной
                          и меняет цвет вместе с заголовком */}
                      <span
                        className={`flex size-[34px] shrink-0 items-center justify-center transition-colors duration-300 ${
                          isActive ? "text-accent" : "text-black"
                        }`}
                      >
                        <ArrowIcon
                          className={`transition-transform duration-300 ${
                            isActive ? "-rotate-90" : "-rotate-150"
                          }`}
                        />
                      </span>
                    </span>
                    <span className="mt-1 block max-w-[620px] text-base leading-[1.4] font-medium text-[#333]/80 md:text-lg">
                      {category.text}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <ArrowLink href="/menu">Explore menu</ArrowLink>
        </div>
      </div>
    </section>
  );
}

// Иконка из Figma (ant-design arrow-down). Нарисована прямо в коде, а не картинкой,
// чтобы её цвет можно было менять через currentColor — он берётся из цвета текста.
function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="25" height="25" viewBox="0 0 24.8897 24.8897" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M20.9521 11.3098H18.9833C18.8715 11.3098 18.7645 11.3584 18.6892 11.4434L13.3685 17.5759V3.88902C13.3685 3.78207 13.281 3.69457 13.1741 3.69457H11.7157C11.6087 3.69457 11.5212 3.78207 11.5212 3.88902V17.5759L6.20056 11.4434C6.12764 11.3584 6.02069 11.3098 5.90645 11.3098H3.93763C3.77235 11.3098 3.68242 11.5066 3.79179 11.6306L11.8591 20.9278C11.932 21.0119 12.0222 21.0794 12.1234 21.1256C12.2247 21.1719 12.3347 21.1958 12.4461 21.1958C12.5574 21.1958 12.6674 21.1719 12.7687 21.1256C12.87 21.0794 12.9602 21.0119 13.0331 20.9278L21.0979 11.6306C21.2073 11.5042 21.1174 11.3098 20.9521 11.3098Z"
      />
    </svg>
  );
}
