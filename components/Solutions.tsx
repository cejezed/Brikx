'use client'
import { DollarSign, CheckCircle2, FileText } from 'lucide-react'
import { motion } from 'framer-motion'

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
    <section className="py-16 md:py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-[#e7f2f3] rounded-[48px] shadow-[0_48px_100px_rgba(6,24,44,0.08)] overflow-hidden border border-[#4db8ba]/10"
        >
          {/* --- Pijnpunten --- */}
          <div className="px-6 md:px-12 lg:px-20 pt-16 md:pt-24 pb-12">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 rounded-full bg-red-100 text-red-600 text-sm font-bold uppercase tracking-wider mb-4">De Uitdaging</span>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-[#0d3d4d] mb-4">Herkent U Dit?</h2>
              <p className="text-xl text-[#35515a] max-w-2xl mx-auto opacity-80">De 3 grootste zorgen bij (ver)bouwen die we overal tegenkomen.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-7xl mx-auto">
              {painPoints.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 group hover:-translate-y-2"
                >
                  <div className="bg-[#0b2b3e] text-white px-6 py-4 text-center">
                    <div className="text-[10px] uppercase tracking-widest opacity-60 mb-1">ZORG #{point.number}</div>
                    <h3 className="text-lg font-bold">{point.title}</h3>
                  </div>

                  <div className="p-10 flex flex-col items-center">
                    <div className="mb-8 p-6 rounded-3xl bg-gray-50 group-hover:bg-red-50 transition-colors duration-500">
                      <img src={`/images/icons/${point.icon}`} alt="" className="w-24 h-24 object-contain grayscale group-hover:grayscale-0 transition-all duration-500" />
                    </div>

                    <p className="text-[18px] italic text-gray-700 text-center mb-8 leading-relaxed font-medium">
                      "{point.quote}"
                    </p>

                    <ul className="space-y-4 w-full">
                      {point.bulletPoints.map((bullet, bulletIndex) => (
                        <li key={bulletIndex} className="text-[17px] text-gray-500 flex items-start leading-tight group-hover:text-red-600/80 transition-colors">
                          <span className="mr-3 text-red-500 font-bold">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="relative h-px w-full overflow-hidden">
            <div className="absolute inset-x-12 h-px bg-gradient-to-r from-transparent via-[#4db8ba]/30 to-transparent" />
          </div>

          {/* --- Oplossingen --- */}
          <div className="px-6 md:px-12 lg:px-20 pt-16 pb-24">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-600 text-sm font-bold uppercase tracking-wider mb-4">De Oplossing</span>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-[#0d3d4d] mb-4">
                Waarom Brikx de Beste Start is
              </h2>
              <p className="text-xl text-[#35515a] max-w-2xl mx-auto opacity-80">
                Voor elk probleem een concrete oplossing. Gebouwd op 20 jaar architect-expertise en slimme AI.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-7xl mx-auto">
              {solutions.map((solution, index) => {
                const imgSrc = iconSrcByTitle[solution.title] || '/images/icons/placeholder.png'
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + (index * 0.1), duration: 0.5 }}
                    className="bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 group hover:-translate-y-2"
                  >
                    <div className="bg-[#4db8ba] text-white px-6 py-4 text-center">
                      <h3 className="text-lg font-bold">{solution.title}</h3>
                    </div>

                    <div className="p-10 flex flex-col items-center">
                      <div className="mb-8 p-6 rounded-3xl bg-gray-50 group-hover:bg-[#e7f2f3] transition-colors duration-500">
                        <img src={imgSrc} alt="" className="w-24 h-24 object-contain group-hover:scale-110 transition-transform duration-500" />
                      </div>

                      <p className="text-[18px] text-gray-700 mb-8 leading-relaxed font-semibold text-center h-14 flex items-center">
                        {solution.description}
                      </p>

                      <ul className="space-y-4 w-full">
                        {solution.bullets.map((bullet, idx) => (
                          <li key={idx} className="flex items-start gap-4 group/item">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center mt-0.5 group-hover/item:bg-emerald-500 transition-colors">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 group-hover/item:bg-white" />
                            </div>
                            <span className="text-[17px] text-gray-600 leading-tight group-hover/item:text-gray-900 transition-colors">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Trust quote */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="mt-20 text-center"
            >
              <div className="inline-block relative">
                <span className="absolute -top-10 -left-10 text-8xl text-[#4db8ba]/10 font-serif">"</span>
                <p className="text-xl md:text-2xl text-gray-600 italic leading-relaxed max-w-4xl mx-auto">
                  De 'wat als'-vragen, de angst voor het onbekende... wij herkennen het. Brikx is ontworpen als die ene, overzichtelijke eerste stap naar jouw droomresultaat.
                </p>
                <span className="absolute -bottom-10 -right-10 text-8xl text-[#4db8ba]/10 font-serif rotate-180">"</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
