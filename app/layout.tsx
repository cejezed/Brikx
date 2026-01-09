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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.brikxai.nl'),
  title: {
    default: "Brikx | Professioneel PvE Opstellen – AI-assistent voor (Ver)bouwprojecten",
    template: "%s | Brikx",
  },
  description: "Stop bouwstress met een professioneel Programma van Eisen. AI-gedreven wizard met 20+ jaar architect-ervaring helpt je bij nieuwbouw en verbouwing. Gratis starten.",
  keywords: [
    "programma van eisen",
    "pve opstellen",
    "verbouwen checklist",
    "nieuwbouw planning",
    "bouwproject voorbereiden",
    "architect inschakelen",
    "bouwbegeleiding",
    "verbouwing voorbereiden",
    "bouwkosten berekenen",
    "pve wizard",
    "programma van eisen software",
    "verbouw assistent"
  ],
  authors: [{ name: "Brikx Team" }, { name: "Jules Zwijsen", url: "https://www.zwijsen.net" }],
  creator: "Brikx",
  publisher: "Brikx",
  alternates: {
    canonical: "https://www.brikxai.nl",
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "https://www.brikxai.nl",
    title: "Brikx | Professioneel PvE Opstellen – AI-assistent voor (Ver)bouwprojecten",
    description: "Stop bouwstress met een professioneel Programma van Eisen. 20+ jaar architect-ervaring in een slimme wizard.",
    siteName: "Brikx",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Brikx - Professioneel PvE Opstellen",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Brikx | Professioneel PvE Opstellen",
    description: "Stop bouwstress. Start met een professioneel Programma van Eisen.",
    images: ["/images/twitter-image.png"],
    creator: "@brikxai",
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
  verification: {
    // Voeg hier je Google Search Console verification code toe
    // google: 'your-google-verification-code',
  },
  other: {
    'revisit-after': '7 days',
    'language': 'Dutch',
    'distribution': 'global',
    'rating': 'general',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-GH2SYBWL74"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-GH2SYBWL74');
`,
          }}
        />
      </head>
      <body className={inter.variable}>
        <RootProviders>
          {children}
        </RootProviders>
      </body>
    </html>
  );
}
