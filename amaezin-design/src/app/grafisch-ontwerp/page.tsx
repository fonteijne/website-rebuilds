import type { Metadata } from "next";
import ServicePage from "@/components/ServicePage";
import { services } from "@/lib/content";

const service = services.find((s) => s.slug === "grafisch-ontwerp")!;

export const metadata: Metadata = {
  title: service.metaTitle,
  description: service.metaDescription,
  alternates: { canonical: "/grafisch-ontwerp" },
};

export default function Page() {
  return <ServicePage service={service} />;
}
