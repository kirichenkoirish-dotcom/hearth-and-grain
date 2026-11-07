import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/page-placeholder";

// Личная или служебная страница — поисковикам показывать не нужно
export const metadata: Metadata = { title: "Privacy Policy", robots: { index: false } };

export default function PrivacyPage() {
  return <PagePlaceholder title="Privacy Policy" stage={9} />;
}
