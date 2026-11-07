import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/page-hero";
import { LoginForm } from "./login-form";

// Личная или служебная страница — поисковикам показывать не нужно
export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <>
      <PageHero
        image="/images/account-hero.jpg"
        imageAlt="Laptop, notebook, latte and a croissant on a cafe table"
        eyebrow="Account"
        title="Sign in"
        textWidth="max-w-[420px]"
      >
        Save your details and addresses, keep your favourite dishes close, and follow your orders.
      </PageHero>

      <section className="mx-auto max-w-[1440px] px-4 pt-10 pb-24 md:px-10 lg:pt-[120px]">
        <div className="border-glow mx-auto max-w-[620px] rounded-xl p-6 md:p-10">
          {/* ?error=link — сюда возвращает страница проверки ссылки, если ссылка не сработала */}
          <Suspense fallback={<LoginForm linkError={false} />}>
            {searchParams.then(({ error }) => (
              <LoginForm linkError={error === "link"} />
            ))}
          </Suspense>
        </div>
      </section>
    </>
  );
}
