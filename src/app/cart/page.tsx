import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = { title: "Cart" };

export default function CartPage() {
  return <PagePlaceholder title="Cart" stage={4} />;
}
