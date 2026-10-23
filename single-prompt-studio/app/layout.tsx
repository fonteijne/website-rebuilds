import type { Metadata, Viewport } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SmoothScroll from "@/components/providers/SmoothScroll";
import { site } from "@/lib/content";
import "./globals.css";

// Twee families: display/body + mono voor de prompt (vision.md: prompt ↔ resultaat).
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", display: "swap" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
  // Secundaire font: niet preloaden, zodat hij niet concurreert met de LCP-kop (Inter Tight).
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Alles kan met één prompt`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  openGraph: { type: "website", locale: "nl_NL", siteName: site.name, url: "/" },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#081215",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.name,
  url: site.url,
  email: site.email,
  description: site.description,
  slogan: site.tagline,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl" className={`${interTight.variable} ${jetbrains.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="antialiased">
        <a
          href="#main"
          className="fixed left-4 top-4 z-[60] -translate-y-24 rounded-full bg-signal px-5 py-3 font-semibold text-ink focus:translate-y-0"
        >
          Naar inhoud
        </a>
        <SmoothScroll>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
