"use client";

// Выпадающий список статуса заказа и кнопка «Save». После сохранения — «Saved ✓».

import { useActionState } from "react";
import { updateOrderStatus, type AdminFormState } from "@/app/admin/actions";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/order-status";
import type { OrderType } from "@/config/cafe";

// По какому пути идёт заказ. «On its way» — только для доставки.
const STATUS_FLOW: OrderStatus[] = ["new", "preparing", "ready", "out_for_delivery", "completed", "cancelled"];

export function OrderStatusForm({
  orderId,
  orderType,
  status,
}: {
  orderId: string;
  orderType: OrderType;
  status: OrderStatus;
}) {
  const [state, action, isSaving] = useActionState<AdminFormState, FormData>(updateOrderStatus, {});
  const options = STATUS_FLOW.filter((option) => option !== "out_for_delivery" || orderType === "delivery");

  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="order_id" value={orderId} />
      <label htmlFor={`status-${orderId}`} className="sr-only">
        Order status
      </label>
      <select
        id={`status-${orderId}`}
        name="status"
        defaultValue={status}
        className="h-11 rounded-lg border border-black/20 bg-transparent px-3 text-base font-medium focus:border-bark focus:outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {ORDER_STATUS_LABELS[option]}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={isSaving}
        className="font-display h-11 rounded-full border border-bark/50 px-5 text-base font-medium transition-colors hover:bg-bark hover:text-white disabled:opacity-50"
      >
        {isSaving ? "Saving…" : "Save"}
      </button>
      <FormMessage state={state} isSaving={isSaving} />
    </form>
  );
}

export function FormMessage({ state, isSaving }: { state: AdminFormState; isSaving: boolean }) {
  if (isSaving) return null;
  if (state.error) {
    return (
      <p role="alert" className="text-sm font-medium text-accent">
        {state.error}
      </p>
    );
  }
  if (state.ok) {
    return (
      <p role="status" className="text-sm font-medium text-bark">
        Saved ✓
      </p>
    );
  }
  return null;
}
