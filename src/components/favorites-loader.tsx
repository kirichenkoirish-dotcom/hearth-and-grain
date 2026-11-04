"use client";

import { useEffect } from "react";
import { useFavoritesStore } from "@/lib/favorites-store";
import { getBrowserSupabase } from "@/lib/supabase/client";

// Загружает избранное после открытия сайта и обновляет его,
// когда человек входит или выходит. Ничего не рисует — просто стоит в layout.tsx.
export function FavoritesLoader() {
  useEffect(() => {
    const { load } = useFavoritesStore.getState();
    load();
    const { data } = getBrowserSupabase().auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") load();
    });
    return () => data.subscription.unsubscribe();
  }, []);
  return null;
}
