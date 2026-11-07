import type { Metadata } from "next";
import Image from "next/image";
import { ContactForm } from "@/components/contact/contact-form";
import { PageHero } from "@/components/page-hero";
import { CAFE, OPENING_HOURS, SOCIAL, formatHour } from "@/config/cafe";

export const metadata: Metadata = {
  title: "Contact",
  description: `Visit Hearth & Grain at ${CAFE.address.street}, ${CAFE.address.city}. Opening hours, phone, email and a map.`,
};

const fullAddress = `${CAFE.address.street}, ${CAFE.address.postalCode} ${CAFE.address.city}`;
// Карта Google без ключа: встроенная страница с меткой по адресу
const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}&z=17&hl=en&output=embed`;
const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

// Страница контактов по макету пользователя (2026-11-07)
export default function ContactsPage() {
  return (
    <>
      <PageHero
        image="/images/contact/contact-hero.jpg"
        imageAlt="A latte, a notebook and daisies on a marble cafe table"
        imagePosition="object-[20%_center] lg:object-left"
        eyebrow="Get in touch"
        title="Contact us"
        textWidth="max-w-[360px]"
      >
        Have a question, a special request, or just want to say hello? We’d love to hear from you.
      </PageHero>

      <div className="mx-auto flex max-w-[1440px] flex-col gap-16 px-4 pt-5 pb-24 md:px-10 lg:gap-[100px]">
        <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoCard title="Address" glowAngle="315deg">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-black">
              {fullAddress}
            </a>
          </InfoCard>
          <InfoCard title="Follow us" glowAngle="225deg">
            <span className="flex justify-center gap-3">
              <SocialIcon href={SOCIAL.telegram} label="Telegram" icon="/images/icons/telegram-accent.svg" />
              <SocialIcon href={SOCIAL.instagram} label="Instagram" icon="/images/icons/instagram-accent.svg" />
            </span>
          </InfoCard>
          <InfoCard title="Email us" glowAngle="135deg">
            <a href={`mailto:${CAFE.email}`} className="break-all hover:text-black">
              {CAFE.email}
            </a>
          </InfoCard>
          <InfoCard title="Call us" glowAngle="45deg">
            {/* tel: — по нажатию на телефоне сразу открывается звонок */}
            <a href={`tel:${CAFE.phone.replaceAll(" ", "")}`} className="hover:text-black">
              {CAFE.phone}
            </a>
          </InfoCard>
        </ul>

        <div className="grid gap-5 lg:grid-cols-2 lg:items-stretch">
          <div className="relative aspect-square overflow-hidden rounded-xl lg:aspect-auto">
            <Image
              src="/images/contact/cafe-interior.jpg"
              alt="A latte and a croissant on a marble table in the cafe, guests talking in the background"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          <section
            aria-labelledby="hours-title"
            style={{ "--glow-angle": "315deg" } as React.CSSProperties}
            className="border-glow flex flex-col gap-6 rounded-xl p-5 md:p-8"
          >
            <IconHeading id="hours-title" icon="/images/icons/clock-brown.svg">
              Opening hours
            </IconHeading>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              <HoursCard title="Weekdays" hours={OPENING_HOURS.weekdays} glowAngle="225deg" />
              <HoursCard title="Weekends" hours={OPENING_HOURS.weekends} glowAngle="135deg" />
            </ul>

            <IconHeading id="find-us-title" icon="/images/icons/map-pin.svg">
              Find us
            </IconHeading>
            <div className="overflow-hidden rounded-xl border-[6px] border-white/60 bg-white/40">
              <iframe
                title={`Map: Hearth & Grain, ${fullAddress}`}
                src={mapEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                // Тёплый оттенок, чтобы карта подходила к цветам сайта
                className="block h-[280px] w-full saturate-[.6] sepia-[.4] md:h-[300px]"
              />
            </div>
          </section>
        </div>

        <section
          aria-labelledby="message-title"
          style={{ "--glow-angle": "45deg" } as React.CSSProperties}
          className="border-glow grid gap-8 rounded-xl p-5 md:p-8 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-16"
        >
          <div className="flex flex-col gap-4">
            <IconHeading id="message-title" icon="/images/icons/chat.svg">
              Send a message
            </IconHeading>
            <p className="text-lg leading-[1.4] font-medium text-black/70 lg:pl-11">
              Can’t find what you’re looking for? Drop us a message and we’ll get back to you as soon as
              possible.
            </p>
          </div>
          <ContactForm />
        </section>
      </div>
    </>
  );
}

function InfoCard({
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
      className="border-glow flex flex-col items-center gap-1.5 rounded-lg px-5 py-6 text-center"
    >
      <h2 className="font-display text-2xl leading-[1.2] font-medium tracking-[-0.24px] text-black/80">{title}</h2>
      <div className="text-lg leading-[1.4] font-medium text-black/60">{children}</div>
    </li>
  );
}

function SocialIcon({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="block transition-opacity hover:opacity-70"
    >
      <Image src={icon} alt="" width={26} height={26} />
    </a>
  );
}

function IconHeading({ id, icon, children }: { id: string; icon: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="font-display flex items-center gap-4 text-[28px] leading-[1.2] font-medium tracking-[-0.36px] md:text-4xl"
    >
      <Image src={icon} alt="" width={28} height={28} />
      {children}
    </h2>
  );
}

function HoursCard({
  title,
  hours,
  glowAngle,
}: {
  title: string;
  hours: { opens: string; closes: string };
  glowAngle: string;
}) {
  return (
    <li
      style={{ "--glow-angle": glowAngle } as React.CSSProperties}
      className="border-glow flex flex-col items-center gap-1.5 rounded-lg px-5 py-5 text-center"
    >
      <h3 className="font-display text-2xl leading-[1.2] font-medium tracking-[-0.24px] text-black/80">{title}</h3>
      <p className="text-lg leading-[1.4] font-medium text-black/60">
        {formatHour(hours.opens)} – {formatHour(hours.closes)}
      </p>
    </li>
  );
}
