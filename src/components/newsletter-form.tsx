"use client";

import Image from "next/image";

// Пока только внешний вид. Сохранять почту в базу будем на этапе 9.
export function NewsletterForm() {
  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      className="flex gap-5"
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email
      </label>
      <input
        id="newsletter-email"
        type="email"
        name="email"
        placeholder="your@email.com"
        className="h-[47px] min-w-0 flex-1 rounded-[7px] border border-cream/30 bg-transparent px-[25px] text-base font-medium text-cream placeholder:text-cream/30 focus:border-cream/60 focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Subscribe"
        className="flex h-[47px] w-[82px] shrink-0 items-center justify-center rounded-[7px] border border-cream/15 transition-colors hover:border-cream/40"
      >
        {/* Стрелка вниз, повёрнутая на 270°, — смотрит вправо */}
        <Image
          src="/images/icon-arrow-light.svg"
          alt=""
          width={25}
          height={25}
          className="rotate-270"
        />
      </button>
    </form>
  );
}
