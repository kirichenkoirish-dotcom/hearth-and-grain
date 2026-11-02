import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = { title: "About Us" };

export default function AboutPage() {
  return <PagePlaceholder title="About Us" stage={9} />;
}
