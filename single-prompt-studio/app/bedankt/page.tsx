import type { Metadata } from "next";
import ThanksView from "@/components/funnel/ThanksView";

export const metadata: Metadata = {
  title: "Je prompt is binnen",
  robots: { index: false, follow: false },
  alternates: { canonical: "/bedankt" },
};

export default function Page() {
  return (
    <section className="pb-24 pt-32 sm:pt-40">
      <ThanksView />
    </section>
  );
}
