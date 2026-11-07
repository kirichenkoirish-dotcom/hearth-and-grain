import "server-only";

import { createServerSupabase } from "@/lib/supabase/server";

// Кто вошёл и админ ли он. Роль берём из таблицы profiles (её нельзя поменять с сайта).
// Это проверка «на входе», а настоящую защиту данных держат правила RLS в базе.
export async function getAdminClient() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return { supabase, user: null, isAdmin: false };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return { supabase, user, isAdmin: profile?.role === "admin" };
}
