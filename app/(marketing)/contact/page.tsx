// app/(marketing)/contact/page.tsx
import type { Metadata } from "next";
import {
  MessageSquare,
  UserRound,
  Calendar,
  Info,
  Mail,
  Linkedin,
  Instagram,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BrikxHero from "@/components/BrikxHeroContact";
import HandoffBannerTrigger from "@/components/HandoffBannerTrigger"; // ⬅️ trigger

export const metadata: Metadata = {
  title: "Contact & Advies – Brikx",
  description:
    "Vind hier de snelste weg naar het juiste antwoord over uw (ver)bouwproject. Chat, stel een vraag of plan een persoonlijk adviesmoment.",
  robots: "index, follow",
  openGraph: {
    title: "Contact & Advies – Brikx",
    description:
      "Kies de contactoptie die het beste past bij uw (ver)bouwvraag — van chat tot persoonlijk advies.",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <div className="bg-white text-neutral-900">
      <Header />
      <BrikxHero />

      <main className="bg-[#e7f3f4] rounded-b-[30px] shadow-[0_10px_30px_rgba(0,0,0,0.06)] relative w-full mx-auto max-w-[1552px] px-6 md:px-10 lg:px-20 py-16 md:py-24 space-y-20">
      

        {/* 4 blokken */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {/* Blok 1 */}
          <div className="rounded-2xl bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.16)] border border-neutral-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4">
              <MessageSquare className="w-8 h-8 text-[#10b981]" />
              <h2 className="text-2xl font-semibold text-[#0d3d4d]">
                De snelste weg naar een plan
              </h2>
            </div>
            <p className="text-lg text-[#35515a] mb-4">
              De Brikx Chat is de snelste manier om uw wensen te structureren en
              direct een eerste opzet van uw Programma van Eisen te maken.
              Mijn digitale assistent – getraind met meer dan 20 jaar
              praktijkervaring – helpt bij:
            </p>
            <ul className="list-disc pl-6 text-[#35515a] space-y-1 mb-6">
              <li>Uw wensenlijst (PvE) samenstellen</li>
              <li>Uw budget in kaart brengen</li>
              <li>Inzicht krijgen in het bouwproces</li>
            </ul>
            <a
              href="/wizard"
              className="inline-block rounded-full bg-[#10b981] text-white font-semibold px-6 py-3 hover:bg-[#059669] transition-colors"
            >
              Start de Chat
            </a>
          </div>

          {/* Blok 2 — Persoonlijke hulplijn + bestaande modal trigger */}
          <div className="rounded-2xl bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.16)] border border-neutral-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4">
              <UserRound className="w-8 h-8 text-[#10b981]" />
              <h2 className="text-2xl font-semibold text-[#0d3d4d]">
                De persoonlijke hulplijn
              </h2>
            </div>
            <p className="text-lg text-[#35515a] mb-2">
              Komt u er met de digitale assistent niet uit, of heeft u een
              specifieke vraag die buiten de standaard stappen valt? Gebruik dan
              de functie <em>“Vraag aan de Architect.”</em> Ik lees uw vraag
              persoonlijk en reageer meestal binnen 24 uur.
            </p>
            <p className="text-lg text-[#35515a] mb-2">
              Deze functie is bedoeld voor gerichte vragen, niet voor volledige
              projectadviezen.
            </p>

            {/* ⬇️ Banner + modal (verwijzing naar bestaande HumanHandoffModal) */}
            <HandoffBannerTrigger />
          </div>

          {/* Blok 3 */}
          <div className="rounded-2xl bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.16)] border border-neutral-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4">
              <Calendar className="w-8 h-8 text-[#10b981]" />
              <h2 className="text-2xl font-semibold text-[#0d3d4d]">
                Klaar voor professioneel advies?
              </h2>
            </div>
            <p className="text-lg text-[#35515a] mb-4">
              Wilt u uw plan professionaliseren en risico’s minimaliseren?
              Boek dan een van mijn adviesdiensten en vraag naar de voorwaarden:
            </p>
            <ul className="list-disc pl-6 text-[#35515a] space-y-1 mb-4">
              <li>
               <a
                  href="mailto:info@brikxai.nl"
                  className="hover:underline text-[#0d3d4d]"
                > <strong>De Startpunt-Sessie</strong></a> – een werksessie om uw PvE
                te professionaliseren en een haalbaarheidsscan te doen.
              </li>
              <li>
                <a
                  href="mailto:info@brikxai.nl"
                  className="hover:underline text-[#0d3d4d]"
                ><strong>De Kavel-Rapportage</strong></a> – een analyse van uw kavel
                op juridische, technische en financiële risico’s.
              </li>
            </ul>
           
          </div>

          {/* Blok 4 */}
          <div className="rounded-2xl bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.16)] border border-neutral-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4">
              <Info className="w-8 h-8 text-[#10b981]" />
              <h2 className="text-2xl font-semibold text-[#0d3d4d]">
                Overige vragen
              </h2>
            </div>
            <p className="text-lg text-[#35515a] mb-4">
              Voor samenwerkingen of technische vragen over de website kunt
              u contact opnemen via onderstaande gegevens.
            </p>
            <ul className="space-y-2 text-[#35515a]">
              <li>
                <Mail className="inline-block w-5 h-5 mr-2 text-[#10b981]" />
                <a
                  href="mailto:info@brikxai.nl"
                  className="hover:underline text-[#0d3d4d]"
                >
                  info@brikxai.nl
                </a>
              </li>
              <li>Loenen aan de Vecht (NL)</li>
             
            </ul>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
