import "server-only";
// ↑ Эта строка не даст случайно подключить файл в браузере: сборка сразу упадёт с ошибкой.

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Клиент с СЕКРЕТНЫМ ключом. Он работает в обход охранника RLS,
// поэтому используется только на сервере и только там, где сервер сам всё проверил:
// например, при создании заказа (цены и сумму считает сервер, а не браузер).
export function createAdminSupabase() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
