import Image from "next/image";

// Большая картинка вверху страницы с текстом слева (как на странице меню в Figma).
// Используется на страницах меню и корзины, чтобы они выглядели одинаково.
export function PageHero({
  image,
  imageAlt,
  imagePosition = "object-[25%_center] md:object-[30%_center]",
  textWidth = "max-w-[563px]",
  eyebrow,
  title,
  children,
}: {
  image: string;
  imageAlt: string;
  // Какую часть фото показывать, когда оно обрезается на узком экране
  imagePosition?: string;
  // Ширина подзаголовка — уже, если справа на фото близко что-то важное
  textWidth?: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative h-[460px] overflow-hidden md:h-[607px]">
      <Image
        src={image}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        className={`object-cover ${imagePosition}`}
      />
      {/* На телефоне и планшете фото обрезается, поэтому слегка осветляем левую часть под текстом */}
      <div className="absolute inset-0 bg-linear-to-r from-cream/85 via-cream/50 to-transparent lg:hidden" />

      {/* На телефоне текст начинается сразу под шапкой (pt-32), на компьютере — как в макете (175px) */}
      <div className="relative mx-auto flex h-full max-w-[1440px] flex-col px-4 pt-32 md:px-10 md:pt-[175px]">
        <p className="flex items-center gap-2.5 text-base leading-[37px] font-medium tracking-[0.32px] text-accent uppercase">
          <span aria-hidden="true" className="h-px w-[25px] bg-accent" />
          {eyebrow}
        </p>
        <h1 className="font-display bg-linear-90 from-caramel to-cocoa to-60% bg-clip-text pb-1 text-[56px] leading-[1.2] font-medium tracking-[-0.8px] text-transparent uppercase md:mt-6 md:text-[80px]">
          {title}
        </h1>
        <p className={`mt-2 ${textWidth} text-base leading-[1.4] font-medium text-black/70 md:mt-4 md:text-lg`}>
          {children}
        </p>
      </div>
    </section>
  );
}
