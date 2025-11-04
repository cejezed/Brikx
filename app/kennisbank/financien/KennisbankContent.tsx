'use client';

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import BrikxHero from "@/components/BrikxHeroKennis";
import Footer from "@/components/Footer";
import ChecklistModal from '@/components/ChecklistModal';
import SidebarTabs from '../SidebarTabs';

const STEPS = [
  { id: "stap-1", title: "Bepaal uw Financiële Fundament", desc: "Een eerlijk en realistisch totaalbudget is de basis voor elk succesvol plan...", icon: "/images/icons/stap-01-waarom.png" },
  { id: "stap-2", title: "Begrijp de Zichtbare Bouwkosten", desc: "Kijk verder dan de vierkante meter prijs...", icon: "/images/icons/stap-02-leefpatronen.png" },
  { id: "stap-3", title: "Ontmasker de 'Verborgen' Kosten", desc: "Dit is de stap naar een stressvrij bouwproces...", icon: "/images/icons/stap-03-functie-gevoel.png" },
  { id: "stap-4", title: "Wees Realistisch over de Afwerking", desc: "Stelposten in een offerte zijn vaak te optimistisch...", icon: "/images/icons/stap-04-inspiratie.png" },
  { id: "stap-5", title: "Beheer uw Buffer als een Pro", desc: "Een buffer is uw financiële parachute, geen luxe...", icon: "/images/icons/stap-05-toekomst.png" },
  { id: "stap-6",
    title: "Neem de Regie & Bespaar",
    desc: "Een budget gaat niet alleen over kosten, maar ook over kansen. Ontdek hoe u duizenden euro's kunt besparen met subsidies zoals de ISDE-regeling. Leer hoe een ijzersterke voorbereiding het duurste 'meerwerk' voorkomt en u de controle houdt van start tot finish.",
    icon: "/images/icons/besparing.png",
  },
  {
    id: "stap-7",
    title: "Bespaar met een Slim Ontwerp",
    desc: "De meest waardevolle besparing zit niet in de materiaalkeuze, maar in het ontwerp zélf. Ontdek hoe een slimme indeling een dure uitbouw overbodig maakt en een kleine, lichte ruimte meer kwaliteit biedt dan een grote, donkere. Een goed ontwerp bespaart direct op complexiteit en voorkomt kostbare bouwfouten.",
    icon: "/images/icons/slimontwerp.png",
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
      const response = await fetch('/api/send-checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          checklistName: requestedChecklist,
        }),
      });

      if (!response.ok) {
        throw new Error('Er is iets misgegaan bij het versturen.');
      }

      alert(`Top! De checklist '${requestedChecklist}' wordt verstuurd naar ${email}.`);
      handleCloseModal();

    } catch (error) {
      console.error(error);
      alert('Het is helaas niet gelukt de aanvraag te verwerken. Probeer het later opnieuw.');
    }
  };

  return (
    <main className="bg-white">
      <Header />
      <BrikxHero />

      {/* --- CONTENT-SECTIE --- */}
      <section className="py-0">
        <div className="bg-[#e7f3f4] rounded-b-[30px] mb-16 shadow-[0_10px_30px_rgba(0,0,0,0.16)] p-6 md:p-12 lg:p-20 relative w-full mx-auto max-w-[1552px]">
          <header className="mb-8 lg:mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#0d3d4d]">De Financiële Routekaart voor uw Droomhuis: Een Overzicht</h2>
            <p className="mt-3 text-[#475569] max-w-3xl">Een goed begin is het halve werk, zeker als het om de financiën gaat. Zie deze checklist als uw routekaart naar een waterdicht budget...</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
            <ol className="space-y-4">
              {STEPS.map((s) => (
                <li key={s.id} id={s.id}>
                  <div className="flex items-center gap-5 rounded-2xl border border-[#DCE9EA] bg-white p-5 lg:p-6 shadow-[0_6px_18px_rgba(0,0,0,0.08)]">
                    <div className="relative w-30 h-16 shrink-0"><Image src={s.icon} alt={s.title} fill className="object-contain" sizes="100px" /></div>
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
      </section>

      {/* --- CTA BANNER --- */}
      <section className="pb-16 lg:pb-24">
        <div className="max-w-[1252px] mx-auto rounded-3xl p-8 lg:p-10 text-white bg-gradient-to-br from-[#082b3f] to-[#1c7d86] shadow-[0_24px_60px_rgba(13,61,77,0.14)]">
          <h3 className="text-2xl lg:text-3xl font-bold">Wilt u hier écht mee aan de slag?</h3>
          <ul className="mt-4 space-y-2 text-white/90">
            <li>✓ Extra schrijfruimte om uw gedachten en antwoorden direct te noteren.</li>
            <li>✓ Een printbaar document dat u kunt gebruiken in gesprekken.</li>
            <li>✓ Exclusieve ‘Tips van de Architect’ bij elke stap die u nergens anders vindt.</li>
          </ul>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button type="button" onClick={() => handleOpenModal('Financiële Routekaart')} className="inline-flex justify-center items-center rounded-full bg-white text-[#0a7266] font-semibold px-6 py-3 hover:opacity-90">Download de Gratis Checklist</button>
            <Link href="/wizard" className="inline-flex justify-center items-center rounded-full border-2 border-white text-white font-semibold px-6 py-3 hover:bg-white/10">Start Brikx Chat</Link>
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