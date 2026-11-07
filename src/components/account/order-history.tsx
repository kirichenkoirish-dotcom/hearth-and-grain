import Link from "next/link";
import { ArrowLink } from "@/components/arrow-link";
import { formatPrice } from "@/lib/format";
import {
  ORDER_STATUS_LABELS,
  ORDER_TYPE_LABELS,
  formatOrderTime,
  isActiveStatus,
  shortOrderId,
  type OrderStatus,
} from "@/lib/order-status";
import type { OrderType } from "@/config/cafe";

export type OrderSummary = {
  id: string;
  status: OrderStatus;
  order_type: OrderType;
  total_grosze: number;
  created_at: string;
  order_items: { quantity: number }[];
};

// Список заказов в кабинете. Каждая строка ведёт на страницу заказа.
export function OrderHistory({ orders }: { orders: OrderSummary[] }) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-start gap-5">
        <p className="text-lg font-medium text-black/60">
          You haven’t ordered yet. Your orders will appear here.
        </p>
        <ArrowLink href="/menu">Explore menu</ArrowLink>
      </div>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-bark/15">
      {orders.map((order) => {
        const itemCount = order.order_items.reduce((sum, item) => sum + item.quantity, 0);
        return (
          <li key={order.id}>
            <Link
              href={`/order/${order.id}`}
              className="group flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-4 first:pt-0"
            >
              <div className="flex flex-col gap-1">
                <p className="font-display text-lg font-medium transition-colors group-hover:text-accent">
                  Order {shortOrderId(order.id)}
                </p>
                <p className="text-base font-medium text-black/60">
                  {formatOrderTime(order.created_at)} · {ORDER_TYPE_LABELS[order.order_type]} ·{" "}
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={order.status} />
                <span className="font-display text-lg font-medium tabular-nums">
                  {formatPrice(order.total_grosze)}
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const tone = isActiveStatus(status)
    ? "bg-accent/15 text-accent"
    : status === "cancelled"
      ? "bg-black/5 text-black/50"
      : "bg-bark/10 text-bark";
  return (
    <span className={`rounded-full px-3 py-1 text-sm font-semibold whitespace-nowrap ${tone}`}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
