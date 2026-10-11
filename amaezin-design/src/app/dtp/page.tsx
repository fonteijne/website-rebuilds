import type { Metadata } from "next";
import ServicePage from "@/components/ServicePage";
import { services } from "@/lib/content";

const service = services.find((s) => s.slug === "dtp")!;

export const metadata: Metadata = {
  title: service.metaTitle,
  description: service.metaDescription,
  alternates: { canonical: "/dtp" },
};

export default function Page() {
  return <ServicePage service={service} />;
}
