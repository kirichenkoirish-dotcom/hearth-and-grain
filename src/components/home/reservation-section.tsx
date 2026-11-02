import Image from "next/image";
import { ReservationForm } from "@/components/home/reservation-form";
import { SectionHeading } from "@/components/home/section-heading";
import { CAFE, OPENING_HOURS, formatHour } from "@/config/cafe";

// glowAngle — в каком углу рамка карточки коричневая (см. border-glow в globals.css)
const infoCards = [
  {
    title: "Address",
    glowAngle: "315deg",
    text: `${CAFE.address.street}, ${CAFE.address.postalCode} ${CAFE.address.city}`,
  },
  {
    title: "Weekdays",
    glowAngle: "225deg",
    text: `${formatHour(OPENING_HOURS.weekdays.opens)} – ${formatHour(OPENING_HOURS.weekdays.closes)}`,
  },
  {
    title: "Weekends",
    glowAngle: "135deg",
    text: `${formatHour(OPENING_HOURS.weekends.opens)} – ${formatHour(OPENING_HOURS.weekends.closes)}`,
  },
  {
    title: "Contact",
    glowAngle: "45deg",
    text: CAFE.phone,
    // tel: — по нажатию на телефоне сразу открывается звонок
    href: `tel:${CAFE.phone.replaceAll(" ", "")}`,
  },
];

export function ReservationSection() {
  return (
    <section
      id="reservation"
      aria-labelledby="reservation-title"
      // Отступ сверху при переходе по ссылке «Book a table», чтобы шапка не закрыла заголовок
      className="mx-auto max-w-[1440px] scroll-mt-28 px-4 md:px-10"
    >
      <SectionHeading
        id="reservation-title"
        title="Reservation"
        subtitle="Walk-ins always welcome — this is just for larger groups."
      />

      <div className="mt-[50px] grid gap-8 rounded-xl border border-white p-4 md:p-5 lg:grid-cols-[minmax(0,620px)_minmax(0,634px)] lg:items-center lg:justify-between">
        <ReservationForm />
        <div className="relative hidden aspect-[634/640] overflow-hidden rounded-xl md:block">
          <Image
            src="/images/home/reservation.jpg"
            alt="Latte and croissant on a cafe table"
            fill
            sizes="(min-width: 1024px) 634px, 100vw"
            className="object-cover"
          />
        </div>
      </div>

      <ul className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {infoCards.map((card) => (
          <li
            key={card.title}
            style={{ "--glow-angle": card.glowAngle } as React.CSSProperties}
            className="border-glow flex flex-col items-center gap-1.5 rounded-lg px-5 py-6 text-center"
          >
            <h3 className="font-display text-2xl leading-[1.2] font-medium tracking-[-0.24px] text-black/80">
              {card.title}
            </h3>
            {card.href ? (
              <a href={card.href} className="text-lg leading-[1.4] font-medium text-black/60 hover:text-black">
                {card.text}
              </a>
            ) : (
              <p className="text-lg leading-[1.4] font-medium text-black/60">{card.text}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
