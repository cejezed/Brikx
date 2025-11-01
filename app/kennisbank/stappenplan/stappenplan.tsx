'use client';

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChecklistModal from '@/components/ChecklistModal';
import SidebarTabs from '../SidebarTabs';

const CONTAINER = "mx-auto max-w-[1600px] px-6";

const STEPS = [
  {
    id: "stap-1",
    title: "Definieer uw 'Waarom'",
    desc: "Ontdek de dieperliggende motivatie achter uw wens.",
    icon: "/images/icons/stap-01-waarom.png",
  },
  {
    id: "stap-2",
    title: "Breng uw Leefpatronen in Kaart",
    desc: "Analyseer hoe u nu leeft om te ontdekken wat u écht nodig heeft.",
    icon: "/images/icons/stap-02-leefpatronen.png",
  },
  {
    id: "stap-3",
    title: "Vertaal Wensen naar Functie & Gevoel",
    desc: "Denk in sfeer en de relatie tussen ruimtes, niet alleen in vierkante meters.",
    icon: "/images/icons/stap-03-functie-gevoel.png",
  },
  {
    id: "stap-4",
    title: "Verzamel Visuele Inspiratie",
    desc: "Maak een moodboard én 'anti-moodboard' om uw stijl te vangen.",
    icon: "/images/icons/stap-04-inspiratie.png",
  },
  {
    id: "stap-5",
    title: "Denk aan de Toekomst",
    desc: "Ontwerp flexibel en levensloopbestendig.",
    icon: "/images/icons/stap-05-toekomst.png",
  },
  {
    id: "stap-6",
    title: "De Eerste Budget-Check",
    desc: "Krijg een eerste, realistische indruk van uw financiële kaders.",
    icon: "/images/icons/stap-06-budget-check.png",
  },
  {
    id: "stap-7",
    title: "De Locatie – Eerste Verkenning",
    desc: "Analyseer de unieke kansen en beperkingen van uw plek.",
    icon: "/images/icons/stap-07-locatie.png",
  },
  {
    id: "stap-8",
    title: "De Regels – Bewustwording",
    desc: "Begrijp de basis van vergunningen en het belang van burenoverleg.",
    icon: "/images/icons/stap-08-regels.png",
  },
  {
    id: "stap-9",
    title: "Het Team – Begrijp de Rollen",
    desc: "Weet wie u nodig heeft: architect, aannemer en constructeur.",
    icon: "/images/icons/stap-09-team.png",
  },
  {
    id: "stap-10",
    title: "De Volgende Stap",
    desc: "Zet uw voorbereiding om in een krachtig, bruikbaar document.",
    icon: "/images/icons/stap-10-volgende-stap.png",
  },
];

export default function KennisbankContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestedChecklist, setRequestedChecklist] = useState<string | null>(null);

  const handleOpenModal = (checklistName: string) => {
    setRequestedChecklist(checklistName);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setRequestedChecklist(null);
  };

  const handleFormSubmit = async (email: string) => {
    if (!requestedChecklist) return;
    try {
      await fetch('/api/send-checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, checklistName: requestedChecklist }),
      });
      alert(`Top! De checklist '${requestedChecklist}' wordt verstuurd naar ${email}.`);
      handleCloseModal();
    } catch (error) {
      console.error(error);
      alert('Het is helaas niet gelukt de aanvraag te verwerken.');
    }
  };

  return (
    <main className="bg-white">
      <Header />

      {/* Hero Section - replaced BrikxHero with inline implementation */}
      <section className="bg-gradient-to-br from-[#0d3d4d] to-[#1c7d86] text-white py-16 lg:py-24">
        <div className={CONTAINER}>
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Brikx Kennisbank</h1>
            <p className="text-lg lg:text-xl text-white/90 mb-8">
              Praktische checklists, stappenplannen en uitleg – rechtstreeks uit 20 jaar architect-ervaring.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/wizard" 
                className="inline-flex justify-center items-center rounded-full bg-[#27bdbb] text-white font-semibold px-8 py-3 hover:opacity-90 transition"
              >
                Start Gratis PvE
              </Link>
              <button 
                type="button"
                onClick={() => handleOpenModal('Kennisbank Stappenplan')}
                className="inline-flex justify-center items-center rounded-full border-2 border-white text-white font-semibold px-8 py-3 hover:bg-white/10 transition"
              >
                Download Checklist
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-0">
        <div className={CONTAINER}>
          <div className="bg-[#e7f3f4] rounded-[0px] mb-16 shadow-[0_10px_30px_rgba(0,0,0,0.16)] p-0 sm:p-0 lg:p-10">
            <header className="mb-0 lg:mb-10">
              <h2 className="text-2xl lg:text-3xl font-bold text-[#0d3d4d]">
                Het Stappenplan voor uw Droomhuis: Een Overzicht
              </h2>
              <p className="mt-3 text-[#475569] max-w-3xl">
                <span className="font-medium">Een goed begin is het halve werk.</span>{" "}
                Zie dit stappenplan als uw routekaart. Het breekt het
                overweldigende proces op in{" "}
                <span className="font-medium">
                  10 heldere, logische stappen
                </span>{" "}
                die u helpen om van een vage droom naar een concreet plan te komen.
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-16">
              {/* LIJST MET STAPPEN */}
              <ol className="space-y-8">
                {STEPS.map((s) => (
                  <li key={s.id} id={s.id}>
                    <div className="flex items-center gap-5 rounded-2xl border border-[#DCE9EA] bg-white p-5 lg:p-6 shadow-[0_6px_18px_rgba(0,0,0,0.16)]">
                      
                      {/* De container blijft 64x64, maar de afbeelding wordt 80x80 en perfect gecentreerd */}
                      <div className="relative w-30 h-06 shrink-0">
                        <Image
                          src={s.icon}
                          alt={s.title}
                          width={100}
                          height={100}
                          className="object-contain absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                          sizes="100px"
                        />
                      </div>
                      <div>
                        <h3 className="text-[#0d3d4d] font-semibold">{s.title}</h3>
                        <p className="text-[#64748b] text-sm">{s.desc}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>

              <SidebarTabs />
            </div>
          </div>
        </div>
      </section>
      
      <section className="pb-16 lg:pb-24">
        <div className="max-w-[1252px] mx-auto rounded-3xl p-8 lg:p-10 text-white bg-gradient-to-br from-[#082b3f] to-[#1c7d86] shadow-[0_24px_60px_rgba(13,61,77,0.14)]">
          <h3 className="text-2xl lg:text-3xl font-bold">Wilt u hier écht mee aan de slag?</h3>
          <ul className="mt-4 space-y-2 text-white/90">
            <li>✓ Extra schrijfruimte om uw gedachten en antwoorden direct te noteren.</li>
            <li>✓ Een printbaar document dat u kunt gebruiken in gesprekken.</li>
            <li>✓ Exclusieve "Tips van de Architect" bij elke stap die u nergens anders vindt.</li>
          </ul>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button 
              type="button" 
              onClick={() => handleOpenModal('Algemene Bouw Checklist')} 
              className="inline-flex justify-center items-center rounded-full bg-white text-[#0a7266] font-semibold px-6 py-3 hover:opacity-90 transition"
            >
              Download de Gratis Checklist
            </button>
            <Link 
              href="/wizard" 
              className="inline-flex justify-center items-center rounded-full border-2 border-white text-white font-semibold px-6 py-3 hover:bg-white/10 transition"
            >
              Start Brikx Chat
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />

      <ChecklistModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
      />
    </main>
  );
}