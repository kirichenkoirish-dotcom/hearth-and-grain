"use client";

// Сердечко «в избранное». Вошёл — нажатие добавляет или убирает блюдо.
// Не вошёл — ведём на страницу входа.

import { usePathname, useRouter } from "next/navigation";
import { useFavoritesStore } from "@/lib/favorites-store";

export function FavoriteButton({
  dishId,
  dishName,
  variant = "overlay",
}: {
  dishId: number;
  dishName: string;
  // overlay — белый кружок поверх фото; inline — рядом с ценой
  variant?: "overlay" | "inline";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const status = useFavoritesStore((state) => state.status);
  const isFavorite = useFavoritesStore((state) => state.dishIds.includes(dishId));
  const toggle = useFavoritesStore((state) => state.toggle);

  const handleClick = async () => {
    if (status === "guest") {
      router.push("/login");
      return;
    }
    if (status !== "member") return;
    await toggle(dishId);
    // В кабинете список избранного рисует сервер — просим его обновиться
    if (pathname === "/account") router.refresh();
  };

  const label =
    status === "guest"
      ? `Sign in to save ${dishName} to favourites`
      : isFavorite
        ? `Remove ${dishName} from favourites`
        : `Save ${dishName} to favourites`;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      aria-pressed={status === "member" ? isFavorite : undefined}
      title={status === "guest" ? "Sign in to save favourites" : undefined}
      className={`flex shrink-0 items-center justify-center rounded-full transition-all duration-300 active:scale-90 ${
        variant === "overlay"
          ? "size-10 bg-white/85 text-bark shadow-sm backdrop-blur-[2px] hover:bg-white"
          : "size-11 border border-bark/50 text-bark hover:bg-bark/10"
      }`}
    >
      <HeartIcon filled={isFavorite} />
    </button>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 20.5s-7.5-4.6-9.3-9.4C1.5 7.7 3.6 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.4 0 5.5 3.2 4.3 6.6-1.8 4.8-9.3 9.4-9.3 9.4Z"
        fill={filled ? "var(--color-accent)" : "none"}
        stroke={filled ? "var(--color-accent)" : "currentColor"}
        strokeWidth="1.8"
        strokeLinejoin="round"
        className="transition-colors duration-300"
      />
    </svg>
  );
}
