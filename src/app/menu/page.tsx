import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = { title: "Our Menu" };

export default function MenuPage() {
  return <PagePlaceholder title="Our Menu" stage={3} />;
}
