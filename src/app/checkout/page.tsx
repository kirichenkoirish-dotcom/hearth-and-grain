import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return <PagePlaceholder title="Checkout" stage={6} />;
}
