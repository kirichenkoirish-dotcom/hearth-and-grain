import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

// Клиент Supabase для сервера, который знает, кто вошёл на сайт.
// Он читает и записывает cookie — «записку» в браузере о том, что человек вошёл.
// Используется в страницах кабинета, Server Actions и Route Handlers.
export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Из обычной страницы (Server Component) cookie менять нельзя — это нормально:
            // их обновит proxy.ts при следующем запросе.
          }
        },
      },
    },
  );
}
