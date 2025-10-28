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
    title: "Slopen of Verbouwen? De Eerste Keuze",
    desc: "De keuze tussen slopen en verbouwen is meer dan financieel. Ontdek hoe deze beslissing de regels (BENG, gasaansluiting) volledig verandert en waarom 'verbouw' soms duizenden euro's en veel hoofdbrekens kan besparen.",
    icon: "/images/icons/slopen.png",
  },
  {
    id: "stap-2",
    title: "Decodeer de Juridische Spelregels",
    desc: "Elke kavel heeft een 'grondwet': het Omgevingsplan. Leer de basisregels over bouwvlak en hoogtes, en ontdek hoe een expert de regels voor vergunningsvrij bouwen en BOPA kan 'stapelen' om extra ruimte te creëren.",
    icon: "/images/icons/juridisc.png",
  },
  {
    id: "stap-3",
    title: "Ervaar de Locatie als een Pro",
    desc: "Een kavel is meer dan een plattegrond. Leer hoe u de locatie 'leest' op zon, geluid en privacy, en ontdek waarom de 'standaard plek' uit het kavelpaspoort vaak niet de beste is voor uw woongenot.",
    icon: "/images/icons/locatie.png",
  },
  {
    id: "stap-4",
    title: "Scan de Onzichtbare Risico's",
    desc: "De duurste verrassingen zitten in de grond. Begrijp het cruciale belang van een bodemonderzoek (PFAS!) en een sondering. Dit is geen kostenpost, maar de verzekeringspremie tegen een financiële catastrofe.",
    icon: "/images/icons/risicos.png",
  },
  {
    id: "stap-5",
    title: "Check de Levensaders van uw Kavel",
    desc: "Een kavel zonder de juiste aansluitingen is waardeloos. Cruciaal: leer waarom het checken van de elektrische capaciteit (netcongestie!) nu net zo belangrijk is als het bestemmingsplan zelf.",
    icon: "/images/icons/aansluitingen.png",
  },
  {
    id: "stap-6",
    title: "Bereken de Echte Kavelkosten",
    desc: "De kavelprijs is slechts het begin. Reken op 15-20% extra bovenop de koopsom voor leges, onderzoeken, en het bouwrijp maken. Leer deze 'derde categorie' aan kosten correct te begroten.",
    icon: "/images/icons/financieel.png",
  },
  {
    id: "stap-7",
    title: "Investeer in de Sociale Context",
    desc: "Uw woongenot stopt niet bij de erfgrens. Begrijp de participatieplicht uit de Omgevingswet en leer waarom een vroegtijdig gesprek met uw buren de beste investering is om een juridische strijd te voorkomen.",
    icon: "/images/icons/buurt.png",
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
                Het Stappenplan voor uw Droomhuis: De Locatie.
              </h2>
              <p className="mt-3 text-[#475569] max-w-3xl">
                <span className="font-medium">U weet wat u wilt bouwen en wat uw budget is. Nu komt de meest fundamentele en onomkeerbare beslissing in uw hele traject: de keuze van de bouwkavel.</span>{" "}
                Zie dit stappenplan als uw routekaart. Het breekt het
                overweldigende proces op in{" "}
                <span className="font-medium">
                  7 heldere, logische stappen
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
            <li>✓ Exclusieve ‘Tips van de Architect’ bij elke stap die u nergens anders vindt.</li>
          </ul>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button type="button" onClick={() => handleOpenModal('locatie')} className="inline-flex justify-center items-center rounded-full bg-white text-[#0a7266] font-semibold px-6 py-3 hover:opacity-90">Download de Gratis Checklist</button>
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