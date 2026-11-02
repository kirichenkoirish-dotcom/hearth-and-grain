import { AboutSection } from "@/components/home/about-section";
import { HeroSection } from "@/components/home/hero-section";
import { MenuPreview } from "@/components/home/menu-preview";
import { QuoteSection } from "@/components/home/quote-section";
import { ReservationSection } from "@/components/home/reservation-section";
import { SignatureDishes } from "@/components/home/signature-dishes";

// Главная страница собрана из блоков — каждый блок лежит в своём файле в components/home/
export default function HomePage() {
  return (
    // *:w-full — каждый блок ровно по ширине экрана; без этого лента «Signature dishes»
    // растягивала свой блок и страница на телефоне становилась шире экрана
    <div className="flex flex-col gap-24 pb-24 *:w-full md:gap-[220px] md:pb-[160px]">
      <HeroSection />
      <MenuPreview />
      <SignatureDishes />
      <AboutSection />
      <QuoteSection />
      <ReservationSection />
    </div>
  );
}
