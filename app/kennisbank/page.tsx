'use client';

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChecklistModal from '@/components/ChecklistModal';
import KennisbankGrid from './KennisbankGrid';

const CONTAINER = "mx-auto max-w-[1600px] px-6";

// --- Data voor de 4 Kennisbank Checklists ---
const kennisbankItems = [
  {
    icon: '/images/icons/solution-steps.png',
    title: 'Checklist Droomhuis Vormgeven (10 Stappen)',
    description:
      'Van een vage wens naar een concreet plan. Definieer uw "waarom", breng leefpatronen in kaart en leg de fundering voor uw (ver)bouwproject.',
    checklistName: 'Checklist Droom Vormgeven',
  },
  {
    icon: '/images/icons/icon-locatie.png',
    title: 'Checklist Bouwkavel & Locatie Analyse',
    description:
      'De meest onomkeerbare (ver)bouwkeuze. Analyseer het omgevingsplan, juridische regels, bodemonderzoek (sondering) en check op netcongestie.',
    checklistName: 'Checklist Locatie',
  },
  {
    icon: '/images/icons/solution-budget.png',
    title: 'Checklist Waterdicht Projectbudget',
    description:
      'Krijg 100% grip op alle (ver)bouwkosten. Begrijp de valkuilen: van "verborgen kosten" en leges tot stelposten en de Wkb kwaliteitsborger.',
    checklistName: 'Checklist Financien',
  },
  {
    icon: '/images/icons/solution-communication.png',
    title: 'Checklist Grip op Uitvoering & Meerwerk',
    description:
      'Voorkom de klassieke bouwstress. Leer hoe u meerwerk managet, de planning bewaakt en een vlijmscherpe oplevering uitvoert conform de Wkb.',
    checklistName: 'Checklist Meerwerk',
  },
];

// === VIER CHECKLISTS ===
const CHECKLISTS = [
  {
    id: 1,
    slug: "stappenplan",
    title: "Checklist Droomhuis Vormgeven (10 Stappen)",
    subtitle: "De Bouwvolgorde",
    description:
      'Van een vage wens naar een concreet plan. Definieer uw "waarom", breng leefpatronen in kaart en leg de fundering voor uw (ver)bouwproject.',
    bulletPoints: [
      "Fundering eerst checken",
      "Ventilatie na isolatie",
      "Leidingen vóór muren",
      "Schilderwerk aan het einde",
    ],
    callout:
      "Fouten in volgorde kosten €10K+ om te herstellen. Deze checklist voorkomt dat.",
    icon: "/images/icons/checklist-stappenplan.png",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
    headerBg: "bg-gradient-to-r from-blue-50 to-blue-100",
  },
  {
    id: 2,
    slug: "financien",
    title: "Financiën Checklist",
    subtitle: "Budget Zekerheid",
    description:
      "Alle verborgen kosten in kaart brengen. Voorkom budget-ontsporing.",
    bulletPoints: [
      "Leges & vergunningen",
      "Onderzoeken (asbest, PFAS)",
      "Kwaliteitsborger (~€15K)",
      "Stelposten & meerwerk",
    ],
    callout:
      "De meeste projecten lopen uit omdat deze kosten vergeten zijn. Dit is jouw voorkoming.",
    icon: "/images/icons/checklist-financien.png",
    buttonColor: "bg-emerald-600 hover:bg-emerald-700",
    headerBg: "bg-gradient-to-r from-emerald-50 to-emerald-100",
  },
  {
    id: 3,
    slug: "locatie",
    title: "Locatie Risico's",
    subtitle: "Adres-Specifieke Waarschuwingen",
    description:
      "Wat betekent jouw bouwjaar, ligging en buurt voor jouw project?",
    bulletPoints: [
      "Bouwjaar < 1940: asbest & fundering",
      "Water-gerelateerde risico's",
      "PFAS-vervuiling (€50-150/m³)",
      "Netcongestie (all-electric)",
    ],
    callout:
      "Een locatie-check bespaart maanden vertraging en tienduizenden euro's.",
    icon: "/images/icons/checklist-locatie.png",
    buttonColor: "bg-amber-600 hover:bg-amber-700",
    headerBg: "bg-gradient-to-r from-amber-50 to-amber-100",
  },
  {
    id: 4,
    slug: "uitvoering",
    title: "Uitvoering Checklist",
    subtitle: "Kwaliteit Borgen",
    description:
      "Hoe je als opdrachtgever de kwaliteit van je project borgt.",
    bulletPoints: [
      "Wekelijkse bouwvergaderingen",
      "Bouwdossier met foto's (voorbewerking)",
      "Professionele notulen & actielijsten",
      "Webcam op bouwplaats",
    ],
    callout:
      "Professionele communicatie = 80% minder conflicten met aannemers.",
    icon: "/images/icons/checklist-uitvoering.png",
    buttonColor: "bg-purple-600 hover:bg-purple-700",
    headerBg: "bg-gradient-to-r from-purple-50 to-purple-100",
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

      <KennisbankGrid onChecklistClick={handleOpenModal} />
      
      {/* FOOTER */}
      <Footer />
      
      <ChecklistModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
      />
    </main>
  );
}