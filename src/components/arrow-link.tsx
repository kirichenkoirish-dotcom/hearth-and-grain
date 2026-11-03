import Image from "next/image";
import Link from "next/link";

// Кнопка-ссылка из Component 1 в Figma: текст и белый кружок со стрелкой.
// При наведении градиент «переворачивается», а стрелка становится горизонтальной.
export function ArrowLink({
  href,
  children,
  // Ширина по умолчанию — как в макете (225px); можно передать свою, например w-full
  className = "w-[225px]",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group btn-roast font-display inline-flex items-center justify-between rounded-full py-[11px] pr-[11px] pl-[30px] text-base leading-none font-medium tracking-[0.32px] ${className}`}
    >
      {children}
      {/* Стрелка в иконке наклонена на 60°, поворот на 60° делает её горизонтальной */}
      <Image
        src="/images/icon-arrow-up-right.svg"
        alt=""
        width={49}
        height={49}
        className="transition-transform duration-300 group-hover:rotate-60"
      />
    </Link>
  );
}
