import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

// Клиент Supabase для браузера. Он видит тот же вход, что и сервер (через cookie),
// поэтому может читать и менять данные именно этого человека — например, избранное.
// Охранник RLS в базе не даст тронуть чужое.
let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function getBrowserSupabase() {
  browserClient ??= createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
  return browserClient;
}
