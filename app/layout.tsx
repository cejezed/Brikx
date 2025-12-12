// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import RootProviders from "@/app/providers";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.brikx.nl'),
  title: {
    default: "Brikx | Uw Digitale (Ver)bouwassistent",
    template: "%s | Brikx",
  },
  description: "De slimme assistent voor elk (ver)bouwproject. Van kavel tot sleuteloverdracht, Brikx helpt u met checklists, budgettering en bouwbegeleiding.",
  keywords: ["verbouwen", "nieuwbouw", "bouwkavel", "bouwbegeleiding", "bouwadvies", "checklist verbouwen", "bouwkosten"],
  authors: [{ name: "Brikx Team" }],
  creator: "Brikx",
  publisher: "Brikx",
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "/",
    title: "Brikx | Uw Digitale (Ver)bouwassistent",
    description: "De slimme assistent voor elk (ver)bouwproject. Beheer uw bouwproces van A tot Z.",
    siteName: "Brikx",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brikx | Uw Digitale (Ver)bouwassistent",
    description: "De slimme assistent voor elk (ver)bouwproject.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className={inter.variable}>
        <RootProviders>
          {children}
        </RootProviders>
      </body>
    </html>
  );
}
