import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { StatusBadge } from "@/components/account/order-history";
import { DishForm } from "@/components/admin/dish-form";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { PageHero } from "@/components/page-hero";
import { getAdminClient } from "@/lib/admin";
import { formatPrice } from "@/lib/format";
import { ORDER_TYPE_LABELS, formatOrderTime, isActiveStatus, shortOrderId } from "@/lib/order-status";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

// Админка кафе: заказы со сменой статуса и блюда (цена, «есть в наличии»).
// Фото блюд и заявки на бронь пока меняем в панели Supabase.
export default function AdminPage() {
  return (
    <>
      <PageHero
        image="/images/account-hero.jpg"
        imageAlt="Laptop, notebook, latte and a croissant on a cafe table"
        eyebrow="Admin"
        title="Cafe admin"
        textWidth="max-w-[420px]"
      >
        Orders and the menu — change a status, a price or mark a dish as sold out.
      </PageHero>

      <section className="mx-auto max-w-[1440px] px-4 pt-10 pb-24 md:px-10 lg:pt-[120px]">
        <Suspense fallback={<div aria-hidden="true" className="h-96 animate-pulse rounded-xl bg-bark/10" />}>
          <AdminContent />
        </Suspense>
      </section>
    </>
  );
}

async function AdminContent() {
  await connection();
  const { supabase, user, isAdmin } = await getAdminClient();
  if (!user) redirect("/login");
  // Не админ — делаем вид, что такой страницы нет
  if (!isAdmin) notFound();

  const [{ data: orders }, { data: categories }] = await Promise.all([
    // Только оплаченные заказы, свежие сверху. Админ по правилам RLS видит заказы всех гостей.
    supabase
      .from("orders")
      .select(
        "id, status, order_type, total_grosze, created_at, scheduled_for, table_number, customer_name, customer_phone, delivery_street, delivery_apartment, delivery_postal_code, order_items (dish_name, quantity)",
      )
      .not("paid_at", "is", null)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("categories")
      .select("id, name, dishes (id, name, price_grosze, is_available)")
      .order("sort_order")
      .order("sort_order", { referencedTable: "dishes" }),
  ]);

  const activeCount = (orders ?? []).filter((order) => isActiveStatus(order.status)).length;

  return (
    <div className="flex flex-col gap-8">
      <nav aria-label="Admin sections" className="flex flex-wrap gap-3">
        <a href="#orders" className="rounded-full bg-bark px-5 py-2 text-base font-medium text-white">
          Orders{activeCount > 0 && ` · ${activeCount} active`}
        </a>
        <a href="#dishes" className="rounded-full border border-bark/50 px-5 py-2 text-base font-medium">
          Dishes
        </a>
      </nav>

      <AdminCard id="orders" title="Orders" glowAngle="45deg">
        {!orders?.length ? (
          <p className="text-lg font-medium text-black/60">No paid orders yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-bark/15">
            {orders.map((order) => (
              <li key={order.id} className="flex flex-col gap-3 py-5 first:pt-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Link
                    href={`/order/${order.id}`}
                    className="font-display text-lg font-medium underline-offset-4 hover:text-accent hover:underline"
                  >
                    Order {shortOrderId(order.id)}
                  </Link>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    <span className="font-display text-lg font-medium tabular-nums">
                      {formatPrice(order.total_grosze)}
                    </span>
                  </div>
                </div>
                <p className="text-base font-medium text-black/70">
                  {ORDER_TYPE_LABELS[order.order_type]}
                  {order.order_type === "dine_in"
                    ? ` · table ${order.table_number}`
                    : order.scheduled_for && ` · for ${formatOrderTime(order.scheduled_for)}`}
                  {order.order_type === "delivery" &&
                    ` · ${order.delivery_street}${order.delivery_apartment ? `, apt ${order.delivery_apartment}` : ""}, ${order.delivery_postal_code}`}
                </p>
                <p className="text-base font-medium text-black/70">
                  {order.customer_name} ·{" "}
                  <a href={`tel:${order.customer_phone}`} className="underline-offset-4 hover:underline">
                    {order.customer_phone}
                  </a>{" "}
                  · ordered {formatOrderTime(order.created_at)}
                </p>
                <p className="text-base font-medium">
                  {order.order_items.map((item) => `${item.quantity} × ${item.dish_name}`).join(", ")}
                </p>
                <OrderStatusForm orderId={order.id} orderType={order.order_type} status={order.status} />
              </li>
            ))}
          </ul>
        )}
      </AdminCard>

      <AdminCard id="dishes" title="Dishes" glowAngle="225deg">
        <p className="text-base font-medium text-black/60">
          Untick “In stock” to show a dish as sold out — guests won’t be able to order it. Photos and
          descriptions are edited in the Supabase dashboard.
        </p>
        {(categories ?? []).map((category) => (
          <div key={category.id} className="flex flex-col">
            <h3 className="font-display text-xl font-medium text-black/60">{category.name}</h3>
            <div className="flex flex-col divide-y divide-bark/15">
              {category.dishes.map((dish) => (
                <DishForm key={dish.id} dish={dish} />
              ))}
            </div>
          </div>
        ))}
      </AdminCard>
    </div>
  );
}

function AdminCard({
  id,
  title,
  glowAngle,
  children,
}: {
  id: string;
  title: string;
  glowAngle: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      style={{ "--glow-angle": glowAngle } as React.CSSProperties}
      className="border-glow flex scroll-mt-[110px] flex-col gap-6 rounded-xl p-6 md:p-10"
    >
      <h2 className="font-display text-[28px] leading-[1.2] font-medium tracking-[-0.36px] text-accent md:text-4xl">
        {title}
      </h2>
      {children}
    </section>
  );
}
