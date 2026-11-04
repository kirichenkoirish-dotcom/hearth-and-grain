"use server";

// Server Actions личного кабинета: сохранить имя и телефон, добавить / изменить / удалить адрес.
// Каждый раз проверяем, кто вошёл. А охранник RLS в базе дополнительно следит,
// чтобы человек мог менять только свои данные.

import { revalidatePath } from "next/cache";
import { POSTAL_CODE_PATTERN } from "@/config/cafe";
import { createServerSupabase } from "@/lib/supabase/server";

// values — то, что человек ввёл. После отправки React очищает форму,
// поэтому при ошибке возвращаем введённое, чтобы подставить обратно.
export type FormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

// Все текстовые поля формы — чтобы вернуть их при ошибке
function submittedValues(formData: FormData) {
  return Object.fromEntries(
    [...formData.entries()].filter(([, value]) => typeof value === "string"),
  ) as Record<string, string>;
}

// Телефон: цифры, пробелы, плюс, скобки и дефисы, от 7 до 20 символов
const PHONE_PATTERN = /^\+?[\d\s()-]{7,20}$/;

function text(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

async function getSignedInClient() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data.user };
}

export async function updateProfile(_previous: FormState, formData: FormData): Promise<FormState> {
  const fullName = text(formData, "full_name");
  const phone = text(formData, "phone");

  const fieldErrors: Record<string, string> = {};
  if (fullName.length > 80) fieldErrors.full_name = "The name is too long.";
  if (phone && !PHONE_PATTERN.test(phone)) fieldErrors.phone = "Please enter a valid phone number.";
  const values = submittedValues(formData);
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors, values };

  const { supabase, user } = await getSignedInClient();
  if (!user) return { error: "Please sign in again.", values };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName || null, phone: phone || null })
    .eq("id", user.id);

  if (error) return { error: "We couldn’t save your details. Please try again.", values };

  revalidatePath("/account");
  return { ok: true };
}

// Общая проверка полей адреса
function readAddress(formData: FormData) {
  const address = {
    label: text(formData, "label") || null,
    street: text(formData, "street"),
    apartment: text(formData, "apartment") || null,
    postal_code: text(formData, "postal_code"),
    city: text(formData, "city") || "Warszawa",
    notes: text(formData, "notes") || null,
  };

  const fieldErrors: Record<string, string> = {};
  if (!address.street) fieldErrors.street = "Please enter the street and building number.";
  if (!POSTAL_CODE_PATTERN.test(address.postal_code)) {
    fieldErrors.postal_code = "Use the format 00-000.";
  }
  if ((address.notes ?? "").length > 200) fieldErrors.notes = "Please keep notes under 200 characters.";

  return { address, fieldErrors };
}

export async function saveAddress(_previous: FormState, formData: FormData): Promise<FormState> {
  const { address, fieldErrors } = readAddress(formData);
  const values = submittedValues(formData);
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors, values };

  const { supabase, user } = await getSignedInClient();
  if (!user) return { error: "Please sign in again.", values };

  // Есть id — меняем существующий адрес, нет — добавляем новый
  const id = Number(formData.get("id"));
  const { error } = id
    ? await supabase.from("addresses").update(address).eq("id", id)
    : await supabase.from("addresses").insert(address);

  if (error) return { error: "We couldn’t save the address. Please try again.", values };

  revalidatePath("/account");
  return { ok: true };
}

export async function deleteAddress(formData: FormData) {
  const id = Number(formData.get("id"));
  const { supabase, user } = await getSignedInClient();
  if (!user || !id) return;

  await supabase.from("addresses").delete().eq("id", id);
  revalidatePath("/account");
}
