import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { PageHero } from "@/components/page-hero";
import { getMenu } from "@/lib/menu";
import { canOrderAtTableNow, getAvailableSlots } from "@/lib/slots";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <>
      <PageHero
        image="/images/cart-hero.jpg"
        imageAlt="Takeaway bag, coffee cups and a croissant with the Hearth & Grain logo"
        eyebrow="Checkout"
        title="Checkout"
        textWidth="max-w-[400px]"
      >
        Choose how you’d like to get your order, pick a time, and pay securely.
      </PageHero>

      <section className="mx-auto max-w-[1440px] px-4 pt-10 pb-24 md:px-10 lg:pt-[120px]">
        <Suspense fallback={<div aria-hidden="true" className="h-96 animate-pulse rounded-xl bg-bark/10" />}>
          <CheckoutContent />
        </Suspense>
      </section>
    </>
  );
}

async function CheckoutContent() {
  // Свободное время зависит от того, который сейчас час, — поэтому страница собирается для каждого посетителя
  await connection();

  const menu = await getMenu();
  const dishes = menu.flatMap((category) => category.dishes);

  // Если человек вошёл — подставим его имя, телефон, почту и сохранённые адреса
  const supabase = await createServerSupabase();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  const [profileResult, addressesResult] = user
    ? await Promise.all([
        supabase.from("profiles").select("full_name, phone").eq("id", user.id).single(),
        supabase.from("addresses").select("*").order("created_at"),
      ])
    : [null, null];

  return (
    <CheckoutForm
      dishes={dishes}
      slots={{ pickup: getAvailableSlots("pickup"), delivery: getAvailableSlots("delivery") }}
      canOrderAtTable={canOrderAtTableNow()}
      contact={{
        name: profileResult?.data?.full_name ?? "",
        phone: profileResult?.data?.phone ?? "",
        email: user?.email ?? "",
      }}
      savedAddresses={addressesResult?.data ?? []}
    />
  );
}
