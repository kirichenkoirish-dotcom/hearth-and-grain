import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { signOut } from "@/app/login/actions";
import { AddressBook } from "@/components/account/address-book";
import { ProfileForm } from "@/components/account/profile-form";
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
        <Suspense fallback={<div aria-hidden="true" className="h-96 animate-pulse rounded-xl bg-bark/10" />}>
          <AccountContent />
        </Suspense>
      </section>
    </>
  );
}

async function AccountContent() {
  // connection() — «эта часть всегда собирается заново для каждого посетителя».
  // Без неё Next.js пытается собрать её заранее и спотыкается о время внутри Supabase.
  await connection();
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  // Не вошёл — отправляем на страницу входа
  if (!user) redirect("/login");

  // Профиль и адреса читаем одновременно. RLS сам вернёт только данные этого человека.
  const [{ data: profile }, { data: addresses }] = await Promise.all([
    supabase.from("profiles").select("full_name, phone").eq("id", user.id).single(),
    supabase.from("addresses").select("*").order("created_at"),
  ]);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <div className="flex flex-col gap-8">
        <AccountCard title="My details" glowAngle="315deg">
          <ProfileForm email={user.email ?? ""} fullName={profile?.full_name ?? null} phone={profile?.phone ?? null} />
        </AccountCard>

        <AccountCard title="Saved addresses" glowAngle="225deg">
          <AddressBook addresses={addresses ?? []} />
        </AccountCard>
      </div>

      <aside className="border-glow flex flex-col gap-5 rounded-xl p-6 md:p-8 lg:sticky lg:top-[110px]">
        <div>
          <p className="text-base font-medium text-black/60">Signed in as</p>
          <p className="font-display mt-1 text-xl font-medium tracking-[-0.24px] break-all">
            {profile?.full_name || user.email}
          </p>
          {profile?.full_name && <p className="text-base font-medium break-all text-black/60">{user.email}</p>}
        </div>
        <p className="rounded-lg bg-bark/5 p-4 text-base leading-[1.4] font-medium text-black/70">
          Your order history and favourite dishes will appear here soon.
        </p>
        <form action={signOut}>
          <button
            type="submit"
            className="font-display w-full rounded-full border border-bark/50 px-[30px] py-3 text-base font-medium transition-colors hover:bg-bark hover:text-white"
          >
            Sign out
          </button>
        </form>
      </aside>
    </div>
  );
}

function AccountCard({
  title,
  glowAngle,
  children,
}: {
  title: string;
  glowAngle: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{ "--glow-angle": glowAngle } as React.CSSProperties}
      className="border-glow flex flex-col gap-6 rounded-xl p-6 md:p-10"
    >
      <h2 className="font-display text-[28px] leading-[1.2] font-medium tracking-[-0.36px] text-accent md:text-4xl">
        {title}
      </h2>
      {children}
    </section>
  );
}
