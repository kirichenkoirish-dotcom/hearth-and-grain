import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = { title: "Contact" };

export default function ContactsPage() {
  return <PagePlaceholder title="Contact" stage={9} />;
}
