import type { Metadata } from "next";
import { Instrument_Sans, Playfair_Display, Work_Sans } from "next/font/google";
import { CartHydrator } from "@/components/cart-hydrator";
import { FavoritesLoader } from "@/components/favorites-loader";
import { Footer } from "@/components/footer";
import { Header, HeaderFallback } from "@/components/header";
import { SITE_URL } from "@/config/cafe";
import { Suspense } from "react";
import "./globals.css";

// Шрифты скачиваются при сборке и отдаются с нашего сайта, без запросов к Google
const workSans = Work_Sans({
  variable: "--font-work-sans-family",
  subsets: ["latin"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans-family",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair-family",
  subsets: ["latin"],
});

const description =
  "A small cafe in Warsaw’s Old Town with light-roast coffee, fresh pastries and all-day breakfast. Order online for delivery, pickup or at your table.";

// Название и описание сайта для вкладки браузера, Google и превью ссылок в мессенджерах.
// Картинка превью — src/app/opengraph-image.jpg, иконка — icon.png и apple-icon.png (Next.js находит их сам).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Hearth & Grain — cafe & bakery in Warsaw",
    template: "%s · Hearth & Grain",
  },
  description,
  applicationName: "Hearth & Grain",
  openGraph: {
    type: "website",
    siteName: "Hearth & Grain",
    locale: "en_GB",
    title: "Hearth & Grain — cafe & bakery in Warsaw",
    description,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // Подсказка Next.js: плавная прокрутка включена в CSS, но при переходе между страницами её надо выключать
      data-scroll-behavior="smooth"
      className={`${workSans.variable} ${instrumentSans.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <CartHydrator />
        <FavoritesLoader />
        <Suspense fallback={<HeaderFallback />}>
          <Header />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
