'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    question: "Is dit niet gewoon een vervanging van een architect?",
    answer: "Nee, juist niet. Brikx helpt je de eerste stap te zetten: het verzamelen en structureren van je wensen. Daarna heb je een compleet PvE waarmee een architect direct aan de slag kan. Je bespaart tijd én geld, omdat de architect niet meer vanaf nul hoeft te beginnen. Veel architecten waarderen dit juist."
  },
  {
    question: "Wat als ik mijn wensen nog niet goed kan verwoorden?",
    answer: "Dáár is Brikx juist voor. De AI-coach stelt slimme vragen die je zelf niet bedenkt - gebaseerd op 20 jaar architect-expertise. Je hoeft geen vakjargon te kennen. Beschrijf het in je eigen woorden. De structuur komt vanzelf."
  },
  {
    question: "Is mijn data veilig? Wat gebeurt er met mijn bouwplannen?",
    answer: "100% veilig. Volledig AVG-compliant, SSL-versleuteling, en alle servers staan in Nederland. Jouw bouwplannen, foto's en documenten blijven van jou. We verkopen geen data aan derden. Je kunt je project en alle gegevens op elk moment verwijderen."
  },
  {
    question: "Hoe weet ik dat ik niets vergeet?",
    answer: "De kennisbank bevat honderden valkuilen uit de praktijk: ventilatie na isolatie, funderingsproblemen, netcongestie. Dingen die je zelf niet bedenkt, maar die €10.000+ kunnen schelen."
  },
  {
    question: "Kan een aannemer hier echt mee werken?",
    answer: "Ja. Het PvE bevat alle essentiële informatie: wensen per ruimte, prioriteiten (MoSCoW) en moodboard. Aannemers weten precies wat je wilt, wat verplicht is (Must), en wat optioneel (Could). Dit voorkomt de klassieke meerwerk-discussies."
  },
  {
    question: "Wat als mijn project heel specifiek of ingewikkeld is?",
    answer: "Dan is Brikx juist dé eerste stap. Hoe complexer het project, hoe belangrijker een compleet PvE. Daarna kun je met een architect verder - die waardeert de voorbereiding enorm."
  },

]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-4">
            Veelgestelde Vragen
          </h2>
          <p className="text-xl text-gray-700">
            Twijfel je nog? Deze vragen worden het meest gesteld.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 hover:border-primary/50 hover:shadow-md"
            >
              {/* Question Button */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="text-[19px] font-semibold text-gray-900 pr-4 leading-relaxed">
                  {item.question}
                </span>
                <ChevronDown
                  className={`flex-shrink-0 w-5 h-5 text-primary transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Answer (Collapsible) */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-6 text-[17px] text-gray-700 leading-relaxed">
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center p-8 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20">
          <p className="text-[19px] text-gray-700 mb-4 leading-relaxed">
            Nog een specifieke vraag over jouw situatie?
          </p>
          <a
            href="mailto:info@brikxai.nl"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline text-lg"
          >
            Stuur ons een bericht →
          </a>
        </div>
      </div>
    </section>
  )
}