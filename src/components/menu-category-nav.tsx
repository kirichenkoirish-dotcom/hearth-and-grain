"use client";

// "use client" — компонент следит за прокруткой страницы прямо в браузере
// и подсвечивает категорию, блюда которой сейчас видны справа.

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type CategoryLink = { id: number; name: string; slug: string };

// Список категорий: на компьютере — колонка слева, которая «прилипает» при прокрутке,
// на телефоне — горизонтальная лента, которую листают пальцем.
export function MenuCategoryNav({ categories }: { categories: CategoryLink[] }) {
  const [activeSlug, setActiveSlug] = useState<string | undefined>(categories[0]?.slug);
  const listRef = useRef<HTMLUListElement>(null);
  // true, пока страница плавно едет к категории после клика:
  // в это время подсветку по прокрутке не меняем, иначе она «пробежит» по всем категориям
  const isScrollingToCategory = useRef(false);

  useEffect(() => {
    // При каждой прокрутке ищем последний раздел, чей верх уже поднялся
    // до линии чуть ниже шапки, — это и есть раздел, который сейчас читают.
    const ACTIVE_LINE_PX = 220;

    const updateActiveSlug = () => {
      if (isScrollingToCategory.current) return;

      const isAtPageBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (isAtPageBottom) {
        setActiveSlug(categories.at(-1)?.slug);
        return;
      }

      let current = categories[0]?.slug;
      for (const category of categories) {
        const section = document.getElementById(category.slug);
        if (section && section.getBoundingClientRect().top <= ACTIVE_LINE_PX) {
          current = category.slug;
        }
      }
      setActiveSlug(current);
    };

    // Прокрутка после клика закончилась — снова следим за ней как обычно
    const finishScrollToCategory = () => {
      isScrollingToCategory.current = false;
    };

    updateActiveSlug();
    window.addEventListener("scroll", updateActiveSlug, { passive: true });
    window.addEventListener("scrollend", finishScrollToCategory);
    return () => {
      window.removeEventListener("scroll", updateActiveSlug);
      window.removeEventListener("scrollend", finishScrollToCategory);
    };
  }, [categories]);

  const handleCategoryClick = (slug: string) => {
    isScrollingToCategory.current = true;
    setActiveSlug(slug);
    // Запасной вариант для браузеров без события scrollend
    window.setTimeout(() => {
      isScrollingToCategory.current = false;
    }, 1200);
  };

  // На телефоне подкручиваем ленту вбок так, чтобы активная категория была видна.
  // Саму страницу при этом не двигаем.
  useEffect(() => {
    const list = listRef.current;
    const activeLink = list?.querySelector<HTMLElement>(`[data-slug="${activeSlug}"]`);
    if (!list || !activeLink || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({ left: activeLink.offsetLeft - list.offsetLeft, behavior: "smooth" });
  }, [activeSlug]);

  return (
    <nav
      aria-label="Menu categories"
      className="sticky top-[88px] z-10 -mx-4 bg-cream/90 px-4 py-3 backdrop-blur-[3px] lg:top-[110px] lg:mx-0 lg:self-start lg:bg-transparent lg:p-0 lg:backdrop-blur-none"
    >
      <ul
        ref={listRef}
        className="flex gap-2.5 overflow-x-auto [scrollbar-width:none] lg:flex-col lg:gap-5 lg:overflow-visible"
      >
        {categories.map((category) => {
          const isActive = category.slug === activeSlug;
          return (
            <li key={category.id} className="shrink-0">
              <a
                href={`#${category.slug}`}
                data-slug={category.slug}
                aria-current={isActive ? "true" : undefined}
                onClick={() => handleCategoryClick(category.slug)}
                className={`flex items-center gap-2.5 rounded-[5px] border py-1.5 pr-4 pl-2.5 text-base leading-[1.4] font-medium whitespace-nowrap transition-colors duration-300 lg:py-2 lg:text-lg ${
                  isActive
                    ? "border-bark bg-bark text-white"
                    : "border-bark/50 bg-cream text-black hover:border-bark hover:bg-bark hover:text-white"
                }`}
              >
                <Image
                  src={`/images/categories/${category.slug}.png`}
                  alt=""
                  width={38}
                  height={38}
                  className="size-8 object-contain lg:size-[38px]"
                />
                {category.name}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
