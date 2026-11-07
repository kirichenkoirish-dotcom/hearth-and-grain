import "server-only";

import Stripe from "stripe";
import { createAdminSupabase } from "@/lib/supabase/admin";

// Клиент Stripe — только для сервера: секретный ключ (sk_test_…) лежит в STRIPE_SECRET_KEY.
let stripeClient: Stripe | undefined;

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not set");
  stripeClient ??= new Stripe(secretKey);
  return stripeClient;
}

// Отмечаем заказ оплаченным, если Stripe подтверждает оплату.
// Вызывается из двух мест — со страницы заказа (когда гость вернулся после оплаты)
// и из webhook (когда Stripe сам «звонит» серверу). Кто бы ни пришёл первым — результат одинаковый.
export async function confirmOrderPayment(sessionId: string) {
  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  const orderId = session.metadata?.order_id;
  if (!orderId || session.payment_status !== "paid") return { paid: false as const };

  const admin = createAdminSupabase();
  // Меняем только заказ, который ещё ждёт оплату, — повторный вызов ничего не испортит
  await admin
    .from("orders")
    .update({ status: "new", paid_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("stripe_checkout_session_id", sessionId)
    .eq("status", "pending_payment");

  return { paid: true as const, orderId };
}
