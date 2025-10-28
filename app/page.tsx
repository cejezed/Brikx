import HeroWithForm from '@/components/HeroWithForm'
import TrustBar from '@/components/TrustBar'
import FounderBanner from '@/components/FounderBanner'

import Solutions from '@/components/Solutions'
import Features from '@/components/Features'
import Cases from '@/components/Cases'
import HowItWorks from '@/components/HowItWorks'
import WhatYouGet from '@/components/WhatYouGet'
import Pricing from '@/components/Pricing'
import FAQ from '@/components/FAQ'

import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero is #home + #login/#start in het formulier zelf */}
      <HeroWithForm />
      <section id="voordelen" className="scroll-mt-14"></section>
      <TrustBar />
      <FounderBanner />
      <Solutions />       {/* Sectie 6: De 3 Oplossingen */}
      <Cases />           {/* Sectie 7: Bewijs met cijfers */}
      <WhatYouGet />

      <section id="werkwijze" className="scroll-mt-14">
        <HowItWorks />
      </section>

      <section id="prijzen" className="scroll-mt-14">
        <Pricing />
      </section>

      <section id="faq" className="scroll-mt-14">
        <FAQ />
      </section>

    
   
      <Footer />
    </main>
  )
}
