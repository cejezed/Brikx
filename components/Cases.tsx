'use client'

export default function Cases() {
  const cases = [
    {
      badge: '€80K Bespaard',
      badgeColor: 'bg-green-100 text-green-800',
      title: 'Boerderij Behouden',
      subtitle: 'Renovatie > Sloop + Nieuwbouw',
      image: 'case-boerderij.jpg',
      quote: 'Eigenaar dacht dat sloop + nieuwbouw goedkoper was. Gevels behouden = €80K bespaard + uniek karakter',
      brikxNote: 'Brikx helpt dit soort renovatie-versus-sloop afwegingen vroeg zichtbaar maken, doordat de AI doorvraagt op bestaande kwaliteit en alternatieve scenario\'s.'
    },
    {
      badge: '2x Oppervlak',
      badgeColor: 'bg-blue-100 text-blue-800',
      title: 'BOPA-procedure',
      subtitle: 'Van 50m² naar 100m²',
      image: 'case-bopa.jpg',
      quote: 'Bestemmingsplan leek uitbouw te blokkeren. Door kennis van BOPA werd woning 100m² groter',
      brikxNote: 'Brikx signaleert vroeg of een BOPA-procedure relevant kan zijn, zodat je dit meeneemt in je tijdplanning en budgetopbouw.'
    },
    {
      badge: 'Half Budget',
      badgeColor: 'bg-purple-100 text-purple-800',
      title: 'Strategische Uitbouwen',
      subtitle: 'Licht door Slim Ontwerp',
      image: 'case-strategie.jpg',
      quote: 'Grote aanbouw was de wens. Twee strategische uitbouwen gaven meer licht voor half geld',
      brikxNote: 'Brikx vraagt door op doelen en budget, zodat slimme alternatieven — zoals twee kleinere uitbouwen — al in de voorfase naar boven komen.'
    },
  ]

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Bewezen Resultaten uit de Praktijk
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Concrete voorbeelden van oplossingen door slimme vragen te stellen en verder te kijken dan de vraag.
          </p>
          <blockquote className="max-w-2xl mx-auto border-l-4 border-[#4db8ba] pl-6 text-left">
            <p className="text-lg italic text-gray-700">
              "Een goed PvE voorkomt €10.000+ aan fouten voordat er een steen is verplaatst."
            </p>
            <cite className="block mt-2 text-sm text-gray-500 not-italic">— Jules Zwijsen, architect en oprichter Brikx</cite>
          </blockquote>
        </div>

        {/* 3 Column Grid - 2 Rows */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cases.map((caseItem, index) => (
            <div 
              key={index}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Image Placeholder */}
              <div className="relative h-48 bg-gradient-to-br from-primary/10 to-accent/10">
                <picture>
                  <source
                    srcSet={`/images/${caseItem.image.replace('.jpg', '.webp')}`}
                    type="image/webp"
                  />
                  <img
                    src={`/images/${caseItem.image}`}
                    alt={`${caseItem.title}: ${caseItem.subtitle} - ${caseItem.badge}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      // Fallback if image doesn't exist
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </picture>
                
                {/* Badge Overlay */}
                <div className="absolute top-4 left-4">
                  <span className={`${caseItem.badgeColor} px-4 py-2 rounded-full text-sm font-semibold shadow-md`}>
                    {caseItem.badge}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {caseItem.title}
                </h3>
                
                <p className="text-base font-medium text-gray-600 mb-4">
                  {caseItem.subtitle}
                </p>

                <p className="text-sm italic text-gray-600 leading-relaxed">
                  "{caseItem.quote}"
                </p>
                <p className="text-xs text-[#1c7d86] mt-3 leading-relaxed border-t border-gray-100 pt-3">
                  {caseItem.brikxNote}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
