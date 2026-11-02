import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

// Тег кэша меню. Когда админ поменяет блюдо (этап 8), сбросим кэш по этому тегу.
export const MENU_CACHE_TAG = "menu";

const DISH_FIELDS = "id, name, slug, description, price_grosze, image_url, is_available";

// Все категории с блюдами, в порядке sort_order
export async function getMenu() {
  "use cache";
  cacheTag(MENU_CACHE_TAG);
  cacheLife("hours");

  const { data, error } = await createPublicClient()
    .from("categories")
    .select(`id, name, slug, dishes (${DISH_FIELDS})`)
    .order("sort_order")
    .order("sort_order", { referencedTable: "dishes" });

  if (error) throw new Error(`Could not load the menu: ${error.message}`);
  return data;
}

export type MenuCategory = Awaited<ReturnType<typeof getMenu>>[number];
export type Dish = MenuCategory["dishes"][number];
