import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { StatusBadge } from "@/components/account/order-history";
import { ArrowLink } from "@/components/arrow-link";
import { ClearCart } from "@/components/checkout/clear-cart";
import { PageHero } from "@/components/page-hero";
import { formatPrice } from "@/lib/format";
import { ORDER_TYPE_LABELS, formatOrderTime, shortOrderId } from "@/lib/order-status";
import { confirmOrderPayment } from "@/lib/stripe";
import { createAdminSupabase } from "@/lib/supabase/admin";

// Личная или служебная страница — поисковикам показывать не нужно
export const metadata: Metadata = { title: "Your order", robots: { index: false } };

// Страница заказа. Сюда Stripe возвращает гостя после оплаты.
// Номер заказа — длинный случайный код (uuid), поэтому чужой заказ по ссылке не угадать.
// Статус не обновляется сам — чтобы увидеть новый, страницу обновляют (этап 7, упрощённо).
export default function OrderPage({ params, searchParams }: PageProps<"/order/[id]">) {
  return (
    <>
      <PageHero
        image="/images/cart-hero.jpg"
        imageAlt="Takeaway bag, coffee cups and a croissant with the Hearth & Grain logo"
        eyebrow="Your order"
        title="Thank you"
        textWidth="max-w-[400px]"
      >
        We’ve got your order and the kitchen will start on it soon.
      </PageHero>

      <section className="mx-auto max-w-[1440px] px-4 pt-10 pb-24 md:px-10 lg:pt-[120px]">
        <Suspense fallback={<div aria-hidden="true" className="h-64 animate-pulse rounded-xl bg-bark/10" />}>
          <OrderDetails params={params} searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  );
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function OrderDetails({
  params,
  searchParams,
}: {
  params: PageProps<"/order/[id]">["params"];
  searchParams: PageProps<"/order/[id]">["searchParams"];
}) {
  await connection();
  const { id } = await params;
  const { session_id: sessionId } = await searchParams;
  if (!UUID_PATTERN.test(id)) notFound();

  // Вернулись со страницы оплаты — сразу спрашиваем Stripe, прошла ли оплата
  if (typeof sessionId === "string" && sessionId.startsWith("cs_")) {
    await confirmOrderPayment(sessionId).catch(() => null);
  }

  const { data: order } = await createAdminSupabase()
    .from("orders")
    .select(
      "id, status, order_type, subtotal_grosze, delivery_fee_grosze, total_grosze, scheduled_for, table_number, delivery_street, delivery_apartment, delivery_postal_code, delivery_city, order_items (dish_name, quantity, unit_price_grosze)",
    )
    .eq("id", id)
    .single();
  if (!order) notFound();

  const isPaid = order.status !== "pending_payment" && order.status !== "cancelled";

  return (
    <div className="border-glow mx-auto flex max-w-[720px] flex-col gap-5 rounded-xl p-6 md:p-10">
      {/* Оплачено — корзину больше не держим */}
      {isPaid && <ClearCart />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-base font-medium text-black/60">
          Order <span className="font-display text-black">{shortOrderId(order.id)}</span>
        </p>
        <StatusBadge status={order.status} />
      </div>
      <h2 className="font-display text-[28px] leading-[1.2] font-medium text-accent md:text-4xl">
        {order.status === "cancelled"
          ? "This order was cancelled"
          : isPaid
            ? "Payment received"
            : "Waiting for payment confirmation…"}
      </h2>

      <dl className="grid gap-x-6 gap-y-2 border-t border-bark/20 pt-4 text-base font-medium sm:grid-cols-[auto_1fr]">
        <dt className="text-black/60">How</dt>
        <dd>{ORDER_TYPE_LABELS[order.order_type]}</dd>
        {order.order_type === "dine_in" ? (
          <>
            <dt className="text-black/60">Table</dt>
            <dd>{order.table_number}</dd>
          </>
        ) : (
          order.scheduled_for && (
            <>
              <dt className="text-black/60">{order.order_type === "delivery" ? "Delivery time" : "Pickup time"}</dt>
              <dd>{formatOrderTime(order.scheduled_for)}</dd>
            </>
          )
        )}
        {order.order_type === "delivery" && (
          <>
            <dt className="text-black/60">Address</dt>
            <dd>
              {order.delivery_street}
              {order.delivery_apartment ? `, apt ${order.delivery_apartment}` : ""}, {order.delivery_postal_code}{" "}
              {order.delivery_city}
            </dd>
          </>
        )}
      </dl>

      <ul className="flex flex-col gap-2 border-t border-bark/20 pt-4 text-base font-medium">
        {order.order_items.map((item) => (
          <li key={item.dish_name} className="flex justify-between gap-4">
            <span className="text-black/70">
              {item.quantity} × {item.dish_name}
            </span>
            <span className="tabular-nums">{formatPrice(item.unit_price_grosze * item.quantity)}</span>
          </li>
        ))}
      </ul>
      {order.delivery_fee_grosze > 0 && (
        <p className="flex justify-between text-base font-medium">
          <span className="text-black/70">Delivery</span>
          <span className="tabular-nums">{formatPrice(order.delivery_fee_grosze)}</span>
        </p>
      )}
      <p className="flex justify-between border-t border-bark/20 pt-4 text-xl font-medium">
        <span>Total</span>
        <span className="font-display tabular-nums">{formatPrice(order.total_grosze)}</span>
      </p>

      {isPaid && order.status !== "completed" && (
        <p className="rounded-lg bg-bark/5 p-4 text-base leading-[1.4] font-medium text-black/70">
          Refresh this page to see the latest status of your order.
        </p>
      )}
      <ArrowLink href="/menu">Back to menu</ArrowLink>
    </div>
  );
}
