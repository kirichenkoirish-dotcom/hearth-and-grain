import { CAFE, type OrderType } from "@/config/cafe";
import type { Database } from "@/lib/supabase/database.types";

export type OrderStatus = Database["public"]["Enums"]["order_status"];

// Как статус заказа видит гость
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Waiting for payment",
  new: "Received",
  preparing: "Being prepared",
  ready: "Ready",
  out_for_delivery: "On its way",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  delivery: "Delivery",
  pickup: "Pickup",
  dine_in: "At the table",
};

// Заказ ещё «в работе» — такие статусы подсвечиваем ярче
export function isActiveStatus(status: OrderStatus) {
  return status === "new" || status === "preparing" || status === "ready" || status === "out_for_delivery";
}

// Короткий номер заказа: первые 8 символов длинного кода
export function shortOrderId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

// Дата и время по Варшаве: "Sat 7 Nov, 2:30 PM" (AM/PM большими буквами, как везде на сайте)
export function formatOrderTime(iso: string) {
  const formatted = new Intl.DateTimeFormat("en-GB", {
    timeZone: CAFE.timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
  return formatted.replace(/\b(am|pm)\b/, (period) => period.toUpperCase());
}
