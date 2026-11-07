import type { Metadata } from "next";
import { ArrowLink } from "@/components/arrow-link";
import { PageHero } from "@/components/page-hero";
import { BOOKING, CAFE, OPENING_HOURS, formatHour } from "@/config/cafe";

export const metadata: Metadata = {
  title: "Contact",
  description: `Visit Hearth & Grain at ${CAFE.address.street}, ${CAFE.address.city}. Opening hours, phone and table bookings.`,
};

const fullAddress = `${CAFE.address.street}, ${CAFE.address.postalCode} ${CAFE.address.city}`;
// Ссылка открывает адрес в Google Maps (на телефоне — в приложении карт). Без встроенной карты: она тяжёлая и ставит cookie
const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

export default function ContactsPage() {
  return (
    <>
      <PageHero
        image="/images/home/about-workspace.jpg"
        imageAlt="A guest working on a laptop at a sunny cafe table"
        eyebrow="Contact"
        title="Say hello"
        textWidth="max-w-[460px]"
      >
        Drop by, give us a call or book a table for your group — we’d love to see you.
      </PageHero>

      <section className="mx-auto flex max-w-[1440px] flex-col gap-8 px-4 pt-10 pb-24 md:px-10 lg:pt-[120px]">
        <ul className="grid gap-2.5 md:grid-cols-3">
          <ContactCard title="Visit us" glowAngle="315deg">
            <p>{CAFE.address.street}</p>
            <p>
              {CAFE.address.postalCode} {CAFE.address.city}
            </p>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-accent underline-offset-4 hover:underline"
            >
              Open in Google Maps
            </a>
          </ContactCard>

          <ContactCard title="Opening hours" glowAngle="225deg">
            <p>
              Mon–Fri: {formatHour(OPENING_HOURS.weekdays.opens)} – {formatHour(OPENING_HOURS.weekdays.closes)}
            </p>
            <p>
              Sat–Sun: {formatHour(OPENING_HOURS.weekends.opens)} – {formatHour(OPENING_HOURS.weekends.closes)}
            </p>
            <p className="mt-3 text-black/50">Kitchen serves all day, until closing.</p>
          </ContactCard>

          <ContactCard title="Call us" glowAngle="135deg">
            {/* tel: — по нажатию на телефоне сразу открывается звонок */}
            <a href={`tel:${CAFE.phone.replaceAll(" ", "")}`} className="hover:text-black">
              {CAFE.phone}
            </a>
            <p className="mt-3 text-black/50">For orders, bookings and anything else.</p>
          </ContactCard>
        </ul>

        <div className="grid gap-2.5 md:grid-cols-2">
          <ActionCard
            title={`Coming with ${BOOKING.minSeats} or more?`}
            text="Walk-ins are always welcome. For bigger groups, send us a booking request and we’ll keep a table for you."
            href="/#reservation"
            linkText="Book a table"
          />
          <ActionCard
            title="Order ahead"
            text="Pick up at the counter, get it delivered or order right from your table."
            href="/menu"
            linkText="Explore menu"
          />
        </div>
      </section>
    </>
  );
}

function ContactCard({
  title,
  glowAngle,
  children,
}: {
  title: string;
  glowAngle: string;
  children: React.ReactNode;
}) {
  return (
    <li
      style={{ "--glow-angle": glowAngle } as React.CSSProperties}
      className="border-glow flex flex-col gap-4 rounded-xl p-6 md:p-8"
    >
      <h2 className="font-display text-2xl leading-[1.2] font-medium tracking-[-0.24px] text-accent">{title}</h2>
      <div className="text-lg leading-[1.4] font-medium text-black/70">{children}</div>
    </li>
  );
}

function ActionCard({
  title,
  text,
  href,
  linkText,
}: {
  title: string;
  text: string;
  href: string;
  linkText: string;
}) {
  return (
    <div className="flex flex-col items-start gap-5 rounded-xl bg-bark/5 p-6 md:p-8">
      <h2 className="font-display text-2xl leading-[1.2] font-medium tracking-[-0.24px]">{title}</h2>
      <p className="text-lg leading-[1.4] font-medium text-black/70">{text}</p>
      <ArrowLink href={href}>{linkText}</ArrowLink>
    </div>
  );
}
