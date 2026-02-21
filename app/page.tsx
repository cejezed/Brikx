import HeroWithForm from '@/components/HeroWithForm'
import TrustBar from '@/components/TrustBar'
import FounderBanner from '@/components/FounderBanner'
import Header from "@/components/Header";
import Solutions from '@/components/Solutions'

import Cases from '@/components/Cases'
import HowItWorks from '@/components/HowItWorks'
import BrikxTools from '@/components/BrikxTools'
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

      <BrikxTools />

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

      {/* JSON-LD Structured Data for Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Brikx",
            "url": "https://www.brikxai.nl",
            "logo": "https://www.brikxai.nl/images/logo.png",
            "description": "Professionele PvE software voor (ver)bouwprojecten. AI-gedreven assistent gebaseerd op 20 jaar architect-ervaring.",
            "founder": {
              "@type": "Person",
              "name": "Jules Zwijsen",
              "jobTitle": "Architect",
              "url": "https://www.zwijsen.net"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "email": "info@brikxai.nl",
              "contactType": "Customer Service",
              "availableLanguage": "Dutch"
            },
            "sameAs": [
              "https://www.zwijsen.net"
            ]
          }),
        }}
      />

      {/* JSON-LD Structured Data for Service */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Programma van Eisen (PvE) Opstellen",
            "provider": {
              "@type": "Organization",
              "name": "Brikx"
            },
            "areaServed": "NL",
            "description": "Digitale wizard voor het opstellen van een professioneel Programma van Eisen (PvE) voor nieuwbouw en verbouwprojecten.",
            "offers": {
              "@type": "Offer",
              "price": "0.00",
              "priceCurrency": "EUR",
              "availability": "https://schema.org/InStock"
            }
          }),
        }}
      />

      {/* JSON-LD Structured Data for ProfessionalService (Architect) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            "name": "Architectenbureau Jules Zwijsen",
            "url": "https://www.zwijsen.net",
            "founder": {
              "@type": "Person",
              "name": "Jules Zwijsen",
              "jobTitle": "Architect"
            },
            "foundingDate": "2005",
            "areaServed": "NL",
            "description": "Erkend architectenbureau met 20+ jaar ervaring in nieuwbouw, verbouw en renovatie. Specialist in woningbouw en herbestemming."
          }),
        }}
      />
    </main>
  )
}
