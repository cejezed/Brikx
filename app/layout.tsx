// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import RootProviders from "@/app/providers";

export const metadata: Metadata = {
  title: "Brikx",
  description: "Digitale (ver)bouwassistent",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>
        <RootProviders>
          {children}
        </RootProviders>
      </body>
    </html>
  );
}
