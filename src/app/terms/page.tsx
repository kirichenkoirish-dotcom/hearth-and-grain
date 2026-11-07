import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/page-placeholder";

// Личная или служебная страница — поисковикам показывать не нужно
export const metadata: Metadata = { title: "Terms & Conditions", robots: { index: false } };

export default function TermsPage() {
  return <PagePlaceholder title="Terms & Conditions" stage={9} />;
}
