"use server";

// Оформление заказа. Сервер НИЧЕМУ из браузера не доверяет:
// цены берёт из базы, сам считает сумму, проверяет зону доставки, минимум и время.

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  DELIVERY,
  MAX_QUANTITY_PER_DISH,
  POSTAL_CODE_PATTERN,
  TABLE_COUNT,
  isInDeliveryZone,
  type OrderType,
} from "@/config/cafe";
import { canOrderAtTableNow, getAvailableSlots } from "@/lib/slots";
import { getStripe } from "@/lib/stripe";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";

export type CheckoutState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[\d\s()-]{7,20}$/;

function text(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

// Корзина приходит из браузера как список «блюдо + количество». Проверяем каждую строку.
function readCartItems(raw: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed)) return null;

  const quantities = new Map<number, number>();
  for (const item of parsed) {
    const dishId = Number(item?.dishId);
    const quantity = Number(item?.quantity);
    if (!Number.isInteger(dishId) || !Number.isInteger(quantity) || quantity < 1) return null;
    quantities.set(dishId, Math.min((quantities.get(dishId) ?? 0) + quantity, MAX_QUANTITY_PER_DISH));
  }
  return quantities.size > 0 ? quantities : null;
}

export async function createOrder(_previous: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const orderType = text(formData, "order_type") as OrderType;
  if (!["delivery", "pickup", "dine_in"].includes(orderType)) {
    return { error: "Please choose delivery, pickup or dine-in." };
  }

  const quantities = readCartItems(text(formData, "items"));
  if (!quantities) return { error: "Your cart is empty." };

  const fieldErrors: Record<string, string> = {};

  // Контакты
  const name = text(formData, "customer_name");
  const phone = text(formData, "customer_phone");
  const email = text(formData, "customer_email").toLowerCase();
  if (!name || name.length > 80) fieldErrors.customer_name = "Please enter your name.";
  if (!PHONE_PATTERN.test(phone)) fieldErrors.customer_phone = "Please enter a valid phone number.";
  if (!EMAIL_PATTERN.test(email)) fieldErrors.customer_email = "Please enter a valid email address.";

  // Адрес — только для доставки
  const address = {
    street: text(formData, "street"),
    apartment: text(formData, "apartment"),
    postalCode: text(formData, "postal_code"),
    city: text(formData, "city") || "Warszawa",
    notes: text(formData, "notes"),
  };
  if (orderType === "delivery") {
    if (!address.street) fieldErrors.street = "Please enter the street and building number.";
    if (!POSTAL_CODE_PATTERN.test(address.postalCode)) {
      fieldErrors.postal_code = "Use the format 00-000.";
    } else if (!isInDeliveryZone(address.postalCode)) {
      fieldErrors.postal_code = "Sorry, we don’t deliver to this postal code yet. Pickup is always available.";
    }
    if (address.notes.length > 200) fieldErrors.notes = "Please keep notes under 200 characters.";
  }

  // Столик — только для заказа на месте
  const tableNumber = Number(text(formData, "table_number"));
  if (orderType === "dine_in") {
    if (!Number.isInteger(tableNumber) || tableNumber < 1 || tableNumber > TABLE_COUNT) {
      fieldErrors.table_number = `Please choose a table from 1 to ${TABLE_COUNT}.`;
    }
    if (!canOrderAtTableNow()) {
      return { error: "The kitchen is closed right now. Please choose pickup or delivery for later." };
    }
  }

  // Время. Список свободных слотов считаем заново на сервере и проверяем, что выбранный в нём есть.
  let scheduledFor: string | null = null;
  if (orderType !== "dine_in") {
    const slots = getAvailableSlots(orderType);
    const chosen = text(formData, "slot");
    const slot = chosen === "asap" ? slots[0] : slots.find((item) => item.iso === chosen);
    if (!slot) {
      fieldErrors.slot = "This time is no longer available. Please pick another one.";
    } else {
      scheduledFor = slot.iso;
    }
  }

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  // Цены — только из базы
  const admin = createAdminSupabase();
  const { data: dishes, error: dishesError } = await admin
    .from("dishes")
    .select("id, name, price_grosze, is_available")
    .in("id", [...quantities.keys()]);
  if (dishesError) return { error: "We couldn’t check the menu. Please try again." };

  const lines = [...quantities].map(([dishId, quantity]) => {
    const dish = dishes?.find((item) => item.id === dishId);
    return { dish, quantity };
  });
  if (lines.some((line) => !line.dish || !line.dish.is_available)) {
    return { error: "Some dishes in your cart are no longer available. Please check your cart." };
  }

  const subtotal = lines.reduce((sum, line) => sum + line.dish!.price_grosze * line.quantity, 0);
  if (orderType === "delivery" && subtotal < DELIVERY.minimumOrderGrosze) {
    return { error: "The minimum order for delivery is 40.00 zł. Add a little more, or choose pickup." };
  }
  const deliveryFee = orderType === "delivery" ? DELIVERY.feeGrosze : 0;

  // Если человек вошёл — привязываем заказ к нему, чтобы он появился в истории
  const supabase = await createServerSupabase();
  const { data: userData } = await supabase.auth.getUser();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: userData.user?.id ?? null,
      order_type: orderType,
      customer_name: name,
      customer_phone: phone,
      customer_email: email,
      delivery_street: orderType === "delivery" ? address.street : null,
      delivery_apartment: orderType === "delivery" ? address.apartment || null : null,
      delivery_postal_code: orderType === "delivery" ? address.postalCode : null,
      delivery_city: orderType === "delivery" ? address.city : null,
      delivery_notes: orderType === "delivery" ? address.notes || null : null,
      table_number: orderType === "dine_in" ? tableNumber : null,
      scheduled_for: scheduledFor,
      subtotal_grosze: subtotal,
      delivery_fee_grosze: deliveryFee,
      total_grosze: subtotal + deliveryFee,
    })
    .select("id")
    .single();
  if (orderError || !order) return { error: "We couldn’t save your order. Please try again." };

  const { error: itemsError } = await admin.from("order_items").insert(
    lines.map((line) => ({
      order_id: order.id,
      dish_id: line.dish!.id,
      dish_name: line.dish!.name,
      unit_price_grosze: line.dish!.price_grosze,
      quantity: line.quantity,
    })),
  );
  if (itemsError) {
    // Не оставляем «пустой» заказ без блюд
    await admin.from("orders").delete().eq("id", order.id);
    return { error: "We couldn’t save your order. Please try again." };
  }

  // Страница оплаты Stripe. Цены передаём те, что посчитал сервер.
  const headerList = await headers();
  const origin = headerList.get("origin") ?? `https://${headerList.get("host")}`;

  let paymentUrl: string | null = null;
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      currency: "pln",
      locale: "en",
      customer_email: email,
      client_reference_id: order.id,
      metadata: { order_id: order.id },
      line_items: [
        ...lines.map((line) => ({
          quantity: line.quantity,
          price_data: {
            currency: "pln",
            unit_amount: line.dish!.price_grosze,
            product_data: { name: line.dish!.name },
          },
        })),
        ...(deliveryFee > 0
          ? [
              {
                quantity: 1,
                price_data: { currency: "pln", unit_amount: deliveryFee, product_data: { name: "Delivery" } },
              },
            ]
          : []),
      ],
      // Ссылка на оплату действует 30 минут — потом заказ можно оформить заново
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      // {CHECKOUT_SESSION_ID} Stripe сам заменит на номер оплаты
      success_url: `${origin}/order/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?canceled=1`,
    });

    await admin.from("orders").update({ stripe_checkout_session_id: session.id }).eq("id", order.id);
    paymentUrl = session.url;
  } catch {
    paymentUrl = null;
  }

  if (!paymentUrl) {
    await admin.from("orders").update({ status: "cancelled" }).eq("id", order.id);
    return { error: "We couldn’t open the payment page. Please try again in a moment." };
  }

  // Переход на страницу оплаты Stripe (redirect работает только вне try/catch)
  redirect(paymentUrl);
}
