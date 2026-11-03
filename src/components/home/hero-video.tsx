"use client";

// "use client" — компонент проверяет настройку системы «Уменьшить движение» в браузере.

import { useEffect, useRef } from "react";

// Видео с паром над кофе на первом экране.
// autoPlay + muted + loop + playsInline — так браузеры (и iPhone тоже) разрешают
// запускать видео само: без звука, по кругу и без перехода в полноэкранный режим.
// poster — первый кадр: его видно, пока видео грузится.
export function HeroVideo({ className = "" }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Если человек включил «Уменьшить движение», оставляем первый кадр как фото
  useEffect(() => {
    const video = videoRef.current;
    if (video && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
    }
  }, []);

  return (
    <video
      ref={videoRef}
      className={className}
      src="/videos/hero-steam.mp4"
      poster="/videos/hero-steam-poster.jpg"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-label="Steam rising from a latte with heart latte art on a sunlit marble table"
    />
  );
}
