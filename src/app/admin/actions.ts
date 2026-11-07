"use server";

// Server Actions админки: поменять статус заказа, цену блюда и «есть в наличии».
// Каждый раз проверяем, что это админ. RLS в базе тоже не даст изменить данные не-админу.

import { revalidatePath, updateTag } from "next/cache";
import { getAdminClient } from "@/lib/admin";
import { MENU_CACHE_TAG } from "@/lib/menu";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/order-status";

export type AdminFormState = { ok?: boolean; error?: string };

const NOT_ALLOWED = "Only the cafe admin can do this. Try signing in again.";

export async function updateOrderStatus(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const { supabase, isAdmin } = await getAdminClient();
  if (!isAdmin) return { error: NOT_ALLOWED };

  const orderId = String(formData.get("order_id") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  // «Ждёт оплаты» вручную не ставим — это делает только оплата
  if (!(status in ORDER_STATUS_LABELS) || status === "pending_payment") {
    return { error: "Choose a status from the list." };
  }

  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .not("paid_at", "is", null)
    .select("id");
  if (error || !data?.length) return { error: "Could not update the order. Refresh the page and try again." };

  revalidatePath("/admin");
  revalidatePath(`/order/${orderId}`);
  return { ok: true };
}

// Цена вводится в злотых ("14" или "14.50"), в базе хранится в грошах (1450)
const PRICE_PATTERN = /^\d{1,4}([.,]\d{1,2})?$/;

export async function updateDish(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const { supabase, isAdmin } = await getAdminClient();
  if (!isAdmin) return { error: NOT_ALLOWED };

  const dishId = Number(formData.get("dish_id"));
  const priceText = String(formData.get("price") ?? "").trim();
  if (!Number.isInteger(dishId)) return { error: "Unknown dish." };
  if (!PRICE_PATTERN.test(priceText)) return { error: "Enter a price like 14 or 14.50." };

  const priceGrosze = Math.round(Number(priceText.replace(",", ".")) * 100);
  if (priceGrosze <= 0) return { error: "The price must be more than 0 zł." };

  const { data, error } = await supabase
    .from("dishes")
    .update({ price_grosze: priceGrosze, is_available: formData.get("is_available") === "on" })
    .eq("id", dishId)
    .select("id");
  if (error || !data?.length) return { error: "Could not save the dish. Refresh the page and try again." };

  // Меню хранится в кэше — сбрасываем его, чтобы гости сразу увидели новую цену
  updateTag(MENU_CACHE_TAG);
  revalidatePath("/admin");
  return { ok: true };
}
