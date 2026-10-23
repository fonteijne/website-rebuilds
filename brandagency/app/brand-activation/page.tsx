import type { Metadata } from "next";
import ServicePage from "@/components/service/ServicePage";
import { getService } from "@/lib/content";

const service = getService("brand-activation");

export const metadata: Metadata = {
  title: service.metaTitle,
  description: service.metaDescription,
  alternates: { canonical: "/brand-activation" },
  openGraph: { title: `${service.metaTitle} - Brand Agency`, description: service.metaDescription },
};

export default function Page() {
  return <ServicePage service={service} />;
}
