import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { signOut } from "@/app/login/actions";
import { AddressBook } from "@/components/account/address-book";
import { OrderHistory } from "@/components/account/order-history";
import { ProfileForm } from "@/components/account/profile-form";
import { ArrowLink } from "@/components/arrow-link";
import { DishCard } from "@/components/dish-card";
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
        Your orders, details, saved addresses and favourite dishes — all in one place.
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

  // Заказы, профиль, адреса и избранное читаем одновременно. RLS сам вернёт только данные этого человека.
  const [{ data: orders }, { data: profile }, { data: addresses }, { data: favorites }] = await Promise.all([
    // Только свои (админ по правилам видит все заказы) и только оплаченные — «брошенные» попытки не нужны
    supabase
      .from("orders")
      .select("id, status, order_type, total_grosze, created_at, order_items (quantity)")
      .eq("user_id", user.id)
      .not("paid_at", "is", null)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("profiles").select("full_name, phone, role").eq("id", user.id).single(),
    supabase.from("addresses").select("*").order("created_at"),
    supabase
      .from("favorites")
      .select("dishes (id, name, slug, description, price_grosze, image_url, is_available)")
      .order("created_at", { ascending: false }),
  ]);
  // Блюдо могли удалить из меню — тогда dishes будет пустым, пропускаем такие строки
  const favoriteDishes = (favorites ?? []).flatMap((row) => (row.dishes ? [row.dishes] : []));

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <div className="flex flex-col gap-8">
        <AccountCard title="My orders" glowAngle="45deg">
          <OrderHistory orders={orders ?? []} />
        </AccountCard>

        <AccountCard title="My details" glowAngle="315deg">
          <ProfileForm email={user.email ?? ""} fullName={profile?.full_name ?? null} phone={profile?.phone ?? null} />
        </AccountCard>

        <AccountCard title="Saved addresses" glowAngle="225deg">
          <AddressBook addresses={addresses ?? []} />
        </AccountCard>

        <AccountCard title="Favourites" glowAngle="135deg">
          {favoriteDishes.length === 0 ? (
            <div className="flex flex-col items-start gap-5">
              <p className="text-lg font-medium text-black/60">
                Tap the ♡ on any dish to keep it here for next time.
              </p>
              <ArrowLink href="/menu">Explore menu</ArrowLink>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {favoriteDishes.map((dish) => (
                <DishCard key={dish.id} dish={dish} />
              ))}
            </div>
          )}
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
        {profile?.role === "admin" && (
          <Link
            href="/admin"
            className="btn-roast font-display rounded-full px-[30px] py-3 text-center text-base font-medium"
          >
            Admin panel
          </Link>
        )}
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
