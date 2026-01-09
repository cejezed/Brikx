'use client'

export default function FounderBanner() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#0d3d4d] mb-4">
            De Architect Achter Brikx
          </h2>
          <p className="text-xl text-gray-600">
            Van 20 jaar praktijkervaring naar de intelligentie achter jouw PvE
          </p>
        </div>

        {/* Two Column Layout - Large Photo Left, Content Right */}
        <div className="flex flex-col lg:flex-row items-center gap-12">
          
          {/* Left: Large Professional Photo */}
          <div className="flex-shrink-0 w-full lg:w-auto">
            <div className="relative w-full max-w-sm lg:max-w-md mx-auto">
              {/* Photo Container - Rectangle for professionalism */}
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src="/images/jules-zwijsen.jpg"
                  alt="Jules Zwijsen - Architect en oprichter van Brikx"
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                />
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
              </div>
              
              {/* Credentials Badge */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-lg border-2 border-[#43D38D]">
                <p className="text-sm font-semibold text-[#0d3d4d] whitespace-nowrap">
                  20 jaar · 100+ projecten
                </p>
              </div>
            </div>
          </div>

          {/* Right: Quote & Details */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            
            {/* Main Quote - Large and Prominent */}
            <blockquote className="relative">
              {/* Quote marks decoration */}
              <span className="absolute -top-4 -left-2 text-6xl text-[#43D38D]/20 font-serif leading-none">"</span>

              <p className="text-2xl lg:text-3xl text-[#1f2937] font-medium leading-relaxed italic relative z-10">
                Veel mensen vinden het een grote stap om direct een architect in te schakelen. Dus beginnen ze zonder goede voorbereiding.
              </p>

              <p className="text-2xl lg:text-3xl text-[#1f2937] font-medium leading-relaxed italic mt-4">
                Dat leidt tot fouten die duizenden euro's kosten. Na 20 jaar en 100+ projecten weet ik: de grootste schade wordt aangericht vóór de eerste offerte.
              </p>

              <p className="text-2xl lg:text-3xl text-[#0d3d4d] font-bold mt-6">
                Daarom Brikx. Professionele voorbereiding, zonder drempel.
              </p>
            </blockquote>
            
            {/* Founder Details */}
            <div className="pt-6 border-t-2 border-gray-200">
              <h3 className="text-2xl font-bold text-[#0d3d4d] mb-2">
                Jules Zwijsen
              </h3>
              <p className="text-lg text-gray-600 mb-2">
                Architect · Oprichter Brikx
              </p>
              <p className="text-lg text-gray-700">
                <a
                  href="https://www.zwijsen.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold hover:text-[#0d3d4d] transition-colors underline decoration-[#43D38D]/50 hover:decoration-[#43D38D]"
                >
                  Architectenbureau Jules Zwijsen
                </a>
              </p>
              <p className="text-base text-gray-500 mt-1">
                Sinds 2005
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-[#43D38D] text-xl">✓</span>
                <span className="text-sm">Erkend architect</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-[#43D38D] text-xl">✓</span>
                <span className="text-sm">Specialist nieuwbouw, verbouw en renovatie</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}