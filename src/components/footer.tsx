import Image from "next/image";
import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";

const navigationLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/contacts", label: "Contact" },
  { href: "/#reservation", label: "Reservation" },
];

const utilityLinks = [
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/privacy", label: "Privacy Policy" },
];

export function Footer() {
  return (
    <footer className="bg-espresso text-cream">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 pt-14 pb-10 md:grid-cols-2 md:px-10 lg:grid-cols-[1fr_1fr_minmax(0,507px)] lg:gap-[106px]">
        <FooterColumn title="Navigation">
          <FooterLinks links={navigationLinks} />
        </FooterColumn>

        <FooterColumn title="Utility pages">
          <FooterLinks links={utilityLinks} />
        </FooterColumn>

        <FooterColumn title="Newsletter">
          <p className="mb-2.5 text-lg leading-[1.4] font-medium">
            Drop your email and we’ll share the most unforgettable moments and offers!
          </p>
          <NewsletterForm />
        </FooterColumn>
      </div>

      <div className="border-t border-cream/60">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-8 text-base text-cream/60 md:flex-row md:justify-between md:px-10 md:text-lg">
          <p>Copyrights are reserved @ Hearth &amp; Grain</p>
          <p>Designed by Iryna Kyrychenko @ Senvori.Agency</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-base leading-[37px] font-medium tracking-[0.32px] text-accent-light uppercase">
        {title}
      </h2>
      {children}
    </div>
  );
}

function FooterLinks({ links }: { links: { href: string; label: string }[] }) {
  return (
    <ul className="flex max-w-[310px] flex-col gap-2.5">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="flex items-center justify-between rounded-[7px] border border-cream/30 py-[5px] pr-[15px] pl-[25px] text-lg leading-[1.4] font-medium transition-colors hover:border-cream/60"
          >
            {link.label}
            {/* Иконка в Figma — стрелка вниз, повёрнутая на 225°, поэтому смотрит вверх-вправо */}
            <span className="flex size-[35px] items-center justify-center">
              <Image
                src="/images/icon-arrow-orange.svg"
                alt=""
                width={25}
                height={25}
                className="rotate-225"
              />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
