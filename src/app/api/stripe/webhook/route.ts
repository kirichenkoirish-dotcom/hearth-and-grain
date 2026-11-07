import type Stripe from "stripe";
import { NextResponse, type NextRequest } from "next/server";
import { confirmOrderPayment, getStripe } from "@/lib/stripe";
import { createAdminSupabase } from "@/lib/supabase/admin";

// Webhook — «звонок от Stripe». Stripe сам сообщает серверу, что оплата прошла
// (даже если гость закрыл вкладку сразу после оплаты).
// Подпись (stripe-signature) доказывает, что звонит именно Stripe, а не кто-то другой.
export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    // Проверять подпись нужно по «сырому» тексту запроса, поэтому читаем его как text()
    event = getStripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    // Оплата прошла сразу (карта) или чуть позже (некоторые способы, например BLIK)
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await confirmOrderPayment(event.data.object.id);
      break;

    // Ссылка на оплату истекла или оплата не прошла — отменяем заказ, который так и не оплатили
    case "checkout.session.expired":
    case "checkout.session.async_payment_failed": {
      const orderId = event.data.object.metadata?.order_id;
      if (orderId) {
        await createAdminSupabase()
          .from("orders")
          .update({ status: "cancelled" })
          .eq("id", orderId)
          .eq("status", "pending_payment");
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
