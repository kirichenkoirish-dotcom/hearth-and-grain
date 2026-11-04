"use client";

// «Saved addresses»: список адресов, добавление, изменение и удаление.

import { useActionState, useEffect, useState } from "react";
import { deleteAddress, saveAddress, type FormState } from "@/app/account/actions";
import { FormField, inputClass } from "@/components/account/form-field";
import { isInDeliveryZone } from "@/config/cafe";
import type { Database } from "@/lib/supabase/database.types";

export type Address = Database["public"]["Tables"]["addresses"]["Row"];

export function AddressBook({ addresses }: { addresses: Address[] }) {
  // Какой адрес сейчас редактируем: id, "new" — новый, null — никакой
  const [editing, setEditing] = useState<number | "new" | null>(null);

  return (
    <div className="flex flex-col gap-4">
      {addresses.length === 0 && editing !== "new" && (
        <p className="text-lg font-medium text-black/60">
          No saved addresses yet. Add one to check out faster next time.
        </p>
      )}

      <ul className="flex flex-col gap-2.5">
        {addresses.map((address) =>
          editing === address.id ? (
            <li key={address.id}>
              <AddressForm address={address} onDone={() => setEditing(null)} />
            </li>
          ) : (
            <li key={address.id}>
              <AddressCard address={address} onEdit={() => setEditing(address.id)} />
            </li>
          ),
        )}
      </ul>

      {editing === "new" ? (
        <AddressForm onDone={() => setEditing(null)} />
      ) : (
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="font-display self-start rounded-full border border-bark/50 px-6 py-3 text-base font-medium transition-colors hover:bg-bark hover:text-white"
        >
          + Add address
        </button>
      )}
    </div>
  );
}

function AddressCard({ address, onEdit }: { address: Address; onEdit: () => void }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const delivers = isInDeliveryZone(address.postal_code);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-bark/30 p-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-display text-xl font-medium">{address.label || "Address"}</p>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              delivers ? "bg-bark/10 text-bark" : "bg-accent/10 text-accent"
            }`}
          >
            {delivers ? "We deliver here" : "Outside delivery area"}
          </span>
        </div>
        <p className="mt-1 text-base font-medium text-black/70">
          {address.street}
          {address.apartment && `, apt ${address.apartment}`}
        </p>
        <p className="text-base font-medium text-black/70">
          {address.postal_code} {address.city}
        </p>
        {address.notes && <p className="mt-1 text-sm font-medium text-black/50">{address.notes}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {confirmingDelete ? (
          <form action={deleteAddress} className="flex items-center gap-2">
            <input type="hidden" name="id" value={address.id} />
            <span className="text-sm font-medium text-black/60">Delete?</span>
            <button
              type="submit"
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Yes, delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="rounded-full px-3 py-2 text-sm font-medium text-black/60 hover:text-black"
            >
              Cancel
            </button>
          </form>
        ) : (
          <>
            <button
              type="button"
              onClick={onEdit}
              className="rounded-full px-4 py-2 text-sm font-semibold text-bark hover:bg-bark/10"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="rounded-full px-4 py-2 text-sm font-semibold text-black/50 hover:bg-bark/10 hover:text-black"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function AddressForm({ address, onDone }: { address?: Address; onDone: () => void }) {
  const [state, action, isSaving] = useActionState<FormState, FormData>(saveAddress, {});
  const errors = state.fieldErrors ?? {};
  // После ошибки подставляем то, что человек уже ввёл
  const values = state.values ?? {};
  const prefix = address ? `address-${address.id}` : "address-new";

  // Сохранилось — закрываем форму
  useEffect(() => {
    if (state.ok) onDone();
  }, [state.ok, onDone]);

  return (
    <form action={action} className="flex flex-col gap-4 rounded-xl border border-bark/50 bg-bark/5 p-5">
      {address && <input type="hidden" name="id" value={address.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Label" htmlFor={`${prefix}-label`} hint="For example, Home or Work">
          <input
            id={`${prefix}-label`}
            name="label"
            defaultValue={values.label ?? address?.label ?? ""}
            placeholder="Home"
            className={inputClass}
          />
        </FormField>
        <FormField label="Street and number" htmlFor={`${prefix}-street`} error={errors.street}>
          <input
            id={`${prefix}-street`}
            name="street"
            autoComplete="address-line1"
            required
            defaultValue={values.street ?? address?.street ?? ""}
            placeholder="ul. Brzozowa 14"
            aria-invalid={Boolean(errors.street)}
            className={inputClass}
          />
        </FormField>
        <FormField label="Apartment" htmlFor={`${prefix}-apartment`}>
          <input
            id={`${prefix}-apartment`}
            name="apartment"
            autoComplete="address-line2"
            defaultValue={values.apartment ?? address?.apartment ?? ""}
            placeholder="12"
            className={inputClass}
          />
        </FormField>
        <FormField label="Postal code" htmlFor={`${prefix}-postal`} error={errors.postal_code}>
          <input
            id={`${prefix}-postal`}
            name="postal_code"
            autoComplete="postal-code"
            inputMode="numeric"
            required
            defaultValue={values.postal_code ?? address?.postal_code ?? ""}
            placeholder="00-950"
            aria-invalid={Boolean(errors.postal_code)}
            className={inputClass}
          />
        </FormField>
        <FormField label="City" htmlFor={`${prefix}-city`}>
          <input
            id={`${prefix}-city`}
            name="city"
            autoComplete="address-level2"
            defaultValue={values.city ?? address?.city ?? "Warszawa"}
            className={inputClass}
          />
        </FormField>
        <FormField label="Notes for the courier" htmlFor={`${prefix}-notes`} error={errors.notes}>
          <input
            id={`${prefix}-notes`}
            name="notes"
            defaultValue={values.notes ?? address?.notes ?? ""}
            placeholder="Entrance from the courtyard"
            className={inputClass}
          />
        </FormField>
      </div>

      {state.error && (
        <p role="alert" className="text-base font-medium text-accent">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="btn-roast font-display rounded-full px-[30px] py-3 text-base leading-none font-medium tracking-[0.32px]"
        >
          {isSaving ? "Saving…" : "Save address"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="font-display rounded-full px-6 py-3 text-base font-medium text-black/60 hover:text-black"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
