import { ArrowLink } from "@/components/arrow-link";
import { CoffeeBadge } from "@/components/home/coffee-badge";
import { HeroVideo } from "@/components/home/hero-video";

// Первый экран главной: слева текст и кнопка, справа видео с паром над кофе и значок.
export function HeroSection() {
  return (
    // На компьютере у блока нет правого отступа, поэтому фото «приклеено» к правому краю экрана.
    // Левый отступ на широких экранах подстраивается, чтобы текст стоял на одной линии с остальным сайтом.
    <section className="mx-auto grid max-w-[1440px] gap-10 px-4 pt-28 md:px-10 lg:max-w-none lg:grid-cols-[minmax(0,661px)_minmax(0,646px)] lg:items-center lg:justify-between lg:gap-8 lg:pt-0 lg:pr-0 lg:min-h-[640px] lg:pl-[max(40px,calc((100vw-1360px)/2))]">
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

      {/* На планшете ограничиваем ширину, чтобы видео не было огромным */}
      {/* На компьютере блок с видео — во всю высоту экрана (h-svh), но не ниже 640px */}
      <div className="relative w-full sm:mx-auto sm:max-w-[560px] lg:mx-0 lg:h-svh lg:min-h-[640px] lg:max-w-none">
        {/*
          Видео с паром. На телефоне и планшете блок имеет пропорции 4:5,
          на компьютере — во всю высоту экрана. object-cover растягивает видео так,
          чтобы закрыть блок целиком; лишнее сверху и снизу обрезается, чашка остаётся в центре.
          У края экрана углы прямые, слева — скруглённые.
        */}
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl lg:aspect-auto lg:h-full lg:rounded-r-none">
          <HeroVideo className="absolute inset-0 size-full object-cover" />
        </div>
        {/* Телефон и планшет: значок внутри фото, 20px от левого и нижнего края.
            origin-bottom-left — уменьшаем значок от левого нижнего угла, чтобы отступы остались ровно 20px.
            Компьютер: значок ровно наполовину на фото, наполовину на фоне (178 / 2 = 89px). */}
        <CoffeeBadge className="absolute bottom-5 left-5 origin-bottom-left scale-75 sm:scale-100 lg:bottom-14 lg:-left-[89px] lg:origin-center" />
      </div>
    </section>
  );
}
