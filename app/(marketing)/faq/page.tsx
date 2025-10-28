import type { Metadata } from "next";

// GOOD: 2x .. en geen /ui/
import BrikxHeaderLanding from "@/components/BrikxHeaderLanding";
import Footer from "@/components/Footer";

import FAQClient from "./FAQClient";

export const metadata: Metadata = {
  title: "Veelgestelde vragen – Brikx",
  description:
    "Antwoorden over PvE, (ver)bouwen, vergunningen, kosten, privacy en Brikx. Gebaseerd op 20+ jaar architectervaring.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Veelgestelde vragen – Brikx",
    description:
      "Alle antwoorden over PvE, (ver)bouwen, vergunningen, kosten en privacy. Met links naar onze kennisbank.",
  },
};

export default function FAQPage() {
  return (
    <main className="bg-white">
      {/* Standaard header */}
      <BrikxHeaderLanding />

      {/* Hero (lichte Brikx-groen, niet full width) */}
      <section className="py-12">
        <div className="mx-auto max-w-[1200px] px-5">
          <div className="bg-[--color-surface-green] rounded-2xl px-8 py-10">
            <h1 className="text-4xl font-bold text-primary mb-2">Veelgestelde vragen</h1>
            <p className="text-neutral-700">
              Antwoorden over PvE, (ver)bouwen, vergunningen, kosten, privacy en Brikx — in klare taal.
            </p>
          </div>
        </div>
      </section>

      {/* Inhoud (FAQ) */}
      <section className="pb-16">
        <div className="mx-auto max-w-[1200px] px-5">
          <FAQClient />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
