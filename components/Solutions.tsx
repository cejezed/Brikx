'use client'

import { DollarSign, CheckCircle2, FileText } from 'lucide-react'

export default function PainSolutions() {
  // --- PainPoints (jouw copy) ---
  const painPoints = [
    {
      icon: 'pain-budget.png',
      number: '1',
      title: 'Onvoorziene Kosten',
      quote: 'Mijn budget is niet oneindig. Wat als kosten exploderen?',
      bulletPoints: ['€15K kwaliteitsborger', '4% leges opslag', 'meerwerk van de aannemer', 'Onverwachte tegenvallers'],
    },
    {
      icon: 'pain-mistakes.png',
      number: '2',
      title: 'Onomkeerbare Fouten',
      quote: 'Verkeerde muur slopen kost €10K om te herstellen',
      bulletPoints: ['Ventilatie vergeten na isolatie', 'Verkeerde bouwvolgorde', 'Fundering onderschat', 'Leidingen slecht geplaatst'],
    },
    {
      icon: 'pain-stress.png',
      number: '3',
      title: 'Stress & Conflict',
      quote: 'Aannemer doet het anders dan ik wilde',
      bulletPoints: ['Meerwerk-discussies', 'Vertraging in planning', 'Frustratie en onzekerheid', 'Miscommunicatie'],
    },
  ]

  // --- Solutions (exact jouw basis-teksten) ---
  const solutions = [
    {
      icon: DollarSign,
      title: 'Budget Zekerheid',
      description: 'Glashelder overzicht van alle kosten. Voorkom budget-ontsporing.',
      bullets: ['Leges & vergunningen', 'Onderzoeken (bodem, asbest)', 'Kwaliteitsborger (~€15K)', 'PFAS-kosten (€50-150/m³)'],
      color: 'text-emerald-600',
    },
    {
      icon: CheckCircle2,
      title: 'Feilloos Stappenplan',
      description: 'AI-coach stelt slimme vragen die u zelf niet bedenkt. Bouw in de juiste volgorde.',
      bullets: ['Ventilatie na isolatie', 'Fundering check eerst', 'Routing leidingen', 'Timing cruciale stappen'],
      color: 'text-blue-600',
    },
    {
      icon: FileText,
      title: 'Professionele Communicatie',
      description: 'PvE dat aannemers direct kunnen gebruiken. Minimaliseer meerwerk-discussies.',
      bullets: ['Eén helder document', 'STABU-standaard', 'Geen verrassingen', 'Direct bruikbaar'],
      color: 'text-teal-600',
    },
  ]

  // Alleen iconen vervangen door afbeeldingen (titels → icon-bestanden)
  const iconSrcByTitle: Record<string, string> = {
    'Budget Zekerheid': '/images/icons/solution-budget.png',
    'Feilloos Stappenplan': '/images/icons/solution-steps.png',
    'Professionele Communicatie': '/images/icons/solution-communication.png',
  }

  return (
    <section className="py-16 md:py-24">
      {/* Eén gedeelde GROENE WRAPPER met afgeronde hoeken & één outer shadow */}
      <div className="container mx-auto px-4 md:px-6">
        <div className="bg-[#e7f2f3] rounded-3xl shadow-[0_28px_72px_rgba(6,24,44,0.14)]">
          {/* --- Pijnpunten --- */}
          <div className="px-6 md:px-12 lg:px-16 pt-12 md:pt-16 pb-8 md:pb-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl lg:text-5xl font-bold text-[#0d3d4d] mb-4">Herkent U Dit?</h2>
              <p className="text-xl text-[#35515a]">De 3 grootste zorgen bij (ver)bouwen</p>
            </div>

            {/* Zelfde grid & max breedte als Solutions */}
            <div className="grid md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">
              {painPoints.map((point, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary/30"
                >
                  {/* Donkergroene header met witte, GECENTREERDE titel */}
                  <div className="bg-[#0b2b3e] text-white px-6 py-3 text-center">
                    <div className="text-xs uppercase tracking-wide/loose opacity-90">
                      ZORG #{point.number}
                    </div>
                    <h3 className="text-lg font-semibold leading-relaxed">{point.title}</h3>
                  </div>

                  {/* Body */}
                  <div className="p-8">
                    {/* Icon (afbeelding) */}
                    <div className="mb-6 flex justify-center">
                      <img src={`/images/icons/${point.icon}`} alt="" className="w-30 h-30 object-contain" />
                    </div>

                    {/* Quote */}
                    <p className="text-[19px] italic text-gray-700 text-center mb-6 leading-relaxed">
                      "{point.quote}"
                    </p>

                    {/* Bullets */}
                    <ul className="space-y-2">
                      {point.bulletPoints.map((bullet, bulletIndex) => (
                        <li key={bulletIndex} className="text-[19px] text-red-600 flex items-start leading-relaxed">
                          <span className="mr-2">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subtle divider binnen het groene blok */}
          <div className="mx-6 md:mx-12 lg:px-16 h-px bg-white/50" />

          {/* --- Oplossingen --- */}
          <div className="px-6 md:px-12 lg:px-16 pt-8 md:pt-12 pb-12 md:pb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-4">
                Waarom Brikx de Eerste, Juiste Stap is
              </h2>
              <p className="text-xl text-gray-700">
                Voor elk probleem een concrete oplossing. Gebouwd op 20+ jaar architect-expertise.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">
              {solutions.map((solution, index) => {
                const imgSrc = iconSrcByTitle[solution.title] || '/images/icons/placeholder.png'
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary/30"
                  >
                    {/* Donkergroene header met witte, GECENTREERDE titel */}
                    <div className="bg-[#0b2b3e] text-white px-6 py-3 text-center">
                      <h3 className="text-lg font-semibold leading-relaxed">{solution.title}</h3>
                    </div>

                    {/* Body */}
                    <div className="p-8">
                      {/* ICON → ALLEEN AFBEELDING (geen cirkel) */}
                      <div className="mb-6 flex justify-center">
                        <img src={imgSrc} alt="" className="w-30 h-30 object-contain" />
                      </div>

                      {/* Description */}
                      <p className="text-[19px] text-gray-700 mb-6 leading-relaxed">
                        {solution.description}
                      </p>

                      {/* Bullet Points */}
                      <ul className="space-y-3">
                        {solution.bullets.map((bullet, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            </div>
                            <span className="text-[19px] text-gray-700 leading-relaxed">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Trust quote */}
            <div className="mt-12 text-center">
              <p className="text-xl text-gray-700 italic leading-relaxed">
                "De 'wat als'-vragen, de angst voor het onbekende... wij herkennen het.{' '}
                <br className="hidden md:block" />
                Brikx is ontworpen als die ene, overzichtelijke eerste stap."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
