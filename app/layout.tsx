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
  title: "Brikx",
  description: "Digitale (ver)bouwassistent",
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
