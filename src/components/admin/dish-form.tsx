"use client";

// Строка блюда в админке: цена в злотых, галочка «In stock» и «Save».

import { useActionState } from "react";
import { updateDish, type AdminFormState } from "@/app/admin/actions";
import { FormMessage } from "@/components/admin/order-status-form";

export function DishForm({
  dish,
}: {
  dish: { id: number; name: string; price_grosze: number; is_available: boolean };
}) {
  const [state, action, isSaving] = useActionState<AdminFormState, FormData>(updateDish, {});

  return (
    <form action={action} className="flex flex-wrap items-center gap-x-5 gap-y-3 py-4">
      <input type="hidden" name="dish_id" value={dish.id} />
      <p className="font-display min-w-[180px] flex-1 text-lg font-medium">{dish.name}</p>

      <div className="flex items-center gap-2">
        <label htmlFor={`price-${dish.id}`} className="sr-only">
          Price of {dish.name} in zł
        </label>
        <input
          id={`price-${dish.id}`}
          name="price"
          inputMode="decimal"
          required
          defaultValue={(dish.price_grosze / 100).toFixed(2)}
          aria-invalid={Boolean(state.error)}
          className="h-11 w-24 rounded-lg border border-black/20 bg-transparent px-3 text-right text-base font-medium tabular-nums focus:border-bark focus:outline-none aria-invalid:border-accent"
        />
        <span className="text-base font-medium text-black/60">zł</span>
      </div>

      <label className="flex items-center gap-2 text-base font-medium">
        <input
          type="checkbox"
          name="is_available"
          defaultChecked={dish.is_available}
          className="size-5 accent-bark"
        />
        In stock
      </label>

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
