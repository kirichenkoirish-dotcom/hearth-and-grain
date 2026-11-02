import Image from "next/image";

// Отзыв гостя на фоне фото кофейных зёрен во всю ширину экрана
export function QuoteSection() {
  return (
    <section className="relative flex h-[420px] items-center justify-center overflow-hidden px-4 md:h-[564px]">
      <Image
        src="/images/home/quote.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
      />
      {/* Лёгкое затемнение, чтобы белый текст читался */}
      <div className="absolute inset-0 bg-black/20" />

      <figure className="relative max-w-[780px] text-center text-white">
        <blockquote className="font-display text-2xl leading-[1.2] font-medium tracking-[-0.36px] md:text-4xl">
          “The only café where I’ve ever finished a whole book without noticing the time.”
        </blockquote>
        <figcaption className="mt-3 text-lg leading-[1.4] font-medium">
          — Maya, regular since 2021
        </figcaption>
      </figure>
    </section>
  );
}
