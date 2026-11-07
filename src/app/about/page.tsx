import type { Metadata } from "next";
import Image from "next/image";
import { ArrowLink } from "@/components/arrow-link";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "About Us",
  description: "Hearth & Grain is a neighbourhood cafe and bakery on a quiet corner of Brzozowa Street in Warsaw.",
};

// Тексты вымышленные — для портфолио. Настоящая история кафе заменит их.
const values = [
  {
    title: "Small-batch coffee",
    text: "We change our beans every two weeks with the roast, so there’s always something new to taste.",
    icon: "/images/icons/coffee-bean.svg",
    glowAngle: "315deg",
  },
  {
    title: "Baked every morning",
    text: "Croissants, buns and sourdough come out of our oven before the doors open — nothing is left over from yesterday.",
    icon: "/images/icons/heart.svg",
    glowAngle: "225deg",
  },
  {
    title: "A table for everyone",
    text: "Bring your laptop, your friends or your dog. Stay for one espresso or the whole afternoon.",
    icon: "/images/icons/calendar.svg",
    glowAngle: "135deg",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        image="/images/home/about-barista.jpg"
        imageAlt="A barista making coffee behind the counter"
        eyebrow="About us"
        title="Our story"
        textWidth="max-w-[440px]"
      >
        A neighbourhood cafe and bakery on a quiet corner of Brzozowa Street.
      </PageHero>

      <section className="mx-auto flex max-w-[1440px] flex-col gap-16 px-4 pt-10 pb-24 md:px-10 lg:gap-[120px] lg:pt-[120px]">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="flex flex-col gap-5">
            <h2 className="font-display text-[32px] leading-[1.2] font-medium tracking-[-0.36px] text-accent md:text-[44px]">
              Made for everyday moments
            </h2>
            <p className="text-lg leading-[1.5] font-medium text-black/70">
              Hearth & Grain started with a simple idea: a place where the coffee is good, the bread
              is fresh and nobody rushes you out of your chair. A hearth to warm up by, and grain for
              the bread we bake every day.
            </p>
            <p className="text-lg leading-[1.5] font-medium text-black/70">
              Our kitchen cooks all day, from breakfast to the last slice of cake — and if you’re in
              a hurry, you can order ahead for pickup, delivery or straight to your table.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white">
            <Image
              src="/images/home/about-workspace.jpg"
              alt="A guest working on a laptop at a sunny cafe table"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        <ul className="grid gap-2.5 md:grid-cols-3">
          {values.map((value) => (
            <li
              key={value.title}
              style={{ "--glow-angle": value.glowAngle } as React.CSSProperties}
              className="border-glow flex flex-col gap-4 rounded-xl p-6 md:p-8"
            >
              <Image src={value.icon} alt="" width={28} height={28} />
              <h3 className="font-display text-2xl leading-[1.2] font-medium tracking-[-0.24px]">{value.title}</h3>
              <p className="text-lg leading-[1.4] font-medium text-black/70">{value.text}</p>
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-start gap-5 rounded-xl bg-bark/5 p-6 md:flex-row md:items-center md:justify-between md:p-10">
          <h2 className="font-display text-2xl leading-[1.2] font-medium tracking-[-0.24px] md:text-[32px]">
            Hungry already?
          </h2>
          <ArrowLink href="/menu">Explore menu</ArrowLink>
        </div>
      </section>
    </>
  );
}
