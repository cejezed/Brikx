'use client'

const steps = [
  {
    number: "1",
    title: "Chat met AI-Coach",
    description: "Beantwoord slimme vragen over je project. De AI stelt de vragen die je zelf niet bedenkt, gebaseerd op 20 jaar architect-expertise.",
    image: "step-chat.png",
    badge: "Zorgvuldig"
  },
  {
    number: "2",
    title: "Prioriteer je Wensen",
    description: "Verdeel in Must/Should/Could met de MoSCoW-methode. Zo blijft het realistisch en haalbaar binnen je budget.",
    image: "step-prioritize.png",
    badge: "Structuur"
  },
  {
    number: "3",
    title: "Ontvang je PvE",
    description: "Compleet document met al je wensen, uploads en moodboard. Preview gratis, inclusief waarschuwingen voor valkuilen.",
    image: "step-generate.png",
    badge: "Compleet"
  },
  {
    number: "4",
    title: "Export & Deel",
    description: "Download gratis met watermerk of help ons mee en upgrade gratis naar een uitgebreide PDF. Direct bruikbaar voor professionals.",
    image: "step-export.png",
    badge: "Pro-Ready"
  }
]

export default function HowItWorks() {
  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-4">
            Hoe Het Werkt
          </h2>
          <p className="text-xl text-gray-700">
            Secuur en volledig. Neem de tijd die nodig is voor een compleet PvE.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="relative bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:-translate-y-1"
            >
              {/* Step Number */}
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg border-4 border-white">
                <span className="text-xl font-bold text-white">
                  {step.number}
                </span>
              </div>

              {/* Badge */}
              <div className="text-right mb-3">
                <span className="inline-block bg-emerald-100 text-primary px-3 py-1 rounded-full text-[13px] font-semibold">
                  {step.badge}
                </span>
              </div>

              {/* Image Placeholder */}
              <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 mb-4">
                <div className="aspect-[4/3] flex items-center justify-center">
                  <span className="text-4xl">
                    {index === 0 ? '💬' : index === 1 ? '✓' : index === 2 ? '📄' : '📤'}
                  </span>
                  {/* Future: <img src={`/images/steps/${step.image}`} alt={step.title} className="w-full h-full object-cover" /> */}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-[19px] font-bold text-gray-900 mb-2 leading-tight">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-[15px] text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 border border-primary/20">
          <p className="text-[19px] text-gray-700 mb-4 leading-relaxed">
            Neem de tijd om alles zorgvuldig in te vullen. Een compleet PvE voorkomt €10K+ aan fouten.
          </p>
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-semibold text-lg hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl">
            Start Gratis →
          </button>
          <p className="text-[13px] text-gray-600 mt-3">
            Geen creditcard nodig • Pauzeer wanneer je wilt
          </p>
        </div>
      </div>
    </section>
  )
}