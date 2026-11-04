"use server";

// "use server" — эти функции (Server Actions) выполняются на сервере.
// Форма в браузере вызывает их как обычные функции, а Next.js сам передаёт данные на сервер.

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

// email — показываем поле почты; sent — письмо отправлено, показываем «Check your email»
export type LoginState =
  | { step: "email"; error?: string; email?: string }
  | { step: "sent"; email: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Отправить письмо со ссылкой для входа
export async function sendMagicLink(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    return { step: "email", email, error: "Please enter a valid email address." };
  }

  // Адрес сайта, с которого пришёл запрос (localhost или vercel.app) — туда и вернёт ссылка из письма
  const headerList = await headers();
  const origin = headerList.get("origin") ?? `https://${headerList.get("host")}`;

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback`, shouldCreateUser: true },
  });

  if (error) {
    // Самая частая причина — бесплатный Supabase отправляет лишь несколько писем в час
    const tooMany = error.status === 429 || /rate limit/i.test(error.message);
    return {
      step: "email",
      email,
      error: tooMany
        ? "Too many emails were sent just now. Please wait a few minutes and try again."
        : "We couldn’t send the email. Please try again.",
    };
  }

  return { step: "sent", email };
}

export async function signOut() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/");
}
