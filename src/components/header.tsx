"use client";

// "use client" — этот компонент работает в браузере,
// потому что ему нужно помнить, открыто ли мобильное меню, и знать текущий адрес страницы.

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCartCount } from "@/lib/cart-store";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/contacts", label: "Contact" },
];

// «Мы на этой странице?» Для /menu считаем активными и карточки блюд /menu/...
function isActiveLink(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  return <HeaderView pathname={usePathname()} />;
}

// Шапка без знания адреса страницы — показывается, пока адрес ещё неизвестен
// (например, у страницы заказа, адрес которой Next.js не может знать заранее).
export function HeaderFallback() {
  return <HeaderView pathname="" />;
}

function HeaderView({ pathname }: { pathname: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cartCount = useCartCount();
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="fixed inset-x-4 top-4 z-50 mx-auto max-w-[1324px] md:inset-x-6">
      <div className="flex items-center justify-between rounded-[110px] border-b border-white bg-cream/70 py-2.5 pr-2.5 pl-[18px] backdrop-blur-[3px]">
        <Logo onClick={closeMenu} />

        {/* Ссылки по центру — только на компьютере (на планшете не помещаются рядом с логотипом) */}
        <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => {
            const isActive = isActiveLink(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`group font-display relative py-0.5 text-base leading-none font-medium tracking-[-0.16px] transition-colors duration-300 ${
                  isActive ? "text-accent" : "text-black/75 hover:text-black"
                }`}
              >
                {link.label}
                {/* Линия под ссылкой: у активной видна всегда, у остальных «вырастает» слева при наведении */}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 -bottom-0.5 h-px origin-left transition-transform duration-300 ${
                    isActive ? "scale-x-100 bg-accent" : "scale-x-0 bg-black/75 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 md:gap-3">
          <IconLink href="/account" label="My account" onClick={closeMenu} isActive={isActiveLink(pathname, "/account")}>
            <AccountIcon />
          </IconLink>
          <IconLink
            href="/cart"
            label={cartCount > 0 ? `Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}` : "Cart"}
            onClick={closeMenu}
            isActive={isActiveLink(pathname, "/cart")}
          >
            <span className="relative">
              <Image src="/images/icons/cart.svg" alt="" width={35} height={35} className="size-6 md:size-[26px]" />
              {cartCount > 0 && (
                // key={cartCount} — при каждом изменении числа кружок создаётся заново
                // и снова проигрывает анимацию «подпрыгивания»
                <span
                  key={cartCount}
                  aria-hidden="true"
                  className="animate-bump absolute -top-2 -right-2.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[11px] leading-none font-semibold text-white"
                >
                  {cartCount}
                </span>
              )}
            </span>
          </IconLink>
          <BookTableButton className="ml-1 hidden lg:flex" />

          {/* Кнопка-«бургер» — на телефоне и планшете */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="flex size-10 items-center justify-center rounded-full bg-black/5 lg:hidden"
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
          className="mt-2 flex flex-col gap-1 rounded-3xl border-b border-white bg-cream/95 p-4 backdrop-blur-[3px] lg:hidden"
        >
          {navLinks.map((link) => {
            const isActive = isActiveLink(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                aria-current={isActive ? "page" : undefined}
                className={`font-display rounded-2xl px-3 py-3 text-lg font-medium transition-colors hover:bg-black/5 ${
                  isActive ? "text-accent" : "text-black/75"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
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

function IconLink({
  href,
  label,
  isActive,
  onClick,
  children,
}: {
  href: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label={label}
      aria-current={isActive ? "page" : undefined}
      className={`flex size-10 items-center justify-center rounded-full transition-colors duration-300 md:size-11 ${
        isActive ? "bg-bark/15" : "hover:bg-black/5"
      }`}
    >
      {children}
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
      className={`group btn-roast font-display items-center justify-between gap-4 rounded-full py-[5px] pr-[5px] pl-[18px] text-base leading-none font-medium tracking-[0.32px] lg:w-[174px] ${className}`}
    >
      Book a table
      {/* Стрелка в иконке наклонена на 60°. При наведении поворачиваем её на 60°,
          и она становится горизонтальной — как в Component 1 */}
      <Image
        src="/images/icon-arrow-up-right.svg"
        alt=""
        width={40}
        height={40}
        className="transition-transform duration-300 group-hover:rotate-60"
      />
    </Link>
  );
}

// Иконка личного кабинета в том же стиле, что и корзина (Phosphor, жирные линии)
function AccountIcon() {
  return (
    <svg
      viewBox="0 0 35 35"
      aria-hidden="true"
      className="size-6 md:size-[26px]"
      fill="none"
      stroke="#522A17"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="17.5" cy="13" r="7.5" />
      <path d="M4.5 30.5c2.6-4.6 7.4-7.5 13-7.5s10.4 2.9 13 7.5" />
    </svg>
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
