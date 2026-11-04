import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { signOut } from "@/app/login/actions";
import { PageHero } from "@/components/page-hero";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "My account" };

export default function AccountPage() {
  return (
    <>
      <PageHero
        image="/images/account-hero.jpg"
        imageAlt="Laptop, notebook, latte and a croissant on a cafe table"
        eyebrow="Account"
        title="My account"
        textWidth="max-w-[420px]"
      >
        Your details, saved addresses and favourite dishes — all in one place.
      </PageHero>

      <section className="mx-auto max-w-[1440px] px-4 pt-10 pb-24 md:px-10 lg:pt-[120px]">
        {/* Кто вошёл, сервер узнаёт из cookie при каждом запросе — поэтому часть страницы
            показывается через Suspense: сначала заглушка, сразу за ней данные */}
        <Suspense fallback={<div aria-hidden="true" className="h-48 animate-pulse rounded-xl bg-bark/10" />}>
          <AccountContent />
        </Suspense>
      </section>
    </>
  );
}

async function AccountContent() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();

  // Не вошёл — отправляем на страницу входа
  if (!data.user) redirect("/login");

  return (
    <div className="border-glow flex flex-col gap-6 rounded-xl p-6 md:flex-row md:items-center md:justify-between md:p-10">
      <div>
        <p className="text-base font-medium text-black/60">Signed in as</p>
        <p className="font-display mt-1 text-2xl font-medium tracking-[-0.24px] break-all">{data.user.email}</p>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className="font-display rounded-full border border-bark/50 px-[30px] py-3 text-base font-medium transition-colors hover:bg-bark hover:text-white"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
