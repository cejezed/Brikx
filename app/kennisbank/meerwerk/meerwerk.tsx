'use client';

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import BrikxHero from "@/components/BrikxHero";
import Footer from "@/components/Footer";
import ChecklistModal from '@/components/ChecklistModal';
import SidebarTabs from '../SidebarTabs';

const CONTAINER = "mx-auto max-w-[1600px] px-6";

const STEPS = [
  {
    id: "stap-1",
    title: "De Voorbereiding: Voorkom 90% van de Problemen",
    desc: "Meerwerk begint bij onduidelijkheid. Leer hoe een waterdicht PvE, een complete tekeningenset en het ontmaskeren van onrealistische stelposten de basis vormen voor een stressvrij en voorspelbaar bouwproces.",
    icon: "/images/icons/preventie.png",
  },
  {
    id: "stap-2",
    title: "De Planning: Motor van uw Project",
    desc: "Een te optimistische planning is de grootste bron van vertraging en dubbele kosten. Ontdek hoe u levertijden van keukens en materialen toetst en het gevreesde 'domino-effect' in de bouw voorkomt.",
    icon: "/images/icons/planningrealistisch.png",
  },
  {
    id: "stap-3",
    title: "Actief Managen: Houd de Regie Tijdens de Bouw",
    desc: "Een mondeling 'ja' op de bouwplaats kan u duizenden euro's kosten. Leer de gouden regels voor communicatie, het belang van wekelijkse bouwvergaderingen en hoe u uw 'post onvoorzien' formeel beheert.",
    icon: "/images/icons/mindset.png",
  },
  {
    id: "stap-4",
    title: "De Oplevering: Uw Laatste Controlemoment",
    desc: "De oplevering is geen formaliteit, maar uw laatste onderhandeling. Ontdek waarom een vooroplevering essentieel is en hoe u de laatste betaaltermijn als uw belangrijkste pressiemiddel inzet om een perfect resultaat af te dwingen.",
    icon: "/images/icons/oplevering.png",
  },
  {
    id: "stap-5",
    title: "Conflictbeheersing: De De-escalatie Gids",
    desc: "Grote conflicten beginnen met kleine irritaties. Leer de stappen om problemen vroegtijdig te signaleren en bespreekbaar te maken, zodat u 9 van de 10 problemen oplost voordat ze juridisch en kostbaar worden.",
    icon: "/images/icons/herstelkosten.png",
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

      <BrikxHero
        title="Brikx Kennisbank"
        subtitle="Praktische checklists, stappenplannen en uitleg — rechtstreeks uit 20 jaar architect-ervaring."
        primaryCta={{ href: "/wizard", label: "Start Gratis PvE" }}
        secondaryCtaLabel="Download Checklist"
        onSecondaryCtaClick={() => handleOpenModal('Kennisbank Stappenplan')}
      />

      <section className="py-0">
        <div className={CONTAINER}>
          <div className="bg-[#e7f3f4] rounded-[0px] mb-16 shadow-[0_10px_30px_rgba(0,0,0,0.16)] p-0 sm:p-0 lg:p-10">
            <header className="mb-0 lg:mb-10">
              <h2 className="text-2xl lg:text-3xl font-bold text-[#0d3d4d]">
                Het Stappenplan voor uw Droomhuis: De Uitvoering
              </h2>
              <p className="mt-3 text-[#475569] max-w-3xl">
                <span className="font-medium">De voorbereiding is gedaan, de aannemer staat klaar. De meest spannende, maar ook meest stressvolle fase van uw project gaat beginnen: de uitvoering. Onverwacht meerwerk, een uitlopende planning en financiële tegenvallers zijn de grootste bron van stress en conflicten tijdens de bouw.</span>{" "}
                Zie dit stappenplan als uw routekaart. Het breekt het
                overweldigende proces op in{" "}
                <span className="font-medium">
                  5 heldere, logische stappen
                </span>{" "}
                die u helpen om de controle over het budget en de planning te behouden, van de eerste dag op de bouwplaats tot de finale sleuteloverdracht.
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
        <div className="max-w-[1252px] mx-auto rounded-3xl p-8 lg:p-10 text-white bg-gradient-to-br from-[#082b3f] to-[#1c7d86] shadow-[0_6px_18px_rgba(0,0,0,0.36)]">
          <h3 className="text-2xl lg:text-3xl font-bold">Wilt u hier écht mee aan de slag?</h3>
          <ul className="mt-4 space-y-2 text-white/90">
            <li>✓ Extra schrijfruimte om uw gedachten en antwoorden direct te noteren.</li>
            <li>✓ Een printbaar document dat u kunt gebruiken in gesprekken.</li>
            <li>✓ Exclusieve ‘Tips van de Architect’ bij elke stap die u nergens anders vindt.</li>
          </ul>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button type="button" onClick={() => handleOpenModal('locatie')} className="inline-flex justify-center items-center rounded-full bg-[#27bdbb] text-[white] font-semibold px-6 py-3 hover:opacity-90">Download de Gratis Checklist</button>
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