"use client";

// Форма оформления заказа. Работает в браузере, потому что корзина живёт в браузере
// и форма меняется на глазах: доставка — поля адреса, столик — номер стола и т. д.
// Окончательные проверки и сумму делает сервер (createOrder).

import Link from "next/link";
import { useActionState, useState } from "react";
import { createOrder, type CheckoutState } from "@/app/checkout/actions";
import type { Address } from "@/components/account/address-book";
import { FormField, inputClass } from "@/components/account/form-field";
import { ArrowLink } from "@/components/arrow-link";
import { DELIVERY, TABLE_COUNT, isInDeliveryZone, POSTAL_CODE_PATTERN, type OrderType } from "@/config/cafe";
import { useCartHydrated, useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import type { Dish } from "@/lib/menu";
import type { Slot } from "@/lib/slots";

type Props = {
  dishes: Dish[];
  slots: { pickup: Slot[]; delivery: Slot[] };
  canOrderAtTable: boolean;
  contact: { name: string; phone: string; email: string };
  savedAddresses: Address[];
};

const ORDER_TYPES: { value: OrderType; title: string; text: string }[] = [
  { value: "delivery", title: "Delivery", text: `To your door · ${formatPrice(DELIVERY.feeGrosze)}` },
  { value: "pickup", title: "Pickup", text: "Collect at the counter · free" },
  { value: "dine_in", title: "At the table", text: "We bring it to you · free" },
];

// Сначала ждём, пока корзина прочитается из браузера, — и только потом создаём форму.
// Тогда начальные значения (например, номер столика из QR-кода) будут правильными.
export function CheckoutForm(props: Props) {
  const isHydrated = useCartHydrated();
  if (!isHydrated) {
    return <div aria-hidden="true" className="h-96 animate-pulse rounded-xl bg-bark/10" />;
  }
  return <CheckoutFormContent {...props} />;
}

function CheckoutFormContent({ dishes, slots, canOrderAtTable, contact, savedAddresses }: Props) {
  const items = useCartStore((state) => state.items);
  const savedTable = useCartStore((state) => state.tableNumber);

  const [state, action, isSubmitting] = useActionState<CheckoutState, FormData>(createOrder, {});
  const errors = state.fieldErrors ?? {};

  // Все поля «управляемые» (их значения хранит React), поэтому после ошибки ничего не стирается
  const [orderType, setOrderType] = useState<OrderType>(savedTable ? "dine_in" : "delivery");
  const [name, setName] = useState(contact.name);
  const [phone, setPhone] = useState(contact.phone);
  const [email, setEmail] = useState(contact.email);
  const [address, setAddress] = useState({
    street: "",
    apartment: "",
    postal_code: "",
    city: "Warszawa",
    notes: "",
  });
  const [table, setTable] = useState(savedTable ? String(savedTable) : "");
  const [slot, setSlot] = useState("asap");

  // Строки заказа: только блюда, которые есть в меню и в наличии
  const dishesById = new Map(dishes.map((dish) => [dish.id, dish]));
  const lines = items.flatMap((item) => {
    const dish = dishesById.get(item.dishId);
    return dish && dish.is_available ? [{ dish, quantity: item.quantity }] : [];
  });

  if (lines.length === 0) {
    return (
      <div className="border-glow mx-auto flex max-w-[720px] flex-col items-start gap-6 rounded-xl p-8 md:p-12">
        <h2 className="font-display text-2xl font-medium md:text-4xl">Your cart is empty</h2>
        <p className="text-lg font-medium text-black/60">Add something from the menu to place an order.</p>
        <ArrowLink href="/menu">Explore menu</ArrowLink>
      </div>
    );
  }

  const subtotal = lines.reduce((sum, line) => sum + line.dish.price_grosze * line.quantity, 0);
  const deliveryFee = orderType === "delivery" ? DELIVERY.feeGrosze : 0;
  const belowMinimum = orderType === "delivery" && subtotal < DELIVERY.minimumOrderGrosze;
  const dineInClosed = orderType === "dine_in" && !canOrderAtTable;
  const typeSlots = orderType === "dine_in" ? [] : slots[orderType];
  const postalChecked = POSTAL_CODE_PATTERN.test(address.postal_code);

  // Слоты по дням — для групп в выпадающем списке
  const slotsByDay = new Map<string, Slot[]>();
  typeSlots.forEach((item) => slotsByDay.set(item.dayLabel, [...(slotsByDay.get(item.dayLabel) ?? []), item]));

  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
      {/* Корзина уходит на сервер как список «блюдо + количество» */}
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      <input type="hidden" name="order_type" value={orderType} />

      <div className="flex flex-col gap-8">
        <CheckoutCard step="1" title="How would you like it?">
          <div role="radiogroup" aria-label="Order type" className="grid gap-2.5 sm:grid-cols-3">
            {ORDER_TYPES.map((type) => {
              const isSelected = orderType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setOrderType(type.value)}
                  className={`flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors ${
                    isSelected ? "border-bark bg-bark text-white" : "border-bark/40 hover:border-bark hover:bg-bark/5"
                  }`}
                >
                  <span className="font-display text-xl font-medium">{type.title}</span>
                  <span className={`text-sm font-medium ${isSelected ? "text-white/80" : "text-black/60"}`}>
                    {type.text}
                  </span>
                </button>
              );
            })}
          </div>
        </CheckoutCard>

        <CheckoutCard step="2" title="Your details">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Name" htmlFor="checkout-name" error={errors.customer_name}>
              <input
                id="checkout-name"
                name="customer_name"
                autoComplete="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                aria-invalid={Boolean(errors.customer_name)}
                className={inputClass}
              />
            </FormField>
            <FormField label="Phone" htmlFor="checkout-phone" error={errors.customer_phone}>
              <input
                id="checkout-phone"
                name="customer_phone"
                type="tel"
                autoComplete="tel"
                required
                placeholder="+48 600 000 000"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                aria-invalid={Boolean(errors.customer_phone)}
                className={inputClass}
              />
            </FormField>
          </div>
          <FormField
            label="Email"
            htmlFor="checkout-email"
            error={errors.customer_email}
            hint="We’ll send your order confirmation here."
          >
            <input
              id="checkout-email"
              name="customer_email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(errors.customer_email)}
              className={inputClass}
            />
          </FormField>
          {!contact.email && (
            <p className="text-base font-medium text-black/60">
              Have an account?{" "}
              <Link href="/login" className="text-bark underline underline-offset-4 hover:text-black">
                Sign in
              </Link>{" "}
              to fill this in automatically — or just continue as a guest.
            </p>
          )}
        </CheckoutCard>

        {orderType === "delivery" && (
          <CheckoutCard step="3" title="Delivery address">
            {savedAddresses.length > 0 && (
              <FormField label="Saved addresses" htmlFor="checkout-saved-address">
                <select
                  id="checkout-saved-address"
                  defaultValue=""
                  onChange={(event) => {
                    const saved = savedAddresses.find((item) => item.id === Number(event.target.value));
                    if (saved) {
                      setAddress({
                        street: saved.street,
                        apartment: saved.apartment ?? "",
                        postal_code: saved.postal_code,
                        city: saved.city,
                        notes: saved.notes ?? "",
                      });
                    }
                  }}
                  className={inputClass}
                >
                  <option value="">Choose a saved address…</option>
                  {savedAddresses.map((saved) => (
                    <option key={saved.id} value={saved.id}>
                      {saved.label ? `${saved.label} — ` : ""}
                      {saved.street}, {saved.postal_code}
                    </option>
                  ))}
                </select>
              </FormField>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Street and number" htmlFor="checkout-street" error={errors.street}>
                <input
                  id="checkout-street"
                  name="street"
                  autoComplete="address-line1"
                  required
                  placeholder="ul. Brzozowa 14"
                  value={address.street}
                  onChange={(event) => setAddress({ ...address, street: event.target.value })}
                  aria-invalid={Boolean(errors.street)}
                  className={inputClass}
                />
              </FormField>
              <FormField label="Apartment" htmlFor="checkout-apartment">
                <input
                  id="checkout-apartment"
                  name="apartment"
                  autoComplete="address-line2"
                  value={address.apartment}
                  onChange={(event) => setAddress({ ...address, apartment: event.target.value })}
                  className={inputClass}
                />
              </FormField>
              <FormField
                label="Postal code"
                htmlFor="checkout-postal"
                error={errors.postal_code}
                hint={
                  postalChecked
                    ? isInDeliveryZone(address.postal_code)
                      ? "✓ We deliver here"
                      : "We don’t deliver to this postal code yet"
                    : undefined
                }
              >
                <input
                  id="checkout-postal"
                  name="postal_code"
                  autoComplete="postal-code"
                  inputMode="numeric"
                  required
                  placeholder="00-950"
                  value={address.postal_code}
                  onChange={(event) => setAddress({ ...address, postal_code: event.target.value })}
                  aria-invalid={Boolean(errors.postal_code)}
                  className={inputClass}
                />
              </FormField>
              <FormField label="City" htmlFor="checkout-city">
                <input
                  id="checkout-city"
                  name="city"
                  autoComplete="address-level2"
                  value={address.city}
                  onChange={(event) => setAddress({ ...address, city: event.target.value })}
                  className={inputClass}
                />
              </FormField>
            </div>
            <FormField label="Notes for the courier" htmlFor="checkout-notes" error={errors.notes}>
              <input
                id="checkout-notes"
                name="notes"
                placeholder="Entrance from the courtyard"
                value={address.notes}
                onChange={(event) => setAddress({ ...address, notes: event.target.value })}
                className={inputClass}
              />
            </FormField>
          </CheckoutCard>
        )}

        {orderType === "dine_in" && (
          <CheckoutCard step="3" title="Your table">
            {dineInClosed && (
              <p role="alert" className="rounded-lg bg-accent/10 p-4 text-base font-medium text-accent">
                The kitchen is closed right now. Please choose pickup or delivery for later.
              </p>
            )}
            <FormField
              label="Table number"
              htmlFor="checkout-table"
              error={errors.table_number}
              hint="You’ll find it on the QR code on your table."
            >
              <select
                id="checkout-table"
                name="table_number"
                required
                value={table}
                onChange={(event) => setTable(event.target.value)}
                aria-invalid={Boolean(errors.table_number)}
                className={inputClass}
              >
                <option value="" disabled>
                  Choose your table…
                </option>
                {Array.from({ length: TABLE_COUNT }, (_, index) => index + 1).map((number) => (
                  <option key={number} value={number}>
                    Table {number}
                  </option>
                ))}
              </select>
            </FormField>
          </CheckoutCard>
        )}

        {orderType !== "dine_in" && (
          <CheckoutCard step="4" title={orderType === "delivery" ? "Delivery time" : "Pickup time"}>
            <FormField
              label="Time"
              htmlFor="checkout-slot"
              error={errors.slot}
              hint={
                orderType === "delivery"
                  ? "Times are in Warsaw time. Delivery needs at least 45 minutes."
                  : "Times are in Warsaw time. We need at least 20 minutes to prepare."
              }
            >
              <select
                id="checkout-slot"
                name="slot"
                value={slot}
                onChange={(event) => setSlot(event.target.value)}
                aria-invalid={Boolean(errors.slot)}
                className={inputClass}
              >
                {typeSlots[0] && (
                  <option value="asap">
                    As soon as possible — {typeSlots[0].dayLabel}, {typeSlots[0].timeLabel}
                  </option>
                )}
                {[...slotsByDay].map(([day, daySlots]) => (
                  <optgroup key={day} label={day}>
                    {daySlots.map((item) => (
                      <option key={item.iso} value={item.iso}>
                        {day}, {item.timeLabel}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </FormField>
          </CheckoutCard>
        )}
      </div>

      <aside
        aria-label="Order summary"
        className="border-glow flex flex-col gap-5 rounded-xl p-6 md:p-8 lg:sticky lg:top-[110px]"
      >
        <h2 className="font-display text-2xl leading-[1.2] font-medium tracking-[-0.24px]">Your order</h2>

        <ul className="flex flex-col gap-2 text-base font-medium">
          {lines.map(({ dish, quantity }) => (
            <li key={dish.id} className="flex justify-between gap-4">
              <span className="text-black/70">
                {quantity} × {dish.name}
              </span>
              <span className="tabular-nums whitespace-nowrap">{formatPrice(dish.price_grosze * quantity)}</span>
            </li>
          ))}
        </ul>

        <dl className="flex flex-col gap-2 border-t border-bark/20 pt-4 text-lg font-medium">
          <div className="flex justify-between">
            <dt className="text-black/60">Subtotal</dt>
            <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
          </div>
          {orderType === "delivery" && (
            <div className="flex justify-between">
              <dt className="text-black/60">Delivery</dt>
              <dd className="tabular-nums">{formatPrice(deliveryFee)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-bark/20 pt-3 text-xl">
            <dt>Total</dt>
            <dd className="font-display tabular-nums">{formatPrice(subtotal + deliveryFee)}</dd>
          </div>
        </dl>

        {belowMinimum && (
          <p className="rounded-lg bg-accent/10 p-4 text-base font-medium text-accent">
            Delivery starts from {formatPrice(DELIVERY.minimumOrderGrosze)} — add{" "}
            {formatPrice(DELIVERY.minimumOrderGrosze - subtotal)} more, or choose pickup.
          </p>
        )}

        {state.error && (
          <p role="alert" className="rounded-lg bg-accent/10 p-4 text-base font-medium text-accent">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || belowMinimum || dineInClosed}
          className="btn-roast font-display rounded-full px-[30px] py-[15px] text-base leading-none font-medium tracking-[0.32px]"
        >
          {isSubmitting ? "Opening secure payment…" : `Pay ${formatPrice(subtotal + deliveryFee)}`}
        </button>
        <Link href="/cart" className="self-center text-base font-medium text-black/60 hover:text-black">
          ← Back to cart
        </Link>
      </aside>
    </form>
  );
}

function CheckoutCard({ step, title, children }: { step: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-glow flex flex-col gap-5 rounded-xl p-6 md:p-8">
      <h2 className="font-display flex items-center gap-3 text-2xl leading-[1.2] font-medium tracking-[-0.24px] md:text-[28px]">
        <span
          aria-hidden="true"
          className="flex size-9 items-center justify-center rounded-full bg-bark text-base text-white"
        >
          {step}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}
