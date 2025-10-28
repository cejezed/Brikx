'use client'

export default function BenefitsTrustBar() {
  const benefits = [
    { icon: 'benefit-budget.png',   title: 'Geen Budget-verrassingen', subtitle: 'Zie geen kosten over het hoofd' },
    { icon: 'benefit-checklist.png', title: 'Geen Vergeten Stappen',     subtitle: 'AI checkt alles voor je' },
    { icon: 'benefit-communicate.png', title: 'Feilloos Communiceren',  subtitle: 'Aannemer of Architect weet wat je wilt' },
    { icon: 'benefit-peace.png',     title: 'Rustig Kunnen Slapen',      subtitle: 'Alles onder controle' },
    { icon: 'benefit-speed.png',     title: 'Snel aan de Slag',           subtitle: 'Geen weken voorbereiding' }
  ]

  return (
    // witte zijranden
    <section className="relative bg-white">
      <div className="relative max-w-[1600px] mx-auto px-6">
        {/* overlap omhoog om witte gleuf te verwijderen */}
        <div className="relative -mt-8 bg-[#e7f3f4] rounded-[20px] shadow-[0_16px_40px_rgba(0,0,0,0.10)]">
          <div className="px-6 pt-8 pb-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-4">Wat Levert Brikx Je Op?</h2>
              <p className="text-xl text-gray-700">In korte tijd van stress naar zekerheid!</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {benefits.map((b, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <img src={`/images/icons/${b.icon}`} alt="" className="w-[120px] h-[120px] object-contain mb-3" />
                  <h3 className="text-[19px] font-semibold text-gray-900 mb-1 leading-relaxed">{b.title}</h3>
                  <p className="text-[19px] text-gray-700 leading-relaxed">{b.subtitle}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
