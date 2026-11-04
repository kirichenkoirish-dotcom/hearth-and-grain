"use client";

// Избранные блюда того, кто вошёл. Хранятся в базе (таблица favorites),
// а здесь — их копия в браузере, чтобы сердечки на всех карточках знали, закрашены они или нет.

import { create } from "zustand";
import { getBrowserSupabase } from "@/lib/supabase/client";

type FavoritesState = {
  // unknown — ещё не проверили, вошёл ли человек; guest — не вошёл; member — вошёл
  status: "unknown" | "guest" | "member";
  dishIds: number[];
  load: () => Promise<void>;
  toggle: (dishId: number) => Promise<void>;
};

export const useFavoritesStore = create<FavoritesState>()((set, get) => ({
  status: "unknown",
  dishIds: [],

  load: async () => {
    const supabase = getBrowserSupabase();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      set({ status: "guest", dishIds: [] });
      return;
    }
    const { data } = await supabase.from("favorites").select("dish_id");
    set({ status: "member", dishIds: (data ?? []).map((row) => row.dish_id) });
  },

  // Сразу меняем сердечко на экране, а потом сохраняем в базу.
  // Если сохранить не получилось — возвращаем как было.
  toggle: async (dishId) => {
    const supabase = getBrowserSupabase();
    const wasFavorite = get().dishIds.includes(dishId);
    set((state) => ({
      dishIds: wasFavorite ? state.dishIds.filter((id) => id !== dishId) : [...state.dishIds, dishId],
    }));

    const { error } = wasFavorite
      ? await supabase.from("favorites").delete().eq("dish_id", dishId)
      : await supabase.from("favorites").insert({ dish_id: dishId });

    if (error) {
      set((state) => ({
        dishIds: wasFavorite ? [...state.dishIds, dishId] : state.dishIds.filter((id) => id !== dishId),
      }));
    }
  },
}));
