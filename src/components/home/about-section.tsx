import Image from "next/image";
import { SectionHeading } from "@/components/home/section-heading";

// glowAngle — в каком углу рамка карточки коричневая (см. border-glow в globals.css):
// у первой карточки справа сверху, у второй — слева сверху
const rows = [
  {
    image: "/images/home/about-workspace.jpg",
    alt: "A guest working on a laptop at a sunny cafe table",
    imageFirst: true,
    title: "A place to slow down & stay awhile",
    text: "From quiet mornings with your laptop to unhurried afternoons over coffee, Hearth & Grain is made for moments that deserve a little more time.",
    glowAngle: "45deg",
  },
  {
    image: "/images/home/about-barista.jpg",
    alt: "A barista making coffee behind the counter",
    imageFirst: false,
    title: "Made with care, cup by cup",
    text: "Good coffee takes time. From carefully selected beans to the final pour, every cup is prepared with attention, balance, and a genuine love for the craft.",
    glowAngle: "315deg",
  },
];

export function AboutSection() {
  return (
    <section aria-labelledby="about-title" className="mx-auto max-w-[1440px] px-4 md:px-10">
      <SectionHeading id="about-title" title="About us" subtitle="Made for everyday moments" />

      <div className="mt-[50px] flex flex-col gap-2.5">
        {rows.map((row) => (
          <div
            key={row.image}
            // Во втором ряду фото справа, поэтому и колонки «зеркальные»: узкая карточка слева
            className={`grid gap-2.5 lg:justify-between ${
              row.imageFirst
                ? "lg:grid-cols-[minmax(0,920px)_minmax(0,422px)]"
                : "lg:grid-cols-[minmax(0,422px)_minmax(0,920px)]"
            }`}
          >
            <div
              className={`relative h-[260px] overflow-hidden rounded-xl border border-white md:h-[360px] ${
                row.imageFirst ? "" : "lg:order-2"
              }`}
            >
              <Image src={row.image} alt={row.alt} fill sizes="(min-width: 1024px) 920px, 100vw" className="object-cover" />
            </div>
            <AboutCard title={row.title} text={row.text} glowAngle={row.glowAngle} />
          </div>
        ))}
      </div>
    </section>
  );
}

function AboutCard({ title, text, glowAngle }: { title: string; text: string; glowAngle: string }) {
  return (
    <div
      // Фон карточки в макете — белый с прозрачностью 15% поверх бежевого фона
      style={
        {
          "--glow-angle": glowAngle,
          "--glow-fill": "color-mix(in srgb, white 15%, var(--color-cream))",
        } as React.CSSProperties
      }
      className="border-glow flex flex-col justify-between gap-8 rounded-lg p-6 md:p-[30px]"
    >
      <div className="flex flex-col gap-[30px]">
        <h3 className="font-display text-2xl leading-[1.2] font-medium tracking-[-0.24px]">
          {title}
        </h3>
        <p className="text-base leading-[1.4] font-medium text-[#333]/80 md:text-lg">{text}</p>
      </div>
      <ul className="font-display flex gap-[30px] text-base leading-none font-medium tracking-[-0.16px]">
        <li className="flex items-center gap-1.5">
          <Image src="/images/icons/heart.svg" alt="" width={19} height={19} />
          Made with care
        </li>
        <li className="flex items-center gap-1.5">
          <Image src="/images/icons/coffee-bean.svg" alt="" width={19} height={19} />
          Quality beans
        </li>
      </ul>
    </div>
  );
}
