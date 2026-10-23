import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/providers/SmoothScroll";
import PageTransition from "@/components/providers/PageTransition";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsApp from "@/components/layout/WhatsApp";
import Cursor from "@/components/fx/Cursor";
import NoiseLayer from "@/components/fx/NoiseLayer";
import { site } from "@/lib/content";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  title: {
    default: "Brand Agency - Brand Activation - Shopper & Retail Activation",
    template: "%s - Brand Agency",
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: site.name,
    title: "Brand Agency - Brand Activation - Shopper & Retail Activation",
    description: site.description,
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MarketingAgency",
  name: site.name,
  url: site.url,
  email: site.email,
  telephone: "+31306336003",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Molenvliet 17",
    postalCode: "3961 MT",
    addressLocality: "Wijk bij Duurstede",
    addressCountry: "NL",
  },
  sameAs: site.socials.map((s) => s.href),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={montserrat.variable} suppressHydrationWarning>
      <head>
        {/* Markeer dat JS draait, zodat te-onthullen elementen pas na hydratie verschijnen. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="min-h-dvh bg-black font-sans text-paper">
        <a
          href="#main"
          className="sr-only z-[200] rounded bg-pink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Naar de inhoud
        </a>
        <SmoothScroll>
          <PageTransition>
            <Header />
            <main id="main">{children}</main>
            <Footer />
            <WhatsApp />
          </PageTransition>
        </SmoothScroll>
        <Cursor />
        <NoiseLayer />
      </body>
    </html>
  );
}
