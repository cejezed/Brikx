import HeroWithForm from '@/components/HeroWithForm'
import TrustBar from '@/components/TrustBar'
import FounderBanner from '@/components/FounderBanner'
import Header from "@/components/Header";
import Solutions from '@/components/Solutions'

import Cases from '@/components/Cases'
import HowItWorks from '@/components/HowItWorks'
import WhatYouGet from '@/components/WhatYouGet'
import Pricing from '@/components/Pricing'
import FAQ from '@/components/FAQ'

import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
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

      {/* JSON-LD Structured Data for SoftwareApplication */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Brikx",
            "applicationCategory": "DesignApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0.00",
              "priceCurrency": "EUR"
            },
            "description": "De slimme assistent voor elk (ver)bouwproject. Van kavel tot sleuteloverdracht.",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "120"
            }
          }),
        }}
      />
    </main>
  )
}
