import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/cafe";
import { getMenu } from "@/lib/menu";

// sitemap.xml — список открытых страниц сайта для поисковиков: главная, меню, каждое блюдо, контакты
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const menu = await getMenu();
  const dishes = menu.flatMap((category) => category.dishes);

  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/menu`, changeFrequency: "weekly", priority: 0.9 },
    ...dishes.map((dish) => ({
      url: `${SITE_URL}/menu/${dish.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    { url: `${SITE_URL}/contacts`, changeFrequency: "yearly", priority: 0.5 },
  ];
}
