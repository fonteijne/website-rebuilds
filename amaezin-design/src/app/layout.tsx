import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Mono, DM_Sans } from "next/font/google";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SmoothScroll from "@/components/SmoothScroll";
import { site } from "@/lib/content";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], axes: ["opsz", "wdth"], variable: "--font-bricolage", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-dm-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  title: {
    default: "Amaezin Design — Grafisch ontwerp, huisstijl & DTP",
    template: "%s — Amaezin Design",
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: site.name,
    images: [{ url: "/images/og-banner.jpg", width: 1600, height: 917, alt: "Amaezin Design" }],
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.name,
  url: site.url,
  image: `${site.url}/images/og-banner.jpg`,
  telephone: site.phone,
  email: site.email,
  founder: { "@type": "Person", name: "Mari-Mae" },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Wijk bij Duurstede",
    addressRegion: "Utrecht",
    addressCountry: "NL",
  },
  areaServed: ["Wijk bij Duurstede", "Doorn", "Houten", "Leersum", "Nieuwegein", "Vianen"],
  sameAs: site.socials.map((s) => s.link),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl" className={`${bricolage.variable} ${dmSans.variable} ${dmMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Flag JS before paint so animated elements can start hidden without a flash. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="antialiased">
        <a
          href="#main"
          className="fixed left-4 top-4 z-[60] -translate-y-24 rounded-full bg-pink px-5 py-3 font-semibold text-ink focus:translate-y-0"
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
