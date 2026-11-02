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

// Одно блюдо по адресу (slug) вместе с его категорией.
// Берём из уже закэшированного меню, поэтому лишнего запроса к базе нет.
export async function getDishBySlug(slug: string) {
  const menu = await getMenu();
  for (const category of menu) {
    const dish = category.dishes.find((item) => item.slug === slug);
    if (dish) return { dish, category };
  }
  return null;
}
