import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Клиент для общедоступных данных, например меню.
// Он не читает cookies (не знает, кто вошёл на сайт), поэтому его ответы можно кэшировать.
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
}
