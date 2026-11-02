"use client";

// "use client" — этот компонент работает в браузере,
// потому что ему нужно помнить, открыто ли мобильное меню.

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/contacts", label: "Contact" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="fixed inset-x-4 top-4 z-50 mx-auto max-w-[1324px] md:inset-x-6">
      <div className="flex items-center justify-between rounded-[110px] border-b border-white bg-cream/70 py-2.5 pr-2.5 pl-[18px] backdrop-blur-[3px]">
        <Logo onClick={closeMenu} />

        {/* Ссылки по центру — только на планшете и компьютере */}
        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-display py-0.5 text-base leading-none font-medium tracking-[-0.16px] text-black/75 transition-colors hover:text-black"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <BookTableButton className="hidden md:flex" />

          {/* Кнопка-«бургер» — только на телефоне */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="flex size-10 items-center justify-center rounded-full bg-black/5 md:hidden"
          >
            <BurgerIcon isOpen={isMenuOpen} />
          </button>
        </div>
      </div>

      {/* Выпадающее мобильное меню */}
      {isMenuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="mt-2 flex flex-col gap-1 rounded-3xl border-b border-white bg-cream/95 p-4 backdrop-blur-[3px] md:hidden"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className="font-display rounded-2xl px-3 py-3 text-lg font-medium text-black/75 hover:bg-black/5"
            >
              {link.label}
            </Link>
          ))}
          <BookTableButton className="mt-2 flex" onClick={closeMenu} />
        </nav>
      )}
    </header>
  );
}

function Logo({ onClick }: { onClick: () => void }) {
  return (
    <Link href="/" onClick={onClick} className="flex items-center gap-3">
      <Image
        src="/images/logo-bean.png"
        alt=""
        width={22}
        height={27}
        className="h-[27px] w-[22px] -rotate-[28deg] object-contain"
        priority
      />
      <span className="font-logo text-xl leading-none font-medium tracking-[0.48px] whitespace-nowrap md:text-2xl">
        Hearth &amp; Grain
      </span>
    </Link>
  );
}

function BookTableButton({
  className = "",
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href="/#reservation"
      onClick={onClick}
      className={`font-display items-center justify-between gap-4 rounded-full bg-linear-[104deg] from-roast-dark from-6% to-roast to-94% py-[5px] pr-[5px] pl-[18px] text-base leading-none font-medium tracking-[0.32px] text-white/90 transition-opacity hover:opacity-90 md:w-[174px] ${className}`}
    >
      Book a table
      <Image src="/images/icon-arrow-up-right.svg" alt="" width={40} height={40} />
    </Link>
  );
}

function BurgerIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      {isOpen ? (
        <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      ) : (
        <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      )}
    </svg>
  );
}
