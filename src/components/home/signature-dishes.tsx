"use client";

// "use client" — на компьютере блок следит за прокруткой страницы:
// пока листаешь вниз, лента с блюдами едет влево (горизонтальный скролл).
// На телефоне и планшете ленту просто листают пальцем вбок.

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SectionHeading } from "@/components/home/section-heading";

// Фото лежат в public/images/signature/<slug>.jpg — имя файла совпадает с адресом блюда
const signatureDishes = [
  { slug: "shakshuka", name: "Shakshuka" },
  { slug: "grilled-cheese-on-sourdough", name: "Grilled Cheese on Sourdough" },
  { slug: "soup-of-the-day", name: "Soup of the Day" },
  { slug: "grain-bowl", name: "Grain Bowl" },
  { slug: "seasonal-fruit-galette", name: "Seasonal Fruit Galette" },
  { slug: "brown-butter-croissant", name: "Brown Butter Croissant" },
  { slug: "pistachio-cardamom-bun", name: "Pistachio Cardamom Bun" },
  { slug: "sourdough-toast-ricotta-honey", name: "Sourdough Toast, Ricotta & Honey" },
  { slug: "granola-bowl", name: "Granola Bowl" },
  { slug: "olive-oil-cake", name: "Olive Oil Cake" },
  { slug: "chocolate-rye-cookie", name: "Chocolate Rye Cookie" },
];

const DESKTOP_QUERY = "(min-width: 1024px)";

export function SignatureDishes() {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  // Высота блока на компьютере: экран + длина ленты, которую нужно «проехать»
  const [sectionHeight, setSectionHeight] = useState<number>();

  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_QUERY);

    // Сколько пикселей ленты не помещается на экран — столько ей и нужно проехать влево
    const getDistance = () => {
      const track = trackRef.current;
      const viewport = viewportRef.current;
      return track && viewport ? Math.max(0, track.scrollWidth - viewport.clientWidth) : 0;
    };

    const updatePosition = () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;
      if (!desktop.matches) {
        track.style.transform = "";
        return;
      }
      const distance = getDistance();
      // Насколько блок уже ушёл вверх за край экрана — на столько и сдвигаем ленту
      const scrolled = Math.min(Math.max(-section.getBoundingClientRect().top, 0), distance);
      track.style.transform = `translateX(${-scrolled}px)`;
    };

    const updateSize = () => {
      setSectionHeight(desktop.matches ? window.innerHeight + getDistance() : undefined);
      updatePosition();
    };

    updateSize();
    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updateSize);
    desktop.addEventListener("change", updateSize);
    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updateSize);
      desktop.removeEventListener("change", updateSize);
    };
  }, []);

  return (
    <section ref={sectionRef} aria-labelledby="signature-title" style={{ height: sectionHeight }}>
      {/* sticky — на компьютере блок «прилипает» к экрану, пока лента не доедет до конца */}
      <div className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:overflow-hidden lg:pt-20">
        <div className="mx-auto w-full max-w-[1440px] px-4 md:px-10">
          <SectionHeading
            id="signature-title"
            title="Signature dishes"
            subtitle="The plates we’re known for — simple ingredients, thoughtful combinations, and flavors worth coming back for."
          />
        </div>

        <div
          ref={viewportRef}
          className="mt-[50px] overflow-x-auto [scrollbar-width:none] lg:overflow-visible"
        >
          <ul
            ref={trackRef}
            className="flex w-max gap-2.5 px-4 pb-2 will-change-transform md:px-10 xl:pl-[max(40px,calc((100vw-1360px)/2))]"
          >
            {signatureDishes.map((dish) => (
              <li key={dish.slug} className="shrink-0">
                <Link
                  href={`/menu/${dish.slug}`}
                  className="group relative block h-[380px] w-[285px] overflow-hidden rounded-xl border border-white md:h-[440px] md:w-[330px]"
                >
                  <Image
                    src={`/images/signature/${dish.slug}.jpg`}
                    alt=""
                    fill
                    sizes="330px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Название вверху карточки, 60px от края, с затемнением сверху (просьба пользователя):
                      внизу и так блюдо — так карточка уравновешена */}
                  <span className="absolute inset-x-0 top-0 flex h-1/3 items-start justify-center bg-linear-to-b from-black/55 to-transparent px-5 pt-[60px]">
                    <span className="font-display text-center text-[22px] leading-[1.2] font-medium tracking-[-0.24px] text-white">
                      {dish.name}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
