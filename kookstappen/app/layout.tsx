import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";

// Atkinson Hyperlegible: ontworpen voor maximale leesbaarheid, ook vanaf een afstandje op het aanrecht.
const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-atkinson",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kookstappen",
  description: "Maak een foto van de bereidingswijze en kook stap voor stap: één handeling per keer.",
  appleWebApp: { capable: true, title: "Kookstappen", statusBarStyle: "default" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf6ee" },
    { media: "(prefers-color-scheme: dark)", color: "#141816" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={atkinson.variable}>
      <body>{children}</body>
    </html>
  );
}
