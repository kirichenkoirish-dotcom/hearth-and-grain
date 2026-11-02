import type { Metadata } from "next";
import { Instrument_Sans, Playfair_Display, Work_Sans } from "next/font/google";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
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

export const metadata: Metadata = {
  title: {
    default: "Hearth & Grain",
    template: "%s · Hearth & Grain",
  },
  description:
    "A small cafe with light-roast coffee, fresh pastries and all-day breakfast. Order online for delivery, pickup or at your table.",
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
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
